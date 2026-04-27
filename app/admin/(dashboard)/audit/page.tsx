import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AuditPageProps = {
  searchParams: Promise<{ page?: string; entity?: string }>;
};

const ENTITY_LABELS: Record<string, string> = {
  Workshop: "Workshop",
  Application: "Başvuru",
  GalleryImage: "Galeri",
  TeamMember: "Takım",
};

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const entity = params.entity;
  const perPage = 50;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: entity ? { entity } : undefined,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { actor: { select: { name: true, email: true } } }
    }),
    prisma.auditLog.count({ where: entity ? { entity } : undefined })
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <PageHeader
        title="İşlem Geçmişi"
        description="Tüm admin işlemlerinin kayıt defteri."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "İşlem Geçmişi" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-border p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <a href="/admin/audit" className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${!entity ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              Tümü
            </a>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
              <a key={key} href={`/admin/audit?entity=${key}`} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${entity === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                {label}
              </a>
            ))}
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{total} kayıt</span>
          </div>

          {logs.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">İşlem kaydı bulunamadı.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>İşlem</TableHead>
                      <TableHead>Varlık</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Detay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {format(log.createdAt, "d MMM yyyy, HH:mm", { locale: tr })}
                        </TableCell>
                        <TableCell>{log.actor?.name ?? log.actor?.email ?? "Sistem"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{ENTITY_LABELS[log.entity] ?? log.entity}</TableCell>
                        <TableCell className="max-w-[100px] truncate font-mono text-xs text-muted-foreground">{log.entityId}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                          {log.metadata ? JSON.stringify(log.metadata) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card view */}
              <div className="grid gap-0 lg:hidden">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-border p-4 last:border-b-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{log.action}</Badge>
                          <span className="text-sm font-medium">{ENTITY_LABELS[log.entity] ?? log.entity}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {log.actor?.name ?? log.actor?.email ?? "Sistem"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {format(log.createdAt, "d MMM, HH:mm", { locale: tr })}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">ID: {log.entityId}</p>
                    {log.metadata && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 border-t border-border p-4">
              {page > 1 ? (
                <a href={`/admin/audit?page=${page - 1}${entity ? `&entity=${entity}` : ""}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium">
                  <ChevronLeft size={16} className="sm:hidden" />
                  <span className="hidden sm:inline">Önceki</span>
                </a>
              ) : (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/30 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm">
                  <ChevronLeft size={16} className="sm:hidden" />
                  <span className="hidden sm:inline">Önceki</span>
                </span>
              )}
              <span className="px-3 text-sm text-muted-foreground">{page} / {totalPages}</span>
              {page < totalPages ? (
                <a href={`/admin/audit?page=${page + 1}${entity ? `&entity=${entity}` : ""}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium">
                  <ChevronRight size={16} className="sm:hidden" />
                  <span className="hidden sm:inline">Sonraki</span>
                </a>
              ) : (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/30 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm">
                  <ChevronRight size={16} className="sm:hidden" />
                  <span className="hidden sm:inline">Sonraki</span>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
