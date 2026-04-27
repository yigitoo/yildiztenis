import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10)
});

export async function POST(request: Request) {
  const payload = contactSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "Mesaj bilgileri eksik veya hatalı." }, { status: 400 });
  }

  const message = await prisma.contactMessage.create({
    data: payload.data
  });

  return NextResponse.json({ id: message.id }, { status: 201 });
}
