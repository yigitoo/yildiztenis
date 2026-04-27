import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "Yıldız Tenis platformu kullanım koşulları.",
  alternates: { canonical: "https://yildiztenis.com/tos" },
};

export default function TosPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 text-zinc-950">
      <h1 className="text-4xl font-semibold">Kullanım Koşulları</h1>
      <p className="mt-2 text-sm text-zinc-400">Son güncelleme: 27 Nisan 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-zinc-600">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900">1. Genel</h2>
          <p className="mt-2">
            Bu kullanım koşulları, yildiztenis.com adresi üzerinden sunulan Yıldız Tenis platformunun
            kullanımına ilişkin kuralları belirler. Platformu kullanarak bu koşulları kabul etmiş
            sayılırsınız.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">2. Hizmet Tanımı</h2>
          <p className="mt-2">
            Yıldız Tenis, Yıldız Teknik Üniversitesi Tenis Topluluğu tarafından işletilen bir
            etkinlik yönetim platformudur. Platform aşağıdaki hizmetleri sunar:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Tenis workshop ve etkinliklerine çevrimiçi ön başvuru</li>
            <li>Etkinlik takvimi ve bilgilendirme</li>
            <li>Topluluk hakkında bilgi sunumu</li>
            <li>İletişim formu aracılığıyla mesaj gönderimi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">3. Başvuru Koşulları</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-6">
            <li>Başvuru sırasında sağlanan tüm bilgilerin doğru ve güncel olması zorunludur.</li>
            <li>Yanlış veya yanıltıcı bilgi veren başvurular reddedilebilir veya iptal edilebilir.</li>
            <li>Başvuru yapmak, etkinliğe katılım hakkı kazandığı anlamına gelmez. Kabul,
              kontenjan ve değerlendirme kriterlerine bağlıdır.</li>
            <li>Kabul edilen katılımcılar e-posta yoluyla bilgilendirilir.</li>
            <li>Başvuru sırasında e-posta doğrulaması zorunludur.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">4. Etkinlik Kuralları</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-6">
            <li>Katılımcılar, etkinlik süresince topluluk kurallarına ve kort adabına uymakla yükümlüdür.</li>
            <li>Etkinlik sırasında oluşabilecek fiziksel yaralanmalardan Yıldız Tenis sorumlu tutulamaz.
              Katılımcılar kendi sorumluluğunda katılım sağlar.</li>
            <li>Organizatörler, gerekli görülen durumlarda etkinlik programında değişiklik yapma veya
              etkinliği iptal etme hakkını saklı tutar.</li>
            <li>Etkinlik iptal edildiğinde kayıtlı katılımcılar e-posta ile bilgilendirilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">5. Fikri Mülkiyet</h2>
          <p className="mt-2">
            Platform üzerindeki tüm içerik, tasarım, logo ve görseller Yıldız Tenis Topluluğu&apos;na
            aittir. İzinsiz kopyalama, dağıtım veya ticari kullanım yasaktır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">6. Platform Kullanımı</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-6">
            <li>Platformun kötüye kullanımı, otomatik başvuru gönderimi veya sisteme müdahale
              girişimleri yasaktır.</li>
            <li>Platform erişimi, bakım veya güncelleme amacıyla geçici olarak kesintiye
              uğrayabilir.</li>
            <li>Yıldız Tenis, platformun kesintisiz veya hatasız çalışacağını garanti etmez.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">7. Sorumluluk Sınırı</h2>
          <p className="mt-2">
            Yıldız Tenis, platform kullanımından kaynaklanan doğrudan veya dolaylı zararlardan
            sorumlu tutulamaz. Platform &quot;olduğu gibi&quot; sunulmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">8. Değişiklikler</h2>
          <p className="mt-2">
            Bu kullanım koşulları önceden bildirim yapılmaksızın güncellenebilir. Güncellemeler
            yayınlandığı tarihten itibaren geçerlidir. Platformu kullanmaya devam etmeniz,
            güncellenmiş koşulları kabul ettiğiniz anlamına gelir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">9. Uygulanacak Hukuk</h2>
          <p className="mt-2">
            Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlık halinde İstanbul
            mahkemeleri ve icra daireleri yetkilidir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">10. İletişim</h2>
          <p className="mt-2">
            Kullanım koşullarına ilişkin sorularınız için{" "}
            <a href="mailto:info@yildiztenis.com" className="font-medium text-[#007405] underline underline-offset-2">
              info@yildiztenis.com
            </a>{" "}
            adresine ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </main>
  );
}
