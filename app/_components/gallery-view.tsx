import Image from "next/image";
import Link from "next/link";
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
  const featuredPhotos = groups
    .flatMap((group) => group.photos.slice(0, 1))
    .slice(0, 3);
  const collectionCount = groups.length;

  const heroTiles = [
    { photo: featuredPhotos[0], className: "row-span-2 aspect-[4/5]" },
    { photo: featuredPhotos[1], className: "aspect-[16/10]" },
    { photo: featuredPhotos[2], className: "aspect-[16/10]" },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 text-white shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
        <div className="relative isolate">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_42%),linear-gradient(135deg,rgba(24,24,27,0.98),rgba(9,9,11,0.94))]" />
          <div className="relative grid gap-10 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.4em] text-white/55">
                  Photography portfolio
                </p>
                <div className="space-y-4">
                  <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
                    {photographerName}
                  </h1>
                  <p className="max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                    A quiet, image-first gallery for night skies, long
                    exposures, and collected moments.
                    <br />
                    Open a collection to explore its own dedicated page.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#collections"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-white/90"
                >
                  Browse collections
                </a>
                <div className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur">
                  {collectionCount} collections · {totalItems} photos
                </div>
              </div>
            </div>

            <div className="gap-3 sm:grid-cols-2 hidden md:grid">
              {heroTiles.map((tile) => {
                if (!tile.photo) {
                  return (
                    <div
                      key={tile.className}
                      className={`${tile.className} overflow-hidden rounded-3xl border border-white/10 bg-white/5`}
                    >
                      <div className="flex h-full min-h-[12rem] items-center justify-center p-6 text-center text-sm text-white/50">
                        Collection previews will appear here.
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={tile.photo.id}
                    className={`${tile.className} relative overflow-hidden rounded-3xl border border-white/10 bg-white/5`}
                  >
                    <Image
                      src={tile.photo.src}
                      alt={`${tile.photo.category} - ${tile.photo.fileName}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 40vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/65">
                        Featured frame
                      </p>
                      <p className="mt-2 text-sm font-medium text-white/85">
                        {tile.photo.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {!hasPhotos ? (
        <section className="mt-8 rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-8 text-zinc-600 backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-300">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            Empty gallery
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Add photos to begin the portfolio.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Create your first collection and upload a few images. Each category
            will automatically become its own page with the same polished
            layout.
          </p>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Example: <code>public/gallery/Star Trail/photo-001.jpg</code>
          </p>
        </section>
      ) : (
        <div id="collections" className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                Collections
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Dedicated category pages
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group, index) => {
              const cover = group.photos[0];
              const isLarge = index === 0;

              return (
                <Link
                  key={group.categorySlug}
                  href={`/categories/${group.categorySlug}`}
                  className={`group relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 ${isLarge ? "md:col-span-2 xl:col-span-2" : ""}`}
                >
                  <div
                    className={`${isLarge ? "aspect-[16/9]" : "aspect-[4/5]"} relative`}
                  >
                    {cover ? (
                      <Image
                        src={cover.src}
                        alt={`${group.category} - ${cover.fileName}`}
                        fill
                        sizes={
                          isLarge
                            ? "(max-width: 1280px) 100vw, 66vw"
                            : "(max-width: 1280px) 50vw, 33vw"
                        }
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                          Category
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">
                          {group.category}
                        </h3>
                        <p className="mt-2 text-sm text-white/75">
                          {group.photos.length} photo
                          {group.photos.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition group-hover:bg-white group-hover:text-zinc-950">
                        Open
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
