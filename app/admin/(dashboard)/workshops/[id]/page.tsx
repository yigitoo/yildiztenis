import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_VARIANT } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { MetricCard } from "@/components/admin/metric-card";
import { WorkshopForm } from "@/components/admin/workshop-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type WorkshopEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkshopEditPage({ params }: WorkshopEditPageProps) {
  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: {
      applications: {
        where: { status: { not: "UNVERIFIED" } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          school: true,
          status: true,
          createdAt: true,
        }
      }
    }
  });

  if (!workshop) {
    notFound();
  }

  const accepted = workshop.applications.filter(a => a.status === "ACCEPTED").length;

  return (
    <>
      <PageHeader
        title={workshop.title}
        description="Workshop bilgilerini düzenleyin ve başvuruları yönetin."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "Workshoplar", href: "/admin/workshops" },
          { label: workshop.title },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<a href={`/api/admin/export?workshopId=${workshop.id}&scope=all&type=xlsx`} />}>
              <Download size={14} />
              Tüm XLSX
            </Button>
            <Button variant="outline" size="sm" render={<a href={`/api/admin/export?workshopId=${workshop.id}&scope=accepted&type=xlsx`} />}>
              <Download size={14} />
              Asil XLSX
            </Button>
            <Button variant="outline" size="sm" render={<a href={`/api/admin/export?workshopId=${workshop.id}&scope=accepted&type=pdf`} />}>
              <Download size={14} />
              Asil PDF
            </Button>
          </div>
        }
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Doğrulanmış Başvuru" value={workshop.applications.length.toString()} icon={<span />} />
        <MetricCard title="Asil Liste" value={`${accepted}/${workshop.capacity}`} icon={<span />} />
        <MetricCard title="Doluluk" value={`%${workshop.capacity > 0 ? Math.round((accepted / workshop.capacity) * 100) : 0}`} icon={<span />} />
      </section>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detaylar</TabsTrigger>
          <TabsTrigger value="applications">Başvurular ({workshop.applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <WorkshopForm workshop={workshop} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Başvurular</CardTitle>
            </CardHeader>
            <CardContent>
              {workshop.applications.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Henüz başvuru yok.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aday</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Okul</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workshop.applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.firstName} {app.lastName}</TableCell>
                        <TableCell className="text-muted-foreground">{app.email}</TableCell>
                        <TableCell className="text-muted-foreground">{app.phone}</TableCell>
                        <TableCell className="text-muted-foreground">{app.school}</TableCell>
                        <TableCell>
                          <Badge variant={APPLICATION_STATUS_VARIANT[app.status]}>
                            {APPLICATION_STATUS_LABEL[app.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(app.createdAt, "d MMM yyyy", { locale: tr })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
