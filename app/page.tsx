import { GalleryView } from "@/app/_components/gallery-view";
import { getGalleryData, groupPhotosByCategory } from "@/app/_lib/gallery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allPhotos = await getGalleryData();
  const groups = groupPhotosByCategory(allPhotos);

  return (
    <GalleryView
      photographerName="Alexis Hayat"
      totalItems={allPhotos.length}
      groups={groups}
    />
  );
}
