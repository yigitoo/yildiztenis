import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted px-5">
      <div className="text-center">
        <p className="font-display text-8xl font-semibold text-primary">404</p>
        <h1 className="font-display mt-4 text-3xl font-semibold">Sayfa Bulunamadı</h1>
        <p className="mt-2 text-sm text-muted-foreground">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button render={<Link href="/" />}>Ana Sayfa</Button>
          <Button variant="outline" render={<Link href="/admin" />}>Admin Paneli</Button>
        </div>
      </div>
    </main>
  );
}
