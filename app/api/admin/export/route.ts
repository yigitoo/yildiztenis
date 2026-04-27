import { jsPDF } from "jspdf";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS_LABEL, SKILL_LEVEL_LABEL } from "@/lib/constants";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") === "pdf" ? "pdf" : "xlsx";
  const scope = url.searchParams.get("scope") === "accepted" ? "accepted" : "all";
  const workshopId = url.searchParams.get("workshopId") ?? undefined;

  const applications = await prisma.application.findMany({
    where: {
      ...(workshopId ? { workshopId } : {}),
      ...(scope === "accepted" ? { status: "ACCEPTED" as const } : { status: { not: "UNVERIFIED" as const } })
    },
    orderBy: [{ workshop: { startsAt: "asc" } }, { createdAt: "asc" }],
    include: { workshop: true }
  });

  const rows = applications.map((application) => ({
    Workshop: application.workshop.title,
    Ad: application.firstName,
    Soyad: application.lastName,
    "E-posta": application.email,
    Telefon: application.phone,
    "Okul / Üniversite": application.school,
    Seviye: SKILL_LEVEL_LABEL[application.level],
    Durum: APPLICATION_STATUS_LABEL[application.status],
    "Başvuru Tarihi": application.createdAt.toLocaleString("tr-TR")
  }));

  if (type === "pdf") {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text(scope === "accepted" ? "Yildiz Tenis Asil Liste" : "Yildiz Tenis Basvuru Listesi", 14, 18);
    doc.setFontSize(9);

    let y = 30;
    rows.forEach((row, index) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        `${index + 1}. ${row.Ad} ${row.Soyad} | ${row["E-posta"]} | ${row.Telefon} | ${row.Workshop} | ${row.Durum}`,
        14,
        y
      );
      y += 8;
    });

    const buffer = Buffer.from(doc.output("arraybuffer"));

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="yildiz-tenis-${scope}.pdf"`
      }
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Başvurular");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="yildiz-tenis-${scope}.xlsx"`
    }
  });
}
