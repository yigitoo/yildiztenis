import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900">
            <ArrowLeft size={16} />
            Ana Sayfa
          </Link>
          <span className="text-zinc-200">|</span>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/yildiz-tenis-logo-round.png" alt="Yıldız Tenis" width={28} height={28} className="rounded-full" />
            <span className="text-sm font-semibold text-zinc-900">Yıldız Tenis</span>
          </Link>
        </div>
      </nav>
      {children}
      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400">
        <div className="mx-auto max-w-3xl px-5 flex flex-wrap justify-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-600">Gizlilik Politikası</Link>
          <Link href="/tos" className="hover:text-zinc-600">Kullanım Koşulları</Link>
          <Link href="/kvkk" className="hover:text-zinc-600">KVKK</Link>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} Yıldız Tenis. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
