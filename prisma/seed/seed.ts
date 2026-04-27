import "dotenv/config";

import { hash } from "bcryptjs";
import { generateSecret } from "otplib";

import { PrismaClient } from "@/generated/prisma/client";
import { createPrismaAdapter } from "@/lib/prisma-adapter";

const prisma = new PrismaClient({
  adapter: createPrismaAdapter()
});

async function main() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_BOOTSTRAP_EMAIL ?? "info@yildiztenis.com")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "ChangeMe123!";
  const twoFactorSecret = process.env.ADMIN_TOTP_SECRET ?? generateSecret();
  const passwordHash = await hash(adminPassword, 12);

  await Promise.all(
    adminEmails.map((adminEmail) =>
      prisma.user.upsert({
        where: { email: adminEmail },
        update: {
          passwordHash,
          twoFactorSecret,
          twoFactorEnabled: true
        },
        create: {
          email: adminEmail,
          name: "Yıldız Tenis Admin",
          passwordHash,
          twoFactorSecret,
          twoFactorEnabled: true
        }
      })
    )
  );

  await Promise.all(
    [
      {
        key: "heroTitle",
        label: "Hero başlığı",
        value: "Tenisi, atölyeleri ve okul topluluklarını tek platformda topluyoruz."
      },
      {
        key: "heroSubtitle",
        label: "Hero alt başlığı",
        value:
          "Yıldız Teknik Üniversitesi öğrencileri ve mezunları için başlayan yapı, partner okulların katılımına da açık modern bir tenis deneyimi sunar."
      },
      {
        key: "aboutText",
        label: "Hakkımızda metni",
        value:
          "Yıldız Tenis, YTÜ öğrencileri ve mezunlarının kort erişimini, eğitim programlarını ve sosyal turnuvalarını düzenli hale getirmek için tasarlandı. Platform aynı zamanda diğer okullar ve partner kulüpler için başvuru, kontenjan ve iletişim süreçlerini tek merkezden yönetir."
      }
    ].map((item) =>
      prisma.siteContent.upsert({
        where: { key: item.key },
        update: { label: item.label, value: item.value },
        create: item
      })
    )
  );

  const workshops = [
    {
      title: "Temel Tenis Atölyesi",
      slug: "temel-tenis-atolyesi-mayis-2026",
      description:
        "Başlangıç seviyesindeki katılımcılar için raket tutuşu, ayak çalışması ve kort güvenliği odaklı yoğunlaştırılmış program.",
      topic: "Raket tutuşu, ayak çalışması ve kort güvenliği",
      venue: "YTÜ Davutpaşa Spor Tesisleri",
      startsAt: new Date("2026-05-16T10:00:00+03:00"),
      endsAt: new Date("2026-05-16T13:00:00+03:00"),
      applicationDeadline: new Date("2026-05-12T23:59:00+03:00"),
      capacity: 24
    },
    {
      title: "Servis ve Return Kampı",
      slug: "servis-return-kampi-haziran-2026",
      description:
        "Servis mekaniği, karşılama pozisyonu ve maç senaryoları üzerine orta seviye uygulamalı kamp.",
      topic: "Servis mekaniği, karşılama pozisyonu ve maç senaryoları",
      venue: "Yıldız Tenis Kortları",
      startsAt: new Date("2026-06-06T11:00:00+03:00"),
      endsAt: new Date("2026-06-06T14:00:00+03:00"),
      applicationDeadline: new Date("2026-06-01T23:59:00+03:00"),
      capacity: 18
    },
    {
      title: "Mezunlar Çiftler Buluşması",
      slug: "mezunlar-ciftler-bulusmasi-2026",
      description:
        "YTÜ mezunları ve partner okul katılımcıları için çiftler formatında sosyal turnuva ve tanışma buluşması.",
      topic: "Sosyal turnuva, eşleşme sistemi ve networking",
      venue: "Beşiktaş Partner Kortları",
      startsAt: new Date("2026-06-21T17:00:00+03:00"),
      endsAt: new Date("2026-06-21T20:30:00+03:00"),
      applicationDeadline: new Date("2026-06-15T23:59:00+03:00"),
      capacity: 32
    }
  ];

  for (const item of workshops) {
    const workshop = await prisma.workshop.upsert({
      where: { slug: item.slug },
      update: { ...item, status: "PUBLISHED", isExternalOpen: true },
      create: { ...item, status: "PUBLISHED", isExternalOpen: true }
    });

    await prisma.formField.createMany({
      data: [
        { workshopId: workshop.id, label: "Ad", name: "firstName", type: "TEXT", sortOrder: 1 },
        { workshopId: workshop.id, label: "Soyad", name: "lastName", type: "TEXT", sortOrder: 2 },
        { workshopId: workshop.id, label: "E-posta", name: "email", type: "EMAIL", sortOrder: 3 },
        { workshopId: workshop.id, label: "Telefon", name: "phone", type: "PHONE", sortOrder: 4 },
        { workshopId: workshop.id, label: "Okul / Üniversite", name: "school", type: "TEXT", sortOrder: 5 },
        {
          workshopId: workshop.id,
          label: "Seviye",
          name: "level",
          type: "SELECT",
          options: ["Başlangıç", "Orta", "İleri"],
          sortOrder: 6
        }
      ],
      skipDuplicates: true
    });
  }

  await prisma.galleryImage.createMany({
    data: [
      {
        title: "Kort içi başlangıç çalışması",
        alt: "Tenis kortunda temel vuruş çalışması yapan katılımcılar",
        imageUrl: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80",
        sortOrder: 1
      },
      {
        title: "Servis tekniği oturumu",
        alt: "Servis tekniği üzerine çalışan tenis oyuncusu",
        imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=900&q=80",
        sortOrder: 2
      },
      {
        title: "Sosyal maç günü",
        alt: "Açık tenis kortunda sosyal maç günü",
        imageUrl: "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=900&q=80",
        sortOrder: 3
      }
    ],
    skipDuplicates: true
  });

  await prisma.teamMember.createMany({
    data: [
      {
        name: "Ece Yıldırım",
        role: "Baş Eğitmen",
        bio: "Başlangıç ve orta seviye oyuncular için teknik gelişim programlarını yönetir.",
        imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=500&q=80",
        sortOrder: 1
      },
      {
        name: "Mert Kaya",
        role: "Program Koordinatörü",
        bio: "Workshop takvimi, kontenjan planlaması ve okul iş birliklerini koordine eder.",
        imageUrl: "https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=500&q=80",
        sortOrder: 2
      },
      {
        name: "Selin Arslan",
        role: "Topluluk Sorumlusu",
        bio: "Öğrenci, mezun ve partner okul katılımcıları arasındaki iletişimi yürütür.",
        imageUrl: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=500&q=80",
        sortOrder: 3
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
