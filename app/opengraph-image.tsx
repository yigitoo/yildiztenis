import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Yıldız Tenis — YTÜ Tenis Topluluğu";
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
          width={160}
          height={160}
          style={{ borderRadius: "50%", marginBottom: 32 }}
        />
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-1px",
          }}
        >
          Yıldız Tenis
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#dff4df",
            marginTop: 16,
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          YTÜ Tenis Topluluğu — Workshop & Etkinlikler
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span>yildiztenis.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
