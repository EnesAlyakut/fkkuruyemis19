import { resolveMx } from "dns/promises";
import { looksSuspiciousEmailLocalPart } from "@/lib/orderValidation";

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "20minutemail.com",
  "anonaddy.com",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "maildrop.cc",
  "mailinator.com",
  "mintemail.com",
  "moakt.com",
  "mytemp.email",
  "nada.ltd",
  "sharklasers.com",
  "temp-mail.org",
  "tempmail.com",
  "tempail.com",
  "tempr.email",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
]);

const BLOCKED_TEST_DOMAINS = new Set([
  "domain.com",
  "email.com",
  "example.com",
  "example.net",
  "example.org",
  "fake.com",
  "invalid.com",
  "localhost",
  "noemail.com",
  "test.com",
]);

const BLOCKED_LOCAL_PARTS = new Set([
  "a",
  "aa",
  "aaa",
  "asdf",
  "fake",
  "mail",
  "qwerty",
  "test",
  "testing",
  "xxx",
]);

export type EmailValidationResult =
  | { valid: true; normalizedEmail: string }
  | { valid: false; message: string };

export async function validateDeliverableEmail(
  email: string
): Promise<EmailValidationResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const [localPart, rawDomain] = normalizedEmail.split("@");
  const domain = rawDomain?.replace(/\.$/, "");

  if (!localPart || !domain) {
    return { valid: false, message: "Ge\u00e7erli bir e-posta giriniz." };
  }

  if (
    localPart.length < 2 ||
    BLOCKED_LOCAL_PARTS.has(localPart) ||
    looksSuspiciousEmailLocalPart(normalizedEmail)
  ) {
    return {
      valid: false,
      message: "L\u00fctfen ger\u00e7ek e-posta adresinizi giriniz.",
    };
  }

  if (
    BLOCKED_TEST_DOMAINS.has(domain) ||
    DISPOSABLE_EMAIL_DOMAINS.has(domain) ||
    isDisposableSubdomain(domain)
  ) {
    return {
      valid: false,
      message: "Ge\u00e7ici veya sahte e-posta adresleri kabul edilmez.",
    };
  }

  if (isSuspiciousDomain(domain)) {
    return {
      valid: false,
      message: "L\u00fctfen ger\u00e7ek e-posta adresinizi giriniz.",
    };
  }

  const hasMx = await hasMailExchange(domain);
  if (!hasMx) {
    return {
      valid: false,
      message: "Bu e-posta alan ad\u0131 ge\u00e7erli g\u00f6r\u00fcnm\u00fcyor.",
    };
  }

  return { valid: true, normalizedEmail };
}

export async function validateNewsletterEmail(
  email: string
): Promise<EmailValidationResult> {
  return validateDeliverableEmail(email);
}

function isDisposableSubdomain(domain: string) {
  return Array.from(DISPOSABLE_EMAIL_DOMAINS).some((blockedDomain) =>
    domain.endsWith(`.${blockedDomain}`)
  );
}

function isSuspiciousDomain(domain: string) {
  if (!domain.includes(".")) return true;
  if (domain.includes("..")) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) return true;
  if (/\.(test|invalid|localhost)$/i.test(domain)) return true;
  return false;
}

async function hasMailExchange(domain: string) {
  try {
    const records = await Promise.race([
      resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("MX lookup timeout")), 3000)
      ),
    ]);
    return records.some((record) => record.exchange && record.exchange !== ".");
  } catch {
    return false;
  }
}
