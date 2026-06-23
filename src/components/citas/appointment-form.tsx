"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appointmentSchema, AppointmentFormData } from "@/lib/validations/appointment";

interface AppointmentFormProps {
  patients: { id: string; nombre: string; apellido: string; ci: string }[];
  dentists: { id: string; nombre: string; apellido: string }[];
  defaultPacienteId?: string;
}

export function AppointmentForm({ patients, dentists, defaultPacienteId }: AppointmentFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      pacienteId: defaultPacienteId || "",
      fecha: new Date().toISOString().split("T")[0],
      horaInicio: "09:00",
      horaFin: "09:30",
    },
  });

  async function onSubmit(data: AppointmentFormData) {
    const res = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(typeof error.error === "string" ? error.error : "Error al crear cita");
      return;
    }

    toast.success("Cita creada exitosamente");
    router.push("/citas");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Cita</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <Select
              defaultValue={defaultPacienteId}
              onValueChange={(value: string | null) => setValue("pacienteId", value || "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre} {p.apellido} - CI: {p.ci}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pacienteId && (
              <p className="text-sm text-destructive">{errors.pacienteId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Dentista *</Label>
            <Select onValueChange={(value: string | null) => setValue("dentistaId", value || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar dentista" />
              </SelectTrigger>
              <SelectContent>
                {dentists.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    Dr. {d.nombre} {d.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dentistaId && (
              <p className="text-sm text-destructive">{errors.dentistaId.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input id="fecha" type="date" {...register("fecha")} />
              {errors.fecha && <p className="text-sm text-destructive">{errors.fecha.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaInicio">Hora Inicio *</Label>
              <Input id="horaInicio" type="time" {...register("horaInicio")} />
              {errors.horaInicio && (
                <p className="text-sm text-destructive">{errors.horaInicio.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaFin">Hora Fin *</Label>
              <Input id="horaFin" type="time" {...register("horaFin")} />
              {errors.horaFin && (
                <p className="text-sm text-destructive">{errors.horaFin.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo *</Label>
            <Input id="motivo" {...register("motivo")} placeholder="Ej: Limpieza dental, Revisión..." />
            {errors.motivo && <p className="text-sm text-destructive">{errors.motivo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" {...register("notas")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Cita"}
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
