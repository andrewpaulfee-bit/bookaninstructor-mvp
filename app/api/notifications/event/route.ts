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
    const statusText =
      event === "job_approved"
        ? "approved and published"
        : event === "job_needs_changes"
          ? "reviewed and needs changes"
          : "not approved";

    const result = await sendBookAnInstructorEmail({
      to: data.client_email,
      subject: `Your BookAnInstructor request has been ${statusText}`,
      html: `
        <h1>Your request has been ${statusText}</h1>
        <p><strong>${title}</strong></p>
        ${data.review_notes ? `<p><strong>Review notes:</strong> ${data.review_notes}</p>` : ""}
        ${actionButton("View your job", jobUrl)}
      `,
      text: [
        `Your request has been ${statusText}.`,
        title,
        data.review_notes ? `Review notes: ${data.review_notes}` : "",
        `View your job: ${jobUrl}`,
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
      subject: `Your BookAnInstructor profile has been ${statusText}`,
      html: `
        <h1>Your instructor profile has been ${statusText}</h1>
        ${data.review_notes ? `<p><strong>Review notes:</strong> ${data.review_notes}</p>` : ""}
        ${actionButton("View your profile setup", profileUrl)}
      `,
      text: [
        `Your instructor profile has been ${statusText}.`,
        data.review_notes ? `Review notes: ${data.review_notes}` : "",
        `View your profile setup: ${profileUrl}`,
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
        <p><strong>Instructor:</strong> ${instructor?.name || "Instructor"}</p>
        <p><strong>Price:</strong> ${data.price ? `$${data.price}` : "Not supplied"}</p>
        <p><strong>Availability:</strong> ${data.availability || "Not supplied"}</p>
        <p>${data.message || ""}</p>
        ${actionButton("Review reply", `${appBaseUrl}/my-jobs`)}
      `,
      text: [
        "You have a new instructor reply.",
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
        <h1>You were selected</h1>
        <p>${requestData?.client_name || "The client"} selected you for <strong>${requestData?.title || "their request"}</strong>.</p>
        <p>The client will review the agreement and send it through the platform.</p>
        ${actionButton("Open BookAnInstructor", `${appBaseUrl}/my-agreements`)}
      `,
      text: [
        "You were selected.",
        `${requestData?.client_name || "The client"} selected you for ${requestData?.title || "their request"}.`,
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
        <p>The client has sent your BookAnInstructor agreement.</p>
        <p><strong>Contract:</strong> ${data.contract_number || data.id.slice(0, 8)}</p>
        ${actionButton("Review and accept agreement", agreementUrl)}
      `,
      text: [
        "Agreement ready for review.",
        `Contract: ${data.contract_number || data.id.slice(0, 8)}`,
        `Review and accept agreement: ${agreementUrl}`,
      ].join("\n\n"),
    });

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unsupported notification event." }, { status: 400 });
}
