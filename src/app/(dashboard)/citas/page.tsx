import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AppointmentCalendar } from "@/components/citas/appointment-calendar";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { Role } from "@/generated/prisma/enums";

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; dentistaId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const role = session!.user.role as Role;

  const currentDate = params.fecha || format(new Date(), "yyyy-MM-dd");
  const selectedDentist = role === "DENTISTA" ? session!.user.id : params.dentistaId || "";

  const start = new Date(currentDate);
  const dayOfWeek = start.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const where: Record<string, unknown> = {
    fecha: { gte: start, lt: end },
  };

  if (role === "DENTISTA") {
    where.dentistaId = session!.user.id;
  } else if (selectedDentist) {
    where.dentistaId = selectedDentist;
  }

  const [appointments, dentists] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        paciente: { select: { id: true, nombre: true, apellido: true, ci: true } },
        dentista: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
    }),
    prisma.user.findMany({
      where: { role: "DENTISTA", activo: true },
      select: { id: true, nombre: true, apellido: true },
    }),
  ]);

  const serialized = appointments.map((a) => ({
    ...a,
    fecha: a.fecha.toISOString(),
    horaInicio: a.horaInicio.toISOString(),
    horaFin: a.horaFin.toISOString(),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Citas</h1>
          <p className="text-muted-foreground">Calendario de citas de la clínica</p>
        </div>
        <Button asChild>
          <Link href="/citas/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Link>
        </Button>
      </div>

      <AppointmentCalendar
        appointments={serialized}
        dentists={dentists}
        currentDate={currentDate}
        selectedDentist={selectedDentist}
      />
    </div>
  );
}
