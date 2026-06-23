"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, Users, Calendar, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Role } from "@/generated/prisma/enums";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "DENTISTA", "RECEPCIONISTA"] as Role[] },
  { label: "Pacientes", href: "/pacientes", icon: Users, roles: ["ADMIN", "DENTISTA", "RECEPCIONISTA"] as Role[] },
  { label: "Citas", href: "/citas", icon: Calendar, roles: ["ADMIN", "DENTISTA", "RECEPCIONISTA"] as Role[] },
  { label: "Historial Clínico", href: "/historial", icon: FileText, roles: ["ADMIN", "DENTISTA"] as Role[] },
  { label: "Usuarios", href: "/usuarios", icon: Settings, roles: ["ADMIN"] as Role[] },
];

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-muted">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">CD</span>
          </div>
          <span className="text-lg font-semibold">Clínica Dental</span>
        </div>
        <nav className="space-y-1 p-4">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
