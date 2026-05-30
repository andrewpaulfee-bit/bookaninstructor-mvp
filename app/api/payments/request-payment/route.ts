import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "BookAnInstructor <notifications@bookaninstructor.com>";
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";

type Agreement = {
  id: string;
  request_id: string;
  offer_id?: string | null;
  client_user_id?: string | null;
  contract_number: string | null;
  status: string | null;
  payment_status: string | null;
  total_fee: number | null;
  job_title: string | null;
  client_name: string | null;
  instructor_name: string | null;
  instructor_id?: string | null;
  instructor_user_id?: string | null;
  request?: { client_email: string | null; client_name: string | null; title: string | null } | null;
};

type RawAgreement = Omit<Agreement, "request"> & {
  request?: Agreement["request"] | Agreement["request"][];
};

function money(value: number | null) {
  return value === null || value === undefined ? "Not supplied" : `$${Number(value).toFixed(2)}`;
}

export async function POST(request: Request) {
  const { agreementId } = (await request.json()) as { agreementId?: string };

  if (!agreementId) {
    return NextResponse.json({ error: "Missing agreement id." }, { status: 400 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Payment request setup is missing Supabase service credentials." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("booking_agreements")
    .select(
      "id,request_id,offer_id,client_user_id,contract_number,status,payment_status,total_fee,job_title,client_name,instructor_name,instructor_id,instructor_user_id,request:client_requests(client_email,client_name,title)"
    )
    .eq("id", agreementId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Agreement not found." },
      { status: 404 }
    );
  }

  const rawAgreement = data as unknown as RawAgreement;
  const agreement: Agreement = {
    ...rawAgreement,
    request: Array.isArray(rawAgreement.request)
      ? rawAgreement.request[0] || null
      : rawAgreement.request || null,
  };

  if (agreement.status !== "accepted") {
    return NextResponse.json(
      { error: "Agreement must be accepted before requesting payment." },
      { status: 400 }
    );
  }

  if (agreement.payment_status === "paid") {
    return NextResponse.json({ skipped: true, reason: "Agreement already paid." });
  }

  await supabase
    .from("booking_agreements")
    .update({ payment_status: "pending", updated_at: new Date().toISOString() })
    .eq("id", agreement.id);

  await supabase
    .from("client_requests")
    .update({ status: "payment_pending" })
    .eq("id", agreement.request_id);

  const recipient = agreement.request?.client_email;
  const payUrl = `${appBaseUrl}/agreements/${agreement.id}`;
  const body = [
    `${agreement.instructor_name || "The instructor"} has accepted the booking agreement.`,
    `Contract: ${agreement.contract_number || agreement.id.slice(0, 8)}`,
    `Total: ${money(agreement.total_fee)}`,
    `Payment link: ${payUrl}`,
  ].join("\n");

  if (agreement.instructor_id) {
    const { data: conversation } = await supabase
      .from("conversations")
      .upsert(
        {
          request_id: agreement.request_id,
          offer_id: agreement.offer_id || null,
          client_user_id: agreement.client_user_id || null,
          instructor_id: agreement.instructor_id,
          instructor_user_id: agreement.instructor_user_id || null,
          status: "open",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "request_id,instructor_id" }
      )
      .select("id")
      .single();

    if (conversation?.id) {
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        author_user_id: null,
        author_role: "admin",
        body,
      });
    }
  }

  if (!recipient) {
    return NextResponse.json({ skipped: true, reason: "No client email found." });
  }

  if (!resendApiKey) {
    console.log("Payment request email skipped. Add RESEND_API_KEY to enable:", {
      recipient,
      agreementId,
      payUrl,
    });
    return NextResponse.json({
      skipped: true,
      reason: "RESEND_API_KEY is not configured.",
      payUrl,
    });
  }

  const subject = `Payment request for ${agreement.job_title || agreement.request?.title || "your booking"}`;
  const emailResult = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: recipient,
      subject,
      html: `
        <h1>Your instructor agreement has been accepted</h1>
        <p>${agreement.instructor_name || "The instructor"} has accepted the booking agreement.</p>
        <p><strong>Contract:</strong> ${agreement.contract_number || agreement.id.slice(0, 8)}</p>
        <p><strong>Total:</strong> ${money(agreement.total_fee)}</p>
        <p><a href="${payUrl}" style="display:inline-block;background:#4374d1;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">Pay booking fee</a></p>
      `,
      text: [
        "Your instructor agreement has been accepted.",
        "",
        `Contract: ${agreement.contract_number || agreement.id.slice(0, 8)}`,
        `Total: ${money(agreement.total_fee)}`,
        "",
        `Pay booking fee: ${payUrl}`,
      ].join("\n"),
    }),
  });

  if (!emailResult.ok) {
    return NextResponse.json(
      { error: "Payment request was created, but the email could not be sent." },
      { status: 502 }
    );
  }

  return NextResponse.json({ sent: true, payUrl });
}
