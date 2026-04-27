import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { GalleryManager } from "@/components/admin/gallery-manager";

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Galeri"
        description="Ana sayfadaki galeri görsellerini yönetin."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "Galeri" },
        ]}
      />
      <GalleryManager images={images} />
    </>
  );
}
