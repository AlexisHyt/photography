"use client";

import { useState } from "react";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

type PhotoLightboxProps = {
  slides: Slide[];
  openIndex: number | null;
  onView: (index: number) => void;
  onClose: () => void;
};

export function PhotoLightbox({
  slides,
  openIndex,
  onView,
  onClose,
}: PhotoLightboxProps) {
  // The lightbox reacts to `index` changes while mounted, so falling back to 0
  // once `openIndex` clears would rewind it to the first slide mid-closing.
  // Remembering the last opened slide keeps the exit animation on that image.
  const [lastIndex, setLastIndex] = useState(openIndex ?? 0);

  if (openIndex !== null && openIndex !== lastIndex) {
    setLastIndex(openIndex);
  }

  return (
    <Lightbox
      open={openIndex !== null}
      close={onClose}
      index={lastIndex}
      slides={slides}
      plugins={[Captions, Zoom]}
      on={{
        view: ({ index }) => onView(index),
      }}
      styles={{
        root: { zIndex: "9999" },
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      zoom={{
        maxZoomPixelRatio: 4,
        scrollToZoom: true,
        pinchZoomV4: true,
        keyboardMoveDistance: 45,
        wheelZoomDistanceFactor: 120,
        doubleClickMaxStops: 4,
      }}
    />
  );
}
