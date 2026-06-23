import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { NextResponse } from "next/server";

export async function getSession() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("No autorizado");
  }
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    throw new Error("No tiene permisos para esta acción");
  }
  return session;
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json(
    { error: "No tiene permisos para esta acción" },
    { status: 403 }
  );
}
