import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { status: { not: "UNVERIFIED" } },
    orderBy: { createdAt: "desc" },
    include: {
      workshop: {
        select: { id: true, title: true }
      }
    }
  });

  return NextResponse.json(applications);
}
