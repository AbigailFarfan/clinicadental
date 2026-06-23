import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unauthorized } from "@/lib/auth-utils";
import { appointmentSchema } from "@/lib/validations/appointment";
import { Role } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha");
  const dentistaId = searchParams.get("dentistaId");
  const estado = searchParams.get("estado");

  const role = session.user.role as Role;
  const where: Record<string, unknown> = {};

  if (role === "DENTISTA") {
    where.dentistaId = session.user.id;
  } else if (dentistaId) {
    where.dentistaId = dentistaId;
  }

  if (fecha) {
    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    where.fecha = { gte: start, lt: end };
  }

  if (estado) {
    where.estado = estado;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      paciente: { select: { id: true, nombre: true, apellido: true, ci: true } },
      dentista: { select: { id: true, nombre: true, apellido: true } },
    },
    orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
  });

  return NextResponse.json(appointments);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();

  const body = await request.json();
  const parsed = appointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { fecha, horaInicio, horaFin, motivo, notas, pacienteId, dentistaId } = parsed.data;

  const fechaDate = new Date(fecha);
  const [startH, startM] = horaInicio.split(":").map(Number);
  const [endH, endM] = horaFin.split(":").map(Number);

  const horaInicioDate = new Date(fecha);
  horaInicioDate.setHours(startH, startM, 0, 0);

  const horaFinDate = new Date(fecha);
  horaFinDate.setHours(endH, endM, 0, 0);

  const appointment = await prisma.appointment.create({
    data: {
      fecha: fechaDate,
      horaInicio: horaInicioDate,
      horaFin: horaFinDate,
      motivo,
      notas: notas || null,
      pacienteId,
      dentistaId,
    },
    include: {
      paciente: { select: { nombre: true, apellido: true } },
      dentista: { select: { nombre: true, apellido: true } },
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}
