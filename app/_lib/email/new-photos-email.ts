import { buildSiteUrl } from "@/app/_lib/site-url";

export type NewPhotosEmailPhoto = {
  id: string;
  alt: string;
};

export type NewPhotosEmailInput = {
  categoryName: string;
  categorySlug: string;
  photos: NewPhotosEmailPhoto[];
  unsubscribeUrl: string;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

// Mail clients render a small, old subset of HTML: tables for layout, inline
// styles only, no <style> blocks worth relying on and no external assets.
const CONTENT_WIDTH = 560;
const MAX_PREVIEWS = 3;

const PLATE = "#161320";
const ACCENT = "#FFC24B";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function renderNewPhotosEmail({
  categoryName,
  categorySlug,
  photos,
  unsubscribeUrl,
}: NewPhotosEmailInput): RenderedEmail {
  const count = photos.length;
  const noun = pluralize(count, "photograph", "photographs");
  const categoryUrl = buildSiteUrl(`/categories/${categorySlug}`);
  const logoUrl = buildSiteUrl("/icons/icon-192.png");

  const subject = `${count} new ${noun} in ${categoryName}`;
  const previews = photos.slice(0, MAX_PREVIEWS);
  const remaining = count - previews.length;

  const previewRows = previews
    .map((photo) => {
      // A stable route rather than the storage URL: presigned MinIO links
      // expire within the hour, long before somebody opens the email.
      const src = buildSiteUrl(`/api/photos/${photo.id}/preview`);

      return `<tr><td style="padding:0 0 12px 0;">
  <a href="${escapeHtml(categoryUrl)}" style="display:block;">
    <img src="${escapeHtml(src)}" alt="${escapeHtml(photo.alt)}" width="${CONTENT_WIDTH}" style="display:block;width:100%;max-width:${CONTENT_WIDTH}px;height:auto;border:0;border-radius:12px;" />
  </a>
</td></tr>`;
    })
    .join("\n");

  const remainingRow =
    remaining > 0
      ? `<tr><td style="padding:4px 0 12px 0;font:14px/22px Helvetica,Arial,sans-serif;color:#71717a;">
  and ${remaining} more in the collection.
</td></tr>`
      : "";

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="${CONTENT_WIDTH}" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:${CONTENT_WIDTH}px;background:#ffffff;border-radius:16px;overflow:hidden;">

      <tr><td style="background:${PLATE};padding:24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:12px;"><img src="${escapeHtml(logoUrl)}" alt="" width="32" height="32" style="display:block;border:0;border-radius:8px;" /></td>
            <td style="font:600 15px/20px Helvetica,Arial,sans-serif;color:#ffffff;">Alexis Hayat Photography</td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:28px 24px 8px 24px;">
        <p style="margin:0 0 6px 0;font:11px/16px Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#a1a1aa;">New in the gallery</p>
        <h1 style="margin:0 0 12px 0;font:600 24px/30px Helvetica,Arial,sans-serif;color:#18181b;">${escapeHtml(categoryName)}</h1>
        <p style="margin:0 0 20px 0;font:15px/24px Helvetica,Arial,sans-serif;color:#52525b;">
          ${count} new ${noun} ${pluralize(count, "was", "were")} just added to the <strong>${escapeHtml(categoryName)}</strong> collection.
        </p>
      </td></tr>

      <tr><td style="padding:0 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${previewRows}
          ${remainingRow}
        </table>
      </td></tr>

      <tr><td style="padding:12px 24px 32px 24px;">
        <a href="${escapeHtml(categoryUrl)}" style="display:inline-block;background:${PLATE};color:${ACCENT};font:600 14px/20px Helvetica,Arial,sans-serif;text-decoration:none;padding:12px 24px;border-radius:999px;">View the collection</a>
      </td></tr>

      <tr><td style="border-top:1px solid #e4e4e7;padding:20px 24px;font:12px/20px Helvetica,Arial,sans-serif;color:#a1a1aa;">
        You are receiving this because you asked to be notified when new photographs are published.
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#71717a;">Unsubscribe</a>.
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    `${count} new ${noun} in ${categoryName}`,
    "",
    `${count} new ${noun} ${pluralize(count, "was", "were")} just added to the ${categoryName} collection.`,
    "",
    `View the collection: ${categoryUrl}`,
    "",
    "You are receiving this because you asked to be notified when new photographs are published.",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return { subject, html, text };
}
