import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/auth-utils";
import { Role } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();
  if ((session.user.role as Role) === "RECEPCIONISTA") return forbidden();

  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get("pacienteId");

  if (!pacienteId) {
    return NextResponse.json({ error: "pacienteId es requerido" }, { status: 400 });
  }

  const records = await prisma.toothRecord.findMany({
    where: { pacienteId },
    orderBy: { numeroPieza: "asc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();
  if ((session.user.role as Role) === "RECEPCIONISTA") return forbidden();

  const body = await request.json();
  const { pacienteId, numeroPieza, estado, notas } = body;

  if (!pacienteId || !numeroPieza || !estado) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const record = await prisma.toothRecord.upsert({
    where: {
      pacienteId_numeroPieza: { pacienteId, numeroPieza },
    },
    update: { estado, notas: notas || null },
    create: { pacienteId, numeroPieza, estado, notas: notas || null },
  });

  return NextResponse.json(record);
}
