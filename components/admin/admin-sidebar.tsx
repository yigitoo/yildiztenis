"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, GraduationCap, Users, Mail, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/workshops", label: "Workshoplar", icon: GraduationCap },
  { href: "/admin/applications", label: "Başvurular", icon: Users },
  { href: "/admin/messages", label: "Mesajlar", icon: Mail },
];

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof LayoutDashboard; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <Link className="inline-flex items-center gap-3" href="/admin">
          <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-border">
            <Image alt="Yıldız Tenis" className="object-cover" fill sizes="40px" src="/images/yildiz-tenis-logo.png" />
          </span>
          <span>
            <span className="font-display block text-lg font-semibold text-foreground">Yıldız Tenis</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin CRM</span>
          </span>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="grid gap-1">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return <NavLink key={item.href} {...item} active={active} />;
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/admin" })}
        >
          <LogOut size={18} />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigasyon</SheetTitle>
            <SidebarContent pathname={pathname} />
          </SheetContent>
        </Sheet>
        <Link className="inline-flex items-center gap-2" href="/admin">
          <span className="relative h-8 w-8 overflow-hidden rounded-lg border border-border">
            <Image alt="Yıldız Tenis" className="object-cover" fill sizes="32px" src="/images/yildiz-tenis-logo.png" />
          </span>
          <span className="font-display text-base font-semibold">Yıldız Tenis</span>
        </Link>
      </div>
    </>
  );
}
