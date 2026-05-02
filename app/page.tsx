import { LandingPage } from "@/components/landing/landing-page";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

export default async function Home() {
  const [contentRows, workshops, heroImage] = await Promise.all([
    prisma.siteContent.findMany(),
    prisma.workshop.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { startsAt: "asc" },
      take: 6,
      include: {
        applications: {
          where: { status: { not: "UNVERIFIED" } },
          select: { id: true, status: true }
        }
      }
    }),
    prisma.galleryImage.findFirst({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      select: { imageUrl: true }
    }),
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
      heroImageUrl={heroImage?.imageUrl}
      workshops={workshops.map((w) => ({
        title: w.title,
        slug: w.slug,
        topic: w.topic,
        venue: w.venue,
        startsAt: w.startsAt,
        capacity: w.capacity,
        isRegistrationOpen: w.isRegistrationOpen,
        acceptedCount: w.applications.filter((a) => a.status === "ACCEPTED").length,
      }))}
    />
  );
}
