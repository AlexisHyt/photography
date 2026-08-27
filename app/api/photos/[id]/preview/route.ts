import { eq } from "drizzle-orm";
import sharp from "sharp";
import { getMinioObjectBuffer } from "@/app/_lib/storage/minio";
import { db } from "@/db";
import { photos } from "@/db/schema";

export const runtime = "nodejs";

const PREVIEW_WIDTH = 720;
const PREVIEW_QUALITY = 78;

/**
 * Serves a downscaled copy of a published photograph under a permanent URL.
 *
 * Emails keep working for years, while the presigned MinIO links stored on the
 * photo row expire within the hour, so announcements point here instead. The
 * response is derived on the fly — nothing extra is stored — and a photo id
 * always maps to a single immutable storage key, hence the aggressive caching.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [photo] = await db
    .select({
      storageKey: photos.storageKey,
      isPublished: photos.isPublished,
    })
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);

  if (!photo || photo.isPublished !== 1) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const original = await getMinioObjectBuffer(photo.storageKey);
    const preview = await sharp(original)
      .rotate()
      .resize({ width: PREVIEW_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: PREVIEW_QUALITY, progressive: true })
      .toBuffer();

    return new Response(new Uint8Array(preview), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(preview.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(`[preview] Could not render photo ${id}`, error);
    return new Response("Preview unavailable", { status: 502 });
  }
}
