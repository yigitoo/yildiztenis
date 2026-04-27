import type { ApplicationStatus, WorkshopStatus, SkillLevel } from "@/generated/prisma/client";

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  UNVERIFIED: "Doğrulanmadı",
  PENDING: "Beklemede",
  ACCEPTED: "Asil Liste",
  REJECTED: "Reddedildi",
  WAITLISTED: "Yedek",
};

export const APPLICATION_STATUS_VARIANT: Record<ApplicationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  UNVERIFIED: "outline",
  PENDING: "secondary",
  ACCEPTED: "default",
  REJECTED: "destructive",
  WAITLISTED: "outline",
};

export const WORKSHOP_STATUS_LABEL: Record<WorkshopStatus, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşiv",
};

export const WORKSHOP_STATUS_VARIANT: Record<WorkshopStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  BEGINNER: "Başlangıç",
  INTERMEDIATE: "Orta",
  ADVANCED: "İleri",
};
