"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, MapPin, Menu, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    isRegistrationOpen: boolean;
    acceptedCount: number;
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
  { href: "#hero", label: "Ana Sayfa" },
  { href: "#events", label: "Etkinlikler" },
  { href: "#contact", label: "İletişim" }
];

export function LandingPage({ content, workshops, galleryImages, teamMembers }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#hero");

  useEffect(() => {
    const ids = navLinks.map(l => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  const heroImage = galleryImages[0]?.imageUrl ?? "";

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <nav className="sticky top-0 z-30 bg-[#003f16]/70 px-3 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 md:px-4">
          <Link className="group inline-flex min-w-0 items-center gap-3" href="/">
            <span className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full">
              <Image alt="Yıldız Tenis logosu" className="object-cover" fill priority src="/images/yildiz-tenis-logo-round.png" sizes="52px" />
            </span>
            <span className="leading-none">
              <span className="font-display block text-xl font-semibold text-white transition group-hover:text-[#dff4df] md:text-[1.7rem]">
                Yıldız Tenis
              </span>
              <span className="hidden pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60 md:block">
                Tenis platformu
              </span>
            </span>
          </Link>
          <div className="hidden grid-cols-3 rounded-[18px] bg-white/10 p-1 text-center text-sm font-semibold text-white/90 ring-1 ring-white/15 md:grid">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href;
              return link.href === "#contact" ? (
                <a className={`rounded-[14px] px-5 py-2.5 transition ${isActive ? "bg-[#007405] text-white shadow-[0_10px_24px_rgba(0,116,5,0.22)]" : "bg-[#007405]/80 text-white hover:bg-[#007405]"}`} href={link.href} key={link.href}>
                  {link.label}
                </a>
              ) : (
                <a className={`rounded-[14px] px-5 py-2.5 transition ${isActive ? "bg-white/20 text-white shadow-sm" : "hover:bg-white/15 hover:text-white"}`} href={link.href} key={link.href}>
                  {link.label}
                </a>
              );
            })}
          </div>
          <button
            aria-expanded={isMenuOpen}
            aria-label="Menüyü aç veya kapat"
            className="grid h-11 w-11 place-items-center rounded-[16px] bg-white/10 text-white ring-1 ring-white/15 md:hidden"
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
        id="hero"
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
                        {workshop.acceptedCount}/{workshop.capacity} kayıtlı
                      </span>
                    </div>
                  </div>
                  {workshop.isRegistrationOpen ? (
                    <Link
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#007405] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#005d04]"
                      href={`/form/${workshop.slug}`}
                    >
                      Ön Başvuru
                      <ArrowRight size={17} />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-400 cursor-not-allowed">
                      Başvurular Kapalı
                    </span>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#007405] transition hover:underline">
            Tüm etkinlikleri gör
            <ArrowRight size={16} />
          </Link>
        </div>
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
              <div className="text-center">
                <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-900/10 bg-emerald-50 transition duration-500 group-hover:scale-105">
                  {member.imageUrl ? (
                    <img
                      alt={member.name}
                      className="h-full w-full object-cover"
                      src={member.imageUrl}
                    />
                  ) : (
                    <span className="text-3xl font-bold text-emerald-800/40">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  )}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold text-[#007405]">{member.role}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{member.bio}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto grid max-w-6xl gap-10 px-5 pt-32 pb-24 scroll-mt-24 md:grid-cols-[0.9fr_1.1fr]">
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

      <footer className="bg-[#0c1810] text-white">
        <div className="mx-auto max-w-6xl px-5 pt-20 pb-10">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image alt="Yıldız Tenis" className="object-cover" fill sizes="48px" src="/images/yildiz-tenis-logo-round.png" />
                </span>
                <span className="font-display text-xl font-semibold">Yıldız Tenis</span>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-7 text-white/50">
                YTÜ merkezli tenis topluluğu. Öğrenciler, mezunlar ve partner okullar için workshop ve etkinlik platformu.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Platform</h4>
              <nav className="mt-5 grid gap-3 text-sm">
                <Link className="text-white/70 transition hover:text-white" href="/events">Etkinlikler</Link>
                <a className="text-white/70 transition hover:text-white" href="#contact">İletişim</a>
              </nav>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Yasal</h4>
              <nav className="mt-5 grid gap-3 text-sm">
                <Link className="text-white/70 transition hover:text-white" href="/kvkk">KVKK Aydınlatma</Link>
                <Link className="text-white/70 transition hover:text-white" href="/tos">Kullanım Koşulları</Link>
                <Link className="text-white/70 transition hover:text-white" href="/privacy">Gizlilik Politikası</Link>
              </nav>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">İletişim & Sosyal</h4>
              <nav className="mt-5 grid gap-3 text-sm">
                <a className="inline-flex items-center gap-2 text-white/70 transition hover:text-white" href="mailto:info@yildiztenis.com">
                  <Mail size={15} />
                  info@yildiztenis.com
                </a>
                <a className="inline-flex items-center gap-2 text-white/70 transition hover:text-white" href="https://www.instagram.com/ytutenis/" rel="noreferrer" target="_blank">
                  <svg width="15" height="15" viewBox="90 90 460 460" fill="currentColor"><path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z"/></svg>
                  Instagram
                </a>
                <a className="inline-flex items-center gap-2 text-white/70 transition hover:text-white" href="https://www.tiktok.com/@ytutenis" rel="noreferrer" target="_blank">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.84 4.84 0 01-1-.11z"/></svg>
                  TikTok
                </a>
                <a className="inline-flex items-center gap-2 text-white/70 transition hover:text-white" href="https://www.linkedin.com/company/yt%C3%BC-tenis/" rel="noreferrer" target="_blank">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              </nav>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/30 md:flex-row">
            <p>© {new Date().getFullYear()} Yıldız Tenis. Tüm hakları saklıdır.</p>
            <p>
              Developed by{' '}
              <Link href='https://github.com/yigitoo' className="underline text-blue-100">
                Yiğit GÜMÜŞ
              </Link>
              {' '}for{' '}
              <Link href='https://instagram.com/ytutenis' className="underline text-blue-100">
                Yıldız Tenis
              </Link>.
              <br/>
              Yıldız Teknik Üniversitesi, İstanbul</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
