import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

type Agreement = {
  id: string;
  contract_number: string | null;
  payment_status: string | null;
  class_completed_at: string | null;
  client_review_submitted_at: string | null;
  payout_status: string | null;
  instructor_id: string;
  instructor_payout: number | null;
  stripe_transfer_id: string | null;
  instructor?: {
    stripe_connect_account_id: string | null;
    stripe_connect_payouts_enabled: boolean | null;
  } | null;
};

type RawAgreement = Omit<Agreement, "instructor"> & {
  instructor?: Agreement["instructor"] | Agreement["instructor"][];
};

function stripeAuthHeader() {
  return `Basic ${Buffer.from(`${stripeSecretKey}:`).toString("base64")}`;
}

async function getSignedInUser(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase.auth.getUser(token);
  return data.user || null;
}

export async function POST(request: Request) {
  const { agreementId } = (await request.json()) as { agreementId?: string };

  if (!agreementId) {
    return NextResponse.json({ error: "Missing agreement id." }, { status: 400 });
  }

  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey) {
    return NextResponse.json(
      {
        error:
          "Stripe payout setup is missing. Add SUPABASE_SERVICE_ROLE_KEY and STRIPE_SECRET_KEY to .env.local.",
      },
      { status: 500 }
    );
  }

  const user = await getSignedInUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("booking_agreements")
    .select(
      "id,contract_number,payment_status,class_completed_at,client_review_submitted_at,payout_status,instructor_id,instructor_payout,stripe_transfer_id,instructor:instructors(stripe_connect_account_id,stripe_connect_payouts_enabled)"
    )
    .eq("id", agreementId)
    .maybeSingle();

  if (error || !data) {
    if (error?.message?.includes("stripe_connect")) {
      return NextResponse.json(
        {
          error:
            "Stripe Connect columns are missing in Supabase. Run supabase/stripe-payout-release-schema.sql, then refresh this page.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Agreement not found." },
      { status: 404 }
    );
  }

  const rawAgreement = data as unknown as RawAgreement;
  const agreement: Agreement = {
    ...rawAgreement,
    instructor: Array.isArray(rawAgreement.instructor)
      ? rawAgreement.instructor[0] || null
      : rawAgreement.instructor || null,
  };

  if (agreement.stripe_transfer_id || agreement.payout_status === "paid") {
    return NextResponse.json({ error: "This payout has already been released." }, { status: 400 });
  }

  if (
    agreement.payment_status !== "paid" ||
    !agreement.class_completed_at ||
    !agreement.client_review_submitted_at ||
    agreement.payout_status !== "ready_for_review"
  ) {
    return NextResponse.json(
      { error: "This booking is not ready for Stripe payout release." },
      { status: 400 }
    );
  }

  if (!agreement.instructor_payout || Number(agreement.instructor_payout) <= 0) {
    return NextResponse.json(
      { error: "This agreement does not have a valid instructor payout amount." },
      { status: 400 }
    );
  }

  if (!agreement.instructor?.stripe_connect_account_id) {
    return NextResponse.json(
      { error: "The instructor has not set up Stripe payouts yet." },
      { status: 400 }
    );
  }

  if (!agreement.instructor.stripe_connect_payouts_enabled) {
    return NextResponse.json(
      { error: "The instructor's Stripe payout setup is not complete yet." },
      { status: 400 }
    );
  }

  const amountInCents = Math.round(Number(agreement.instructor_payout) * 100);
  const params = new URLSearchParams();
  params.set("amount", String(amountInCents));
  params.set("currency", "aud");
  params.set("destination", agreement.instructor.stripe_connect_account_id);
  params.set(
    "description",
    `BookAnInstructor payout ${agreement.contract_number || agreement.id.slice(0, 8)}`
  );
  params.set("metadata[agreement_id]", agreement.id);
  params.set("metadata[instructor_id]", agreement.instructor_id);
  if (agreement.contract_number) {
    params.set("metadata[contract_number]", agreement.contract_number);
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/transfers", {
    method: "POST",
    headers: {
      Authorization: stripeAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `bookaninstructor-payout-${agreement.id}`,
    },
    body: params,
  });

  const stripeData = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return NextResponse.json(
      { error: stripeData?.error?.message || "Could not release Stripe payout." },
      { status: 502 }
    );
  }

  const now = new Date().toISOString();
  const { data: updatedAgreement, error: updateError } = await supabase
    .from("booking_agreements")
    .update({
      payout_status: "paid",
      payout_paid_at: now,
      payout_paid_by: user.id,
      payout_reference: stripeData.id,
      payout_method: "stripe_connect",
      stripe_transfer_id: stripeData.id,
      updated_at: now,
    })
    .eq("id", agreement.id)
    .select(
      "id,payout_status,payout_paid_at,payout_reference,payout_notes,payout_method,stripe_transfer_id"
    )
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ agreement: updatedAgreement, transferId: stripeData.id });
}
