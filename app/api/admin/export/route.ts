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
    "Öğrenci No": application.studentNo ?? "",
    Bölüm: application.department ?? "",
    Sınıf: application.classYear ?? "",
    "Harici Başvuru": application.isExternal ? "Evet" : "Hayır",
    Seviye: SKILL_LEVEL_LABEL[application.level],
    Durum: APPLICATION_STATUS_LABEL[application.status],
    "Başvuru Tarihi": application.createdAt.toLocaleString("tr-TR")
  }));

  const dateStr = new Date().toLocaleDateString("tr-TR");
  const titleText = scope === "accepted" ? "Yildiz Tenis — Asil Liste" : "Yildiz Tenis — Basvuru Listesi";

  if (type === "pdf") {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(0, 116, 5);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(titleText, 14, 12);
    doc.setFontSize(9);
    doc.text(`Olusturma: ${dateStr} · Toplam: ${rows.length} kayit`, 14, 20);

    doc.setTextColor(0, 0, 0);

    const headers = ["#", "Ad Soyad", "E-posta", "Telefon", "Okul", "Seviye", "Durum", "Workshop"];
    const colWidths = [10, 40, 55, 32, 40, 25, 25, 50];
    let y = 36;
    const startX = 10;

    doc.setFillColor(240, 248, 240);
    doc.rect(startX, y - 5, pageWidth - 20, 8, "F");
    doc.setFontSize(7);
    doc.setTextColor(90, 110, 94);
    let x = startX;
    headers.forEach((h, i) => {
      doc.text(h, x + 1, y);
      x += colWidths[i];
    });

    doc.setTextColor(26, 46, 30);
    doc.setFontSize(8);
    y += 8;

    rows.forEach((row, index) => {
      if (y > 190) {
        doc.addPage();
        doc.setFillColor(245, 250, 245);
        doc.rect(0, 0, pageWidth, 10, "F");
        doc.setFontSize(7);
        doc.setTextColor(120, 140, 120);
        doc.text(`${titleText} — sayfa ${doc.getNumberOfPages()}`, 14, 7);
        doc.setTextColor(26, 46, 30);
        doc.setFontSize(8);
        y = 18;
      }

      if (index % 2 === 0) {
        doc.setFillColor(250, 253, 250);
        doc.rect(startX, y - 4, pageWidth - 20, 7, "F");
      }

      x = startX;
      const vals = [
        (index + 1).toString(),
        `${row.Ad} ${row.Soyad}`,
        row["E-posta"],
        row.Telefon,
        row["Okul / Üniversite"],
        row.Seviye,
        row.Durum,
        row.Workshop,
      ];

      vals.forEach((val, i) => {
        const truncated = val.length > (colWidths[i] / 2) ? val.slice(0, Math.floor(colWidths[i] / 2)) + ".." : val;
        doc.text(truncated, x + 1, y);
        x += colWidths[i];
      });

      y += 7;
    });

    doc.setFontSize(7);
    doc.setTextColor(150, 170, 150);
    doc.text(`Yildiz Tenis CRM · ${dateStr}`, 14, doc.internal.pageSize.getHeight() - 8);

    const buffer = Buffer.from(doc.output("arraybuffer"));
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="yildiz-tenis-${scope}-${dateStr}.pdf"`
      }
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 25 },
    { wch: 12 },
    { wch: 14 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, scope === "accepted" ? "Asil Liste" : "Tüm Başvurular");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="yildiz-tenis-${scope}-${dateStr}.xlsx"`
    }
  });
}
