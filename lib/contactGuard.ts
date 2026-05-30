export type ContactGuardResult = {
  blocked: boolean;
  reason: string;
};

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const obfuscatedEmailPattern =
  /\b[A-Z0-9._%+-]+\s*(?:\(|\[)?\s*(?:at|@)\s*(?:\)|\])?\s*[A-Z0-9.-]+\s*(?:\(|\[)?\s*(?:dot|\.)\s*(?:\)|\])?\s*[A-Z]{2,}\b/i;
const urlPattern = /\b(?:https?:\/\/|www\.)\S+/i;
const contactIntentPattern =
  /\b(?:email|e-mail|gmail|hotmail|outlook|icloud|yahoo|phone|mobile|mob|call|text|sms|whatsapp|telegram|signal)\b/i;

function digitCount(value: string) {
  return (value.match(/\d/g) || []).length;
}

function hasPhoneLikeNumber(value: string) {
  const compact = value.replace(/[^\d+]/g, "");
  const digits = value.replace(/\D/g, "");

  if (/\+?61(?:0)?4\d{8}\b/.test(compact)) return true;
  if (/\b04\d{8}\b/.test(digits)) return true;
  if (/\b0[2378]\d{8}\b/.test(digits)) return true;

  const phoneishGroups = value.match(/(?:\+?\d[\d\s().-]{6,}\d)/g) || [];
  return phoneishGroups.some((group) => digitCount(group) >= 8);
}

export function checkMessageForContactDetails(message: string): ContactGuardResult {
  const trimmed = message.trim();

  if (emailPattern.test(trimmed) || obfuscatedEmailPattern.test(trimmed)) {
    return {
      blocked: true,
      reason: "Please keep email addresses inside your account details, not chat messages.",
    };
  }

  if (hasPhoneLikeNumber(trimmed)) {
    return {
      blocked: true,
      reason: "Please keep mobile and phone numbers inside your account details, not chat messages.",
    };
  }

  if (urlPattern.test(trimmed) && contactIntentPattern.test(trimmed)) {
    return {
      blocked: true,
      reason: "Please do not share external contact links in chat.",
    };
  }

  return { blocked: false, reason: "" };
}
