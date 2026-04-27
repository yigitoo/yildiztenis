import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { prisma } from "@/lib/prisma";

export const alt = "Workshop — Yıldız Tenis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ "workshop-slug": string }> }) {
  const { "workshop-slug": slug } = await params;
  const workshop = await prisma.workshop.findUnique({
    where: { slug },
    select: { title: true, topic: true, venue: true },
  });

  const title = workshop?.title ?? "Workshop";
  const topic = workshop?.topic ?? "";
  const venue = workshop?.venue ?? "";

  const logoData = await readFile(join(process.cwd(), "public/images/yildiz-tenis-logo-round.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 60,
          background: "linear-gradient(135deg, #003f16 0%, #0c1810 50%, #001a0a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img
            src={logoBase64}
            width={64}
            height={64}
            style={{ borderRadius: "50%" }}
          />
          <span style={{ fontSize: 24, color: "#dff4df", fontWeight: 600 }}>
            Yıldız Tenis
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#6ee7b7",
              textTransform: "uppercase",
              letterSpacing: "3px",
              marginBottom: 16,
            }}
          >
            Ön Başvuru Açık
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 24,
              fontSize: 20,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {topic && <span>{topic}</span>}
            {venue && <span>📍 {venue}</span>}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
