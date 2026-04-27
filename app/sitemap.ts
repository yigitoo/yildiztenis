import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://yildiztenis.com";

  const workshops = await prisma.workshop.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/tos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/kvkk`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const workshopPages: MetadataRoute.Sitemap = workshops.map((w) => ({
    url: `${baseUrl}/form/${w.slug}`,
    lastModified: w.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...workshopPages];
}
