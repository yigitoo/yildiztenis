import { WorkshopForm } from "@/components/admin/workshop-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function NewWorkshopPage() {
  return (
    <>
      <PageHeader
        title="Yeni Workshop"
        description="Etkinlik detaylarını, kontenjanı ve yayın durumunu tanımlayın. Kayıttan sonra standart başvuru form alanları otomatik oluşturulur."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "Workshoplar", href: "/admin/workshops" },
          { label: "Yeni Workshop" },
        ]}
      />
      <Card>
        <CardContent className="p-6">
          <WorkshopForm />
        </CardContent>
      </Card>
    </>
  );
}
