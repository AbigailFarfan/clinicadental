"use client";

import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { AppointmentStatus } from "@/generated/prisma/enums";

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge className={APPOINTMENT_STATUS_COLORS[status]}>
      {APPOINTMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
