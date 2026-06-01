import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { actionButton, appBaseUrl, sendBookAnInstructorEmail } from "../../../../lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type Agreement = {
  id: string;
  request_id: string;
  offer_id: string | null;
  client_user_id: string | null;
  instructor_id: string;
  instructor_user_id: string | null;
  contract_number: string | null;
  payment_status: string | null;
  class_completed_at: string | null;
  client_name: string | null;
  instructor_name: string | null;
  job_title: string | null;
  request?: { client_email: string | null; client_name: string | null; title: string | null } | null;
  instructor?: { email: string | null; name: string | null } | null;
};

type RawAgreement = Omit<Agreement, "request" | "instructor"> & {
  request?: Agreement["request"] | Agreement["request"][];
  instructor?: Agreement["instructor"] | Agreement["instructor"][];
};

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

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Completion setup is missing Supabase service credentials." },
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
      "id,request_id,offer_id,client_user_id,instructor_id,instructor_user_id,contract_number,payment_status,class_completed_at,client_name,instructor_name,job_title,request:client_requests(client_email,client_name,title),instructor:instructors(email,name)"
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
    instructor: Array.isArray(rawAgreement.instructor)
      ? rawAgreement.instructor[0] || null
      : rawAgreement.instructor || null,
  };

  if (agreement.instructor_user_id !== user.id) {
    return NextResponse.json(
      { error: "Only the booked instructor can mark this class complete." },
      { status: 403 }
    );
  }

  if (agreement.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment must be received before the class can be completed." },
      { status: 400 }
    );
  }

  if (agreement.class_completed_at) {
    return NextResponse.json({ completed: true, alreadyCompleted: true });
  }

  const now = new Date().toISOString();
  await supabase
    .from("booking_agreements")
    .update({
      class_completed_at: now,
      class_completed_by: user.id,
      client_review_requested_at: now,
      instructor_review_requested_at: now,
      payout_status: "awaiting_client_review",
      payout_ready_at: null,
      updated_at: now,
    })
    .eq("id", agreement.id);

  await supabase.from("client_requests").update({ status: "completed" }).eq("id", agreement.request_id);

  const reviewClientUrl = `${appBaseUrl}/reviews/${agreement.id}/review-client`;
  const reviewInstructorUrl = `${appBaseUrl}/reviews/${agreement.id}/review-instructor`;
  const contract = agreement.contract_number || agreement.id.slice(0, 8);
  const title = agreement.job_title || agreement.request?.title || "your booking";

  if (agreement.request?.client_email) {
    await sendBookAnInstructorEmail({
      to: agreement.request.client_email,
      subject: `Review ${agreement.instructor_name || "your instructor"} for ${title}`,
      html: `
        <h1>How did your class go?</h1>
        <p>${agreement.instructor_name || "Your instructor"} has marked the booking as complete.</p>
        <p>Please take a moment to review your instructor. Your review helps us maintain quality and helps future clients choose with confidence.</p>
        <p><strong>Contract:</strong> ${contract}</p>
        ${actionButton("Review instructor", reviewInstructorUrl)}
      `,
      text: [
        "How did your class go?",
        `${agreement.instructor_name || "Your instructor"} has marked the booking as complete.`,
        "Please review your instructor when you have a moment.",
        `Contract: ${contract}`,
        `Review instructor: ${reviewInstructorUrl}`,
      ].join("\n\n"),
    });
  }

  if (agreement.instructor?.email) {
    await sendBookAnInstructorEmail({
      to: agreement.instructor.email,
      subject: `Review the client for ${title}`,
      html: `
        <h1>Please review the client</h1>
        <p>The booking has been marked complete. Please review your experience with ${agreement.client_name || agreement.request?.client_name || "the client"}.</p>
        <p>This review is kept internally. It helps BookAnInstructor monitor booking quality and keep the platform professional for instructors.</p>
        <p><strong>Contract:</strong> ${contract}</p>
        ${actionButton("Review client", reviewClientUrl)}
      `,
      text: [
        "Please review the client.",
        "This internal review helps BookAnInstructor monitor booking quality and keep the platform professional for instructors.",
        `Contract: ${contract}`,
        `Review client: ${reviewClientUrl}`,
      ].join("\n\n"),
    });
  }

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
        updated_at: now,
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
      body: [
        "Class completed.",
        `Contract: ${contract}`,
        "Review requests have been sent to the client and instructor.",
        "Payout will move to review once the client submits their instructor review.",
      ].join("\n"),
    });
  }

  return NextResponse.json({ completed: true });
}
