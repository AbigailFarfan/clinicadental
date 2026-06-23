"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/generated/prisma/enums";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "DENTISTA", "RECEPCIONISTA"] as Role[],
  },
  {
    label: "Pacientes",
    href: "/pacientes",
    icon: Users,
    roles: ["ADMIN", "DENTISTA", "RECEPCIONISTA"] as Role[],
  },
  {
    label: "Citas",
    href: "/citas",
    icon: Calendar,
    roles: ["ADMIN", "DENTISTA", "RECEPCIONISTA"] as Role[],
  },
  {
    label: "Historial Clínico",
    href: "/historial",
    icon: FileText,
    roles: ["ADMIN", "DENTISTA"] as Role[],
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: Settings,
    roles: ["ADMIN"] as Role[],
  },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">CD</span>
        </div>
        <span className="text-lg font-semibold">Clínica Dental</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
