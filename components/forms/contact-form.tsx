"use client";

import { Loader2, Send } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FormState = "idle" | "submitting";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  async function submitContact(formData: FormData) {
    if (state === "submitting") return;
    setState("submitting");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        website: formData.get("website") || undefined
      })
    });

    setState("idle");

    if (response.ok) {
      toast.success("Mesajın alındı. En kısa sürede dönüş yapacağız.");
      formRef.current?.reset();
    } else {
      toast.error("Mesaj gönderilemedi. Lütfen bilgileri kontrol edip tekrar dene.");
    }
  }

  return (
    <form ref={formRef} action={submitContact} className="grid gap-4 rounded-xl border border-emerald-900/10 p-6">
      <input type="text" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0 w-0" />
      <Input name="name" placeholder="Ad Soyad" required className="bg-white py-5" />
      <Input name="email" placeholder="E-posta" required type="email" className="bg-white py-5" />
      <Input name="subject" placeholder="Konu" required className="bg-white py-5" />
      <Textarea name="message" placeholder="Mesajın" required className="min-h-32 bg-white py-4" />
      <Button disabled={state === "submitting"} className="py-5" type="submit">
        {state === "submitting" ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {state === "submitting" ? "Gönderiliyor..." : "Gönder"}
      </Button>
    </form>
  );
}
