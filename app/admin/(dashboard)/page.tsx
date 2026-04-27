import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { GraduationCap, Users, CheckCircle2, Mail, PlusCircle, ArrowRight, Download } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_VARIANT, WORKSHOP_STATUS_LABEL } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { MetricCard } from "@/components/admin/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function DashboardPage() {
  const [workshops, applications, unreadMessages, recentContacts] = await Promise.all([
    prisma.workshop.findMany({
      orderBy: { startsAt: "desc" },
      include: {
        applications: {
          where: { status: { not: "UNVERIFIED" } },
          select: { id: true, status: true }
        }
      }
    }),
    prisma.application.findMany({
      where: { status: { not: "UNVERIFIED" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { workshop: { select: { id: true, title: true } } }
    }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 3
    })
  ]);

  const totalApplications = workshops.reduce((sum, w) => sum + w.applications.length, 0);
  const acceptedCount = workshops.reduce((sum, w) => sum + w.applications.filter(a => a.status === "ACCEPTED").length, 0);
  const pendingCount = workshops.reduce((sum, w) => sum + w.applications.filter(a => a.status === "PENDING").length, 0);

  const upcomingWorkshops = workshops
    .filter(w => w.status === "PUBLISHED" && w.startsAt > new Date())
    .slice(0, 3);

  return (
    <>
      <PageHeader
        title="Genel Bakış"
        description="Workshop, başvuru ve iletişim süreçlerini tek yerden yönetin."
        actions={
          <div className="flex gap-2">
            <Button render={<Link href="/admin/workshops/new" />}>
              <PlusCircle size={16} />
              Yeni Workshop
            </Button>
            <Button variant="outline" render={<a href="/api/admin/export?scope=all&type=xlsx" />}>
              <Download size={16} />
              Export XLSX
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Workshop" value={workshops.length.toString()} icon={<GraduationCap size={20} />} />
        <MetricCard title="Toplam Başvuru" value={totalApplications.toString()} icon={<Users size={20} />} />
        <MetricCard title="Asil Liste" value={acceptedCount.toString()} description={`${pendingCount} beklemede`} icon={<CheckCircle2 size={20} />} />
        <MetricCard title="Okunmamış Mesaj" value={unreadMessages.toString()} icon={<Mail size={20} />} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Son Başvurular</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/admin/applications" />}>
              Tümünü gör
              <ArrowRight size={14} />
            </Button>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Henüz başvuru yok.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aday</TableHead>
                    <TableHead>Workshop</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.firstName} {app.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{app.workshop.title}</TableCell>
                      <TableCell>
                        <Badge variant={APPLICATION_STATUS_VARIANT[app.status]}>
                          {APPLICATION_STATUS_LABEL[app.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(app.createdAt, "d MMM", { locale: tr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yaklaşan Workshoplar</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/admin/workshops" />}>
                Tümü
                <ArrowRight size={14} />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3">
              {upcomingWorkshops.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Yaklaşan workshop yok.</p>
              ) : (
                upcomingWorkshops.map((w) => (
                  <Link key={w.id} href={`/admin/workshops/${w.id}`} className="group rounded-lg border border-border p-3 transition-colors hover:bg-accent">
                    <p className="font-medium group-hover:text-primary">{w.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(w.startsAt, "d MMMM yyyy, HH:mm", { locale: tr })}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{WORKSHOP_STATUS_LABEL[w.status]}</Badge>
                      <span className="text-xs text-muted-foreground">{w.applications.length}/{w.capacity}</span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Son Mesajlar</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/admin/messages" />}>
                Tümü
                <ArrowRight size={14} />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3">
              {recentContacts.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Henüz mesaj yok.</p>
              ) : (
                recentContacts.map((c) => (
                  <div key={c.id} className="rounded-lg border-l-2 border-primary pl-3">
                    <p className="text-sm font-medium">{c.subject}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.name} · {format(c.createdAt, "d MMM", { locale: tr })}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
