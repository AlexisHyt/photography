import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategorySection } from "@/app/_components/category-section";
import {
  getGalleryCategoryBySlug,
  normalizeCategorySlug,
} from "@/app/_lib/gallery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = await getGalleryCategoryBySlug(slug);

  if (!group) {
    return {
      title: "Collection introuvable",
      description: "The requested photography category could not be found.",
    };
  }

  return {
    title: `${group.category} — Alexis Hayat`,
    description: `Browse ${group.photos.length} photo${group.photos.length === 1 ? "" : "s"} in the ${group.category} collection.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const group = await getGalleryCategoryBySlug(slug);

  if (!group) {
    notFound();
  }

  const latestPhoto = group.photos[0];
  const latestDate = latestPhoto
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
      }).format(new Date(latestPhoto.modifiedAtISO))
    : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/80 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="relative overflow-hidden bg-zinc-950 px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_38%),linear-gradient(135deg,rgba(24,24,27,0.98),rgba(9,9,11,0.94))]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-white"
              >
                <span aria-hidden="true">←</span>
                Back to collections
              </Link>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                  Collection
                </p>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  {group.category}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                  A dedicated gallery page for this body of work, presented with
                  a calm layout, larger image spacing, and a lightbox for closer
                  viewing.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Photos
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {group.photos.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Latest update
                </p>
                <p className="mt-2 text-sm font-medium text-white/90">
                  {latestDate ?? "No published images yet"}
                </p>
              </div>
            </div>
          </div>
          <p className="relative mt-8 text-xs uppercase tracking-[0.35em] text-white/45">
            /categories/{normalizeCategorySlug(group.categorySlug)}
          </p>
        </div>

        <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <CategorySection group={group} />
        </div>
      </section>
    </main>
  );
}
