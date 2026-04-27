import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EMAIL_TYPE_LABEL: Record<string, string> = {
  APPLICATION_VERIFICATION: "Doğrulama",
  APPLICATION_RECEIVED: "Başvuru Alındı",
  APPLICATION_ACCEPTED: "Kabul",
  CONTACT_RECEIVED: "İletişim",
};

const EMAIL_TYPE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  APPLICATION_VERIFICATION: "outline",
  APPLICATION_RECEIVED: "secondary",
  APPLICATION_ACCEPTED: "default",
  CONTACT_RECEIVED: "outline",
};

type EmailsPageProps = {
  searchParams: Promise<{ page?: string; type?: string }>;
};

export default async function EmailsPage({ searchParams }: EmailsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const type = params.type;
  const perPage = 50;

  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      where: type ? { type: type as "APPLICATION_VERIFICATION" | "APPLICATION_RECEIVED" | "APPLICATION_ACCEPTED" | "CONTACT_RECEIVED" } : undefined,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        workshop: { select: { title: true } },
        application: { select: { firstName: true, lastName: true } }
      }
    }),
    prisma.emailLog.count({ where: type ? { type: type as "APPLICATION_VERIFICATION" | "APPLICATION_RECEIVED" | "APPLICATION_ACCEPTED" | "CONTACT_RECEIVED" } : undefined })
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <PageHeader
        title="E-posta Kayıtları"
        description="Gönderilen tüm e-postaların kaydı."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "E-posta Kayıtları" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-border p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <a href="/admin/emails" className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${!type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              Tümü
            </a>
            {Object.entries(EMAIL_TYPE_LABEL).map(([key, label]) => (
              <a key={key} href={`/admin/emails?type=${key}`} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${type === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                {label}
              </a>
            ))}
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{total} kayıt</span>
          </div>

          {logs.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">E-posta kaydı bulunamadı.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Alıcı</TableHead>
                      <TableHead>Konu</TableHead>
                      <TableHead>Workshop</TableHead>
                      <TableHead>Başvuran</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {format(log.createdAt, "d MMM yyyy, HH:mm", { locale: tr })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={EMAIL_TYPE_VARIANT[log.type] ?? "outline"}>
                            {EMAIL_TYPE_LABEL[log.type] ?? log.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.recipient}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{log.subject}</TableCell>
                        <TableCell className="text-muted-foreground">{log.workshop?.title ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.application ? `${log.application.firstName} ${log.application.lastName}` : "—"}
                        </TableCell>
                        <TableCell>
                          {log.errorMessage ? (
                            <Badge variant="destructive">Hata</Badge>
                          ) : (
                            <Badge variant="default">Gönderildi</Badge>
                          )}
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
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{log.recipient}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{log.subject}</p>
                      </div>
                      {log.errorMessage ? (
                        <Badge variant="destructive" className="shrink-0">Hata</Badge>
                      ) : (
                        <Badge variant="default" className="shrink-0">Gönderildi</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={EMAIL_TYPE_VARIANT[log.type] ?? "outline"} className="text-[10px]">
                        {EMAIL_TYPE_LABEL[log.type] ?? log.type}
                      </Badge>
                      <span>{format(log.createdAt, "d MMM, HH:mm", { locale: tr })}</span>
                      {log.workshop && <span>· {log.workshop.title}</span>}
                      {log.application && <span>· {log.application.firstName} {log.application.lastName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 border-t border-border p-4">
              {page > 1 ? (
                <a href={`/admin/emails?page=${page - 1}${type ? `&type=${type}` : ""}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium">
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
                <a href={`/admin/emails?page=${page + 1}${type ? `&type=${type}` : ""}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium">
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
