import { prisma } from "@/lib/prisma";
import { WorkshopList } from "@/components/admin/workshop-list";

export default async function WorkshopsPage() {
  const workshops = await prisma.workshop.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      applications: {
        where: { status: { not: "UNVERIFIED" } },
        select: { id: true, status: true }
      }
    }
  });

  return (
    <WorkshopList
      workshops={workshops.map((w) => ({
        id: w.id,
        title: w.title,
        topic: w.topic,
        venue: w.venue,
        capacity: w.capacity,
        status: w.status,
        startsAt: w.startsAt.toISOString(),
        acceptedCount: w.applications.filter((a) => a.status === "ACCEPTED").length,
        applicationCount: w.applications.length,
      }))}
    />
  );
}
