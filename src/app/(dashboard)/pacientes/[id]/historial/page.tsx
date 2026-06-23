import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ClinicalRecordForm } from "@/components/historial/clinical-record-form";
import { ClinicalRecordList } from "@/components/historial/clinical-record-list";
import { Odontograma } from "@/components/historial/odontograma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Role } from "@/generated/prisma/enums";

export default async function HistorialPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const role = session!.user.role as Role;

  if (role === "RECEPCIONISTA") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient || !patient.activo) notFound();

  const [records, toothRecords] = await Promise.all([
    prisma.clinicalRecord.findMany({
      where: { pacienteId: id },
      include: {
        dentista: { select: { nombre: true, apellido: true } },
      },
      orderBy: { fecha: "desc" },
    }),
    prisma.toothRecord.findMany({
      where: { pacienteId: id },
      orderBy: { numeroPieza: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/pacientes/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Historial de {patient.nombre} {patient.apellido}
            </h1>
            <p className="text-muted-foreground">CI: {patient.ci}</p>
          </div>
        </div>
        <ClinicalRecordForm pacienteId={id} />
      </div>

      <Tabs defaultValue="registros">
        <TabsList>
          <TabsTrigger value="registros">Registros Clínicos</TabsTrigger>
          <TabsTrigger value="odontograma">Odontograma</TabsTrigger>
        </TabsList>
        <TabsContent value="registros" className="mt-4">
          <ClinicalRecordList records={records} />
        </TabsContent>
        <TabsContent value="odontograma" className="mt-4">
          <Odontograma pacienteId={id} toothRecords={toothRecords} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
