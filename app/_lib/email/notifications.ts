import { getMailerConfig, getResendClient } from "@/app/_lib/email/mailer";
import {
  type NewPhotosEmailPhoto,
  renderNewPhotosEmail,
} from "@/app/_lib/email/new-photos-email";
import { buildSiteUrl } from "@/app/_lib/site-url";
import { listSubscribers } from "@/app/_lib/subscribers";

// Resend caps a batch at 100 messages per call.
const BATCH_SIZE = 100;

export type NewPhotosNotification = {
  categoryName: string;
  categorySlug: string;
  photos: NewPhotosEmailPhoto[];
};

export type NotificationResult = {
  sent: number;
  failed: number;
  recipients: number;
};

export function buildUnsubscribeUrl(token: string): string {
  return buildSiteUrl(`/unsubscribe?token=${encodeURIComponent(token)}`);
}

function buildOneClickUnsubscribeUrl(token: string): string {
  return buildSiteUrl(`/api/unsubscribe?token=${encodeURIComponent(token)}`);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

/**
 * Notifies every subscriber that photographs were published.
 *
 * Each recipient gets their own message rather than one blind-copied blast.
 * The unsubscribe link carries a per-recipient token, which a shared BCC body
 * cannot express, and Resend's batch endpoint sends the whole list in a single
 * HTTP call anyway — so the personalisation costs nothing. Addresses stay
 * invisible to one another, and a bad address fails on its own instead of
 * taking the batch down with it.
 */
export async function sendNewPhotosNotification({
  categoryName,
  categorySlug,
  photos,
}: NewPhotosNotification): Promise<NotificationResult> {
  if (photos.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const config = getMailerConfig();

  if (!config) {
    console.warn(
      "[notifications] RESEND_API_KEY is not set, skipping the new photo announcement.",
    );
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const recipients = await listSubscribers();

  if (recipients.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const resend = getResendClient();
  let sent = 0;
  let failed = 0;

  // Sequential on purpose: the default Resend rate limit is a couple of
  // requests per second, and each round trip already covers a hundred people.
  for (const batch of chunk(recipients, BATCH_SIZE)) {
    const messages = batch.map((subscriber) => {
      const unsubscribeUrl = buildUnsubscribeUrl(subscriber.unsubscribeToken);
      const { subject, html, text } = renderNewPhotosEmail({
        categoryName,
        categorySlug,
        photos,
        unsubscribeUrl,
      });

      return {
        from: config.from,
        to: subscriber.email,
        subject,
        html,
        text,
        headers: {
          // Lets Gmail and friends show their own unsubscribe control.
          "List-Unsubscribe": `<${buildOneClickUnsubscribeUrl(subscriber.unsubscribeToken)}>, <${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };
    });

    try {
      // Permissive validation keeps one malformed address from rejecting the
      // whole batch; the rejected entries come back in `errors`.
      const { data, error } = await resend.batch.send(messages, {
        batchValidation: "permissive",
      });

      if (error) {
        failed += messages.length;
        console.error("[notifications] Batch rejected by Resend", error);
        continue;
      }

      const rejected = data?.errors?.length ?? 0;
      sent += data?.data.length ?? 0;
      failed += rejected;

      for (const entry of data?.errors ?? []) {
        console.error(
          `[notifications] Rejected ${messages[entry.index]?.to}: ${entry.message}`,
        );
      }
    } catch (error) {
      failed += messages.length;
      console.error("[notifications] Batch request failed", error);
    }
  }

  return { sent, failed, recipients: recipients.length };
}
