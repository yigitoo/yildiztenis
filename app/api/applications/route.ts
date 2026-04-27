import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hash, compare } from "bcryptjs";

import { Prisma } from "@/generated/prisma/client";
import { isAllowedApplicationEmail } from "@/lib/email-domains";
import { sendApplicationReceivedEmail, sendApplicationVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const applicationSchema = z.object({
  workshopSlug: z.string().min(1),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().refine(isAllowedApplicationEmail),
  phone: z.string().min(7),
  school: z.string().min(2),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  notes: z.string().optional(),
  answers: z.record(z.string(), z.unknown()).optional()
});

const verificationSchema = z.object({
  applicationId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/)
});

export async function POST(request: Request) {
  const payload = applicationSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: "Başvuru için @std.yildiz.edu.tr veya @yildiz.edu.tr uzantılı e-posta kullanılmalıdır." },
      { status: 400 }
    );
  }

  const workshop = await prisma.workshop.findUnique({
    where: { slug: payload.data.workshopSlug }
  });

  if (!workshop) {
    return NextResponse.json({ message: "Etkinlik bulunamadı." }, { status: 404 });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const application = await prisma.application.create({
      data: {
        workshopId: workshop.id,
        firstName: payload.data.firstName,
        lastName: payload.data.lastName,
        email: payload.data.email,
        phone: payload.data.phone,
        school: payload.data.school,
        level: payload.data.level,
        notes: payload.data.notes,
        answers: payload.data.answers as Prisma.InputJsonValue | undefined,
        status: "UNVERIFIED",
        verificationCodeHash: await hash(code, 10),
        verificationExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    const mailResult = await sendApplicationVerificationEmail({
      to: application.email,
      firstName: application.firstName,
      workshopTitle: workshop.title,
      workshopDate: format(workshop.startsAt, "d MMMM yyyy, HH:mm", { locale: tr }),
      code
    });

    await prisma.emailLog.create({
      data: {
        type: "APPLICATION_VERIFICATION",
        recipient: application.email,
        subject: "Başvuru doğrulama kodu",
        providerId: mailResult.id,
        workshopId: workshop.id,
        applicationId: application.id
      }
    });

    return NextResponse.json(
      {
        id: application.id,
        requiresVerification: true,
        message: "Doğrulama kodu e-posta adresine gönderildi."
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ message: "Bu etkinlik için aynı e-posta ile başvuru yapılmış." }, { status: 409 });
    }

    throw error;
  }
}

export async function PATCH(request: Request) {
  const payload = verificationSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "Doğrulama kodu hatalı." }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id: payload.data.applicationId },
    include: { workshop: true }
  });

  if (!application?.verificationCodeHash || !application.verificationExpiresAt) {
    return NextResponse.json({ message: "Doğrulanacak başvuru bulunamadı." }, { status: 404 });
  }

  if (application.verificationExpiresAt.getTime() < Date.now()) {
    return NextResponse.json({ message: "Doğrulama kodunun süresi doldu." }, { status: 410 });
  }

  const codeMatches = await compare(payload.data.code, application.verificationCodeHash);
  if (!codeMatches) {
    return NextResponse.json({ message: "Doğrulama kodu hatalı." }, { status: 400 });
  }

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: {
      status: "PENDING",
      verifiedAt: new Date(),
      verificationCodeHash: null,
      verificationExpiresAt: null,
      applicationEmailSentAt: new Date()
    }
  });

  const mailResult = await sendApplicationReceivedEmail({
    to: updated.email,
    firstName: updated.firstName,
    workshopTitle: application.workshop.title,
    workshopDate: format(application.workshop.startsAt, "d MMMM yyyy, HH:mm", { locale: tr })
  });

  await prisma.emailLog.create({
    data: {
      type: "APPLICATION_RECEIVED",
      recipient: updated.email,
      subject: "Ön başvurunuz alındı",
      providerId: mailResult.id,
      workshopId: application.workshopId,
      applicationId: application.id
    }
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
