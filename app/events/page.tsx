import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, Clock } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Etkinlikler",
  description: "Yıldız Tenis workshop ve etkinlikleri. Her seviyeye uygun tenis programları ile ön başvuru yapın.",
  alternates: { canonical: "https://yildiztenis.com/events" },
};

export default async function EventsPage() {
  const workshops = await prisma.workshop.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startsAt: "asc" },
    include: {
      applications: {
        where: { status: { not: "UNVERIFIED" } },
        select: { id: true, status: true }
      }
    }
  });

  const upcoming = workshops.filter(w => w.startsAt > new Date());
  const past = workshops.filter(w => w.startsAt <= new Date());

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="relative overflow-hidden bg-[#003f16] text-white">
        <div className="absolute inset-0 court-grid opacity-30 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#003f16]/80" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-12">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white">
            <ArrowLeft size={16} />
            Ana Sayfa
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#dff4df]">Etkinlikler</p>
          <h1 className="font-display mt-4 text-5xl font-semibold leading-tight md:text-7xl">
            Workshop &<br />Buluşmalar
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
            Kort üzerinde öğren, geliş, yarış. Her seviyeye uygun programlarla tenis deneyimini bir üst seviyeye taşı.
          </p>
        </div>
      </div>

      {upcoming.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#007405]">Yaklaşan Etkinlikler</p>
            <h2 className="font-display mt-2 text-3xl font-semibold md:text-4xl">Ön başvuru açık workshoplar</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {upcoming.map((workshop) => {
              const accepted = workshop.applications.filter(a => a.status === "ACCEPTED").length;
              const spotsLeft = workshop.capacity - accepted;

              return (
                <article key={workshop.id} className="group relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white transition hover:shadow-[0_20px_60px_rgba(0,60,20,0.1)]">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#007405] to-[#003f16]" />
                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-display text-sm font-semibold text-[#007405]">
                          {format(workshop.startsAt, "d MMMM yyyy", { locale: tr })}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold leading-tight group-hover:text-[#007405]">
                          {workshop.title}
                        </h3>
                      </div>
                      {spotsLeft <= 5 && spotsLeft > 0 && (
                        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Son {spotsLeft} yer
                        </span>
                      )}
                      {spotsLeft <= 0 && (
                        <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Kontenjan dolu
                        </span>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">{workshop.description}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Calendar size={15} className="text-[#007405]" />
                        {format(workshop.startsAt, "HH:mm", { locale: tr })}
                        {workshop.endsAt && ` – ${format(workshop.endsAt, "HH:mm", { locale: tr })}`}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <MapPin size={15} className="text-[#007405]" />
                        {workshop.venue}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Users size={15} className="text-[#007405]" />
                        {accepted}/{workshop.capacity} kayıtlı
                      </div>
                      {workshop.applicationDeadline && (
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <Clock size={15} className="text-[#007405]" />
                          Son: {format(workshop.applicationDeadline, "d MMM", { locale: tr })}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <Link
                        href={`/form/${workshop.slug}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#007405] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#005d04]"
                      >
                        Ön Başvuru Yap
                        <ArrowRight size={16} />
                      </Link>
                      <span className="text-xs text-zinc-400">{workshop.topic}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {upcoming.length === 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="rounded-2xl border border-dashed border-emerald-900/20 py-20 text-center">
            <Calendar size={40} className="mx-auto text-zinc-300" />
            <h3 className="mt-4 text-xl font-semibold text-zinc-700">Yaklaşan etkinlik yok</h3>
            <p className="mt-2 text-sm text-zinc-500">Yeni workshoplar duyurulduğunda burada görünecek.</p>
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="border-t border-emerald-900/10 bg-[#f9fcf9]">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">Geçmiş Etkinlikler</p>
            <h2 className="font-display mt-2 text-3xl font-semibold">Tamamlanan workshoplar</h2>

            <div className="mt-10 divide-y divide-zinc-200">
              {past.map((workshop) => (
                <div key={workshop.id} className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{workshop.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {format(workshop.startsAt, "d MMMM yyyy", { locale: tr })} · {workshop.venue}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <span>{workshop.applications.length} katılımcı</span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">Tamamlandı</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="border-t border-emerald-900/10 bg-white py-16 text-center">
        <h3 className="font-display text-2xl font-semibold">Sorularınız mı var?</h3>
        <p className="mt-2 text-sm text-zinc-500">Workshop, iş birliği veya kontenjan hakkında bize ulaşın.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/#contact" className="inline-flex items-center gap-2 rounded-lg bg-[#007405] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#005d04]">
            İletişime Geç
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-[#007405] hover:text-[#007405]">
            Ana Sayfa
          </Link>
        </div>
      </div>
    </main>
  );
}
