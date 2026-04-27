"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useEffect, useState, useCallback } from "react";
import { Download, Loader2, CheckSquare, Square, MinusSquare } from "lucide-react";
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
  department: string | null;
  classYear: number | null;
  isExternal: boolean;
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchUpdating, setBatchUpdating] = useState(false);

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

  const allSelected = filtered.length > 0 && filtered.every(a => selectedIds.has(a.id));
  const someSelected = filtered.some(a => selectedIds.has(a.id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(a => a.id)));
    }
  }, [allSelected, filtered]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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

  async function handleBatchUpdate(newStatus: ApplicationStatus) {
    if (selectedIds.size === 0) return;
    setBatchUpdating(true);
    let successCount = 0;
    for (const id of selectedIds) {
      const fd = new FormData();
      fd.set("applicationId", id);
      fd.set("status", newStatus);
      const result = await updateApplicationStatus(null, fd);
      if (result.success) {
        successCount++;
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      }
    }
    toast.success(`${successCount} başvuru güncellendi.`);
    setSelectedIds(new Set());
    setBatchUpdating(false);
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
              <span className="hidden sm:inline">Tüm</span> XLSX
            </Button>
            <Button variant="outline" size="sm" render={<a href="/api/admin/export?scope=accepted&type=pdf" />}>
              <Download size={14} />
              <span className="hidden sm:inline">Asil</span> PDF
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <Input
              placeholder="Ara... (ad, e-posta, okul)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:max-w-sm"
            />
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
              <span className="shrink-0 text-sm text-muted-foreground">{filtered.length} sonuç</span>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-primary/5 px-4 py-3">
              <span className="text-sm font-medium">{selectedIds.size} seçili</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => handleBatchUpdate("ACCEPTED")} disabled={batchUpdating}>
                  {batchUpdating && <Loader2 size={14} className="animate-spin" />}
                  Kabul Et
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBatchUpdate("WAITLISTED")} disabled={batchUpdating}>
                  Yedek
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBatchUpdate("REJECTED")} disabled={batchUpdating}>
                  Reddet
                </Button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="ml-auto">
                Seçimi Kaldır
              </Button>
            </div>
          )}

          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Yükleniyor...</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Başvuru bulunamadı.</p>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <button type="button" onClick={toggleAll} className="flex items-center justify-center">
                          {allSelected ? <CheckSquare size={16} className="text-primary" /> : someSelected ? <MinusSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                        </button>
                      </TableHead>
                      <TableHead>Aday</TableHead>
                      <TableHead>Workshop</TableHead>
                      <TableHead>Okul</TableHead>
                      <TableHead className="hidden lg:table-cell">İletişim</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Aksiyon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(app => (
                      <TableRow key={app.id} className="cursor-pointer" onClick={() => setSelectedApp(app)}>
                        <TableCell onClick={e => e.stopPropagation()}>
                          <button type="button" onClick={() => toggleOne(app.id)} className="flex items-center justify-center">
                            {selectedIds.has(app.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                          </button>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{app.firstName} {app.lastName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(app.createdAt), "d MMM yyyy, HH:mm", { locale: tr })}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{app.workshop.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          <span>{app.school}</span>
                          {app.department && <span className="block text-xs">{app.department}</span>}
                          {app.isExternal && <span className="mt-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Harici</span>}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <p className="text-sm">{app.email}</p>
                          <p className="text-xs text-muted-foreground">{app.phone}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={APPLICATION_STATUS_VARIANT[app.status]}>
                            {APPLICATION_STATUS_LABEL[app.status]}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={e => e.stopPropagation()}>
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

              {/* Mobile card view */}
              <div className="grid gap-0 md:hidden">
                {filtered.map(app => (
                  <div
                    key={app.id}
                    className="flex gap-3 border-b border-border p-4 last:border-b-0 active:bg-muted/50"
                    onClick={() => setSelectedApp(app)}
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0"
                      onClick={e => { e.stopPropagation(); toggleOne(app.id); }}
                    >
                      {selectedIds.has(app.id) ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted-foreground" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium">{app.firstName} {app.lastName}</p>
                          <p className="truncate text-xs text-muted-foreground">{app.workshop.title}</p>
                        </div>
                        <Badge variant={APPLICATION_STATUS_VARIANT[app.status]} className="shrink-0">
                          {APPLICATION_STATUS_LABEL[app.status]}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{app.school}</span>
                        <span>{app.email}</span>
                        <span>{format(new Date(app.createdAt), "d MMM", { locale: tr })}</span>
                        {app.isExternal && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Harici</span>}
                      </div>
                      <div className="mt-2" onClick={e => e.stopPropagation()}>
                        {updatingId === app.id ? (
                          <div className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground">
                            <Loader2 size={14} className="animate-spin" />
                            Güncelleniyor
                          </div>
                        ) : (
                          <Select
                            defaultValue={app.status}
                            onValueChange={val => val && handleStatusUpdate(app.id, val)}
                            disabled={updatingId !== null}
                          >
                            <SelectTrigger className="h-8 w-full">
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
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ApplicationDetailDialog application={selectedApp} onClose={() => setSelectedApp(null)} />
    </>
  );
}
