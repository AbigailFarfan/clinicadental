import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PatientForm } from "@/components/pacientes/patient-form";
import { format } from "date-fns";

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({ where: { id } });

  if (!patient || !patient.activo) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <PatientForm
        isEditing
        defaultValues={{
          id: patient.id,
          nombre: patient.nombre,
          apellido: patient.apellido,
          ci: patient.ci,
          telefono: patient.telefono || "",
          email: patient.email || "",
          fechaNacimiento: patient.fechaNacimiento
            ? format(patient.fechaNacimiento, "yyyy-MM-dd")
            : "",
          direccion: patient.direccion || "",
          alergias: patient.alergias || "",
          notas: patient.notas || "",
        }}
      />
    </div>
  );
}
