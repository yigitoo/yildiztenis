import { CalendarOff } from "lucide-react";

export function RegistrationClosedNotice() {
  return (
    <section className="flex items-center justify-center rounded-[28px] border border-emerald-950/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,60,20,0.08)] md:p-8">
      <div className="flex flex-col items-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <CalendarOff size={28} />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-zinc-700">Başvurular Kapalı</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          Bu etkinlik için ön başvurular şu anda kapalıdır. Yeni dönem açıldığında bu sayfada duyurulacaktır.
        </p>
      </div>
    </section>
  );
}
