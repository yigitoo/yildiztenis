import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS_LABEL, SKILL_LEVEL_LABEL } from "@/lib/constants";

function turkishSafe(text: string): string {
  return text
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ü/g, "u").replace(/Ü/g, "U");
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Yetkisiz islem." }, { status: 401 });
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

  const workshopTitle = workshopId
    ? applications[0]?.workshop.title ?? "Workshop"
    : undefined;

  const rows = applications.map((application) => ({
    workshop: application.workshop.title,
    ad: application.firstName,
    soyad: application.lastName,
    email: application.email,
    telefon: application.phone,
    okul: application.school,
    ogrenciNo: application.studentNo ?? "",
    bolum: application.department ?? "",
    sinif: application.classYear != null ? application.classYear.toString() : "",
    seviye: SKILL_LEVEL_LABEL[application.level],
    durum: APPLICATION_STATUS_LABEL[application.status],
    tarih: application.createdAt.toLocaleString("tr-TR")
  }));

  const dateStr = new Date().toLocaleDateString("tr-TR");
  const scopeLabel = scope === "accepted" ? "Asil Liste" : "Tum Basvurular";
  const filePrefix = workshopTitle
    ? turkishSafe(workshopTitle).toLowerCase().replace(/\s+/g, "-")
    : "yildiz-tenis";

  if (type === "pdf") {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(0, 116, 5);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    const pdfTitle = workshopTitle
      ? `${turkishSafe(workshopTitle)} — ${turkishSafe(scopeLabel)}`
      : `Yildiz Tenis — ${turkishSafe(scopeLabel)}`;
    doc.text(pdfTitle, 14, 12);
    doc.setFontSize(9);
    doc.text(`Olusturma: ${dateStr} | Toplam: ${rows.length} kayit`, 14, 20);

    doc.setTextColor(0, 0, 0);

    const headers = ["#", "Ad Soyad", "E-posta", "Telefon", "Okul", "Ogrenci No", "Seviye", "Durum"];
    const colWidths = [10, 40, 55, 32, 35, 22, 25, 25];
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
        doc.text(`${pdfTitle} — sayfa ${doc.getNumberOfPages()}`, 14, 7);
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
        turkishSafe(`${row.ad} ${row.soyad}`),
        row.email,
        row.telefon,
        turkishSafe(row.okul),
        row.ogrenciNo,
        turkishSafe(row.seviye),
        turkishSafe(row.durum),
      ];

      vals.forEach((val, i) => {
        const maxChars = Math.floor(colWidths[i] / 2);
        const truncated = val.length > maxChars ? val.slice(0, maxChars) + ".." : val;
        doc.text(truncated, x + 1, y);
        x += colWidths[i];
      });

      y += 7;
    });

    doc.setFontSize(7);
    doc.setTextColor(150, 170, 150);
    doc.text(`Yildiz Tenis CRM | ${dateStr}`, 14, doc.internal.pageSize.getHeight() - 8);

    const buffer = Buffer.from(doc.output("arraybuffer"));
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filePrefix}-${scope}-${dateStr}.pdf"`
      }
    });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Yıldız Tenis";
  const sheetName = scope === "accepted" ? "Asil Liste" : "Tüm Başvurular";
  const sheet = workbook.addWorksheet(sheetName);

  const headerLabels = [
    "Workshop", "Ad", "Soyad", "E-posta", "Telefon",
    "Okul / Üniversite", "Öğrenci No", "Bölüm", "Sınıf",
    "Seviye", "Durum", "Başvuru Tarihi"
  ];

  const headerRow = sheet.addRow(headerLabels);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF007405" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF005d04" } },
    };
  });
  headerRow.height = 28;

  rows.forEach((row, index) => {
    const dataRow = sheet.addRow([
      row.workshop,
      row.ad,
      row.soyad,
      row.email,
      row.telefon,
      row.okul,
      row.ogrenciNo,
      row.bolum,
      row.sinif,
      row.seviye,
      row.durum,
      row.tarih,
    ]);

    const bgColor = index % 2 === 0 ? "FFF9FCF9" : "FFFFFFFF";
    dataRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgColor },
      };
      cell.font = { size: 10 };
      cell.alignment = { vertical: "middle" };
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE0E0E0" } },
      };
    });

    const statusCell = dataRow.getCell(11);
    const statusColors: Record<string, string> = {
      "Beklemede": "FFFBBF24",
      "Asil Liste": "FF22C55E",
      "Yedek": "FF3B82F6",
      "Reddedildi": "FFEF4444",
    };
    const statusColor = statusColors[row.durum];
    if (statusColor) {
      statusCell.font = { size: 10, bold: true, color: { argb: statusColor } };
    }
  });

  sheet.columns = [
    { width: 25 },
    { width: 15 },
    { width: 15 },
    { width: 30 },
    { width: 16 },
    { width: 22 },
    { width: 14 },
    { width: 22 },
    { width: 8 },
    { width: 14 },
    { width: 14 },
    { width: 20 },
  ];

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: rows.length + 1, column: headerLabels.length },
  };

  const xlsxBuffer = await workbook.xlsx.writeBuffer();

  return new Response(new Uint8Array(xlsxBuffer as ArrayBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filePrefix}-${scope}-${dateStr}.xlsx"`
    }
  });
}
