import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unauthorized } from "@/lib/auth-utils";
import { patientSchema } from "@/lib/validations/patient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();

  const { id } = await params;
  const patient = await prisma.patient.findUnique({ where: { id } });

  if (!patient || !patient.activo) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  return NextResponse.json(patient);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const parsed = patientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.patient.findFirst({
    where: { ci: parsed.data.ci, id: { not: id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya existe otro paciente con ese CI" }, { status: 400 });
  }

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...parsed.data,
      fechaNacimiento: parsed.data.fechaNacimiento
        ? new Date(parsed.data.fechaNacimiento)
        : null,
    },
  });

  return NextResponse.json(patient);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();

  if (session.user.role === "DENTISTA") {
    return NextResponse.json({ error: "No tiene permisos" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.patient.update({ where: { id }, data: { activo: false } });

  return NextResponse.json({ message: "Paciente eliminado" });
}
