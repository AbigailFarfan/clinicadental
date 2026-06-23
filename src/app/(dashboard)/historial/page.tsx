import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClinicalRecordList } from "@/components/historial/clinical-record-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Role } from "@/generated/prisma/enums";
import Link from "next/link";

export default async function HistorialGlobalPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  const role = session!.user.role as Role;

  if (role === "RECEPCIONISTA") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const search = params.search || "";

  const where: Record<string, unknown> = {};

  if (role === "DENTISTA") {
    where.dentistaId = session!.user.id;
  }

  if (search) {
    where.OR = [
      { diagnostico: { contains: search, mode: "insensitive" } },
      { tratamiento: { contains: search, mode: "insensitive" } },
      { paciente: { nombre: { contains: search, mode: "insensitive" } } },
      { paciente: { apellido: { contains: search, mode: "insensitive" } } },
    ];
  }

  const records = await prisma.clinicalRecord.findMany({
    where,
    include: {
      paciente: { select: { id: true, nombre: true, apellido: true, ci: true } },
      dentista: { select: { nombre: true, apellido: true } },
    },
    orderBy: { fecha: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial Clínico</h1>
        <p className="text-muted-foreground">Registros clínicos de todos los pacientes</p>
      </div>

      <form className="flex gap-2" action="/historial">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Buscar por diagnóstico, tratamiento o paciente..."
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/pacientes/${record.paciente.id}/historial`}
                className="text-sm font-medium hover:underline"
              >
                {record.paciente.nombre} {record.paciente.apellido} (CI: {record.paciente.ci})
              </Link>
            </div>
            <ClinicalRecordList records={[record]} />
          </div>
        ))}
        {records.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No se encontraron registros clínicos
          </p>
        )}
      </div>
    </div>
  );
}
