import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unauthorized } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      paciente: true,
      dentista: { select: { id: true, nombre: true, apellido: true } },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  }

  return NextResponse.json(appointment);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};

  if (body.estado) updateData.estado = body.estado;
  if (body.motivo) updateData.motivo = body.motivo;
  if (body.notas !== undefined) updateData.notas = body.notas;

  if (body.fecha) {
    updateData.fecha = new Date(body.fecha);
  }
  if (body.horaInicio && body.fecha) {
    const [h, m] = body.horaInicio.split(":").map(Number);
    const d = new Date(body.fecha);
    d.setHours(h, m, 0, 0);
    updateData.horaInicio = d;
  }
  if (body.horaFin && body.fecha) {
    const [h, m] = body.horaFin.split(":").map(Number);
    const d = new Date(body.fecha);
    d.setHours(h, m, 0, 0);
    updateData.horaFin = d;
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
    include: {
      paciente: { select: { nombre: true, apellido: true } },
      dentista: { select: { nombre: true, apellido: true } },
    },
  });

  return NextResponse.json(appointment);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();

  const { id } = await params;
  await prisma.appointment.update({
    where: { id },
    data: { estado: "CANCELADA" },
  });

  return NextResponse.json({ message: "Cita cancelada" });
}
