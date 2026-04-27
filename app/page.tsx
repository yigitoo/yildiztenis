import { LandingPage } from "@/components/landing/landing-page";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [contentRows, workshops, galleryImages, teamMembers] = await Promise.all([
    prisma.siteContent.findMany(),
    prisma.workshop.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { startsAt: "asc" },
      take: 6
    }),
    prisma.galleryImage.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      take: 6
    }),
    prisma.teamMember.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" }
    })
  ]);

  const content = Object.fromEntries(contentRows.map((row) => [row.key, row.value]));

  return (
    <LandingPage
      content={{
        heroTitle: content.heroTitle ?? "Tenisi, atölyeleri ve okul topluluklarını tek platformda topluyoruz.",
        heroSubtitle:
          content.heroSubtitle ??
          "Yıldız Teknik Üniversitesi öğrencileri ve mezunları için başlayan yapı, partner okulların katılımına da açık modern bir tenis deneyimi sunar.",
        aboutText:
          content.aboutText ??
          "Yıldız Tenis, kort erişimini, eğitim programlarını ve sosyal turnuvaları düzenli hale getirmek için tasarlandı."
      }}
      galleryImages={galleryImages}
      teamMembers={teamMembers}
      workshops={workshops}
    />
  );
}
