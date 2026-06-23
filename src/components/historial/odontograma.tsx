"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOOTH_STATUS_LABELS, TOOTH_STATUS_COLORS } from "@/lib/constants";
import { ToothStatus } from "@/generated/prisma/enums";

interface ToothRecord {
  id: string;
  numeroPieza: number;
  estado: ToothStatus;
  notas: string | null;
}

interface OdontogramaProps {
  pacienteId: string;
  toothRecords: ToothRecord[];
}

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function toInternalNumber(fdi: number): number {
  const idx1 = UPPER_TEETH.indexOf(fdi);
  if (idx1 !== -1) return idx1 + 1;
  const idx2 = LOWER_TEETH.indexOf(fdi);
  if (idx2 !== -1) return idx2 + 17;
  return fdi;
}

function toFDI(internal: number): number {
  if (internal >= 1 && internal <= 16) return UPPER_TEETH[internal - 1];
  if (internal >= 17 && internal <= 32) return LOWER_TEETH[internal - 17];
  return internal;
}

export function Odontograma({ pacienteId, toothRecords }: OdontogramaProps) {
  const router = useRouter();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [status, setStatus] = useState<ToothStatus>("SANO");
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);

  const recordMap = new Map<number, ToothRecord>();
  toothRecords.forEach((r) => recordMap.set(r.numeroPieza, r));

  function handleToothClick(fdi: number) {
    const internal = toInternalNumber(fdi);
    const record = recordMap.get(internal);
    setSelectedTooth(fdi);
    setStatus(record?.estado || "SANO");
    setNotas(record?.notas || "");
  }

  async function saveTooth() {
    if (selectedTooth === null) return;
    setSaving(true);

    const internal = toInternalNumber(selectedTooth);
    const res = await fetch("/api/odontograma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pacienteId,
        numeroPieza: internal,
        estado: status,
        notas: notas || null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      toast.error("Error al guardar");
      return;
    }

    toast.success(`Pieza ${selectedTooth} actualizada`);
    setSelectedTooth(null);
    router.refresh();
  }

  function getToothColor(fdi: number): string {
    const internal = toInternalNumber(fdi);
    const record = recordMap.get(internal);
    return record ? TOOTH_STATUS_COLORS[record.estado] : TOOTH_STATUS_COLORS.SANO;
  }

  function getToothStatus(fdi: number): string {
    const internal = toInternalNumber(fdi);
    const record = recordMap.get(internal);
    return record ? TOOTH_STATUS_LABELS[record.estado] : "Sano";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">Superior (Derecha del paciente → Izquierda)</p>
          <div className="flex justify-center gap-1 flex-wrap">
            {UPPER_TEETH.map((tooth) => (
              <ToothButton
                key={tooth}
                number={tooth}
                color={getToothColor(tooth)}
                statusLabel={getToothStatus(tooth)}
                isSelected={selectedTooth === tooth}
                onClick={() => handleToothClick(tooth)}
              />
            ))}
          </div>

          <div className="border-t my-4" />

          <div className="flex justify-center gap-1 flex-wrap">
            {LOWER_TEETH.map((tooth) => (
              <ToothButton
                key={tooth}
                number={tooth}
                color={getToothColor(tooth)}
                statusLabel={getToothStatus(tooth)}
                isSelected={selectedTooth === tooth}
                onClick={() => handleToothClick(tooth)}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">Inferior</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {(Object.keys(TOOTH_STATUS_LABELS) as ToothStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: TOOTH_STATUS_COLORS[s] }}
              />
              <span className="text-xs">{TOOTH_STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>

        {selectedTooth !== null && (
          <div className="mt-6 rounded-lg border p-4 space-y-3">
            <h4 className="font-medium">Pieza #{selectedTooth}</h4>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v: string | null) => setStatus((v || "SANO") as ToothStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TOOTH_STATUS_LABELS) as ToothStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {TOOTH_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input value={notas} onChange={(e) => setNotas(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveTooth} disabled={saving} size="sm">
                {saving ? "Guardando..." : "Guardar"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTooth(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ToothButton({
  number,
  color,
  statusLabel,
  isSelected,
  onClick,
}: {
  number: number;
  color: string;
  statusLabel: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-10 h-14 rounded-lg border-2 transition-all hover:scale-110 ${
        isSelected ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
      title={`Pieza ${number}: ${statusLabel}`}
    >
      <div
        className="w-6 h-6 rounded-sm border"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] font-mono mt-1">{number}</span>
    </button>
  );
}
