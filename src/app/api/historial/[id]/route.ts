import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/auth-utils";
import { Role } from "@/generated/prisma/enums";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();
  if ((session.user.role as Role) === "RECEPCIONISTA") return forbidden();

  const { id } = await params;
  const record = await prisma.clinicalRecord.findUnique({
    where: { id },
    include: {
      paciente: true,
      dentista: { select: { nombre: true, apellido: true } },
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();
  if ((session.user.role as Role) === "RECEPCIONISTA") return forbidden();

  const { id } = await params;
  const body = await request.json();

  const record = await prisma.clinicalRecord.update({
    where: { id },
    data: {
      diagnostico: body.diagnostico,
      tratamiento: body.tratamiento,
      observaciones: body.observaciones || null,
      piezaDental: body.piezaDental || null,
    },
  });

  return NextResponse.json(record);
}
