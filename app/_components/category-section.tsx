"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Slide } from "yet-another-react-lightbox";
import { PhotoLightbox } from "@/app/_components/photo-lightbox";
import type { GalleryCategoryGroup, GalleryPhoto } from "@/app/_lib/gallery";
import { PHOTOS_PER_CATEGORY_PAGE } from "@/app/_lib/gallery.constants";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hasPhotos = group.photos.length > 0;

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
    setOpenIndex(startIndex + localIndex);
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
                  <Image
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
        onClose={() => setOpenIndex(null)}
      />
    </section>
  );
}
