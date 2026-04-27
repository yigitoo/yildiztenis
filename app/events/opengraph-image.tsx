import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Etkinlikler — Yıldız Tenis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #003f16 0%, #0c1810 50%, #001a0a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <img
          src={logoBase64}
          width={120}
          height={120}
          style={{ borderRadius: "50%", marginBottom: 24 }}
        />
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#dff4df",
            textTransform: "uppercase",
            letterSpacing: "4px",
            marginBottom: 12,
          }}
        >
          Etkinlikler
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-1px",
          }}
        >
          Workshop & Buluşmalar
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            marginTop: 20,
          }}
        >
          yildiztenis.com/events
        </div>
      </div>
    ),
    { ...size }
  );
}
