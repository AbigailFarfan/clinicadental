import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/enums";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();
  if ((session.user.role as Role) !== "ADMIN") return forbidden();

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {
    nombre: body.nombre,
    apellido: body.apellido,
    email: body.email,
    role: body.role,
  };

  if (body.password) {
    updateData.password = await bcrypt.hash(body.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, nombre: true, apellido: true, role: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return unauthorized();
  if ((session.user.role as Role) !== "ADMIN") return forbidden();

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "No puede eliminarse a sí mismo" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { activo: false } });

  return NextResponse.json({ message: "Usuario desactivado" });
}
