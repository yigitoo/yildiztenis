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
    select: { title: true, topic: true, venue: true, imageUrl: true, bannerUrl: true, isRegistrationOpen: true },
  });

  const title = workshop?.title ?? "Workshop";
  const topic = workshop?.topic ?? "";
  const venue = workshop?.venue ?? "";
  const bannerSrc = workshop?.bannerUrl ?? workshop?.imageUrl;
  const isOpen = workshop?.isRegistrationOpen ?? true;

  const logoData = await readFile(join(process.cwd(), "public/images/yildiz-tenis-logo-round.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  let bannerBase64: string | null = null;
  if (bannerSrc) {
    try {
      const res = await fetch(bannerSrc);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") ?? "image/png";
        bannerBase64 = `data:${contentType};base64,${Buffer.from(buf).toString("base64")}`;
      }
    } catch {
      // banner fetch failed, skip
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 0,
          background: "linear-gradient(135deg, #003f16 0%, #0c1810 50%, #001a0a 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {bannerBase64 && (
          <img
            src={bannerBase64}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: 60, position: "relative" }}>
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
                color: isOpen ? "#6ee7b7" : "#fbbf24",
                textTransform: "uppercase",
                letterSpacing: "3px",
                marginBottom: 16,
              }}
            >
              {isOpen ? "Ön Başvuru Açık" : "Başvurular Kapalı"}
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
              {topic && <span className="text-white">{topic}</span>}
              {venue && <span className="text-white">📍 {venue}</span>}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
