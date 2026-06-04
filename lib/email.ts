export const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "BookAnInstructor <notifications@bookaninstructor.com>";

export function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emailTemplate(content: string) {
  return `
    <div style="margin:0;padding:0;background:#eef4f9;font-family:Arial,Helvetica,sans-serif;color:#202737;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef4f9;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dce4ed;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="padding:24px 28px 12px;">
                  <img src="${appBaseUrl}/logo-mark.png" alt="BookAnInstructor" width="72" style="display:block;width:72px;height:auto;margin:0 0 18px;" />
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 22px;font-size:16px;line-height:1.6;color:#202737;">
                  ${content}
                  <hr style="border:0;border-top:1px solid #e3ebf4;margin:28px 0 18px;" />
                  <p style="margin:0 0 4px;color:#202737;font-weight:700;">Warm regards,</p>
                  <p style="margin:0;color:#4f5b6d;">The BookAnInstructor Team</p>
                  <p style="margin:14px 0 0;color:#667181;font-size:13px;line-height:1.5;">
                    Please keep booking communication inside BookAnInstructor so agreements, payments, reviews, and support stay clear for everyone.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function emailText(content: string) {
  return [
    content,
    "",
    "Warm regards,",
    "The BookAnInstructor Team",
    "",
    "Please keep booking communication inside BookAnInstructor so agreements, payments, reviews, and support stay clear for everyone.",
  ].join("\n");
}

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
      html: emailTemplate(html),
      text: emailText(text),
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
  return `<p style="margin:22px 0;"><a href="${url}" style="display:inline-block;background:#4374d1;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:700;">${label}</a></p>`;
}
