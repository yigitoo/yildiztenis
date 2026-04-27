"use server";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import type { ApplicationStatus } from "@/generated/prisma/client";
import { sendApplicationAcceptedEmail } from "@/lib/email";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const workshopSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "En az 3 karakter"),
  topic: z.string().min(3, "En az 3 karakter"),
  description: z.string().min(12, "En az 12 karakter"),
  venue: z.string().min(3, "En az 3 karakter"),
  startsAt: z.string().min(1, "Zorunlu alan"),
  endsAt: z.string().optional(),
  applicationDeadline: z.string().optional(),
  capacity: z.coerce.number().int().min(1, "En az 1"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isExternalOpen: z.coerce.boolean().default(true)
});

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Yetkisiz işlem.");
  }
  return session.user.id;
}

export async function saveWorkshop(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await assertAdmin();
    const result = workshopSchema.safeParse({
      id: formData.get("id")?.toString() || undefined,
      title: formData.get("title"),
      topic: formData.get("topic"),
      description: formData.get("description"),
      venue: formData.get("venue"),
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt")?.toString() || undefined,
      applicationDeadline: formData.get("applicationDeadline")?.toString() || undefined,
      capacity: formData.get("capacity"),
      status: formData.get("status"),
      isExternalOpen: formData.get("isExternalOpen") === "on"
    });

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "_";
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, error: "Form hataları var.", fieldErrors };
    }

    const parsed = result.data;
    const data = {
      title: parsed.title,
      topic: parsed.topic,
      description: parsed.description,
      venue: parsed.venue,
      startsAt: new Date(parsed.startsAt),
      endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
      applicationDeadline: parsed.applicationDeadline ? new Date(parsed.applicationDeadline) : null,
      capacity: parsed.capacity,
      status: parsed.status,
      isExternalOpen: parsed.isExternalOpen
    };

    const workshop = parsed.id
      ? await prisma.workshop.update({
          where: { id: parsed.id },
          data
        })
      : await prisma.workshop.create({
          data: {
            ...data,
            slug: slugify(`${parsed.title}-${Date.now()}`),
            formFields: {
              create: [
                { label: "Ad", name: "firstName", type: "TEXT", sortOrder: 1 },
                { label: "Soyad", name: "lastName", type: "TEXT", sortOrder: 2 },
                { label: "E-posta", name: "email", type: "EMAIL", sortOrder: 3 },
                { label: "Telefon", name: "phone", type: "PHONE", sortOrder: 4 },
                { label: "Okul / Üniversite", name: "school", type: "TEXT", sortOrder: 5 },
                { label: "Seviye", name: "level", type: "SELECT", options: ["Başlangıç", "Orta", "İleri"], sortOrder: 6 }
              ]
            }
          }
        });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: parsed.id ? "workshop.update" : "workshop.create",
        entity: "Workshop",
        entityId: workshop.id
      }
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, data: { id: workshop.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "Yetkisiz işlem.") {
      return { success: false, error: "Yetkisiz işlem." };
    }
    return { success: false, error: "Workshop kaydedilirken hata oluştu." };
  }
}

export async function updateApplicationStatus(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const actorId = await assertAdmin();
    const applicationId = z.string().min(1).parse(formData.get("applicationId"));
    const status = z.enum(["PENDING", "ACCEPTED", "REJECTED", "WAITLISTED"]).parse(formData.get("status"));

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        acceptedAt: status === "ACCEPTED" ? new Date() : null
      },
      include: { workshop: true }
    });

    if (status === "ACCEPTED" && !application.acceptanceEmailSentAt) {
      const mailResult = await sendApplicationAcceptedEmail({
        to: application.email,
        firstName: application.firstName,
        workshopTitle: application.workshop.title,
        workshopDate: format(application.workshop.startsAt, "d MMMM yyyy, HH:mm", { locale: tr })
      });

      await prisma.emailLog.create({
        data: {
          type: "APPLICATION_ACCEPTED",
          recipient: application.email,
          subject: "Workshop'a kabul edildiniz",
          providerId: mailResult.id,
          workshopId: application.workshopId,
          applicationId: application.id
        }
      });

      await prisma.application.update({
        where: { id: application.id },
        data: { acceptanceEmailSentAt: new Date() }
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId,
        action: "application.status.update",
        entity: "Application",
        entityId: application.id,
        metadata: { status }
      }
    });

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Başvuru durumu güncellenirken hata oluştu." };
  }
}

export async function markMessageAsRead(messageId: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead: true }
    });
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Mesaj güncellenirken hata oluştu." };
  }
}

export async function bulkUpdateApplicationStatus(
  applicationIds: string[],
  status: ApplicationStatus
): Promise<ActionResult> {
  try {
    const actorId = await assertAdmin();
    await prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: {
        status,
        acceptedAt: status === "ACCEPTED" ? new Date() : null
      }
    });

    for (const id of applicationIds) {
      await prisma.auditLog.create({
        data: {
          actorId,
          action: "application.status.bulk_update",
          entity: "Application",
          entityId: id,
          metadata: { status }
        }
      });
    }

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Toplu güncelleme sırasında hata oluştu." };
  }
}
