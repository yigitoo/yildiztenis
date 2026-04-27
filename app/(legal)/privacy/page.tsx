import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Yıldız Tenis gizlilik politikası — kişisel verilerin korunması ve işlenmesi.",
  alternates: { canonical: "https://yildiztenis.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 text-zinc-950">
      <h1 className="text-4xl font-semibold">Gizlilik Politikası</h1>
      <p className="mt-2 text-sm text-zinc-400">Son güncelleme: 27 Nisan 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-zinc-600">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900">1. Veri Sorumlusu</h2>
          <p className="mt-2">
            Bu platform, Yıldız Teknik Üniversitesi bünyesinde faaliyet gösteren Yıldız Tenis Topluluğu
            tarafından işletilmektedir. Kişisel verilerinizin korunması konusunda 6698 sayılı Kişisel
            Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla hareket ediyoruz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">2. Toplanan Veriler</h2>
          <p className="mt-2">Platform üzerinden aşağıdaki kişisel veriler toplanabilir:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li><strong>Kimlik bilgileri:</strong> Ad, soyad</li>
            <li><strong>İletişim bilgileri:</strong> E-posta adresi, telefon numarası</li>
            <li><strong>Eğitim bilgileri:</strong> Okul/üniversite adı</li>
            <li><strong>Etkinlik bilgileri:</strong> Workshop tercihi, tenis seviyesi, başvuru durumu</li>
            <li><strong>İletişim formu:</strong> Konu, mesaj içeriği</li>
            <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı bilgisi, çerez verileri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">3. Verilerin İşlenme Amacı</h2>
          <p className="mt-2">Toplanan veriler aşağıdaki amaçlarla işlenir:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Workshop ve etkinlik başvurularının değerlendirilmesi</li>
            <li>Başvuru durumu hakkında bilgilendirme e-postaları gönderilmesi</li>
            <li>Etkinlik organizasyonu ve kontenjan yönetimi</li>
            <li>İletişim taleplerinin yanıtlanması</li>
            <li>Platform güvenliğinin sağlanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">4. Verilerin Paylaşımı</h2>
          <p className="mt-2">
            Kişisel verileriniz, aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarıyla</li>
            <li>E-posta gönderimi için hizmet sağlayıcılarıyla (Resend, Google SMTP)</li>
            <li>Barındırma hizmetleri için altyapı sağlayıcılarıyla (Vercel, Aiven, Cloudflare)</li>
          </ul>
          <p className="mt-2">
            Verileriniz yurt dışında bulunan sunucularda (AB bölgesi) işlenebilir. Bu durumda
            KVKK&apos;nın yurt dışına veri aktarımına ilişkin hükümleri uygulanır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">5. Verilerin Saklanması</h2>
          <p className="mt-2">
            Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca saklanır. Workshop
            başvuru verileri etkinlik tarihinden itibaren en fazla 2 yıl, iletişim formu
            verileri 1 yıl süreyle muhafaza edilir. Süre sonunda veriler silinir veya
            anonim hale getirilir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">6. Çerezler</h2>
          <p className="mt-2">
            Platform, oturum yönetimi ve güvenlik amacıyla teknik çerezler kullanır. Bu çerezler
            platformun düzgün çalışması için zorunludur. Analitik veya reklam amaçlı çerez
            kullanılmamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">7. Haklarınız</h2>
          <p className="mt-2">KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
            <li>KVKK&apos;nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kanuna aykırı işleme sebebiyle zarara uğranması halinde zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">8. İletişim</h2>
          <p className="mt-2">
            Kişisel verilerinize ilişkin tüm taleplerinizi{" "}
            <a href="mailto:info@yildiztenis.com" className="font-medium text-[#007405] underline underline-offset-2">
              info@yildiztenis.com
            </a>{" "}
            adresine iletebilirsiniz.
          </p>
        </section>
      </div>
    </main>
  );
}
