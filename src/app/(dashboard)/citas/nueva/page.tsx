import { prisma } from "@/lib/prisma";
import { AppointmentForm } from "@/components/citas/appointment-form";

export default async function NuevaCitaPage({
  searchParams,
}: {
  searchParams: Promise<{ pacienteId?: string }>;
}) {
  const params = await searchParams;

  const [patients, dentists] = await Promise.all([
    prisma.patient.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, apellido: true, ci: true },
      orderBy: { apellido: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "DENTISTA", activo: true },
      select: { id: true, nombre: true, apellido: true },
      orderBy: { apellido: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <AppointmentForm
        patients={patients}
        dentists={dentists}
        defaultPacienteId={params.pacienteId}
      />
    </div>
  );
}
