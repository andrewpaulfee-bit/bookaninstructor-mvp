import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { actionButton, appBaseUrl, sendBookAnInstructorEmail } from "../../../../lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type PayoutAction = "approve" | "mark_paid" | "resend_paid_email";

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

  if (!["approve", "mark_paid", "resend_paid_email"].includes(action)) {
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
    .select("id,contract_number,job_title,payment_status,class_completed_at,client_review_submitted_at,instructor_review_submitted_at,payout_status,instructor_payout,instructor_name,instructor:instructors(email)")
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

  if (action === "resend_paid_email" && agreement.payout_status !== "paid") {
    return NextResponse.json(
      { error: "The payout must be marked paid before resending the payout email." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  let updatedAgreement = {
    id: agreement.id,
    payout_status: agreement.payout_status,
    payout_approved_at: null,
    payout_paid_at: null,
    payout_reference: null,
    payout_notes: null,
  };

  if (action !== "resend_paid_email") {
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

    const { data, error: updateError } = await supabase
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

    updatedAgreement = data;
  }

  let emailResult:
    | { sent?: boolean; skipped?: boolean; reason?: string; error?: string }
    | null = null;

  if (action === "mark_paid" || action === "resend_paid_email") {
    const instructor = Array.isArray(agreement.instructor)
      ? agreement.instructor[0]
      : agreement.instructor;
    const agreementUrl = `${appBaseUrl}/agreements/${agreement.id}`;
    const subject = `Payout sent for ${agreement.job_title || "your booking"}`;
    const referenceText = reference?.trim()
      ? `<p><strong>Reference:</strong> ${reference.trim()}</p>`
      : "";

    emailResult = await sendBookAnInstructorEmail({
      to: instructor?.email,
      subject,
      html: `
        <h1>Your payout has been sent</h1>
        <p>Thanks for completing this BookAnInstructor booking.</p>
        <p>Your payout for <strong>${agreement.job_title || "your booking"}</strong> has been marked as sent.</p>
        <p><strong>Contract:</strong> ${agreement.contract_number || agreement.id.slice(0, 8)}</p>
        <p><strong>Payout amount:</strong> ${agreement.instructor_payout ? `$${agreement.instructor_payout}` : "Confirmed"}</p>
        ${referenceText}
        <p>Please allow normal bank or Stripe processing time for the funds to appear. If anything looks incorrect, reply through BookAnInstructor so we can help.</p>
        ${actionButton("View agreement", agreementUrl)}
      `,
      text: [
        "Your payout has been sent.",
        `Booking: ${agreement.job_title || "your booking"}`,
        `Contract: ${agreement.contract_number || agreement.id.slice(0, 8)}`,
        `Payout amount: ${agreement.instructor_payout ? `$${agreement.instructor_payout}` : "Confirmed"}`,
        reference?.trim() ? `Reference: ${reference.trim()}` : "",
        "Please allow normal bank or Stripe processing time for the funds to appear.",
        `View agreement: ${agreementUrl}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  return NextResponse.json({ agreement: updatedAgreement, email: emailResult });
}
