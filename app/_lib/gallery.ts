import type { Dirent } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { PHOTOS_PER_CATEGORY_PAGE } from "@/app/_lib/gallery.constants";

export { PHOTOS_PER_CATEGORY_PAGE };

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

export type GalleryPhoto = {
  id: string;
  category: string;
  fileName: string;
  src: string;
  modifiedAt: number;
  modifiedAtISO: string;
};

export type GalleryCategoryGroup = {
  category: string;
  sectionId: string;
  photos: GalleryPhoto[];
};

function toSectionId(category: string): string {
  const normalized = category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized.length > 0 ? `category-${normalized}` : "category-untitled";
}

function isImageFile(fileName: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function toPublicSrc(category: string, fileName: string): string {
  return `/gallery/${encodeURIComponent(category)}/${encodeURIComponent(fileName)}`;
}

export async function getGalleryData(): Promise<GalleryPhoto[]> {
  const galleryRoot = path.join(process.cwd(), "public", "gallery");

  let categoryEntries: Dirent[];
  try {
    categoryEntries = await readdir(galleryRoot, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const categories = categoryEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const photosByCategory = await Promise.all(
    categories.map(async (category) => {
      const categoryPath = path.join(galleryRoot, category);
      const entries = await readdir(categoryPath, { withFileTypes: true });
      const files = entries
        .filter((entry) => entry.isFile() && isImageFile(entry.name))
        .map((entry) => entry.name);

      const photos = await Promise.all(
        files.map(async (fileName) => {
          const absolutePath = path.join(categoryPath, fileName);
          const fileStat = await stat(absolutePath);
          const modifiedAt = fileStat.mtimeMs;

          return {
            id: `${category}/${fileName}`,
            category,
            fileName,
            src: toPublicSrc(category, fileName),
            modifiedAt,
            modifiedAtISO: new Date(modifiedAt).toISOString(),
          } satisfies GalleryPhoto;
        }),
      );

      return photos;
    }),
  );

  return photosByCategory
    .flat()
    .sort(
      (a, b) =>
        b.modifiedAt - a.modifiedAt ||
        a.category.localeCompare(b.category) ||
        a.fileName.localeCompare(b.fileName),
    );
}

export function groupPhotosByCategory(
  photos: GalleryPhoto[],
): GalleryCategoryGroup[] {
  const grouped = new Map<string, GalleryPhoto[]>();

  for (const photo of photos) {
    const items = grouped.get(photo.category);
    if (items) {
      items.push(photo);
    } else {
      grouped.set(photo.category, [photo]);
    }
  }

  return [...grouped.entries()].map(([category, categoryPhotos]) => ({
    category,
    sectionId: toSectionId(category),
    photos: categoryPhotos,
  }));
}
