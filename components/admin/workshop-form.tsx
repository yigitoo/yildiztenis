"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { saveWorkshop } from "@/app/admin/actions";
import type { ActionResult } from "@/lib/action-result";
import type { WorkshopStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/admin/image-upload";

type WorkshopFormProps = {
  workshop?: {
    id: string;
    title: string;
    topic: string;
    description: string;
    venue: string;
    startsAt: Date;
    endsAt: Date | null;
    applicationDeadline: Date | null;
    capacity: number;
    status: WorkshopStatus;
    isExternalOpen: boolean;
    whatsappLink: string | null;
    imageUrl: string | null;
  };
};

function toDatetimeLocal(value: Date | null) {
  if (!value) return "";
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function WorkshopForm({ workshop }: WorkshopFormProps) {
  const [imageUrl, setImageUrl] = useState(workshop?.imageUrl ?? "");
  const [state, formAction, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(
    async (prev, formData) => {
      formData.set("imageUrl", imageUrl);
      return saveWorkshop(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(workshop ? "Workshop güncellendi." : "Workshop oluşturuldu.");
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, workshop]);

  function fieldError(name: string) {
    if (!state || state.success) return null;
    const errors = state.fieldErrors?.[name];
    if (!errors?.length) return null;
    return <p className="text-sm text-destructive">{errors[0]}</p>;
  }

  return (
    <form action={formAction} className="grid gap-5">
      {workshop && <input name="id" type="hidden" value={workshop.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Başlık</Label>
          <Input id="title" name="title" defaultValue={workshop?.title} placeholder="Temel Tenis Atölyesi" required />
          {fieldError("title")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="topic">Konu</Label>
          <Input id="topic" name="topic" defaultValue={workshop?.topic} placeholder="Servis, return, maç senaryosu" required />
          {fieldError("topic")}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea id="description" name="description" defaultValue={workshop?.description} placeholder="Etkinliğin kapsamını, hedef kitlesini ve hazırlık notlarını yazın." className="min-h-32" required />
        {fieldError("description")}
      </div>

      <div className="space-y-2">
        <Label>Kapak Görseli</Label>
        <ImageUpload value={imageUrl} onChange={setImageUrl} folder="workshops" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="venue">Konum</Label>
          <Input id="venue" name="venue" defaultValue={workshop?.venue} placeholder="YTÜ Davutpaşa Spor Tesisleri" required />
          {fieldError("venue")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Kontenjan</Label>
          <Input id="capacity" name="capacity" defaultValue={workshop?.capacity} min="1" required type="number" />
          {fieldError("capacity")}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Başlangıç</Label>
          <Input id="startsAt" name="startsAt" defaultValue={toDatetimeLocal(workshop?.startsAt ?? null)} required type="datetime-local" />
          {fieldError("startsAt")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">Bitiş</Label>
          <Input id="endsAt" name="endsAt" defaultValue={toDatetimeLocal(workshop?.endsAt ?? null)} type="datetime-local" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="applicationDeadline">Son başvuru</Label>
          <Input id="applicationDeadline" name="applicationDeadline" defaultValue={toDatetimeLocal(workshop?.applicationDeadline ?? null)} type="datetime-local" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Yayın durumu</Label>
          <Select name="status" defaultValue={workshop?.status ?? "PUBLISHED"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLISHED">Yayında</SelectItem>
              <SelectItem value="DRAFT">Taslak</SelectItem>
              <SelectItem value="ARCHIVED">Arşiv</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Başvuru kapsamı</Label>
          <div className="flex h-9 items-center gap-2">
            <Checkbox id="isExternalOpen" name="isExternalOpen" defaultChecked={workshop?.isExternalOpen ?? true} />
            <Label htmlFor="isExternalOpen" className="text-sm font-normal">Partner okul başvurularına açık</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsappLink">WhatsApp Grup Linki</Label>
        <Input id="whatsappLink" name="whatsappLink" defaultValue={workshop?.whatsappLink ?? ""} placeholder="https://chat.whatsapp.com/..." type="url" />
        <p className="text-xs text-muted-foreground">Kabul edilen adaylara gönderilen mailde bu link paylaşılır. Başvuranlar göremez.</p>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 size={16} className="animate-spin" />}
          {pending ? "Kaydediliyor..." : workshop ? "Değişiklikleri Kaydet" : "Workshop Oluştur"}
        </Button>
        <Button variant="outline" render={<Link href="/admin/workshops" />}>
          Workshoplara dön
        </Button>
      </div>
    </form>
  );
}
