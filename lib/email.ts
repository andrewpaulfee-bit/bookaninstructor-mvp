export const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "BookAnInstructor <notifications@bookaninstructor.com>";

export async function sendBookAnInstructorEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | null | undefined;
  subject: string;
  html: string;
  text: string;
}) {
  if (!to) {
    return { skipped: true, reason: "No recipient email supplied." };
  }

  if (!resendApiKey) {
    console.log("Email skipped. Add RESEND_API_KEY to enable:", { to, subject });
    return { skipped: true, reason: "RESEND_API_KEY is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { message?: string; error?: string; name?: string };
      message = parsed.message || parsed.error || parsed.name || body;
    } catch {
      message = body;
    }
    console.error("Resend email failed:", { to, subject, body });
    return { error: message || "Could not send email." };
  }

  return { sent: true };
}

export function actionButton(label: string, url: string) {
  return `<p><a href="${url}" style="display:inline-block;background:#4374d1;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">${label}</a></p>`;
}
