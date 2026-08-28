"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Slide } from "yet-another-react-lightbox";
import { GalleryImage } from "@/app/_components/gallery-image";
import { PhotoLightbox } from "@/app/_components/photo-lightbox";
import type { GalleryCategoryGroup, GalleryPhoto } from "@/app/_lib/gallery";
import {
  LIGHTBOX_PHOTO_PARAM,
  PHOTOS_PER_CATEGORY_PAGE,
} from "@/app/_lib/gallery.constants";

function formatCameraSettings(photo: GalleryPhoto): string | undefined {
  const parts: string[] = [];
  if (photo.aperture) parts.push(`f/${photo.aperture}`);
  if (photo.exposureTime) parts.push(`${photo.exposureTime}s`);
  if (photo.iso) parts.push(`ISO ${photo.iso}`);
  if (photo.focalLength) parts.push(`${photo.focalLength} mm`);
  if (photo.cameraModel) parts.push(photo.cameraModel);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

type CategorySectionProps = {
  group: GalleryCategoryGroup;
};

export function CategorySection({ group }: CategorySectionProps) {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const hasPhotos = group.photos.length > 0;

  // The open slide lives in the URL rather than in local state, so the address
  // bar always describes what is on screen and a shared link restores it.
  const photoId = searchParams.get(LIGHTBOX_PHOTO_PARAM);
  const openIndex = useMemo(() => {
    if (!photoId) {
      return null;
    }

    const index = group.photos.findIndex((photo) => photo.dbId === photoId);
    return index === -1 ? null : index;
  }, [group.photos, photoId]);

  // Opening from the grid adds a history entry so the back button (or a mobile
  // back gesture) closes the lightbox instead of leaving the page. Links opened
  // straight onto a photo have no such entry to step back to.
  const hasHistoryEntry = useRef(false);

  const writePhotoId = useCallback(
    (nextPhotoId: string | null, mode: "push" | "replace") => {
      const params = new URLSearchParams(window.location.search);

      if (nextPhotoId) {
        params.set(LIGHTBOX_PHOTO_PARAM, nextPhotoId);
      } else {
        params.delete(LIGHTBOX_PHOTO_PARAM);
      }

      const query = params.toString();
      const url = `${window.location.pathname}${query ? `?${query}` : ""}`;

      if (mode === "push") {
        window.history.pushState(null, "", url);
      } else {
        window.history.replaceState(null, "", url);
      }
    },
    [],
  );

  // An unknown id — a deleted photo, or one belonging to another collection —
  // is dropped from the URL and the plain category page is shown instead.
  useEffect(() => {
    if (photoId && openIndex === null) {
      writePhotoId(null, "replace");
    }
  }, [openIndex, photoId, writePhotoId]);

  // Keep the grid on the page holding the open photo, so a shared link lands on
  // the right page and closing the lightbox reveals the photo in place.
  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    setCurrentPage(Math.floor(openIndex / PHOTOS_PER_CATEGORY_PAGE) + 1);
  }, [openIndex]);

  const totalPages = Math.max(
    1,
    Math.ceil(group.photos.length / PHOTOS_PER_CATEGORY_PAGE),
  );

  const startIndex = (currentPage - 1) * PHOTOS_PER_CATEGORY_PAGE;
  const pagePhotos = group.photos.slice(
    startIndex,
    startIndex + PHOTOS_PER_CATEGORY_PAGE,
  );

  const slides = useMemo<Slide[]>(
    () =>
      group.photos.map((photo) => ({
        src: photo.src,
        alt: `${group.category} - ${photo.fileName}`,
        title: photo.description ?? undefined,
        description: formatCameraSettings(photo),
      })),
    [group.category, group.photos],
  );

  function handleOpen(localIndex: number) {
    const photo = pagePhotos[localIndex];

    if (!photo) {
      return;
    }

    hasHistoryEntry.current = true;
    writePhotoId(photo.dbId, "push");
  }

  // Moving to another slide rewrites the current entry instead of stacking a
  // new one, so browsing a collection does not flood the history stack.
  function handleView(index: number) {
    const photo = group.photos[index];

    if (!photo || photo.dbId === photoId) {
      return;
    }

    writePhotoId(photo.dbId, "replace");
  }

  function handleClose() {
    if (hasHistoryEntry.current) {
      hasHistoryEntry.current = false;
      window.history.back();
      return;
    }

    writePhotoId(null, "replace");
  }

  return (
    <section id={group.sectionId} className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {group.category}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {group.photos.length} photos
        </p>
      </div>

      {!hasPhotos ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-8 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-300">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            Empty collection
          </p>
          <p className="mt-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">
            No photos are published in this category yet.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Once images are uploaded and published, they will appear here in a
            clean card grid with the same lightbox experience.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {pagePhotos.map((photo, index) => (
              <button
                type="button"
                key={photo.id}
                className="cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-left transition hover:scale-[1.01] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                onClick={() => handleOpen(index)}
              >
                <div className="relative aspect-[4/3]">
                  <GalleryImage
                    src={photo.src}
                    alt={`${group.category} - ${photo.fileName}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Added {new Date(photo.modifiedAtISO).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              className="mt-4 flex items-center justify-between"
              aria-label={`Pagination for ${group.category}`}
            >
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:pointer-events-none disabled:text-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Previous
              </button>

              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:pointer-events-none disabled:text-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}

      <PhotoLightbox
        slides={slides}
        openIndex={openIndex}
        onView={handleView}
        onClose={handleClose}
      />
    </section>
  );
}
