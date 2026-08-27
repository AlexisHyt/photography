import path from "node:path";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  GALLERY_IMAGE_ACCEPT,
  PHOTOS_PER_CATEGORY_PAGE,
  SUPPORTED_IMAGE_EXTENSIONS,
} from "@/app/_lib/gallery.constants";
import {
  deleteFromMinio,
  getSignedMinioUrl,
  uploadToMinio,
} from "@/app/_lib/storage/minio";
import { db } from "@/db";
import { categories, photos } from "@/db/schema";

export { GALLERY_IMAGE_ACCEPT, PHOTOS_PER_CATEGORY_PAGE };

const IMAGE_EXTENSIONS = new Set<string>(SUPPORTED_IMAGE_EXTENSIONS);

const WINDOWS_RESERVED_NAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

const INVALID_FILE_NAME_CHARACTERS = new Set([
  "<",
  ">",
  ":",
  '"',
  "/",
  "\\",
  "|",
  "?",
  "*",
]);

export type PhotoMetadata = {
  description: string | null;
  iso: string | null;
  aperture: string | null;
  exposureTime: string | null;
  focalLength: string | null;
  cameraModel: string | null;
};

export type GalleryPhoto = {
  id: string;
  dbId: string;
  category: string;
  categorySlug: string;
  fileName: string;
  src: string;
  description: string | null;
  iso: string | null;
  aperture: string | null;
  exposureTime: string | null;
  focalLength: string | null;
  cameraModel: string | null;
  modifiedAt: number;
  modifiedAtISO: string;
};

export type GalleryCategory = {
  name: string;
  slug: string;
};

export type GalleryCategoryGroup = {
  category: string;
  categorySlug: string;
  sectionId: string;
  photos: GalleryPhoto[];
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function ensureSafePathSegment(value: string, label: string): string {
  if (value.length === 0) {
    throw new Error(`${label} is required.`);
  }

  if (value === "." || value === "..") {
    throw new Error(`${label} is invalid.`);
  }

  if (value.includes("/") || value.includes("\\") || value.includes("\0")) {
    throw new Error(`${label} is invalid.`);
  }

  return value;
}

export function normalizeCategoryName(category: string): string {
  const normalized = ensureSafePathSegment(
    normalizeWhitespace(category),
    "Category",
  );

  if (WINDOWS_RESERVED_NAMES.has(normalized.toUpperCase())) {
    throw new Error("Category name is not allowed on this server.");
  }

  return normalized;
}

export function normalizeCategorySlug(category: string): string {
  const normalized = normalizeWhitespace(category)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (normalized.length === 0) {
    throw new Error("Category is invalid.");
  }

  if (WINDOWS_RESERVED_NAMES.has(normalized.toUpperCase())) {
    throw new Error("Category name is not allowed on this server.");
  }

  return normalized;
}

function sanitizeWindowsFileNamePart(value: string): string {
  return [...value]
    .map((character) => {
      const code = character.charCodeAt(0);

      if (code < 32 || INVALID_FILE_NAME_CHARACTERS.has(character)) {
        return "-";
      }

      return character;
    })
    .join("");
}

function sanitizeFileName(fileName: string): string {
  const baseName = path.basename(fileName);
  const parsed = path.parse(baseName);
  const extension = parsed.ext.toLowerCase();

  if (!IMAGE_EXTENSIONS.has(extension)) {
    throw new Error("Unsupported image format.");
  }

  let normalizedName = sanitizeWindowsFileNamePart(
    normalizeWhitespace(parsed.name),
  )
    .replace(/[.\s]+$/g, "")
    .trim();

  if (normalizedName.length === 0) {
    normalizedName = "photo";
  }

  if (WINDOWS_RESERVED_NAMES.has(normalizedName.toUpperCase())) {
    normalizedName = `${normalizedName}-photo`;
  }

  return `${normalizedName}${extension}`;
}

function toSectionId(category: string): string {
  const normalized = category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized.length > 0 ? `category-${normalized}` : "category-untitled";
}

function generateStorageKey(categoryId: string, fileName: string): string {
  return `photos/${categoryId}/${fileName}`;
}

function toIsoTimestamp(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

type GalleryPhotoRow = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  storageKey: string;
  description: string | null;
  iso: string | null;
  aperture: string | null;
  exposureTime: string | null;
  focalLength: string | null;
  cameraModel: string | null;
  createdAt: string | Date;
};

async function mapGalleryPhotoRows(
  rows: GalleryPhotoRow[],
): Promise<GalleryPhoto[]> {
  return await Promise.all(
    rows.map(async (photo) => ({
      id: `${photo.categoryId}/${photo.id}`,
      dbId: photo.id,
      category: photo.categoryName,
      categorySlug: photo.categorySlug,
      fileName: path.basename(photo.storageKey),
      src: await getSignedMinioUrl(photo.storageKey),
      description: photo.description,
      iso: photo.iso,
      aperture: photo.aperture,
      exposureTime: photo.exposureTime,
      focalLength: photo.focalLength,
      cameraModel: photo.cameraModel,
      modifiedAt: new Date(photo.createdAt).getTime(),
      modifiedAtISO: toIsoTimestamp(photo.createdAt),
    })),
  );
}

async function getOrCreateCategory(
  categoryName: string,
): Promise<{ id: string; name: string; slug: string }> {
  const normalized = normalizeCategoryName(categoryName);
  const slug = normalizeCategorySlug(normalized);

  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (existingCategory) {
    return existingCategory;
  }

  const [createdCategory] = await db
    .insert(categories)
    .values({ name: normalized, slug })
    .returning();

  if (!createdCategory) {
    throw new Error("Failed to create category.");
  }

  return createdCategory;
}

export async function getGalleryData(): Promise<GalleryPhoto[]> {
  const allPhotos = await db
    .select({
      id: photos.id,
      categoryId: photos.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      storageKey: photos.storageKey,
      description: photos.description,
      iso: photos.iso,
      aperture: photos.aperture,
      exposureTime: photos.exposureTime,
      focalLength: photos.focalLength,
      cameraModel: photos.cameraModel,
      createdAt: photos.createdAt,
    })
    .from(photos)
    .innerJoin(categories, eq(photos.categoryId, categories.id))
    .where(eq(photos.isPublished, 1))
    .orderBy(desc(photos.createdAt), asc(photos.sortOrder));

  return await mapGalleryPhotoRows(allPhotos);
}

export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  return await db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.name));
}

