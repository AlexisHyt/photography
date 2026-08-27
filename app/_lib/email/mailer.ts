import { Resend } from "resend";

// Resend only accepts a sender on a domain verified in the account. The
// fallback is Resend's shared sandbox address, which is limited to delivering
// to the account owner — good enough to try things out, not for production.
const FALLBACK_FROM = "Alexis Hayat Photography <onboarding@resend.dev>";

export type MailerConfig = {
  apiKey: string;
  from: string;
};

// Returns null instead of throwing so callers can degrade quietly: a missing
// API key must never break a photo upload.
export function getMailerConfig(): MailerConfig | null {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    from: process.env.MAIL_FROM ?? FALLBACK_FROM,
  };
}

let client: Resend | null = null;

export function getResendClient(): Resend {
  if (client) {
    return client;
  }

  const config = getMailerConfig();

  if (!config) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  client = new Resend(config.apiKey);

  return client;
}
