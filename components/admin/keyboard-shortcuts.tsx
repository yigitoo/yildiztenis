"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const shortcuts = [
  { key: "g h", label: "Genel Bakış", href: "/admin" },
  { key: "g w", label: "Workshoplar", href: "/admin/workshops" },
  { key: "g a", label: "Başvurular", href: "/admin/applications" },
  { key: "g m", label: "Mesajlar", href: "/admin/messages" },
  { key: "g g", label: "Galeri", href: "/admin/gallery" },
  { key: "g t", label: "Takım", href: "/admin/team" },
  { key: "g e", label: "E-posta Kayıtları", href: "/admin/emails" },
  { key: "g l", label: "İşlem Geçmişi", href: "/admin/audit" },
  { key: "g s", label: "Ayarlar", href: "/admin/settings" },
  { key: "n w", label: "Yeni Workshop", href: "/admin/workshops/new" },
  { key: "?", label: "Kısayolları Göster", href: "" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable) return;

      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowHelp(v => !v);
        setPending(null);
        return;
      }

      if (e.key === "Escape") {
        setShowHelp(false);
        setPending(null);
        return;
      }

      if (pending) {
        const combo = `${pending} ${e.key}`;
        const match = shortcuts.find(s => s.key === combo);
        if (match && match.href) {
          e.preventDefault();
          router.push(match.href);
        }
        setPending(null);
        return;
      }

      if (e.key === "g" || e.key === "n") {
        setPending(e.key);
        timer = setTimeout(() => setPending(null), 1500);
        return;
      }
    }

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(timer);
    };
  }, [pending, router]);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Klavye Kısayolları</DialogTitle>
        </DialogHeader>
        <div className="grid gap-1">
          {shortcuts.filter(s => s.href).map(s => (
            <div key={s.key} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
              <span className="text-muted-foreground">{s.label}</span>
              <div className="flex gap-1">
                {s.key.split(" ").map((k, i) => (
                  <kbd key={i} className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
            <span className="text-muted-foreground">Bu paneli aç/kapat</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">?</kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
