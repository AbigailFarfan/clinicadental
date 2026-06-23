import { z } from "zod";

export const userSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "DENTISTA", "RECEPCIONISTA"]),
});

export const userUpdateSchema = userSchema.omit({ password: true }).extend({
  password: z.string().min(6).optional().or(z.literal("")),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
