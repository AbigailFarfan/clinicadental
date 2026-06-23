import { AppointmentStatus, ToothStatus } from "@/generated/prisma/enums";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  EN_CURSO: "En Curso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  CONFIRMADA: "bg-blue-100 text-blue-800",
  EN_CURSO: "bg-purple-100 text-purple-800",
  COMPLETADA: "bg-green-100 text-green-800",
  CANCELADA: "bg-red-100 text-red-800",
};

export const TOOTH_STATUS_LABELS: Record<ToothStatus, string> = {
  SANO: "Sano",
  CARIES: "Caries",
  OBTURADO: "Obturado",
  EXTRAIDO: "Extraído",
  CORONA: "Corona",
  ENDODONCIA: "Endodoncia",
  PROTESIS: "Prótesis",
  IMPLANTE: "Implante",
};

export const TOOTH_STATUS_COLORS: Record<ToothStatus, string> = {
  SANO: "#4ade80",
  CARIES: "#f87171",
  OBTURADO: "#60a5fa",
  EXTRAIDO: "#9ca3af",
  CORONA: "#fbbf24",
  ENDODONCIA: "#c084fc",
  PROTESIS: "#2dd4bf",
  IMPLANTE: "#f472b6",
};
