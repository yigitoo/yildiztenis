import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hash, compare } from "bcryptjs";

import { Prisma } from "@/generated/prisma/client";
import { sendApplicationReceivedEmail, sendApplicationVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const applicationSchema = z.object({
  workshopSlug: z.string().min(1),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  school: z.string().min(2),
  studentNo: z.string().optional().or(z.literal("")),
  department: z.string().min(2).optional().or(z.literal("")),
  classYear: z.coerce.number().int().min(0).max(8).optional(),
  isExternal: z.boolean().default(false),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  notes: z.string().optional(),
  answers: z.record(z.string(), z.unknown()).optional()
});

const verificationSchema = z.object({
  applicationId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/)
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`app:post:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "Çok fazla istek. Lütfen biraz bekleyin." }, { status: 429 });
  }

  const payload = applicationSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: "Lütfen tüm alanları doğru şekilde doldurun." },
      { status: 400 }
    );
  }

  const workshop = await prisma.workshop.findUnique({
    where: { slug: payload.data.workshopSlug }
  });

  if (!workshop) {
    return NextResponse.json({ message: "Etkinlik bulunamadı." }, { status: 404 });
  }

  if (!workshop.isRegistrationOpen) {
    return NextResponse.json({ message: "Bu etkinlik için başvurular kapalıdır." }, { status: 403 });
  }

  const isExternal = payload.data.isExternal;

  try {
    if (workshop.isVerificationRequired) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const application = await prisma.application.create({
        data: {
          workshopId: workshop.id,
          firstName: payload.data.firstName,
          lastName: payload.data.lastName,
          email: payload.data.email,
          phone: payload.data.phone,
          school: payload.data.school,
          studentNo: payload.data.studentNo || null,
          department: payload.data.department || null,
          classYear: payload.data.classYear ?? null,
          isExternal,
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
    }

    const application = await prisma.application.create({
      data: {
        workshopId: workshop.id,
        firstName: payload.data.firstName,
        lastName: payload.data.lastName,
        email: payload.data.email,
        phone: payload.data.phone,
        school: payload.data.school,
        studentNo: payload.data.studentNo || null,
        department: payload.data.department || null,
        classYear: payload.data.classYear ?? null,
        isExternal,
        level: payload.data.level,
        notes: payload.data.notes,
        answers: payload.data.answers as Prisma.InputJsonValue | undefined,
        status: "PENDING",
        verifiedAt: new Date(),
        applicationEmailSentAt: new Date()
      }
    });

    const mailResult = await sendApplicationReceivedEmail({
      to: application.email,
      firstName: application.firstName,
      workshopTitle: workshop.title,
      workshopDate: format(workshop.startsAt, "d MMMM yyyy, HH:mm", { locale: tr })
    });

    await prisma.emailLog.create({
      data: {
        type: "APPLICATION_RECEIVED",
        recipient: application.email,
        subject: "Ön başvurunuz alındı",
        providerId: mailResult.id,
        workshopId: workshop.id,
        applicationId: application.id
      }
    });

    return NextResponse.json(
      {
        id: application.id,
        requiresVerification: false,
        message: "Başvurun başarıyla alındı."
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
  const ip = getClientIp(request);
  const rl = rateLimit(`app:patch:${ip}`, 15, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "Çok fazla istek. Lütfen biraz bekleyin." }, { status: 429 });
  }

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
