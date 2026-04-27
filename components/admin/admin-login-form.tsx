"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  async function submitLogin(formData: FormData) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!codeSent) {
      const nextEmail = formData.get("email")?.toString() ?? "";
      const nextPassword = formData.get("password")?.toString() ?? "";
      const response = await fetch("/api/admin/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail, password: nextPassword })
      });

      setIsSubmitting(false);

      if (!response.ok) {
        toast.error("E-posta veya şifre hatalı.");
        return;
      }

      setEmail(nextEmail);
      setPassword(nextPassword);
      setCodeSent(true);
      toast.success("Doğrulama kodu gönderildi.");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      otp: formData.get("otp"),
      redirect: false
    });

    setIsSubmitting(false);

    if (result?.error) {
      toast.error("Giriş başarısız. Şifreyi ve 2FA kodunu kontrol edin.");
      return;
    }

    startTransition(() => {
      router.push("/admin/workshops");
      router.refresh();
    });
  }

  return (
    <form action={submitLogin} className="mt-6 grid gap-4">
      {!codeSent ? (
        <>
          <Input name="email" placeholder="Admin e-postası" className="py-6" required type="email" />
          <Input name="password" placeholder="Şifre" className="py-6" required type="password" />
        </>
      ) : (
        <>
          <div className="rounded-lg bg-accent p-4 text-sm leading-6 text-accent-foreground">
            Doğrulama kodu <strong>{email}</strong> adresine gönderildi.
          </div>
          <Input
            name="otp"
            placeholder="000000"
            required
            inputMode="numeric"
            maxLength={6}
            className="text-center text-xl font-semibold tracking-[0.22em]"
          />
        </>
      )}
      <Button disabled={isSubmitting} className="py-6" type="submit">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Kontrol ediliyor..." : codeSent ? "Kodu Doğrula" : "Kodu E-postaya Gönder"}
      </Button>
      {codeSent && (
        <Button variant="ghost" onClick={() => setCodeSent(false)} type="button">
          E-posta veya şifreyi değiştir
        </Button>
      )}
    </form>
  );
}
