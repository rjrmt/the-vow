import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const response = NextResponse.next();
  response.headers.set("x-request-id", crypto.randomUUID());

  if (path.startsWith("/api/")) {
    logger.info("API request", {
      method: request.method,
      path,
    });
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
