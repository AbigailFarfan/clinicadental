import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface ClinicalRecord {
  id: string;
  fecha: Date | string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string | null;
  piezaDental: number | null;
  dentista: { nombre: string; apellido: string };
}

export function ClinicalRecordList({ records }: { records: ClinicalRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No hay registros clínicos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {format(new Date(record.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                </span>
                {record.piezaDental && (
                  <Badge variant="outline">Pieza #{record.piezaDental}</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Dr. {record.dentista.nombre} {record.dentista.apellido}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Diagnóstico</p>
                <p className="text-sm">{record.diagnostico}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Tratamiento</p>
                <p className="text-sm">{record.tratamiento}</p>
              </div>
              {record.observaciones && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Observaciones
                  </p>
                  <p className="text-sm">{record.observaciones}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