export async function getGalleryCategoryBySlug(
  slug: string,
): Promise<GalleryCategoryGroup | null> {
  const normalizedSlug = normalizeCategorySlug(slug);

  const [category] = await db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.slug, normalizedSlug))
    .limit(1);

  if (!category) {
    return null;
  }

  const photosForCategory = await db
    .select({
      id: photos.id,
      categoryId: photos.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      storageKey: photos.storageKey,
      description: photos.description,
      iso: photos.iso,
      aperture: photos.aperture,
      exposureTime: photos.exposureTime,
      focalLength: photos.focalLength,
      cameraModel: photos.cameraModel,
      createdAt: photos.createdAt,
    })
    .from(photos)
    .innerJoin(categories, eq(photos.categoryId, categories.id))
    .where(and(eq(photos.isPublished, 1), eq(categories.slug, normalizedSlug)))
    .orderBy(desc(photos.createdAt), asc(photos.sortOrder));

  return {
    category: category.name,
    categorySlug: category.slug,
    sectionId: toSectionId(category.slug),
    photos: await mapGalleryPhotoRows(photosForCategory),
  };
}

export type UploadedGalleryPhoto = {
  id: string;
  fileName: string;
};

export async function uploadGalleryPhotos(
  categoryName: string,
  files: File[],
  metadata?: Partial<PhotoMetadata> | null,
): Promise<{
  category: string;
  categorySlug: string;
  fileNames: string[];
  uploaded: UploadedGalleryPhoto[];
}> {
  const validFiles = files.filter((file) => file.size > 0);

  if (validFiles.length === 0) {
    throw new Error("Please choose at least one image to upload.");
  }

  const category = await getOrCreateCategory(categoryName);
  const uploaded: UploadedGalleryPhoto[] = [];

  for (const file of validFiles) {
    const sanitizedFileName = sanitizeFileName(file.name);
    const storageKey = generateStorageKey(category.id, sanitizedFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "application/octet-stream";

    // Upload to MinIO
    const publicUrl = await uploadToMinio(storageKey, buffer, contentType);

    // Store in DB
    const [inserted] = await db
      .insert(photos)
      .values({
      categoryId: category.id,
      storageKey,
      publicUrl,
      isPublished: 1,
      description: metadata?.description?.trim() || null,
      iso: metadata?.iso?.trim() || null,
      aperture: metadata?.aperture?.trim() || null,
      exposureTime: metadata?.exposureTime?.trim() || null,
      focalLength: metadata?.focalLength?.trim() || null,
        cameraModel: metadata?.cameraModel?.trim() || null,
      })
      .returning({ id: photos.id });

    if (inserted) {
      uploaded.push({ id: inserted.id, fileName: sanitizedFileName });
    }
  }

  return {
    category: category.name,
    categorySlug: category.slug,
    fileNames: uploaded.map((photo) => photo.fileName),
    uploaded,
  };
}

export async function deleteGalleryPhoto(
  categoryName: string,
  fileName: string,
): Promise<void> {
  const categoryName_ = normalizeCategoryName(categoryName);

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.name, categoryName_))
    .limit(1);

  if (!category) {
    throw new Error("Category not found.");
  }

  const [photo] = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.categoryId, category.id),
        eq(photos.storageKey, generateStorageKey(category.id, fileName)),
      ),
    )
    .limit(1);

  if (!photo) {
    throw new Error("Photo not found.");
  }

  // Delete from MinIO
  await deleteFromMinio(photo.storageKey);

  // Delete from DB
  await db.delete(photos).where(eq(photos.id, photo.id));
}

