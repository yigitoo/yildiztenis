import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { SiteContentForm } from "@/components/admin/site-content-form";

export default async function SettingsPage() {
  const rows = await prisma.siteContent.findMany();
  const content = Object.fromEntries(rows.map(r => [r.key, r.value]));

  return (
    <>
      <PageHeader
        title="Ayarlar"
        description="Site içeriklerini ve genel ayarları yönetin."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "Ayarlar" },
        ]}
      />
      <SiteContentForm content={content} />
    </>
  );
}
