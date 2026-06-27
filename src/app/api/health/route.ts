import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasAuthUrl: !!process.env.AUTH_URL,
        hasTrustHost: !!process.env.AUTH_TRUST_HOST,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", database: "disconnected", error: message },
      { status: 500 }
    );
  }
}
