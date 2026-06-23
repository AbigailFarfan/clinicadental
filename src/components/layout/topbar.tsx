"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { Role } from "@/generated/prisma/enums";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  DENTISTA: "Dentista",
  RECEPCIONISTA: "Recepcionista",
};

export function Topbar({
  userName,
  role,
}: {
  userName: string;
  role: Role;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-6">
      <MobileNav role={role} />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-medium">{userName}</span>
          <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
