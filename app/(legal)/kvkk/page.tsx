import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Yıldız Tenis KVKK aydınlatma metni — 6698 sayılı kanun kapsamında kişisel verilerin işlenmesi.",
  alternates: { canonical: "https://yildiztenis.com/kvkk" },
};

export default function KvkkPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 text-zinc-950">
      <h1 className="text-4xl font-semibold">KVKK Aydınlatma Metni</h1>
      <p className="mt-2 text-sm text-zinc-400">Son güncelleme: 27 Nisan 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-7 text-zinc-600">
        <section>
          <p>
            İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun
            (&quot;KVKK&quot;) 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde
            Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında hazırlanmıştır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">1. Veri Sorumlusu</h2>
          <p className="mt-2">
            Yıldız Teknik Üniversitesi Tenis Topluluğu (Yıldız Tenis) olarak, kişisel verilerinizi
            aşağıda açıklanan amaçlar doğrultusunda, hukuka ve dürüstlük kuralına uygun şekilde
            işlemekteyiz.
          </p>
          <div className="mt-3 rounded-lg border border-zinc-200 p-4 text-sm">
            <p><strong>Platform:</strong> yildiztenis.com</p>
            <p className="mt-1"><strong>E-posta:</strong>{" "}
              <a href="mailto:info@yildiztenis.com" className="text-[#007405] underline underline-offset-2">info@yildiztenis.com</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">2. İşlenen Kişisel Veriler</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="pb-2 pr-4 text-left font-semibold text-zinc-900">Veri Kategorisi</th>
                  <th className="pb-2 text-left font-semibold text-zinc-900">Veriler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-zinc-700">Kimlik</td>
                  <td className="py-2.5">Ad, soyad</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-zinc-700">İletişim</td>
                  <td className="py-2.5">E-posta adresi, telefon numarası</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-zinc-700">Eğitim</td>
                  <td className="py-2.5">Okul / üniversite adı, bölüm, sınıf</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-zinc-700">Etkinlik</td>
                  <td className="py-2.5">Tenis seviyesi, workshop tercihi, başvuru durumu, harici okul başvuru bilgisi</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-zinc-700">İşlem güvenliği</td>
                  <td className="py-2.5">IP adresi, oturum bilgisi, tarayıcı verisi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">3. İşleme Amaçları ve Hukuki Sebebi</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="pb-2 pr-4 text-left font-semibold text-zinc-900">Amaç</th>
                  <th className="pb-2 text-left font-semibold text-zinc-900">Hukuki Sebep (KVKK m.5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2.5 pr-4">Workshop başvurularının alınması ve değerlendirilmesi</td>
                  <td className="py-2.5">Açık rıza, sözleşmenin ifası</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">Başvuru durumu hakkında bilgilendirme</td>
                  <td className="py-2.5">Sözleşmenin ifası</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">Kontenjan ve etkinlik yönetimi</td>
                  <td className="py-2.5">Meşru menfaat</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">İletişim taleplerinin yanıtlanması</td>
                  <td className="py-2.5">Açık rıza</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">Platform güvenliğinin sağlanması</td>
                  <td className="py-2.5">Meşru menfaat</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">Yasal yükümlülüklerin yerine getirilmesi</td>
                  <td className="py-2.5">Kanuni yükümlülük</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">4. Verilerin Aktarımı</h2>
          <p className="mt-2">Kişisel verileriniz aşağıdaki alıcılara aktarılabilir:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li><strong>E-posta hizmet sağlayıcıları:</strong> Resend (ABD), Google SMTP — bilgilendirme e-postalarının gönderimi</li>
            <li><strong>Barındırma sağlayıcıları:</strong> Vercel (ABD), Aiven (AB) — platform ve veritabanı barındırma</li>
            <li><strong>CDN sağlayıcısı:</strong> Cloudflare (AB) — içerik dağıtımı</li>
            <li><strong>Yetkili kamu kurum ve kuruluşları:</strong> Yasal zorunluluk halinde</li>
          </ul>
          <p className="mt-3">
            Yurt dışına veri aktarımı, KVKK m.9 kapsamında yeterli koruma bulunan ülkelere veya
            yeterli korumanın bulunmadığı ülkelerde veri sorumlularının yeterli korumayı yazılı
            olarak taahhüt etmesi şartıyla gerçekleştirilir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">5. Saklama Süreleri</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="pb-2 pr-4 text-left font-semibold text-zinc-900">Veri</th>
                  <th className="pb-2 text-left font-semibold text-zinc-900">Saklama Süresi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2.5 pr-4">Workshop başvuru verileri</td>
                  <td className="py-2.5">Etkinlik tarihinden itibaren 2 yıl</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">İletişim formu verileri</td>
                  <td className="py-2.5">1 yıl</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">E-posta log verileri</td>
                  <td className="py-2.5">1 yıl</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">Oturum ve güvenlik verileri</td>
                  <td className="py-2.5">Oturum sonlandırılana kadar</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">Saklama süresi sona eren veriler silinir, yok edilir veya anonim hale getirilir.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">6. Veri Sahibinin Hakları</h2>
          <p className="mt-2">KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ol className="mt-3 list-[lower-alpha] space-y-1.5 pl-6">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
            <li>KVKK m.7 çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
            <li>(e) ve (f) bentleri uyarınca yapılan işlemlerin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">7. Başvuru Yöntemi</h2>
          <p className="mt-2">
            Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>
              <strong>E-posta:</strong>{" "}
              <a href="mailto:info@yildiztenis.com" className="font-medium text-[#007405] underline underline-offset-2">
                info@yildiztenis.com
              </a>{" "}
              adresine kimliğinizi doğrulayan bilgilerle birlikte yazılı başvuru
            </li>
          </ul>
          <p className="mt-3">
            Başvurular en geç 30 gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir
            maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen
            tarife uygulanabilir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">8. Güncelleme</h2>
          <p className="mt-2">
            İşbu aydınlatma metni, yasal düzenlemeler veya veri işleme faaliyetlerindeki
            değişiklikler doğrultusunda güncellenebilir. Güncellemeler platform üzerinden
            yayınlanır.
          </p>
        </section>
      </div>
    </main>
  );
}
