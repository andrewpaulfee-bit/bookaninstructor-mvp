import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { actionButton, appBaseUrl, sendBookAnInstructorEmail } from "../../../../lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

function stripeAuthHeader() {
  return `Basic ${Buffer.from(`${stripeSecretKey}:`).toString("base64")}`;
}

export async function POST(request: Request) {
  const { agreementId, sessionId } = (await request.json()) as {
    agreementId?: string;
    sessionId?: string;
  };

  if (!agreementId || !sessionId) {
    return NextResponse.json({ error: "Missing agreement or session id." }, { status: 400 });
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

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      headers: {
        Authorization: stripeAuthHeader(),
      },
    }
  );

  const stripeData = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return NextResponse.json(
      { error: stripeData?.error?.message || "Could not verify Stripe Checkout session." },
      { status: 502 }
    );
  }

  if (stripeData.metadata?.agreement_id !== agreementId || stripeData.client_reference_id !== agreementId) {
    return NextResponse.json(
      { error: "Stripe session does not match this agreement." },
      { status: 400 }
    );
  }

  if (stripeData.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Stripe has not marked this payment as paid yet." },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: agreement, error } = await supabase
    .from("booking_agreements")
    .select("id,request_id,contract_number,job_title,total_fee,client_name,instructor_name,request:client_requests(client_email,title),instructor:instructors(email,name)")
    .eq("id", agreementId)
    .maybeSingle();

  if (error || !agreement) {
    return NextResponse.json(
      { error: error?.message || "Agreement not found." },
      { status: 404 }
    );
  }

  await supabase
    .from("booking_agreements")
    .update({
      payment_status: "paid",
      stripe_checkout_session_id: stripeData.id,
      stripe_payment_intent_id: stripeData.payment_intent || null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", agreementId);

  await supabase
    .from("client_requests")
    .update({ status: "booking_confirmed" })
    .eq("id", agreement.request_id);

  const requestData = Array.isArray(agreement.request) ? agreement.request[0] : agreement.request;
  const instructorData = Array.isArray(agreement.instructor)
    ? agreement.instructor[0]
    : agreement.instructor;
  const agreementUrl = `${appBaseUrl}/agreements/${agreement.id}`;
  const title = agreement.job_title || requestData?.title || "your booking";
  const contract = agreement.contract_number || agreement.id.slice(0, 8);

  await Promise.all([
    sendBookAnInstructorEmail({
      to: requestData?.client_email,
      subject: `Payment received for ${title}`,
      html: `
        <h1>Payment received</h1>
        <p>Your booking is confirmed.</p>
        <p><strong>Contract:</strong> ${contract}</p>
        <p><strong>Total fee:</strong> ${agreement.total_fee ? `$${agreement.total_fee}` : "Paid"}</p>
        ${actionButton("View agreement", agreementUrl)}
      `,
      text: [
        "Payment received. Your booking is confirmed.",
        `Contract: ${contract}`,
        `View agreement: ${agreementUrl}`,
      ].join("\n\n"),
    }),
    sendBookAnInstructorEmail({
      to: instructorData?.email,
      subject: `Booking confirmed: ${title}`,
      html: `
        <h1>Booking confirmed</h1>
        <p>The client has paid and the booking is confirmed.</p>
        <p><strong>Contract:</strong> ${contract}</p>
        ${actionButton("View agreement", agreementUrl)}
      `,
      text: [
        "Booking confirmed. The client has paid.",
        `Contract: ${contract}`,
        `View agreement: ${agreementUrl}`,
      ].join("\n\n"),
    }),
  ]);

  return NextResponse.json({ paid: true });
}
