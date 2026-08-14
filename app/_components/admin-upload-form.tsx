"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { AdminSubmitButton } from "@/app/_components/admin-submit-button";
import { uploadPhotosAction } from "@/app/_lib/admin.actions";
import { ADMIN_FORM_INITIAL_STATE } from "@/app/_lib/admin.form-state";
import { GALLERY_IMAGE_ACCEPT } from "@/app/_lib/gallery.constants";

type AdminUploadFormProps = {
  categories: string[];
};

export function AdminUploadForm({ categories }: AdminUploadFormProps) {
  const [state, formAction] = useActionState(
    uploadPhotosAction,
    ADMIN_FORM_INITIAL_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const datalistId = useId();

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-2">
          <label
            htmlFor="upload-category"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Category
          </label>
          <input
            id="upload-category"
            name="category"
            type="text"
            list={datalistId}
            placeholder="e.g. Star Trail"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <datalist id={datalistId}>
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="upload-photos"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Images
          </label>
          <input
            id="upload-photos"
            name="photos"
            type="file"
            accept={GALLERY_IMAGE_ACCEPT}
            multiple
            required
            className="block w-full cursor-pointer rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:file:bg-white dark:file:text-zinc-950"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="upload-description"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Description{" "}
          <span className="font-normal text-zinc-500 dark:text-zinc-400">
            (optional — applied to all uploaded images)
          </span>
        </label>
        <textarea
          id="upload-description"
          name="description"
          rows={2}
          placeholder="e.g. Shot on a clear winter night at ISO 3200…"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <legend className="px-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Camera settings{" "}
          <span className="font-normal text-zinc-500 dark:text-zinc-400">
            (optional — applied to all uploaded images)
          </span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="upload-iso"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              ISO
            </label>
            <input
              id="upload-iso"
              name="iso"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 3200"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="upload-aperture"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Aperture
            </label>
            <input
              id="upload-aperture"
              name="aperture"
              type="text"
              placeholder="e.g. 2.8"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="upload-exposure"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Exposure time
            </label>
            <input
              id="upload-exposure"
              name="exposureTime"
              type="text"
              placeholder="e.g. 1/30 or 25"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="upload-focal"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Focal length (mm)
            </label>
            <input
              id="upload-focal"
              name="focalLength"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 24"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1 sm:col-span-2 lg:col-span-2">
            <label
              htmlFor="upload-camera"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Camera / Lens
            </label>
            <input
              id="upload-camera"
              name="cameraModel"
              type="text"
              placeholder="e.g. Canon EOS R5 · RF 24mm f/1.8"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>
      </fieldset>

      {state.message ? (
        <p
          aria-live="polite"
          className={`text-sm ${state.status === "error" ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
        >
          {state.message}
        </p>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Duplicate file names are automatically suffixed to avoid overwriting
          existing images.
        </p>
      )}

      <AdminSubmitButton
        idleLabel="Upload images"
        pendingLabel="Uploading..."
        className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      />
    </form>
  );
}
