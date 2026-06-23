import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { Role } from "@/generated/prisma/enums";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const role = session!.user.role as Role;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      citas: {
        include: { dentista: { select: { nombre: true, apellido: true } } },
        orderBy: { fecha: "desc" },
        take: 5,
      },
    },
  });

  if (!patient || !patient.activo) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {patient.nombre} {patient.apellido}
          </h1>
          <p className="text-muted-foreground">CI: {patient.ci}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/pacientes/${id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          {role !== "RECEPCIONISTA" && (
            <Button asChild>
              <Link href={`/pacientes/${id}/historial`}>
                <FileText className="mr-2 h-4 w-4" />
                Historial Clínico
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Teléfono" value={patient.telefono} />
            <InfoRow label="Email" value={patient.email} />
            <InfoRow
              label="Fecha de Nacimiento"
              value={
                patient.fechaNacimiento
                  ? format(patient.fechaNacimiento, "dd/MM/yyyy", { locale: es })
                  : null
              }
            />
            <InfoRow label="Dirección" value={patient.direccion} />
            <InfoRow label="Alergias" value={patient.alergias} />
            <InfoRow label="Notas" value={patient.notas} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimas Citas</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/citas/nueva?pacienteId=${id}`}>
                <Calendar className="mr-2 h-4 w-4" />
                Nueva Cita
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {patient.citas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin citas registradas</p>
            ) : (
              <div className="space-y-3">
                {patient.citas.map((cita) => (
                  <div key={cita.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{cita.motivo}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(cita.fecha, "dd/MM/yyyy", { locale: es })} -{" "}
                        {format(cita.horaInicio, "HH:mm")} a {format(cita.horaFin, "HH:mm")}
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
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "No especificado"}</p>
    </div>
  );
}
