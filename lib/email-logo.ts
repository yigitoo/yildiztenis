import { readFileSync } from "fs";
import { join } from "path";

let cached: string | null = null;

export function getEmailLogoDataUri(): string {
  if (cached) return cached;
  try {
    const buf = readFileSync(join(process.cwd(), "public/images/yildiz-tenis-logo-email.png"));
    cached = `data:image/png;base64,${buf.toString("base64")}`;
    return cached;
  } catch {
    return "";
  }
}
