import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type PayoutAction = "approve" | "mark_paid";

async function getSignedInUser(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase.auth.getUser(token);
  return data.user || null;
}

export async function POST(request: Request) {
  const {
    agreementId,
    action,
    reference,
    notes,
  } = (await request.json()) as {
    agreementId?: string;
    action?: PayoutAction;
    reference?: string;
    notes?: string;
  };

  if (!agreementId || !action) {
    return NextResponse.json({ error: "Missing payout update details." }, { status: 400 });
  }

  if (!["approve", "mark_paid"].includes(action)) {
    return NextResponse.json({ error: "Unknown payout action." }, { status: 400 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Payout setup is missing Supabase service credentials." },
      { status: 500 }
    );
  }

  const user = await getSignedInUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: agreement, error: agreementError } = await supabase
    .from("booking_agreements")
    .select("id,payment_status,class_completed_at,client_review_submitted_at,instructor_review_submitted_at,payout_status,instructor_payout")
    .eq("id", agreementId)
    .maybeSingle();

  if (agreementError || !agreement) {
    return NextResponse.json(
      { error: agreementError?.message || "Agreement not found." },
      { status: 404 }
    );
  }

  if (agreement.payment_status !== "paid" || !agreement.class_completed_at) {
    return NextResponse.json(
      { error: "Only paid, completed bookings can be updated for payout." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const update =
    action === "approve"
      ? {
          payout_status: "approved",
          payout_approved_at: now,
          payout_approved_by: user.id,
          updated_at: now,
        }
      : {
          payout_status: "paid",
          payout_paid_at: now,
          payout_paid_by: user.id,
          payout_reference: reference?.trim() || null,
          payout_notes: notes?.trim() || null,
          updated_at: now,
        };

  const reviewsComplete =
    Boolean(agreement.client_review_submitted_at) &&
    Boolean(agreement.instructor_review_submitted_at);

  if (
    action === "approve" &&
    agreement.payout_status !== "ready_for_review" &&
    !reviewsComplete
  ) {
    return NextResponse.json(
      { error: "This payout is not waiting for approval." },
      { status: 400 }
    );
  }

  if (action === "mark_paid" && agreement.payout_status !== "approved") {
    return NextResponse.json(
      { error: "Approve the payout before marking it paid." },
      { status: 400 }
    );
  }

  const { data: updatedAgreement, error: updateError } = await supabase
    .from("booking_agreements")
    .update(update)
    .eq("id", agreementId)
    .select(
      "id,payout_status,payout_approved_at,payout_paid_at,payout_reference,payout_notes"
    )
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ agreement: updatedAgreement });
}
