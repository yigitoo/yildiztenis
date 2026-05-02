import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BOT_UA_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scrape/i, /curl/i, /wget/i,
  /python-requests/i, /axios/i, /node-fetch/i, /go-http-client/i,
  /headless/i, /phantom/i, /selenium/i, /puppeteer/i, /playwright/i,
];

const ALLOWED_BOTS = [/googlebot/i, /bingbot/i, /twitterbot/i, /facebookexternalhit/i, /linkedinbot/i];

function isBlockedBot(ua: string): boolean {
  if (ALLOWED_BOTS.some((p) => p.test(ua))) return false;
  if (!ua || ua.length < 10) return true;
  return BOT_UA_PATTERNS.some((p) => p.test(ua));
}

export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";

  if (request.method === "POST" && isBlockedBot(ua)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/applications/:path*", "/api/contact/:path*"],
};
