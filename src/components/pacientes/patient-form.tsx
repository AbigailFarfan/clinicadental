"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { patientSchema, PatientFormData } from "@/lib/validations/patient";

interface PatientFormProps {
  defaultValues?: PatientFormData & { id?: string };
  isEditing?: boolean;
}

export function PatientForm({ defaultValues, isEditing }: PatientFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValues || {},
  });

  async function onSubmit(data: PatientFormData) {
    const url = isEditing ? `/api/pacientes/${defaultValues?.id}` : "/api/pacientes";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(typeof error.error === "string" ? error.error : "Error al guardar paciente");
      return;
    }

    toast.success(isEditing ? "Paciente actualizado" : "Paciente creado");
    router.push("/pacientes");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Paciente" : "Nuevo Paciente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register("nombre")} />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input id="apellido" {...register("apellido")} />
              {errors.apellido && <p className="text-sm text-destructive">{errors.apellido.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ci">Carnet de Identidad *</Label>
              <Input id="ci" {...register("ci")} />
              {errors.ci && <p className="text-sm text-destructive">{errors.ci.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register("telefono")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
              <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register("direccion")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alergias">Alergias</Label>
            <Textarea id="alergias" {...register("alergias")} placeholder="Ej: Penicilina, Látex..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" {...register("notas")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear Paciente"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
