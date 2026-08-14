export const PHOTOS_PER_CATEGORY_PAGE = 12;

export const SUPPORTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
] as const;

export const GALLERY_IMAGE_ACCEPT = SUPPORTED_IMAGE_EXTENSIONS.join(",");
