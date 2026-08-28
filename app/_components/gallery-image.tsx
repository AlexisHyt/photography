"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";

type GalleryImageProps = Omit<ImageProps, "onError" | "onLoad" | "ref">;

type SkeletonStatus = "loading" | "fading" | "hidden";

/**
 * Gallery frames are full-resolution photographs streamed from object storage,
 * so a card is laid out and sized long before its bytes arrive. This covers the
 * gap with a skeleton that fades away once the browser has decoded the photo.
 *
 * The skeleton sits on top of the image rather than the image fading in, so the
 * caller keeps full control of the image classes (hover transforms, their own
 * transitions) without a competing transition from this component.
 */
export function GalleryImage(imageProps: GalleryImageProps) {
  const [status, setStatus] = useState<SkeletonStatus>("loading");

  const settle = useCallback((next: Exclude<SkeletonStatus, "loading">) => {
    setStatus((current) => (current === "loading" ? next : current));
  }, []);

  // A cached photo is already decoded by the time hydration attaches `onLoad`,
  // which would otherwise leave the skeleton up for good. Catching it on mount
  // also spares those cards a pointless flash of skeleton.
  const skipIfComplete = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete) {
        settle("hidden");
      }
    },
    [settle],
  );

  return (
    <>
      <Image
        {...imageProps}
        ref={skipIfComplete}
        onLoad={() => settle("fading")}
        // A frame that fails to load must not leave the skeleton shimmering
        // forever: drop it and let the broken image speak for itself.
        onError={() => settle("fading")}
      />

      {status === "hidden" ? null : (
        <div
          aria-hidden="true"
          onTransitionEnd={() => setStatus("hidden")}
          className={`pointer-events-none absolute inset-0 overflow-hidden bg-zinc-200 transition-opacity duration-500 dark:bg-zinc-800 ${
            status === "fading" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent motion-reduce:animate-none dark:via-white/10" />
        </div>
      )}
    </>
  );
}
