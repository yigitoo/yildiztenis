"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateApplicationStatus } from "@/app/admin/actions";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_VARIANT } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ApplicationStatus, SkillLevel } from "@/generated/prisma/client";
import { ApplicationDetailDialog } from "@/components/admin/application-detail-dialog";

type Application = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  level: SkillLevel;
  notes: string | null;
  answers: Record<string, string> | null;
  status: ApplicationStatus;
  createdAt: string;
  verifiedAt: string | null;
  acceptedAt: string | null;
  acceptanceEmailSentAt: string | null;
  workshop: { id: string; title: string };
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetch("/api/admin/applications")
      .then(r => r.json())
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter(app => {
    const matchesSearch = search === "" || `${app.firstName} ${app.lastName} ${app.email} ${app.school}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleStatusUpdate(applicationId: string, newStatus: string) {
    setUpdatingId(applicationId);
    const fd = new FormData();
    fd.set("applicationId", applicationId);
    fd.set("status", newStatus);
    const result = await updateApplicationStatus(null, fd);
    if (result.success) {
      toast.success("Başvuru durumu güncellendi.");
      setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status: newStatus as ApplicationStatus } : a));
    } else {
      toast.error(result.error);
    }
    setUpdatingId(null);
  }

  return (
    <>
      <PageHeader
        title="Başvurular"
        description="Tüm workshop başvurularını yönetin ve durumlarını güncelleyin."
        breadcrumbs={[
          { label: "Genel Bakış", href: "/admin" },
          { label: "Başvurular" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<a href="/api/admin/export?scope=all&type=xlsx" />}>
              <Download size={14} />
              Tüm XLSX
            </Button>
            <Button variant="outline" size="sm" render={<a href="/api/admin/export?scope=accepted&type=pdf" />}>
              <Download size={14} />
              Asil PDF
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Input
              placeholder="Ara... (ad, e-posta, okul)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="PENDING">Beklemede</SelectItem>
                <SelectItem value="ACCEPTED">Asil Liste</SelectItem>
                <SelectItem value="WAITLISTED">Yedek</SelectItem>
                <SelectItem value="REJECTED">Reddedildi</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filtered.length} sonuç</span>
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Yükleniyor...</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Başvuru bulunamadı.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aday</TableHead>
                    <TableHead>Workshop</TableHead>
                    <TableHead>Okul</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Aksiyon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(app => (
                    <TableRow key={app.id} className="cursor-pointer" onClick={() => setSelectedApp(app)}>
                      <TableCell>
                        <p className="font-medium">{app.firstName} {app.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(app.createdAt), "d MMM yyyy, HH:mm", { locale: tr })}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{app.workshop.title}</TableCell>
                      <TableCell className="text-muted-foreground">{app.school}</TableCell>
                      <TableCell>
                        <p className="text-sm">{app.email}</p>
                        <p className="text-xs text-muted-foreground">{app.phone}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={APPLICATION_STATUS_VARIANT[app.status]}>
                          {APPLICATION_STATUS_LABEL[app.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {updatingId === app.id ? (
                            <div className="flex h-8 w-[140px] items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground">
                              <Loader2 size={14} className="animate-spin" />
                              Güncelleniyor
                            </div>
                          ) : (
                            <Select
                              defaultValue={app.status}
                              onValueChange={val => val && handleStatusUpdate(app.id, val)}
                              disabled={updatingId !== null}
                            >
                              <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Beklemede</SelectItem>
                                <SelectItem value="ACCEPTED">Asil Liste</SelectItem>
                                <SelectItem value="WAITLISTED">Yedek</SelectItem>
                                <SelectItem value="REJECTED">Reddedildi</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ApplicationDetailDialog application={selectedApp} onClose={() => setSelectedApp(null)} />
    </>
  );
}
