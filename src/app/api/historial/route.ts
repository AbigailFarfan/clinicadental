import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/auth-utils";
import { clinicalRecordSchema } from "@/lib/validations/clinical-record";
import { Role } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();

  const role = session.user.role as Role;
  if (role === "RECEPCIONISTA") return forbidden();

  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get("pacienteId");
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};

  if (pacienteId) {
    where.pacienteId = pacienteId;
  }

  if (role === "DENTISTA") {
    where.dentistaId = session.user.id;
  }

  if (search) {
    where.OR = [
      { diagnostico: { contains: search, mode: "insensitive" } },
      { tratamiento: { contains: search, mode: "insensitive" } },
    ];
  }

  const records = await prisma.clinicalRecord.findMany({
    where,
    include: {
      paciente: { select: { id: true, nombre: true, apellido: true, ci: true } },
      dentista: { select: { id: true, nombre: true, apellido: true } },
    },
    orderBy: { fecha: "desc" },
    take: 50,
  });

  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();

  const role = session.user.role as Role;
  if (role === "RECEPCIONISTA") return forbidden();

  const body = await request.json();
  const parsed = clinicalRecordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const record = await prisma.clinicalRecord.create({
    data: {
      diagnostico: parsed.data.diagnostico,
      tratamiento: parsed.data.tratamiento,
      observaciones: parsed.data.observaciones || null,
      piezaDental: parsed.data.piezaDental || null,
      pacienteId: parsed.data.pacienteId,
      dentistaId: session.user.id,
    },
    include: {
      paciente: { select: { nombre: true, apellido: true } },
      dentista: { select: { nombre: true, apellido: true } },
    },
  });

  return NextResponse.json(record, { status: 201 });
}
