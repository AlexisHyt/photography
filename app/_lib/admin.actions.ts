"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_PAGE_PATH } from "@/app/_lib/admin.constants";
import type { AdminFormState } from "@/app/_lib/admin.form-state";
import { hasAdminSession } from "@/app/_lib/admin-auth";
import {
  deleteGalleryPhoto,
  moveGalleryPhotoToCategory,
  normalizeCategorySlug,
  updateGalleryPhotoMetadata,
  uploadGalleryPhotos,
} from "@/app/_lib/gallery";
import { auth } from "@/auth";

async function ensureAdminAccess(): Promise<boolean> {
  return hasAdminSession();
}

function revalidateGalleryViews(categoryNames: string[] = []): void {
  revalidatePath(ADMIN_PAGE_PATH);
  revalidatePath("/");

  for (const categoryName of categoryNames) {
    revalidatePath(`/categories/${normalizeCategorySlug(categoryName)}`);
  }
}

export async function logoutAdminAction(): Promise<void> {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect(ADMIN_PAGE_PATH);
}

export async function uploadPhotosAction(
  _previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await ensureAdminAccess())) {
    return {
      status: "error",
      message: "Your admin session has expired. Please sign in again.",
    };
  }

  const category = String(formData.get("category") ?? "");
  const files = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File);

  const str = (key: string) => {
    const v = formData.get(key);
    return v && String(v).trim() ? String(v).trim() : null;
  };

  try {
    const result = await uploadGalleryPhotos(category, files, {
      description: str("description"),
      iso: str("iso"),
      aperture: str("aperture"),
      exposureTime: str("exposureTime"),
      focalLength: str("focalLength"),
      cameraModel: str("cameraModel"),
    });

    revalidateGalleryViews([result.category]);

    return {
      status: "success",
      message: `${result.fileNames.length} photo${result.fileNames.length > 1 ? "s" : ""} uploaded to ${result.category}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to upload photos.",
    };
  }
}

export async function deletePhotoAction(formData: FormData): Promise<void> {
  if (!(await ensureAdminAccess())) {
    redirect(ADMIN_PAGE_PATH);
  }

  const category = String(formData.get("category") ?? "");
  const fileName = String(formData.get("fileName") ?? "");

  try {
    await deleteGalleryPhoto(category, fileName);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  revalidateGalleryViews([category]);
}

export async function movePhotoAction(formData: FormData): Promise<void> {
  if (!(await ensureAdminAccess())) {
    redirect(ADMIN_PAGE_PATH);
  }

  const category = String(formData.get("category") ?? "");
  const fileName = String(formData.get("fileName") ?? "");
  const nextCategory = String(formData.get("nextCategory") ?? "");

  try {
    await moveGalleryPhotoToCategory(category, fileName, nextCategory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  revalidateGalleryViews([category, nextCategory]);
}

export async function updatePhotoMetadataAction(
  formData: FormData,
): Promise<void> {
  if (!(await ensureAdminAccess())) {
    redirect(ADMIN_PAGE_PATH);
  }

  const photoId = String(formData.get("photoId") ?? "");
  const category = String(formData.get("category") ?? "");

  const str = (key: string) => {
    const v = formData.get(key);
    return v && String(v).trim() ? String(v).trim() : null;
  };

  await updateGalleryPhotoMetadata(photoId, {
    description: str("description"),
    iso: str("iso"),
    aperture: str("aperture"),
    exposureTime: str("exposureTime"),
    focalLength: str("focalLength"),
    cameraModel: str("cameraModel"),
  });

  revalidateGalleryViews([category]);
}
