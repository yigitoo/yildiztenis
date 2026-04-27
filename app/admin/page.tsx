import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { authOptions } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/admin/workshops");
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7fbf7] px-5">
      <div className="absolute inset-0 court-grid opacity-40" />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(0,116,5,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,63,22,0.06) 0%, transparent 50%)"
        }}
      />

      <section className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full shadow-lg">
            <Image alt="Yıldız Tenis" className="object-cover" fill sizes="80px" src="/images/yildiz-tenis-logo-round.png" />
          </div>
          <h2 className="font-display mt-4 text-2xl font-semibold text-[#003f16]">Yıldız Tenis</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Operasyon Merkezi</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck size={22} />
          </div>
          <h1 className="font-display mt-5 text-3xl font-semibold">Admin Girişi</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Bu alan yalnızca yetkili yöneticilere açıktır. Şifre ve iki faktörlü doğrulama kodu birlikte kontrol edilir.
          </p>
          <AdminLoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Yıldız Tenis · Yıldız Teknik Üniversitesi
        </p>
      </section>
    </main>
  );
}
