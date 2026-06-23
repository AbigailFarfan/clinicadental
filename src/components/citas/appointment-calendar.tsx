"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { AppointmentStatus } from "@/generated/prisma/enums";

interface Appointment {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  notas: string | null;
  estado: AppointmentStatus;
  paciente: { id: string; nombre: string; apellido: string; ci: string };
  dentista: { id: string; nombre: string; apellido: string };
}

interface CalendarProps {
  appointments: Appointment[];
  dentists: { id: string; nombre: string; apellido: string }[];
  currentDate: string;
  selectedDentist: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

const NEXT_STATUS: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  PENDIENTE: "CONFIRMADA",
  CONFIRMADA: "EN_CURSO",
  EN_CURSO: "COMPLETADA",
};

const STATUS_ACTION_LABEL: Partial<Record<AppointmentStatus, string>> = {
  PENDIENTE: "Confirmar",
  CONFIRMADA: "Iniciar",
  EN_CURSO: "Completar",
};

export function AppointmentCalendar({
  appointments,
  dentists,
  currentDate,
  selectedDentist,
}: CalendarProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [updating, setUpdating] = useState(false);

  const baseDate = new Date(currentDate);
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function navigateWeek(offset: number) {
    const newDate = addDays(baseDate, offset * 7);
    const params = new URLSearchParams();
    params.set("fecha", format(newDate, "yyyy-MM-dd"));
    if (selectedDentist) params.set("dentistaId", selectedDentist);
    router.push(`/citas?${params.toString()}`);
  }

  function getAppointmentsForDayHour(day: Date, hour: number) {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.fecha);
      const aptHour = new Date(apt.horaInicio).getHours();
      return isSameDay(aptDate, day) && aptHour === hour;
    });
  }

  async function updateStatus(id: string, estado: AppointmentStatus) {
    setUpdating(true);
    const res = await fetch(`/api/citas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setUpdating(false);

    if (!res.ok) {
      toast.error("Error al actualizar estado");
      return;
    }

    toast.success("Estado actualizado");
    setSelected(null);
    router.refresh();
  }

  async function cancelAppointment(id: string) {
    setUpdating(true);
    const res = await fetch(`/api/citas/${id}`, { method: "DELETE" });
    setUpdating(false);

    if (!res.ok) {
      toast.error("Error al cancelar cita");
      return;
    }

    toast.success("Cita cancelada");
    setSelected(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">
              {format(weekStart, "d MMM", { locale: es })} -{" "}
              {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={selectedDentist || "all"}
            onValueChange={(v: string | null) => {
              const params = new URLSearchParams();
              params.set("fecha", currentDate);
              if (v && v !== "all") params.set("dentistaId", v);
              router.push(`/citas?${params.toString()}`);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos los dentistas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los dentistas</SelectItem>
              {dentists.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  Dr. {d.nombre} {d.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-px bg-border">
              <div className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">
                Hora
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`bg-card p-2 text-center text-xs font-medium ${
                    isSameDay(day, new Date()) ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <div>{format(day, "EEE", { locale: es })}</div>
                  <div className="text-lg">{format(day, "d")}</div>
                </div>
              ))}

              {HOURS.map((hour) => (
                <>
                  <div
                    key={`h-${hour}`}
                    className="bg-card p-2 text-right text-xs text-muted-foreground"
                  >
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  {weekDays.map((day) => {
                    const dayAppts = getAppointmentsForDayHour(day, hour);
                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className="bg-card p-1 min-h-[60px] border-t"
                      >
                        {dayAppts.map((apt) => (
                          <button
                            key={apt.id}
                            onClick={() => setSelected(apt)}
                            className={`w-full rounded p-1 text-left text-xs mb-1 transition-opacity hover:opacity-80 ${
                              apt.estado === "CANCELADA"
                                ? "bg-red-100 text-red-800 line-through"
                                : apt.estado === "COMPLETADA"
                                ? "bg-green-100 text-green-800"
                                : apt.estado === "EN_CURSO"
                                ? "bg-purple-100 text-purple-800"
                                : apt.estado === "CONFIRMADA"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            <div className="font-medium truncate">
                              {apt.paciente.nombre} {apt.paciente.apellido}
                            </div>
                            <div className="truncate">
                              {format(new Date(apt.horaInicio), "HH:mm")} - {apt.motivo}
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle de Cita</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                  <p>{selected.paciente.nombre} {selected.paciente.apellido}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dentista</p>
                  <p>Dr. {selected.dentista.nombre} {selected.dentista.apellido}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha y Hora</p>
                  <p>
                    {format(new Date(selected.fecha), "dd/MM/yyyy", { locale: es })} |{" "}
                    {format(new Date(selected.horaInicio), "HH:mm")} -{" "}
                    {format(new Date(selected.horaFin), "HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Motivo</p>
                  <p>{selected.motivo}</p>
                </div>
                {selected.notas && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notas</p>
                    <p>{selected.notas}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <StatusBadge status={selected.estado} />
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                {NEXT_STATUS[selected.estado] && (
                  <Button
                    onClick={() => updateStatus(selected.id, NEXT_STATUS[selected.estado]!)}
                    disabled={updating}
                  >
                    {STATUS_ACTION_LABEL[selected.estado]}
                  </Button>
                )}
                {selected.estado !== "CANCELADA" && selected.estado !== "COMPLETADA" && (
                  <Button
                    variant="destructive"
                    onClick={() => cancelAppointment(selected.id)}
                    disabled={updating}
                  >
                    Cancelar Cita
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
