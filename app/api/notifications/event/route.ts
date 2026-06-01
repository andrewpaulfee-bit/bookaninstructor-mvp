import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { actionButton, appBaseUrl, sendBookAnInstructorEmail } from "../../../../lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type EventType =
  | "job_approved"
  | "job_needs_changes"
  | "job_rejected"
  | "instructor_approved"
  | "instructor_needs_changes"
  | "instructor_rejected"
  | "offer_submitted"
  | "instructor_selected"
  | "agreement_sent";

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

async function getUser(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase.auth.getUser(token);
  return data.user || null;
}

async function isAdmin(userId: string) {
  if (!supabaseUrl || !serviceRoleKey) return false;
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}

export async function POST(request: Request) {
  const { event, id } = (await request.json()) as { event?: EventType; id?: string };

  if (!event || !id) {
    return NextResponse.json({ error: "Missing notification event or id." }, { status: 400 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Notification setup is missing Supabase service credentials." },
      { status: 500 }
    );
  }

  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const adminEvents: EventType[] = [
    "job_approved",
    "job_needs_changes",
    "job_rejected",
    "instructor_approved",
    "instructor_needs_changes",
    "instructor_rejected",
  ];

  if (adminEvents.includes(event) && !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (event.startsWith("job_")) {
    const { data } = await supabase.from("client_requests").select("*").eq("id", id).maybeSingle();
    if (!data) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    const jobUrl = `${appBaseUrl}/my-jobs`;
    const title = data.title || data.style || "your instructor request";
    const showReviewNotes = event !== "job_approved" && data.review_notes;
    const statusText =
      event === "job_approved"
        ? "approved and published"
        : event === "job_needs_changes"
          ? "reviewed and needs changes"
          : "not approved";

    const result = await sendBookAnInstructorEmail({
      to: data.client_email,
      subject: `Update on your BookAnInstructor request`,
      html: `
        <h1>Your request update</h1>
        <p>Hi ${data.first_name || data.client_name || "there"},</p>
        <p>Thanks for submitting your request through BookAnInstructor.</p>
        <p><strong>${title}</strong></p>
        <p>Status: <strong>${statusText}</strong></p>
        ${showReviewNotes ? `<p><strong>Review notes:</strong> ${data.review_notes}</p>` : ""}
        <p>You can view your request and make any updates from your account.</p>
        ${actionButton(event === "job_needs_changes" ? "Update your request" : "View your request", jobUrl)}
      `,
      text: [
        `Your request status: ${statusText}.`,
        title,
        showReviewNotes ? `Review notes: ${data.review_notes}` : "",
        `View your request: ${jobUrl}`,
      ].filter(Boolean).join("\n\n"),
    });

    return NextResponse.json(result);
  }

  if (event.startsWith("instructor_")) {
    const { data } = await supabase.from("instructors").select("*").eq("id", id).maybeSingle();
    if (!data) return NextResponse.json({ error: "Instructor not found." }, { status: 404 });

    const profileUrl = `${appBaseUrl}/instructor-signup`;
    const statusText =
      event === "instructor_approved"
        ? "approved and published"
        : event === "instructor_needs_changes"
          ? "reviewed and needs changes"
          : "not approved";

    const result = await sendBookAnInstructorEmail({
      to: data.email,
      subject: `Update on your BookAnInstructor profile`,
      html: `
        <h1>Your instructor profile update</h1>
        <p>Hi ${data.first_name || data.name || "there"},</p>
        <p>Thanks for setting up your BookAnInstructor profile.</p>
        <p>Status: <strong>${statusText}</strong></p>
        ${data.review_notes ? `<p><strong>Review notes:</strong> ${data.review_notes}</p>` : ""}
        <p>You can review your profile details from your account.</p>
        ${actionButton("Open profile setup", profileUrl)}
      `,
      text: [
        `Your instructor profile status: ${statusText}.`,
        data.review_notes ? `Review notes: ${data.review_notes}` : "",
        `Open profile setup: ${profileUrl}`,
      ].filter(Boolean).join("\n\n"),
    });

    return NextResponse.json(result);
  }

  if (event === "offer_submitted") {
    const { data } = await supabase
      .from("offers")
      .select("id,price,availability,message,instructor:instructors(name,user_id),request:client_requests(title,client_email,client_name)")
      .eq("id", id)
      .maybeSingle();
    if (!data) return NextResponse.json({ error: "Offer not found." }, { status: 404 });

    const instructor = one(data.instructor);
    if (instructor?.user_id && instructor.user_id !== user.id) {
      return NextResponse.json({ error: "Only the replying instructor can send this notification." }, { status: 403 });
    }

    const requestData = one(data.request);
    const result = await sendBookAnInstructorEmail({
      to: requestData?.client_email,
      subject: `New instructor reply for ${requestData?.title || "your request"}`,
      html: `
        <h1>You have a new instructor reply</h1>
        <p>Hi ${requestData?.client_name || "there"},</p>
        <p>An instructor has replied to your request. Review their offer, message them if you need to clarify anything, then select the instructor you would like to book.</p>
        <p><strong>Instructor:</strong> ${instructor?.name || "Instructor"}</p>
        <p><strong>Price:</strong> ${data.price ? `$${data.price}` : "Not supplied"}</p>
        <p><strong>Availability:</strong> ${data.availability || "Not supplied"}</p>
        <p>${data.message || ""}</p>
        ${actionButton("Review reply", `${appBaseUrl}/my-jobs`)}
      `,
      text: [
        "You have a new instructor reply. Review their offer, message them if needed, then select the instructor you would like to book.",
        `Instructor: ${instructor?.name || "Instructor"}`,
        `Price: ${data.price ? `$${data.price}` : "Not supplied"}`,
        `Availability: ${data.availability || "Not supplied"}`,
        data.message || "",
        `Review reply: ${appBaseUrl}/my-jobs`,
      ].join("\n\n"),
    });

    return NextResponse.json(result);
  }

  if (event === "instructor_selected") {
    const { data } = await supabase
      .from("offers")
      .select("id,instructor:instructors(email,name),request:client_requests(title,client_name,client_user_id)")
      .eq("id", id)
      .maybeSingle();
    if (!data) return NextResponse.json({ error: "Offer not found." }, { status: 404 });

    const requestData = one(data.request);
    if (requestData?.client_user_id && requestData.client_user_id !== user.id) {
      return NextResponse.json({ error: "Only the client can send this notification." }, { status: 403 });
    }

    const instructor = one(data.instructor);
    const result = await sendBookAnInstructorEmail({
      to: instructor?.email,
      subject: `You were selected for ${requestData?.title || "a BookAnInstructor request"}`,
      html: `
        <h1>You have been selected</h1>
        <p>Great news. ${requestData?.client_name || "The client"} selected you for <strong>${requestData?.title || "their request"}</strong>.</p>
        <p>The client will now review the booking agreement and send it to you through BookAnInstructor. Please wait for the agreement before treating the booking as confirmed.</p>
        ${actionButton("Open BookAnInstructor", `${appBaseUrl}/my-agreements`)}
      `,
      text: [
        "You have been selected.",
        `${requestData?.client_name || "The client"} selected you for ${requestData?.title || "their request"}.`,
        "The client will now review and send the booking agreement through BookAnInstructor.",
        `Open BookAnInstructor: ${appBaseUrl}/my-agreements`,
      ].join("\n\n"),
    });

    return NextResponse.json(result);
  }

  if (event === "agreement_sent") {
    const { data } = await supabase
      .from("booking_agreements")
      .select("id,contract_number,job_title,client_user_id,instructor:instructors(email,name)")
      .eq("id", id)
      .maybeSingle();
    if (!data) return NextResponse.json({ error: "Agreement not found." }, { status: 404 });

    if (data.client_user_id && data.client_user_id !== user.id) {
      return NextResponse.json({ error: "Only the client can send this notification." }, { status: 403 });
    }

    const instructor = one(data.instructor);
    const agreementUrl = `${appBaseUrl}/agreements/${data.id}`;
    const result = await sendBookAnInstructorEmail({
      to: instructor?.email,
      subject: `Agreement ready for ${data.job_title || "your booking"}`,
      html: `
        <h1>Agreement ready for review</h1>
        <p>The client has sent the booking agreement for your review.</p>
        <p>Please check the details carefully. If everything looks correct, accept the agreement in BookAnInstructor. The client will then be asked to complete payment.</p>
        <p><strong>Contract:</strong> ${data.contract_number || data.id.slice(0, 8)}</p>
        ${actionButton("Review and accept agreement", agreementUrl)}
      `,
      text: [
        "Agreement ready for review.",
        `Contract: ${data.contract_number || data.id.slice(0, 8)}`,
        "Please review the details and accept the agreement if everything looks correct.",
        `Review and accept agreement: ${agreementUrl}`,
      ].join("\n\n"),
    });

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unsupported notification event." }, { status: 400 });
}
