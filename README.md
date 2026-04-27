# Yıldız Tenis

YTÜ öğrencileri, mezunları ve partner okullar için tenis workshop başvuruları, admin yönetimi,
2FA koruması, e-posta bildirimleri ve XLSX/PDF export süreçlerini kapsayan Next.js platformu.

## Teknoloji

- Next.js App Router
- React, TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Prisma 7 + PostgreSQL
- NextAuth.js + TOTP tabanlı 2FA hazırlığı
- Resend e-posta altyapısı
- xlsx ve jsPDF export paketleri

## Klasör Yapısı

```txt
app/
  admin/                  Admin giriş ve panel ekranları
  api/                    Route Handler tabanlı backend uçları
  form/[workshop-slug]/   Workshop bazlı dinamik başvuru sayfası
  (legal)/                KVKK, gizlilik ve kullanım koşulları
components/
  landing/                Ana sayfa bileşenleri
  forms/                  Form bileşenleri
  admin/                  Admin panel bileşenleri
data/                     İlk landing verileri
lib/                      Prisma, auth, email ve ortak yardımcılar
prisma/
  schema.prisma           PostgreSQL veri modeli
  seed/                   İlk admin ve örnek workshop verisi
```

## Kurulum

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

`.env.example` dosyasını baz alarak yerel `.env` dosyasını doldurun. Üretimde `NEXTAUTH_SECRET`,
admin şifresi ve e-posta sağlayıcı anahtarı mutlaka değiştirilmelidir.

## Veritabanı Modeli

İlk şema şu ana alanları kapsar:

- `User`, `Account`, `Session`, `VerificationToken`: Admin auth ve NextAuth oturumları
- `User.twoFactorSecret`, `User.twoFactorEnabled`: TOTP tabanlı 2FA altyapısı
- `Workshop`: Etkinlik/workshop kaydı, kontenjan ve yayın durumu
- `FormField`: Workshop'a özel dinamik başvuru alanları
- `Application`: Başvuru ve asil liste durumu
- `ContactMessage`: Landing iletişim formu mesajları
- `EmailLog`: Otomatik ve admin tetiklemeli e-posta kayıtları
- `AuditLog`: Admin panel aksiyon geçmişi
A infrastructure for tennis clubs in Istanbul. (We're from YTU)
