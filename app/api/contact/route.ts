import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10)
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "Çok fazla istek. Lütfen biraz bekleyin." }, { status: 429 });
  }

  const body = await request.json();

  if (body.website) {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  const payload = contactSchema.safeParse(body);

  if (!payload.success) {
    return NextResponse.json({ message: "Mesaj bilgileri eksik veya hatalı." }, { status: 400 });
  }

  const message = await prisma.contactMessage.create({
    data: payload.data
  });

  return NextResponse.json({ id: message.id }, { status: 201 });
}
