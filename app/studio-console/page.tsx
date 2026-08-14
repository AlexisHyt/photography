import type { Metadata } from "next";
import Image from "next/image";
import { AdminLoginForm } from "@/app/_components/admin-login-form";
import { AdminSubmitButton } from "@/app/_components/admin-submit-button";
import { AdminUploadForm } from "@/app/_components/admin-upload-form";
import {
  deletePhotoAction,
  logoutAdminAction,
  movePhotoAction,
  updatePhotoMetadataAction,
} from "@/app/_lib/admin.actions";
import { ADMIN_PAGE_PATH } from "@/app/_lib/admin.constants";
import { hasAdminSession } from "@/app/_lib/admin-auth";
import { getGalleryCategories, getGalleryData } from "@/app/_lib/gallery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Gallery Admin",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function StudioConsolePage() {
  const isAuthenticated = await hasAdminSession();

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <section className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/85 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
            Hidden gallery admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Unlock {ADMIN_PAGE_PATH}
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            Sign in with your admin email and password.
          </p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </section>
      </main>
    );
  }

  const [photos, categories] = await Promise.all([
    getGalleryData(),
    getGalleryCategories(),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Hidden gallery admin
              </p>
              <div>
                <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Manage your images
                </h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  Upload new photos, delete existing ones, or move them to
                  another category. This page is intentionally not linked from
                  the public gallery.
                </p>
              </div>
            </div>

            <form action={logoutAdminAction}>
              <AdminSubmitButton
                idleLabel="Log out"
                pendingLabel="Logging out..."
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              />
            </form>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Photos</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {photos.length}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Categories
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {categories.length}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Public gallery
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Images are stored in the `photography` MinIO bucket.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Upload images
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Upload one or more images into an existing category or a new one.
            </p>
          </div>
          <AdminUploadForm
            categories={categories.map((category) => category.name)}
          />
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Existing images
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Move an image by changing its category, or remove it permanently.
            </p>
          </div>

          {photos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-8 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-300">
              No photos found yet. Upload your first images above.
            </div>
          ) : (
            <>
              <datalist id="admin-category-options">
                {categories.map((category) => (
                  <option key={category.slug} value={category.name} />
                ))}
              </datalist>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {photos.map((photo) => (
                  <article
                    key={photo.id}
                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/90 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85"
                  >
                    <div className="relative aspect-4/3 bg-zinc-100 dark:bg-zinc-900">
                      <Image
                        src={photo.src}
                        alt={photo.fileName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                          {photo.category}
                        </p>
                        <h3 className="mt-2 break-all text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                          {photo.fileName}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                          Last update: {formatDate(photo.modifiedAtISO)}
                        </p>
                      </div>

                      <form action={movePhotoAction} className="space-y-3">
                        <input
                          type="hidden"
                          name="category"
                          value={photo.category}
                        />
                        <input
                          type="hidden"
                          name="fileName"
                          value={photo.fileName}
                        />
                        <div className="space-y-2">
                          <label
                            htmlFor={`move-${photo.id}`}
                            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
                          >
                            New category
                          </label>
                          <input
                            id={`move-${photo.id}`}
                            name="nextCategory"
                            type="text"
                            list="admin-category-options"
                            defaultValue={photo.category}
                            required
                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                        </div>
                        <AdminSubmitButton
                          idleLabel="Change category"
                          pendingLabel="Moving..."
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        />
                      </form>

                      <form action={updatePhotoMetadataAction} className="space-y-3">
                        <input type="hidden" name="photoId" value={photo.dbId} />
                        <input type="hidden" name="category" value={photo.category} />
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          Metadata
                        </p>
                        <div className="space-y-2">
                          <label
                            htmlFor={`desc-${photo.id}`}
                            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                          >
                            Description
                          </label>
                          <textarea
                            id={`desc-${photo.id}`}
                            name="description"
                            rows={2}
                            defaultValue={photo.description ?? ""}
                            placeholder="Add a caption or note…"
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label
                              htmlFor={`iso-${photo.id}`}
                              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                            >
                              ISO
                            </label>
                            <input
                              id={`iso-${photo.id}`}
                              name="iso"
                              type="text"
                              inputMode="numeric"
                              defaultValue={photo.iso ?? ""}
                              placeholder="3200"
                              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`aperture-${photo.id}`}
                              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                            >
                              Aperture
                            </label>
                            <input
                              id={`aperture-${photo.id}`}
                              name="aperture"
                              type="text"
                              defaultValue={photo.aperture ?? ""}
                              placeholder="2.8"
                              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`exposure-${photo.id}`}
                              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                            >
                              Exposure time
                            </label>
                            <input
                              id={`exposure-${photo.id}`}
                              name="exposureTime"
                              type="text"
                              defaultValue={photo.exposureTime ?? ""}
                              placeholder="1/30 or 25"
                              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`focal-${photo.id}`}
                              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                            >
                              Focal length (mm)
                            </label>
                            <input
                              id={`focal-${photo.id}`}
                              name="focalLength"
                              type="text"
                              inputMode="numeric"
                              defaultValue={photo.focalLength ?? ""}
                              placeholder="24"
                              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label
                            htmlFor={`camera-${photo.id}`}
                            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                          >
                            Camera / Lens
                          </label>
                          <input
                            id={`camera-${photo.id}`}
                            name="cameraModel"
                            type="text"
                            defaultValue={photo.cameraModel ?? ""}
                            placeholder="Canon EOS R5 · RF 24mm f/1.8"
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                        </div>
                        <AdminSubmitButton
                          idleLabel="Save metadata"
                          pendingLabel="Saving…"
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                        />
                      </form>

                      <form action={deletePhotoAction}>
                        <input
                          type="hidden"
                          name="category"
                          value={photo.category}
                        />
                        <input
                          type="hidden"
                          name="fileName"
                          value={photo.fileName}
                        />
                        <AdminSubmitButton
                          idleLabel="Delete image"
                          pendingLabel="Deleting..."
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        />
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
