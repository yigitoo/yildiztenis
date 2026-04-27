"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_VARIANT, SKILL_LEVEL_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ApplicationStatus, SkillLevel } from "@/generated/prisma/client";

type ApplicationDetail = {
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
  workshop: { title: string };
};

type Props = {
  application: ApplicationDetail | null;
  onClose: () => void;
};

export function ApplicationDetailDialog({ application, onClose }: Props) {
  if (!application) return null;

  return (
    <Dialog open={!!application} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{application.firstName} {application.lastName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={APPLICATION_STATUS_VARIANT[application.status]}>
              {APPLICATION_STATUS_LABEL[application.status]}
            </Badge>
            <span className="text-sm text-muted-foreground">{application.workshop.title}</span>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <DetailRow label="E-posta" value={application.email} />
            <DetailRow label="Telefon" value={application.phone} />
            <DetailRow label="Okul" value={application.school} />
            {application.department && <DetailRow label="Bölüm" value={application.department} />}
            {application.classYear != null && <DetailRow label="Sınıf" value={application.classYear === 0 ? "Hazırlık" : application.classYear >= 6 ? (application.classYear === 6 ? "Y.Lisans" : application.classYear === 7 ? "Doktora" : "Mezun") : `${application.classYear}. Sınıf`} />}
            {application.isExternal && <DetailRow label="Kaynak" value="Harici Okul" />}
            <DetailRow label="Seviye" value={SKILL_LEVEL_LABEL[application.level]} />
            <DetailRow label="Başvuru" value={format(new Date(application.createdAt), "d MMM yyyy, HH:mm", { locale: tr })} />
            {application.verifiedAt && (
              <DetailRow label="Doğrulanma" value={format(new Date(application.verifiedAt), "d MMM yyyy, HH:mm", { locale: tr })} />
            )}
            {application.acceptedAt && (
              <DetailRow label="Kabul" value={format(new Date(application.acceptedAt), "d MMM yyyy, HH:mm", { locale: tr })} />
            )}
          </div>

          {application.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Başvuran Notu</p>
                <p className="mt-1 rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">{application.notes}</p>
              </div>
            </>
          )}

          {application.answers && Object.keys(application.answers).length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Form Cevapları</p>
                <div className="mt-2 grid gap-2 text-sm">
                  {Object.entries(application.answers)
                    .filter(([key]) => !["firstName", "lastName", "email", "phone", "school", "level", "notes"].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex gap-2 rounded-lg bg-muted px-3 py-2">
                        <span className="font-medium text-muted-foreground">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
