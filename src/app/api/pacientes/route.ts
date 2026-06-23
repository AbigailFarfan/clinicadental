import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unauthorized } from "@/lib/auth-utils";
import { patientSchema } from "@/lib/validations/patient";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const where = {
    activo: true,
    ...(search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" as const } },
            { apellido: { contains: search, mode: "insensitive" as const } },
            { ci: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  return NextResponse.json({ patients, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();

  const role = session.user.role;
  if (role === "DENTISTA") {
    return NextResponse.json({ error: "No tiene permisos" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = patientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.patient.findUnique({ where: { ci: parsed.data.ci } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe un paciente con ese CI" }, { status: 400 });
  }

  const patient = await prisma.patient.create({
    data: {
      ...parsed.data,
      fechaNacimiento: parsed.data.fechaNacimiento
        ? new Date(parsed.data.fechaNacimiento)
        : null,
    },
  });

  return NextResponse.json(patient, { status: 201 });
}
