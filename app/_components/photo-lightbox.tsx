"use client";

import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

type PhotoLightboxProps = {
  slides: Slide[];
  openIndex: number | null;
  onClose: () => void;
};

export function PhotoLightbox({
  slides,
  openIndex,
  onClose,
}: PhotoLightboxProps) {
  return (
    <Lightbox
      open={openIndex !== null}
      close={onClose}
      index={openIndex ?? 0}
      slides={slides}
      plugins={[Captions, Zoom]}
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
