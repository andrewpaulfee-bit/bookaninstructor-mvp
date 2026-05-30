import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";

type Agreement = {
  id: string;
  request_id: string;
  contract_number: string | null;
  status: string | null;
  payment_status: string | null;
  total_fee: number | null;
  job_title: string | null;
};

function stripeAuthHeader() {
  return `Basic ${Buffer.from(`${stripeSecretKey}:`).toString("base64")}`;
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
          "Payment setup is missing. Add SUPABASE_SERVICE_ROLE_KEY and STRIPE_SECRET_KEY to .env.local.",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: agreement, error } = await supabase
    .from("booking_agreements")
    .select("id,request_id,contract_number,status,payment_status,total_fee,job_title")
    .eq("id", agreementId)
    .maybeSingle();

  if (error || !agreement) {
    return NextResponse.json(
      { error: error?.message || "Agreement not found." },
      { status: 404 }
    );
  }

  const bookingAgreement = agreement as Agreement;

  if (bookingAgreement.status !== "accepted") {
    return NextResponse.json(
      { error: "The instructor must accept the agreement before payment can be requested." },
      { status: 400 }
    );
  }

  if (bookingAgreement.payment_status === "paid") {
    return NextResponse.json({ error: "This agreement has already been paid." }, { status: 400 });
  }

  if (!bookingAgreement.total_fee || bookingAgreement.total_fee <= 0) {
    return NextResponse.json(
      { error: "This agreement does not have a valid total fee." },
      { status: 400 }
    );
  }

  const amountInCents = Math.round(Number(bookingAgreement.total_fee) * 100);
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set(
    "success_url",
    `${appBaseUrl}/agreements/${bookingAgreement.id}?payment=success&session_id={CHECKOUT_SESSION_ID}`
  );
  params.set("cancel_url", `${appBaseUrl}/agreements/${bookingAgreement.id}?payment=cancelled`);
  params.set("client_reference_id", bookingAgreement.id);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "aud");
  params.set("line_items[0][price_data][unit_amount]", String(amountInCents));
  params.set(
    "line_items[0][price_data][product_data][name]",
    `BookAnInstructor booking ${bookingAgreement.contract_number || bookingAgreement.id.slice(0, 8)}`
  );
  params.set("metadata[agreement_id]", bookingAgreement.id);
  params.set("metadata[request_id]", bookingAgreement.request_id);
  if (bookingAgreement.contract_number) {
    params.set("metadata[contract_number]", bookingAgreement.contract_number);
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: stripeAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const stripeData = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return NextResponse.json(
      { error: stripeData?.error?.message || "Could not create Stripe Checkout session." },
      { status: 502 }
    );
  }

  await supabase
    .from("booking_agreements")
    .update({
      stripe_checkout_session_id: stripeData.id,
      payment_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingAgreement.id);

  await supabase
    .from("client_requests")
    .update({ status: "payment_pending" })
    .eq("id", bookingAgreement.request_id);

  return NextResponse.json({ url: stripeData.url });
}
