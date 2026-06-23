import { z } from "zod";

export const appointmentSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  horaInicio: z.string().min(1, "La hora de inicio es requerida"),
  horaFin: z.string().min(1, "La hora de fin es requerida"),
  motivo: z.string().min(3, "El motivo debe tener al menos 3 caracteres"),
  notas: z.string().optional().or(z.literal("")),
  pacienteId: z.string().min(1, "Debe seleccionar un paciente"),
  dentistaId: z.string().min(1, "Debe seleccionar un dentista"),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
