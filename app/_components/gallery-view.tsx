import { CategoryNav } from "@/app/_components/category-nav";
import { CategorySection } from "@/app/_components/category-section";
import type { GalleryCategoryGroup } from "@/app/_lib/gallery";

type GalleryViewProps = {
  photographerName: string;
  totalItems: number;
  groups: GalleryCategoryGroup[];
};

export function GalleryView({
  photographerName,
  totalItems,
  groups,
}: GalleryViewProps) {
  const hasPhotos = totalItems > 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Photography Gallery
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          {photographerName}
        </h1>
      </header>

      {!hasPhotos ? (
        <section className="rounded-xl border border-dashed border-zinc-300 p-8 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          <p className="font-medium">Add photos to start your gallery.</p>
          <p className="mt-2 text-sm">
            Example: <code>public/gallery/Star Trail/photo-001.jpg</code>
          </p>
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <CategoryNav
            items={groups.map((group) => ({
              category: group.category,
              sectionId: group.sectionId,
              count: group.photos.length,
            }))}
          />

          <div className="space-y-10">
            {groups.map((group) => (
              <CategorySection key={group.sectionId} group={group} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
