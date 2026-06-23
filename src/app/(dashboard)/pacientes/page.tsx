import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PatientTable } from "@/components/pacientes/patient-table";
import { Plus } from "lucide-react";
import { Role } from "@/generated/prisma/enums";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const search = params.search || "";
  const page = parseInt(params.page || "1");
  const limit = 10;
  const role = session!.user.role as Role;

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

  const canCreate = role !== "DENTISTA";
  const canDelete = role !== "DENTISTA";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">Gestión de pacientes de la clínica</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/pacientes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Link>
          </Button>
        )}
      </div>

      <PatientTable
        patients={patients}
        totalPages={Math.ceil(total / limit)}
        currentPage={page}
        search={search}
        canDelete={canDelete}
      />
    </div>
  );
}
