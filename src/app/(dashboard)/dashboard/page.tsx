import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { Role } from "@/generated/prisma/enums";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const role = session!.user.role as Role;
  const dentistaFilter = role === "DENTISTA" ? { dentistaId: session!.user.id } : {};

  const [totalPatients, todayAppointments, pendingAppointments, completedToday] =
    await Promise.all([
      prisma.patient.count({ where: { activo: true } }),
      prisma.appointment.count({
        where: { fecha: { gte: today, lt: tomorrow }, ...dentistaFilter },
      }),
      prisma.appointment.count({
        where: { estado: "PENDIENTE", ...dentistaFilter },
      }),
      prisma.appointment.count({
        where: {
          fecha: { gte: today, lt: tomorrow },
          estado: "COMPLETADA",
          ...dentistaFilter,
        },
      }),
    ]);

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      fecha: { gte: today },
      estado: { in: ["PENDIENTE", "CONFIRMADA", "EN_CURSO"] },
      ...dentistaFilter,
    },
    include: {
      paciente: { select: { nombre: true, apellido: true } },
      dentista: { select: { nombre: true, apellido: true } },
    },
    orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
    take: 10,
  });

  const recentPatients = await prisma.patient.findMany({
    where: { activo: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Pacientes Totales", value: totalPatients, icon: Users, color: "text-blue-600" },
    { label: "Citas Hoy", value: todayAppointments, icon: Calendar, color: "text-green-600" },
    { label: "Pendientes", value: pendingAppointments, icon: Clock, color: "text-yellow-600" },
    { label: "Completadas Hoy", value: completedToday, icon: CheckCircle, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay citas próximas</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {cita.paciente.nombre} {cita.paciente.apellido}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(cita.fecha, "dd/MM/yyyy", { locale: es })} -{" "}
                        {format(cita.horaInicio, "HH:mm")} - {cita.motivo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {cita.dentista.nombre} {cita.dentista.apellido}
                      </p>
                    </div>
                    <Badge className={APPOINTMENT_STATUS_COLORS[cita.estado]}>
                      {APPOINTMENT_STATUS_LABELS[cita.estado]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pacientes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay pacientes registrados</p>
            ) : (
              <div className="space-y-3">
                {recentPatients.map((paciente) => (
                  <Link
                    key={paciente.id}
                    href={`/pacientes/${paciente.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {paciente.nombre} {paciente.apellido}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CI: {paciente.ci} {paciente.telefono ? `| Tel: ${paciente.telefono}` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(paciente.createdAt, "dd/MM/yyyy")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
