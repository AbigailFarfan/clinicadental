import { z } from "zod";

export const patientSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  ci: z.string().min(4, "El CI debe tener al menos 4 caracteres"),
  telefono: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  fechaNacimiento: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  alergias: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
});

export type PatientFormData = z.infer<typeof patientSchema>;
