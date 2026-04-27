import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, ShieldCheck, Users } from "lucide-react";

import { WorkshopApplicationForm } from "@/components/forms/workshop-application-form";
import { prisma } from "@/lib/prisma";

type WorkshopFormPageProps = {
  params: Promise<{
    "workshop-slug": string;
  }>;
};

export async function generateMetadata({ params }: WorkshopFormPageProps): Promise<Metadata> {
  const { "workshop-slug": slug } = await params;
  const workshop = await prisma.workshop.findUnique({ where: { slug }, select: { title: true, topic: true, venue: true } });
  if (!workshop) return { title: "Workshop Bulunamadı" };
  const description = `${workshop.topic} — ${workshop.venue}. Hemen ön başvuru yap.`;
  return {
    title: `${workshop.title} — Ön Başvuru`,
    description,
    alternates: { canonical: `https://yildiztenis.com/form/${slug}` },
  };
}

export default async function WorkshopFormPage({ params }: WorkshopFormPageProps) {
  const { "workshop-slug": slug } = await params;
  const workshop = await prisma.workshop.findUnique({
    where: { slug },
    include: {
      formFields: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  if (!workshop) {
    notFound();
  }

  const verifiedCount = await prisma.application.count({
    where: {
      workshopId: workshop.id,
      status: { not: "UNVERIFIED" }
    }
  });

  const acceptedCount = await prisma.application.count({
    where: {
      workshopId: workshop.id,
      status: "ACCEPTED"
    }
  });

  const dateText = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(workshop.startsAt);

  return (
    <main className="min-h-screen bg-[#f7fbf7] text-zinc-950">
      <header className="border-b border-emerald-950/10 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link className="inline-flex items-center gap-3" href="/">
            <span className="relative h-11 w-11 overflow-hidden rounded-full">
              <Image alt="Yıldız Tenis logosu" className="object-cover" fill priority sizes="44px" src="/images/yildiz-tenis-logo-round.png" />
            </span>
            <span>
              <span className="font-display block text-xl font-semibold text-[#003f16]">Yıldız Tenis</span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:block">Tenis platformu</span>
            </span>
          </Link>
          <Link className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 px-4 py-2 text-sm font-semibold text-[#007405] transition hover:bg-[#e8f6e8]" href="/">
            <ArrowLeft size={16} />
            Ana Sayfa
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative overflow-hidden rounded-[28px] bg-[#003f16] p-8 text-white shadow-[0_24px_80px_rgba(0,63,22,0.22)] md:p-10">
          <div className="absolute inset-0 court-grid opacity-35 mix-blend-screen" />
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#dff4df]">Ön Başvuru</p>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.95] md:text-7xl">{workshop.title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/82">{workshop.description}</p>

            <div className="mt-10 grid gap-4">
              <InfoLine icon={<CalendarDays size={18} />} label="Tarih" value={dateText} />
              <InfoLine icon={<MapPin size={18} />} label="Konum" value={workshop.venue} />
              <InfoLine icon={<Users size={18} />} label="Kontenjan" value={`${acceptedCount}/${workshop.capacity} asil liste · ${verifiedCount} doğrulanmış başvuru`} />
              <InfoLine icon={<ShieldCheck size={18} />} label="E-posta doğrulaması" value="@std.yildiz.edu.tr ve @yildiz.edu.tr adresleri kabul edilir" />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-emerald-950/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,60,20,0.08)] md:p-8">
          <div className="flex items-start gap-3 border-b border-zinc-100 pb-6">
            <span className="mt-1 grid h-9 w-9 place-items-center rounded-full bg-[#e8f6e8] text-[#007405]">
              <CheckCircle2 size={19} />
            </span>
            <div>
              <h2 className="text-2xl font-semibold">Başvuru bilgileri</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Form gönderildikten sonra e-posta adresine 6 haneli doğrulama kodu gelir. Kod doğrulanmadan başvuru kontenjana dahil edilmez.
              </p>
            </div>
          </div>
          <WorkshopApplicationForm fields={workshop.formFields} workshopSlug={workshop.slug} />
        </section>
      </div>
    </main>
  );
}

function InfoLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid gap-3 border-t border-white/12 pt-4 sm:grid-cols-[150px_1fr]">
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#dff4df]">
        {icon}
        {label}
      </div>
      <p className="text-sm leading-6 text-white/88">{value}</p>
    </div>
  );
}
