"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Mail, PartyPopper } from "lucide-react";

import type { Prisma } from "@/generated/prisma/client";
import { SKILL_LEVEL_LABEL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type WorkshopApplicationFormProps = {
  workshopSlug: string;
  isExternalOpen: boolean;
  fields: Array<{
    label: string;
    name: string;
    type: string;
    required: boolean;
    placeholder: string | null;
    options: Prisma.JsonValue;
  }>;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function WorkshopApplicationForm({ workshopSlug, isExternalOpen, fields }: WorkshopApplicationFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isExternal, setIsExternal] = useState(false);

  async function submitApplication(formData: FormData) {
    if (state === "submitting") return;
    setState("submitting");
    setMessage(null);

    const body = {
      workshopSlug,
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      school: formData.get("school"),
      department: formData.get("department") || undefined,
      classYear: formData.get("classYear") ? Number(formData.get("classYear")) : undefined,
      isExternal,
      level: formData.get("level"),
      notes: formData.get("notes"),
      answers: Object.fromEntries(formData.entries())
    };

    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const payload = (await response.json()) as { id: string; message?: string };
      setApplicationId(payload.id);
      setState("idle");
      setShowVerifyDialog(true);
      return;
    }

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    setState("error");
    setMessage(payload?.message ?? "Başvuru gönderilemedi. Lütfen bilgileri kontrol edip tekrar dene.");
    toast.error(payload?.message ?? "Başvuru gönderilemedi.");
  }

  async function verifyApplication(formData: FormData) {
    if (!applicationId) return;
    if (state === "submitting") return;
    setState("submitting");
    setVerifyError(null);

    const response = await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        code: formData.get("code")
      })
    });

    if (response.ok) {
      setState("success");
      setShowVerifyDialog(false);
      setShowSuccessDialog(true);
      toast.success("Başvurun doğrulandı!");
      return;
    }

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    setState("error");
    setVerifyError(payload?.message ?? "Doğrulama başarısız. Kodu kontrol edip tekrar dene.");
  }

  if (state === "success" || showSuccessDialog) {
    return (
      <>
        <div className="mt-8 flex flex-col items-center rounded-2xl bg-accent p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PartyPopper size={28} />
          </div>
          <h3 className="font-display mt-5 text-2xl font-semibold">Başvurun Alındı!</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Başvurun doğrulandı ve değerlendirme listesine alındı. Sonuçlar e-posta ile bildirilecek.
          </p>
        </div>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="text-center sm:max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 size={32} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Tebrikler!</DialogTitle>
              <DialogDescription className="text-center">
                Başvurun başarıyla doğrulandı ve değerlendirme listesine alındı. Kabul durumun e-posta ile bildirilecek.
              </DialogDescription>
            </DialogHeader>
            <Button className="mt-2" onClick={() => setShowSuccessDialog(false)}>
              Tamam
            </Button>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <form action={submitApplication} className="mt-8 grid gap-4">
        {isExternalOpen && (
          <div className="flex gap-2 rounded-xl border border-zinc-200 bg-[#fbfdfb] p-1">
            <button
              type="button"
              onClick={() => setIsExternal(false)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                !isExternal
                  ? "bg-[#007405] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              YTÜ Öğrenci / Mezun
            </button>
            <button
              type="button"
              onClick={() => setIsExternal(true)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                isExternal
                  ? "bg-[#007405] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Diğer Okul
            </button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {fields
            .filter((field) => ["firstName", "lastName"].includes(field.name))
            .map((field) => (
              <InputField field={field} key={field.name} />
            ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {fields
            .filter((field) => ["email", "phone"].includes(field.name))
            .map((field) => (
              <InputField field={field} key={field.name} />
            ))}
        </div>
        {!isExternal && (
          <p className="-mt-2 text-xs font-medium text-muted-foreground">
            YTÜ başvuruları yalnızca @std.yildiz.edu.tr veya @yildiz.edu.tr uzantılı e-posta adresleriyle alınır.
          </p>
        )}
        {isExternal && (
          <p className="-mt-2 text-xs font-medium text-muted-foreground">
            Okulunuza ait e-posta adresinizi veya kişisel e-postanızı kullanabilirsiniz.
          </p>
        )}

        {fields
          .filter((field) => field.name === "school")
          .map((field) => (
            <InputField field={field} key={field.name} />
          ))}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            className="h-11 rounded-xl border-zinc-200 bg-[#fbfdfb]"
            name="department"
            placeholder="Bölüm (ör. Bilgisayar Mühendisliği)"
          />
          <select
            className="h-11 rounded-xl border border-zinc-200 bg-[#fbfdfb] px-4 py-3 text-sm outline-none transition focus:border-[#007405] focus:bg-white"
            name="classYear"
            defaultValue=""
          >
            <option value="">Sınıf seç</option>
            <option value="0">Hazırlık</option>
            <option value="1">1. Sınıf</option>
            <option value="2">2. Sınıf</option>
            <option value="3">3. Sınıf</option>
            <option value="4">4. Sınıf</option>
            <option value="5">5. Sınıf+</option>
            <option value="6">Yüksek Lisans</option>
            <option value="7">Doktora</option>
            <option value="8">Mezun</option>
          </select>
        </div>

        {fields
          .filter((field) => !["firstName", "lastName", "email", "phone", "school"].includes(field.name))
          .map((field) => (
            <InputField field={field} key={field.name} />
          ))}
        <Textarea className="min-h-28 rounded-xl border-zinc-200 bg-[#fbfdfb]" name="notes" placeholder="Eklemek istediğin notlar" />
        <Button type="submit" disabled={state === "submitting"} className="h-12 rounded-xl text-sm">
          {state === "submitting" && <Loader2 size={16} className="animate-spin" />}
          {state === "submitting" ? "Başvuru gönderiliyor..." : "Başvuruyu Gönder"}
        </Button>
        {message && state === "error" && (
          <p className="text-sm font-medium text-destructive">{message}</p>
        )}
      </form>

      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail size={28} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">E-posta Doğrulama</DialogTitle>
            <DialogDescription className="text-center">
              E-posta adresine 6 haneli doğrulama kodu gönderdik. Kodu girerek başvurunu onayla.
            </DialogDescription>
          </DialogHeader>
          <form action={verifyApplication} className="grid gap-4">
            <Input
              inputMode="numeric"
              maxLength={6}
              name="code"
              placeholder="000000"
              required
              className="h-14 text-center text-2xl font-semibold tracking-[0.28em]"
              autoFocus
            />
            {verifyError && <p className="text-center text-sm font-medium text-destructive">{verifyError}</p>}
            <Button type="submit" disabled={state === "submitting"} className="h-11">
              {state === "submitting" && <Loader2 size={16} className="animate-spin" />}
              {state === "submitting" ? "Doğrulanıyor..." : "Başvuruyu Doğrula"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InputField({
  field
}: {
  field: WorkshopApplicationFormProps["fields"][number];
}) {
  if (field.name === "level") {
    return (
      <select className="h-11 rounded-xl border border-zinc-200 bg-[#fbfdfb] px-4 py-3 outline-none transition focus:border-[#007405] focus:bg-white" name="level" required={field.required} defaultValue="">
        <option disabled value="">
          Seviye seç
        </option>
        {Object.entries(SKILL_LEVEL_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      className="h-11 rounded-xl border-zinc-200 bg-[#fbfdfb]"
      name={field.name}
      placeholder={field.placeholder ?? field.label}
      required={field.required}
      type={field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : "text"}
    />
  );
}
