export const PHOTOS_PER_CATEGORY_PAGE = 12;

/**
 * Query string key holding the id of the photo whose lightbox is open, so a
 * category URL can be shared and reopen on the exact same image.
 */
export const LIGHTBOX_PHOTO_PARAM = "photo";

export const SUPPORTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
] as const;

export const GALLERY_IMAGE_ACCEPT = SUPPORTED_IMAGE_EXTENSIONS.join(",");
