"use client";

import { Send } from "lucide-react";
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
    setState("submitting");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message")
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
      <Input name="name" placeholder="Ad Soyad" required className="bg-white" />
      <Input name="email" placeholder="E-posta" required type="email" className="bg-white" />
      <Input name="subject" placeholder="Konu" required className="bg-white" />
      <Textarea name="message" placeholder="Mesajın" required className="min-h-32 bg-white" />
      <Button disabled={state === "submitting"} type="submit">
        {state === "submitting" ? "Gönderiliyor..." : "Gönder"}
        <Send size={18} />
      </Button>
    </form>
  );
}
