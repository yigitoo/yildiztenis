"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { PlusCircle } from "lucide-react";

import { WORKSHOP_STATUS_LABEL, WORKSHOP_STATUS_VARIANT } from "@/lib/constants";
import type { WorkshopStatus } from "@/generated/prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkshopActions, WorkshopActionsMobile } from "./workshop-actions";

type WorkshopData = {
  id: string;
  title: string;
  topic: string;
  venue: string;
  capacity: number;
  status: WorkshopStatus;
  startsAt: string;
  acceptedCount: number;
  applicationCount: number;
};

export function WorkshopList({ workshops }: { workshops: WorkshopData[] }) {
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
          <Button render={<a href="/admin/workshops/new" />}>
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
                    {workshops.map((workshop) => (
                      <TableRow key={workshop.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{workshop.title}</p>
                            <p className="text-xs text-muted-foreground">{workshop.topic}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(workshop.startsAt), "d MMM yyyy", { locale: tr })}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">{workshop.venue}</TableCell>
                        <TableCell>
                          <Badge variant={WORKSHOP_STATUS_VARIANT[workshop.status]}>
                            {WORKSHOP_STATUS_LABEL[workshop.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{workshop.acceptedCount}/{workshop.capacity}</span>
                          <span className="ml-1 text-xs text-muted-foreground">({workshop.applicationCount} başvuru)</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <WorkshopActions workshopId={workshop.id} workshopTitle={workshop.title} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-0 md:hidden">
                {workshops.map((workshop) => (
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
                      <span>{format(new Date(workshop.startsAt), "d MMM yyyy", { locale: tr })}</span>
                      <span>{workshop.venue}</span>
                      <span>{workshop.acceptedCount}/{workshop.capacity} ({workshop.applicationCount} başvuru)</span>
                    </div>
                    <WorkshopActionsMobile workshopId={workshop.id} workshopTitle={workshop.title} />
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