export async function moveGalleryPhotoToCategory(
  currentCategoryName: string,
  fileName: string,
  nextCategoryName: string,
): Promise<{ category: string; fileName: string }> {
  if (currentCategoryName === nextCategoryName) {
    return {
      category: currentCategoryName,
      fileName,
    };
  }

  const currentCat = await getOrCreateCategory(currentCategoryName);
  const nextCat = await getOrCreateCategory(nextCategoryName);

  const [photo] = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.categoryId, currentCat.id),
        eq(photos.storageKey, generateStorageKey(currentCat.id, fileName)),
      ),
    )
    .limit(1);

  if (!photo) {
    throw new Error("Photo not found.");
  }

  const newStorageKey = generateStorageKey(nextCat.id, fileName);

  // Update in DB
  await db
    .update(photos)
    .set({
      categoryId: nextCat.id,
      storageKey: newStorageKey,
    })
    .where(eq(photos.id, photo.id));

  return {
    category: nextCat.name,
    fileName,
  };
}

export async function updateGalleryPhotoMetadata(
  photoId: string,
  metadata: PhotoMetadata,
): Promise<void> {
  await db
    .update(photos)
    .set({
      description: metadata.description,
      iso: metadata.iso,
      aperture: metadata.aperture,
      exposureTime: metadata.exposureTime,
      focalLength: metadata.focalLength,
      cameraModel: metadata.cameraModel,
    })
    .where(eq(photos.id, photoId));
}

export function groupPhotosByCategory(
  photos: GalleryPhoto[],
): GalleryCategoryGroup[] {
  const grouped = new Map<string, GalleryPhoto[]>();

  for (const photo of photos) {
    const items = grouped.get(photo.categorySlug);
    if (items) {
      items.push(photo);
    } else {
      grouped.set(photo.categorySlug, [photo]);
    }
  }

  return [...grouped.entries()].map(([, categoryPhotos]) => ({
    category: categoryPhotos[0]?.category ?? "Untitled",
    categorySlug: categoryPhotos[0]?.categorySlug ?? "untitled",
    sectionId: toSectionId(categoryPhotos[0]?.categorySlug ?? "untitled"),
    photos: categoryPhotos,
  }));
}
