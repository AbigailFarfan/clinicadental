import { z } from "zod";

export const clinicalRecordSchema = z.object({
  diagnostico: z.string().min(3, "El diagnóstico debe tener al menos 3 caracteres"),
  tratamiento: z.string().min(3, "El tratamiento debe tener al menos 3 caracteres"),
  observaciones: z.string().optional().or(z.literal("")),
  piezaDental: z.number().int().min(1).max(32).optional().nullable(),
  pacienteId: z.string().min(1, "Debe seleccionar un paciente"),
});

export type ClinicalRecordFormData = z.infer<typeof clinicalRecordSchema>;
