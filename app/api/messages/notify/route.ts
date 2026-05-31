import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "BookAnInstructor <notifications@bookaninstructor.com>";

export async function POST(request: Request) {
  const { conversationId, messageId } = await request.json();

  if (!conversationId || !messageId) {
    return NextResponse.json({ error: "Missing conversation or message." }, { status: 400 });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase environment is missing." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

  const [{ data: conversation }, { data: message }] = await Promise.all([
    supabase
      .from("conversations")
      .select(
        "id,request:client_requests(title,client_email,client_name),instructor:instructors(name,email)"
      )
      .eq("id", conversationId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id,author_role,body")
      .eq("id", messageId)
      .maybeSingle(),
  ]);

  if (!conversation || !message) {
    return NextResponse.json({ error: "Conversation or message not found." }, { status: 404 });
  }

  const requestData = Array.isArray(conversation.request)
    ? conversation.request[0]
    : conversation.request;
  const instructorData = Array.isArray(conversation.instructor)
    ? conversation.instructor[0]
    : conversation.instructor;

  const recipient =
    message.author_role === "client"
      ? instructorData?.email
      : requestData?.client_email;

  if (!recipient) {
    return NextResponse.json({ skipped: true, reason: "No recipient email found." });
  }

  if (!resendApiKey) {
    console.log("Email notification skipped. Add RESEND_API_KEY to enable:", {
      recipient,
      conversationId,
      messageId,
    });
    return NextResponse.json({ skipped: true, reason: "RESEND_API_KEY is not configured." });
  }

  const subject = `New message about ${requestData?.title || "your instructor request"}`;
  const preview = message.body.length > 180 ? `${message.body.slice(0, 177)}...` : message.body;

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
      text: [
        "You have a new BookAnInstructor message.",
        "",
        preview,
        "",
        "Log in to BookAnInstructor to reply. For safety, please keep all contact details inside your account details, not chat messages.",
      ].join("\n"),
    }),
  });

  if (!emailResult.ok) {
    const body = await emailResult.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { message?: string; error?: string; name?: string };
      message = parsed.message || parsed.error || parsed.name || body;
    } catch {
      message = body;
    }
    return NextResponse.json({ error: message || "Could not send notification email." }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
