import { buildSiteUrl } from "@/app/_lib/site-url";
import { deleteSubscriberByToken } from "@/app/_lib/subscribers";

export const runtime = "nodejs";

function readToken(request: Request): string {
  return new URL(request.url).searchParams.get("token") ?? "";
}

/**
 * One-click unsubscribe (RFC 8058), used by the mail client's own button.
 *
 * Always answers 204, whether or not the token matched: the caller is a mail
 * provider, and telling it which tokens exist would leak list membership.
 */
export async function POST(request: Request): Promise<Response> {
  await deleteSubscriberByToken(readToken(request));

  return new Response(null, { status: 204 });
}

/**
 * Deliberately does not mutate anything. Spam filters and link scanners follow
 * every URL in an email, so a GET that unsubscribed would remove people who
 * never clicked. Humans are sent to the confirmation page instead.
 */
export function GET(request: Request): Response {
  const token = readToken(request);

  return Response.redirect(
    buildSiteUrl(`/unsubscribe?token=${encodeURIComponent(token)}`),
    302,
  );
}
