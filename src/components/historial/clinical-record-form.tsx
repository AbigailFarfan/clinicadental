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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { clinicalRecordSchema, ClinicalRecordFormData } from "@/lib/validations/clinical-record";
import { useState } from "react";

export function ClinicalRecordForm({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClinicalRecordFormData>({
    resolver: zodResolver(clinicalRecordSchema),
    defaultValues: { pacienteId },
  });

  async function onSubmit(data: ClinicalRecordFormData) {
    const res = await fetch("/api/historial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Error al crear registro");
      return;
    }

    toast.success("Registro clínico creado");
    reset({ pacienteId });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Registro
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Registro Clínico</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("pacienteId")} />

          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico *</Label>
            <Textarea id="diagnostico" {...register("diagnostico")} />
            {errors.diagnostico && (
              <p className="text-sm text-destructive">{errors.diagnostico.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tratamiento">Tratamiento *</Label>
            <Textarea id="tratamiento" {...register("tratamiento")} />
            {errors.tratamiento && (
              <p className="text-sm text-destructive">{errors.tratamiento.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="piezaDental">Pieza Dental (1-32, opcional)</Label>
            <Input
              id="piezaDental"
              type="number"
              min={1}
              max={32}
              {...register("piezaDental", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" {...register("observaciones")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
