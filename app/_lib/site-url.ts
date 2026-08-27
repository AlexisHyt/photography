const FALLBACK_SITE_URL = "http://localhost:3000";

// Links inside emails outlive the request that produced them, so they cannot be
// derived from request headers. SITE_URL is the public origin of the deployment.
export function getSiteUrl(): string {
  const configured =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BETTER_AUTH_URL ??
    FALLBACK_SITE_URL;

  return configured.replace(/\/+$/, "");
}

export function buildSiteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
