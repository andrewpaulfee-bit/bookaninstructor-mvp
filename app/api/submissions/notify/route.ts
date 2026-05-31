import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "BookAnInstructor <notifications@bookaninstructor.com>";
const submissionsEmail = process.env.SUBMISSIONS_EMAIL || "submissions@bookaninstructor.com";
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";

type SubmissionType = "job" | "instructor";

function rowValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return "Not supplied";
  return String(value);
}

function reviewUrl(type: SubmissionType, id: string) {
  return `${appBaseUrl}/admin/${type === "job" ? "jobs" : "instructors"}/${id}`;
}

export async function POST(request: Request) {
  const { type, id } = (await request.json()) as { type?: SubmissionType; id?: string };

  if (!type || !id || !["job", "instructor"].includes(type)) {
    return NextResponse.json({ error: "Missing submission type or id." }, { status: 400 });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase environment is missing." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);
  const table = type === "job" ? "client_requests" : "instructors";
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Submission not found." },
      { status: 404 }
    );
  }

  const url = reviewUrl(type, id);
  const title =
    type === "job"
      ? data.title || data.category || "New job submission"
      : data.name || "New instructor profile";
  const subject =
    type === "job"
      ? `New job post awaiting approval: ${title}`
      : `New instructor profile awaiting approval: ${title}`;

  const lines =
    type === "job"
      ? [
          `Client: ${rowValue(data.client_name)}`,
          `Email: ${rowValue(data.client_email)}`,
          `Mobile: ${rowValue(data.mobile)}`,
          `Company/School/Business: ${rowValue(data.company_name)}`,
          `Title: ${rowValue(data.title)}`,
          `Style: ${rowValue(data.style)}`,
          `Class level: ${rowValue(data.class_level)}`,
          `Frequency: ${rowValue(data.class_frequency)}`,
          `Budget: ${data.budget ? `$${data.budget}` : "Not supplied"}`,
          `Total hours: ${data.total_hours ? `${data.total_hours} hours` : "Not supplied"}`,
          `Hourly rate: ${
            data.budget && data.total_hours
              ? `$${(Number(data.budget) / Number(data.total_hours)).toFixed(2)}/hr`
              : "Not supplied"
          }`,
          `Location: ${rowValue(data.location)}`,
          `Details: ${rowValue(data.details)}`,
        ]
      : [
          `Instructor: ${rowValue(data.name)}`,
          `Email: ${rowValue(data.email)}`,
          `Mobile: ${rowValue(data.mobile)}`,
          `Location: ${rowValue(data.location)}`,
          `Categories: ${rowValue(data.categories)}`,
          `Hourly rate: ${data.hourly_rate ? `$${data.hourly_rate}/hr` : "Not supplied"}`,
          `ABN: ${rowValue(data.abn)}`,
          `GST registered: ${data.registered_for_gst ? "Yes" : "No"}`,
          `Service areas: ${rowValue(data.service_areas)}`,
          `WWCC: ${rowValue(data.working_with_children_card)}`,
          `WWCC expiry: ${rowValue(data.working_with_children_expiry)}`,
          `Bio: ${rowValue(data.bio)}`,
        ];

  if (!resendApiKey) {
    console.log("Submission email skipped. Add RESEND_API_KEY to enable:", {
      type,
      id,
      to: submissionsEmail,
      reviewUrl: url,
    });
    return NextResponse.json({ skipped: true, reason: "RESEND_API_KEY is not configured." });
  }

  const emailResult = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: submissionsEmail,
      subject,
      html: `
        <h1>${subject}</h1>
        <p>A new ${type} submission is waiting for human review.</p>
        <p><a href="${url}" style="display:inline-block;background:#4374d1;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">Review Submission</a></p>
        <h2>Submission details</h2>
        <ul>${lines.map((line) => `<li>${line}</li>`).join("")}</ul>
      `,
      text: [
        subject,
        "",
        "A new submission is waiting for human review.",
        "",
        ...lines,
        "",
        `Review submission: ${url}`,
      ].join("\n"),
    }),
  });

  if (!emailResult.ok) {
    const body = await emailResult.text();
    console.error("Submission notification email failed:", body);
    return NextResponse.json(
      { error: "Could not send submission notification email." },
      { status: 502 }
    );
  }

  return NextResponse.json({ sent: true });
}
