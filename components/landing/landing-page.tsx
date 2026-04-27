"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Camera, Mail, MapPin, Menu, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ContactForm } from "@/components/forms/contact-form";

type LandingPageProps = {
  content: Record<string, string>;
  workshops: Array<{
    title: string;
    slug: string;
    topic: string;
    venue: string;
    startsAt: Date;
    capacity: number;
  }>;
  galleryImages: Array<{
    id: string;
    title: string;
    alt: string;
    imageUrl: string;
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    bio: string;
    imageUrl: string | null;
  }>;
};

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" as const }
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "#events", label: "Etkinlikler" },
  { href: "#contact", label: "İletişim" }
];

export function LandingPage({ content, workshops, galleryImages, teamMembers }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroImage =
    galleryImages[0]?.imageUrl ??
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1800&q=85";

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <nav className="sticky top-0 z-30 bg-white/72 px-3 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[24px] border border-emerald-950/10 bg-white/88 px-3 py-2 shadow-[0_18px_60px_rgba(0,60,20,0.12)] md:px-4">
          <Link className="group inline-flex min-w-0 items-center gap-3" href="/">
            <span className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[18px] border border-emerald-950/10 bg-white shadow-[0_14px_34px_rgba(0,60,20,0.16)]">
              <Image alt="Yıldız Tenis logosu" className="object-cover" fill priority src="/images/yildiz-tenis-logo.png" sizes="52px" />
            </span>
            <span className="leading-none">
              <span className="font-display block text-xl font-semibold text-[#003f16] transition group-hover:text-[#007405] md:text-[1.7rem]">
                Yıldız Tenis
              </span>
              <span className="hidden pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400 md:block">
                Tenis platformu
              </span>
            </span>
          </Link>
          <div className="hidden grid-cols-3 rounded-[18px] bg-[#f3faf3] p-1 text-center text-sm font-semibold text-zinc-700 ring-1 ring-emerald-950/8 md:grid">
            {navLinks.map((link) =>
              link.href === "#contact" ? (
                <a className="rounded-[14px] bg-[#007405] px-5 py-2.5 text-white shadow-[0_10px_24px_rgba(0,116,5,0.22)] transition hover:bg-[#005d04]" href={link.href} key={link.href}>
                  {link.label}
                </a>
              ) : link.href.startsWith("#") ? (
                <a className="rounded-[14px] px-5 py-2.5 transition hover:bg-white hover:text-[#007405] hover:shadow-sm" href={link.href} key={link.href}>
                  {link.label}
                </a>
              ) : (
                <Link className="rounded-[14px] px-5 py-2.5 transition hover:bg-white hover:text-[#007405] hover:shadow-sm" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              )
            )}
          </div>
          <button
            aria-expanded={isMenuOpen}
            aria-label="Menüyü aç veya kapat"
            className="grid h-11 w-11 place-items-center rounded-[16px] bg-[#f3faf3] text-[#003f16] ring-1 ring-emerald-950/8 md:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
            type="button"
          >
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-[22px] border border-emerald-950/10 bg-white/94 p-2 shadow-[0_18px_60px_rgba(0,60,20,0.16)] md:hidden"
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {navLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <a
                    className="block rounded-[16px] px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-[#e8f6e8] hover:text-[#007405]"
                    href={link.href}
                    key={link.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    className="block rounded-[16px] px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-[#e8f6e8] hover:text-[#007405]"
                    href={link.href}
                    key={link.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>

      <section
        className="relative isolate flex min-h-[calc(100vh-65px)] overflow-hidden bg-[#0c1810] text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0, 42, 15, 0.9) 0%, rgba(0, 70, 24, 0.68) 42%, rgba(0, 0, 0, 0.12) 100%), url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 court-grid opacity-70 mix-blend-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(223,244,223,0.28),transparent_26%),linear-gradient(180deg,transparent_65%,rgba(0,0,0,0.34))]"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 py-16 md:px-6">
          <motion.div {...reveal} className="max-w-5xl">
            <div className="mb-8 inline-flex items-center gap-3 border-l-2 border-[#dff4df] pl-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#dff4df]">
              YTÜ merkezli tenis platformu
            </div>
            <h1 className="font-display text-[clamp(4.8rem,15vw,12.4rem)] font-semibold leading-[0.76] tracking-normal">
              Yıldız Tenis
            </h1>
            <p className="mt-8 max-w-2xl text-2xl font-semibold leading-tight text-white md:text-4xl">
              {content.heroTitle}
            </p>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/82 md:text-lg">
              {content.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#003f16] transition hover:-translate-y-0.5 hover:bg-[#dff4df]"
                href="#events"
              >
                Etkinlikleri İncele
                <ArrowRight size={18} />
              </a>
              <a
                className="inline-flex items-center justify-center rounded-md border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/12"
                href="#contact"
              >
                İletişime Geç
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="events" className="mx-auto max-w-6xl px-5 py-24">
        <motion.div {...reveal} className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#007405]">
            Gelecek Etkinlikler
          </p>
          <h2 className="font-display mt-3 text-4xl font-semibold leading-tight md:text-6xl">
            Workshop ve buluşmalar için ön başvurular açık.
          </h2>
        </motion.div>

        {workshops.length === 0 ? (
          <motion.div {...reveal} className="mt-12 rounded-xl border border-dashed border-emerald-900/20 py-16 text-center">
            <p className="text-lg font-medium text-zinc-500">Yakında yeni etkinlikler duyurulacak.</p>
            <p className="mt-2 text-sm text-zinc-400">Haberdar olmak için bizi takip etmeye devam edin.</p>
          </motion.div>
        ) : (
          <div className="mt-12 divide-y divide-emerald-950/12 border-y border-emerald-950/12">
            {workshops.map((workshop, index) => (
              <motion.article
                {...reveal}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                key={workshop.slug}
              >
                <div className="grid gap-5 py-8 md:grid-cols-[0.38fr_1fr_auto] md:items-center">
                  <div className="font-display text-3xl font-semibold text-[#007405]">
                    {dateFormatter.format(workshop.startsAt)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold">{workshop.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{workshop.topic}</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={16} />
                        {workshop.venue}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Users size={16} />
                        {workshop.capacity} kişilik kontenjan
                      </span>
                    </div>
                  </div>
                  <Link
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#007405] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#005d04]"
                    href={`/form/${workshop.slug}`}
                  >
                    Ön Başvuru
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#f4faf4] py-24">
        <div className="mx-auto max-w-6xl px-5">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#007405]">
            Galeri
          </p>
          <h2 className="font-display mt-3 text-4xl font-semibold leading-tight md:text-6xl">
            Korttan ve atölyelerden seçili anlar.
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {galleryImages.map((image, index) => (
            <motion.figure
              {...reveal}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.04 }}
              className={index === 0 ? "md:col-span-2" : ""}
              key={image.id}
            >
              <div>
                <div
                  aria-label={image.alt}
                  className="aspect-[4/3] bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${image.imageUrl})` }}
                />
                <figcaption className="pt-3 text-sm font-medium text-zinc-700">{image.title}</figcaption>
              </div>
            </motion.figure>
          ))}
        </div>
        </div>
      </section>

      <section className="border-y border-emerald-900/10 bg-white py-24">
        <div className="mx-auto max-w-6xl px-5">
          <motion.div {...reveal} className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#007405]">
                Hakkımızda
              </p>
              <h2 className="font-display mt-3 text-4xl font-semibold leading-tight md:text-6xl">
                Üniversite topluluğundan açık bir spor ağına.
              </h2>
            </div>
            <p className="text-xl leading-9 text-zinc-600">
              {content.aboutText}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#007405]">
            Takım
          </p>
          <h2 className="font-display mt-3 text-4xl font-semibold leading-tight md:text-6xl">
            Programları sahadan gelen ekip yönetir.
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {teamMembers.map((member, index) => (
            <motion.article
              {...reveal}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
              className="group"
              key={member.id}
            >
              <div>
                <div
                  className="aspect-[4/5] bg-cover bg-center transition duration-500 group-hover:scale-[1.015]"
                  style={{
                    backgroundImage: `url(${member.imageUrl ?? "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=400&q=80"})`
                  }}
                />
                <h3 className="mt-5 text-2xl font-semibold">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold text-[#007405]">{member.role}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{member.bio}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto grid max-w-6xl gap-10 px-5 py-24 md:grid-cols-[0.9fr_1.1fr]">
        <motion.div {...reveal}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#007405]">
            İletişim
          </p>
          <h2 className="font-display mt-3 text-4xl font-semibold leading-tight md:text-6xl">Bize mesaj bırak.</h2>
          <p className="mt-5 text-lg leading-8 text-zinc-600">
            Workshop, okul iş birliği veya kontenjan soruları için formu doldurabilirsin.
          </p>
        </motion.div>

        <motion.div {...reveal}>
          <ContactForm />
        </motion.div>
      </section>

      <footer className="border-t border-emerald-900/10 bg-[#f9fcf9]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-emerald-950/10">
                  <Image alt="Yıldız Tenis" className="object-cover" fill sizes="40px" src="/images/yildiz-tenis-logo.png" />
                </span>
                <span className="font-display text-xl font-semibold text-[#003f16]">Yıldız Tenis</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500">
                YTÜ merkezli tenis topluluğu. Öğrenciler, mezunlar ve partner okullar için workshop ve etkinlik platformu.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Platform</h4>
              <nav className="mt-4 grid gap-2.5 text-sm">
                <a className="text-zinc-600 transition hover:text-[#007405]" href="#events">Etkinlikler</a>
                <a className="text-zinc-600 transition hover:text-[#007405]" href="#contact">İletişim</a>
              </nav>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Yasal</h4>
              <nav className="mt-4 grid gap-2.5 text-sm">
                <Link className="text-zinc-600 transition hover:text-[#007405]" href="/kvkk">KVKK Aydınlatma</Link>
                <Link className="text-zinc-600 transition hover:text-[#007405]" href="/tos">Kullanım Koşulları</Link>
                <Link className="text-zinc-600 transition hover:text-[#007405]" href="/privacy">Gizlilik Politikası</Link>
              </nav>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">İletişim</h4>
              <nav className="mt-4 grid gap-2.5 text-sm">
                <a className="inline-flex items-center gap-2 text-zinc-600 transition hover:text-[#007405]" href="mailto:info@yildiztenis.com">
                  <Mail size={15} />
                  info@yildiztenis.com
                </a>
                <a className="inline-flex items-center gap-2 text-zinc-600 transition hover:text-[#007405]" href="https://instagram.com" rel="noreferrer" target="_blank">
                  <Camera size={15} />
                  Instagram
                </a>
              </nav>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-emerald-900/10 pt-8 text-xs text-zinc-400 md:flex-row">
            <p>© {new Date().getFullYear()} Yıldız Tenis. Tüm hakları saklıdır.</p>
            <p>Yıldız Teknik Üniversitesi, İstanbul</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
