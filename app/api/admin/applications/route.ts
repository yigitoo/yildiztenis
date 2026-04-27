import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ workshops: [], applications: [] }, { status: 401 });
  }

  const workshopId = request.nextUrl.searchParams.get("workshopId");

  const [workshops, applications] = await Promise.all([
    prisma.workshop.findMany({
      where: { status: { not: "DRAFT" } },
      select: { id: true, title: true, startsAt: true },
      orderBy: { startsAt: "desc" },
    }),
    prisma.application.findMany({
      where: {
        status: { not: "UNVERIFIED" },
        ...(workshopId ? { workshopId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        workshop: {
          select: { id: true, title: true }
        }
      }
    }),
  ]);

  const emails = [...new Set(applications.map(a => a.email))];

  const pastAccepted = await prisma.application.findMany({
    where: {
      email: { in: emails },
      status: "ACCEPTED",
    },
    select: {
      email: true,
      workshopId: true,
      workshop: { select: { id: true, title: true, startsAt: true } },
    },
  });

  const historyByEmail: Record<string, { workshopId: string; title: string; startsAt: Date }[]> = {};
  for (const pa of pastAccepted) {
    if (!historyByEmail[pa.email]) historyByEmail[pa.email] = [];
    historyByEmail[pa.email].push({
      workshopId: pa.workshopId,
      title: pa.workshop.title,
      startsAt: pa.workshop.startsAt,
    });
  }

  const applicationsWithHistory = applications.map(app => ({
    ...app,
    pastEvents: (historyByEmail[app.email] || [])
      .filter(h => h.workshopId !== app.workshopId)
      .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()),
  }));

  return NextResponse.json({ workshops, applications: applicationsWithHistory });
}
