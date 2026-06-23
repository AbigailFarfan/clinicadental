import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/auth-utils";
import { userSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();
  if ((session.user.role as Role) !== "ADMIN") return forbidden();

  const users = await prisma.user.findMany({
    where: { activo: true },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      role: true,
      activo: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorized();
  if ((session.user.role as Role) !== "ADMIN") return forbidden();

  const body = await request.json();
  const parsed = userSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      ...parsed.data,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      role: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
