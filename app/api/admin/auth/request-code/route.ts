import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { sendAdminLoginCodeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const requestCodeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const payload = requestCodeSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "Giriş bilgileri hatalı." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.data.email }
  });

  if (!user?.passwordHash || !user.twoFactorEnabled) {
    return NextResponse.json({ message: "Giriş bilgileri hatalı." }, { status: 401 });
  }

  const passwordMatches = await compare(payload.data.password, user.passwordHash);
  if (!passwordMatches) {
    return NextResponse.json({ message: "Giriş bilgileri hatalı." }, { status: 401 });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailOtpHash: await hash(code, 10),
      emailOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  });

  await sendAdminLoginCodeEmail({
    to: user.email,
    code
  });

  return NextResponse.json({ ok: true });
}
