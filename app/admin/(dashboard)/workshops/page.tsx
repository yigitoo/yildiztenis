import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { PlusCircle, Download, ArrowUpRight } from "lucide-react";
import { DeleteWorkshopButton } from "@/components/admin/delete-workshop-button";
import { DuplicateWorkshopButton } from "@/components/admin/duplicate-workshop-button";

import { prisma } from "@/lib/prisma";
import { WORKSHOP_STATUS_LABEL, WORKSHOP_STATUS_VARIANT } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function WorkshopsPage() {
  const workshops = await prisma.workshop.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      applications: {
        where: { status: { not: "UNVERIFIED" } },
        select: { id: true, status: true }
      }
    }
  });

  return (
    <>
      <PageHeader
        title="Workshoplar"
        description="Tüm workshopları yönetin, yeni etkinlik oluşturun ve dışa aktarın."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "Workshoplar" },
        ]}
        actions={
          <Button render={<Link href="/admin/workshops/new" />}>
            <PlusCircle size={16} />
            Yeni Workshop
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {workshops.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Henüz workshop oluşturulmadı.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead className="hidden lg:table-cell">Konum</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Kontenjan</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workshops.map((workshop) => {
                      const accepted = workshop.applications.filter(a => a.status === "ACCEPTED").length;
                      return (
                        <TableRow key={workshop.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{workshop.title}</p>
                              <p className="text-xs text-muted-foreground">{workshop.topic}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(workshop.startsAt, "d MMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell className="hidden text-muted-foreground lg:table-cell">{workshop.venue}</TableCell>
                          <TableCell>
                            <Badge variant={WORKSHOP_STATUS_VARIANT[workshop.status]}>
                              {WORKSHOP_STATUS_LABEL[workshop.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{accepted}/{workshop.capacity}</span>
                            <span className="ml-1 text-xs text-muted-foreground">({workshop.applications.length} başvuru)</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" render={<Link href={`/admin/workshops/${workshop.id}`} />}>
                                Düzenle
                                <ArrowUpRight size={14} />
                              </Button>
                              <DuplicateWorkshopButton workshopId={workshop.id} />
                              <Button variant="ghost" size="sm" render={<a href={`/api/admin/export?workshopId=${workshop.id}&scope=all&type=xlsx`} />}>
                                <Download size={14} />
                              </Button>
                              <DeleteWorkshopButton workshopId={workshop.id} workshopTitle={workshop.title} />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card view */}
              <div className="grid gap-0 md:hidden">
                {workshops.map((workshop) => {
                  const accepted = workshop.applications.filter(a => a.status === "ACCEPTED").length;
                  return (
                    <div key={workshop.id} className="border-b border-border p-4 last:border-b-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium">{workshop.title}</p>
                          <p className="text-xs text-muted-foreground">{workshop.topic}</p>
                        </div>
                        <Badge variant={WORKSHOP_STATUS_VARIANT[workshop.status]} className="shrink-0">
                          {WORKSHOP_STATUS_LABEL[workshop.status]}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{format(workshop.startsAt, "d MMM yyyy", { locale: tr })}</span>
                        <span>{workshop.venue}</span>
                        <span>{accepted}/{workshop.capacity} ({workshop.applications.length} başvuru)</span>
                      </div>
                      <div className="mt-3 flex gap-1">
                        <Button variant="ghost" size="sm" render={<Link href={`/admin/workshops/${workshop.id}`} />}>
                          Düzenle
                          <ArrowUpRight size={14} />
                        </Button>
                        <DuplicateWorkshopButton workshopId={workshop.id} />
                        <Button variant="ghost" size="sm" render={<a href={`/api/admin/export?workshopId=${workshop.id}&scope=all&type=xlsx`} />}>
                          <Download size={14} />
                        </Button>
                        <DeleteWorkshopButton workshopId={workshop.id} workshopTitle={workshop.title} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
