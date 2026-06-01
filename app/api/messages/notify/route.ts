import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { actionButton, appBaseUrl, escapeHtml, sendBookAnInstructorEmail } from "../../../../lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

  const subject = `New message about ${requestData?.title || "your instructor request"}`;
  const preview = message.body.length > 180 ? `${message.body.slice(0, 177)}...` : message.body;
  const messageUrl = `${appBaseUrl}/messages/${conversationId}`;

  const emailResult = await sendBookAnInstructorEmail({
    to: recipient,
    subject,
    html: `
      <h1>You have a new message</h1>
      <p>A new message has been added to your BookAnInstructor conversation.</p>
      <blockquote style="margin:18px 0;padding:14px 16px;border-left:4px solid #4374d1;background:#f5f8fc;color:#2f3747;">${escapeHtml(preview)}</blockquote>
      <p>Log in to reply from the message thread.</p>
      ${actionButton("Open message", messageUrl)}
    `,
    text: [
      "You have a new BookAnInstructor message.",
      preview,
      `Open message: ${messageUrl}`,
    ].join("\n\n"),
  });

  if ("error" in emailResult) {
    return NextResponse.json({ error: emailResult.error || "Could not send notification email." }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
