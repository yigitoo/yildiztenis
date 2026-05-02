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
  isExternalOpen: z.coerce.boolean().default(true),
  isRegistrationOpen: z.coerce.boolean().default(true),
  isVerificationRequired: z.coerce.boolean().default(true),
  whatsappLink: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal(""))
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
      isExternalOpen: formData.get("isExternalOpen") === "on",
      isRegistrationOpen: formData.get("isRegistrationOpen") === "on",
      isVerificationRequired: formData.get("isVerificationRequired") === "on",
      whatsappLink: formData.get("whatsappLink")?.toString() || "",
      imageUrl: formData.get("imageUrl")?.toString() || "",
      bannerUrl: formData.get("bannerUrl")?.toString() || ""
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
      isExternalOpen: parsed.isExternalOpen,
      isRegistrationOpen: parsed.isRegistrationOpen,
      isVerificationRequired: parsed.isVerificationRequired,
      whatsappLink: parsed.whatsappLink || null,
      imageUrl: parsed.imageUrl || null,
      bannerUrl: parsed.bannerUrl || null
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

    if (status === "ACCEPTED") {
      const workshop = await prisma.workshop.findUniqueOrThrow({
        where: { id: (await prisma.application.findUniqueOrThrow({ where: { id: applicationId }, select: { workshopId: true } })).workshopId },
        include: { applications: { where: { status: "ACCEPTED" }, select: { id: true } } }
      });
      if (workshop.applications.length >= workshop.capacity) {
        return { success: false, error: `Kontenjan dolu (${workshop.capacity}/${workshop.capacity}). Yeni kabul yapılamaz.` };
      }
    }

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
        workshopDate: format(application.workshop.startsAt, "d MMMM yyyy, HH:mm", { locale: tr }),
        whatsappLink: application.workshop.whatsappLink
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

export async function updateSiteContent(key: string, value: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, label: key, value, type: "TEXT" }
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "İçerik güncellenirken hata oluştu." };
  }
}

export async function saveGalleryImage(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await assertAdmin();
    const id = formData.get("id")?.toString() || undefined;
    const title = z.string().min(1).parse(formData.get("title"));
    const alt = formData.get("alt")?.toString() ?? title;
    const imageUrl = z.string().url().parse(formData.get("imageUrl"));

    const image = id
      ? await prisma.galleryImage.update({ where: { id }, data: { title, alt, imageUrl } })
      : await prisma.galleryImage.create({
          data: { title, alt, imageUrl, sortOrder: 999, isPublished: true }
        });

    await prisma.auditLog.create({
      data: { actorId, action: id ? "gallery.update" : "gallery.create", entity: "GalleryImage", entityId: image.id }
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: { id: image.id } };
  } catch {
    return { success: false, error: "Görsel kaydedilirken hata oluştu." };
  }
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  try {
    const actorId = await assertAdmin();
    await prisma.galleryImage.delete({ where: { id } });
    await prisma.auditLog.create({
      data: { actorId, action: "gallery.delete", entity: "GalleryImage", entityId: id }
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Görsel silinirken hata oluştu." };
  }
}

export async function toggleGalleryImagePublished(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    const img = await prisma.galleryImage.findUniqueOrThrow({ where: { id } });
    await prisma.galleryImage.update({ where: { id }, data: { isPublished: !img.isPublished } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Görsel durumu güncellenirken hata oluştu." };
  }
}

export async function saveTeamMember(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await assertAdmin();
    const id = formData.get("id")?.toString() || undefined;
    const name = z.string().min(1).parse(formData.get("name"));
    const role = z.string().min(1).parse(formData.get("role"));
    const bio = formData.get("bio")?.toString() ?? "";
    const imageUrl = formData.get("imageUrl")?.toString() || null;

    const member = id
      ? await prisma.teamMember.update({ where: { id }, data: { name, role, bio, imageUrl } })
      : await prisma.teamMember.create({
          data: { name, role, bio, imageUrl, sortOrder: 999, isPublished: true }
        });

    await prisma.auditLog.create({
      data: { actorId, action: id ? "team.update" : "team.create", entity: "TeamMember", entityId: member.id }
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: { id: member.id } };
  } catch {
    return { success: false, error: "Takım üyesi kaydedilirken hata oluştu." };
  }
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  try {
    const actorId = await assertAdmin();
    await prisma.teamMember.delete({ where: { id } });
    await prisma.auditLog.create({
      data: { actorId, action: "team.delete", entity: "TeamMember", entityId: id }
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Takım üyesi silinirken hata oluştu." };
  }
}

export async function toggleTeamMemberPublished(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    const member = await prisma.teamMember.findUniqueOrThrow({ where: { id } });
    await prisma.teamMember.update({ where: { id }, data: { isPublished: !member.isPublished } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Üye durumu güncellenirken hata oluştu." };
  }
}

export async function deleteWorkshop(workshopId: string): Promise<ActionResult> {
  try {
    const actorId = await assertAdmin();
    await prisma.workshop.delete({ where: { id: workshopId } });
    await prisma.auditLog.create({
      data: { actorId, action: "workshop.delete", entity: "Workshop", entityId: workshopId }
    });
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Workshop silinirken hata oluştu." };
  }
}

export async function duplicateWorkshop(workshopId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await assertAdmin();
    const source = await prisma.workshop.findUniqueOrThrow({
      where: { id: workshopId },
      include: { formFields: true }
    });

    const workshop = await prisma.workshop.create({
      data: {
        title: `${source.title} (Kopya)`,
        slug: slugify(`${source.title}-kopya-${Date.now()}`),
        description: source.description,
        topic: source.topic,
        venue: source.venue,
        startsAt: source.startsAt,
        endsAt: source.endsAt,
        applicationDeadline: source.applicationDeadline,
        capacity: source.capacity,
        status: "DRAFT",
        isExternalOpen: source.isExternalOpen,
        isRegistrationOpen: source.isRegistrationOpen,
        isVerificationRequired: source.isVerificationRequired,
        bannerUrl: source.bannerUrl,
        whatsappLink: source.whatsappLink,
        formFields: {
          create: source.formFields.map(f => ({
            label: f.label,
            name: f.name,
            type: f.type,
            required: f.required,
            options: f.options ?? undefined,
            placeholder: f.placeholder,
            sortOrder: f.sortOrder
          }))
        }
      }
    });

    await prisma.auditLog.create({
      data: { actorId, action: "workshop.duplicate", entity: "Workshop", entityId: workshop.id, metadata: { sourceId: workshopId } }
    });

    revalidatePath("/admin");
    return { success: true, data: { id: workshop.id } };
  } catch {
    return { success: false, error: "Workshop kopyalanırken hata oluştu." };
  }
}
