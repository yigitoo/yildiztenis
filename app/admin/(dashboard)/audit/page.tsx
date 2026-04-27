import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
          <div className="flex items-center gap-2 border-b border-border p-4">
            <a href="/admin/audit" className={`rounded-lg px-3 py-1.5 text-sm font-medium ${!entity ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              Tümü
            </a>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
              <a key={key} href={`/admin/audit?entity=${key}`} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${entity === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                {label}
              </a>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">{total} kayıt</span>
          </div>

          {logs.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">İşlem kaydı bulunamadı.</p>
          ) : (
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
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-border p-4">
              {page > 1 && (
                <a href={`/admin/audit?page=${page - 1}${entity ? `&entity=${entity}` : ""}`} className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                  Önceki
                </a>
              )}
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              {page < totalPages && (
                <a href={`/admin/audit?page=${page + 1}${entity ? `&entity=${entity}` : ""}`} className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                  Sonraki
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
