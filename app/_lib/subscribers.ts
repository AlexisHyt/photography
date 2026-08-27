import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

export type Subscriber = typeof subscribers.$inferSelect;

// Deliberately permissive: the only authority on whether an address exists is
// the delivery attempt itself, so this just rejects obvious typos.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAIL_MAX_LENGTH = 254;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return value.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(value);
}

export async function subscribeEmail(
  email: string,
): Promise<"created" | "already-subscribed"> {
  const [created] = await db
    .insert(subscribers)
    .values({ email })
    .onConflictDoNothing({ target: subscribers.email })
    .returning();

  return created ? "created" : "already-subscribed";
}

export async function listSubscribers(): Promise<Subscriber[]> {
  return db.select().from(subscribers).orderBy(asc(subscribers.createdAt));
}

export async function findSubscriberByToken(
  token: string,
): Promise<Subscriber | null> {
  if (!token) {
    return null;
  }

  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .limit(1);

  return subscriber ?? null;
}

// Returns the address that was removed, or null when the token is unknown —
// which also covers the case of a link being followed twice.
export async function deleteSubscriberByToken(
  token: string,
): Promise<string | null> {
  if (!token) {
    return null;
  }

  const [deleted] = await db
    .delete(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .returning({ email: subscribers.email });

  return deleted?.email ?? null;
}
