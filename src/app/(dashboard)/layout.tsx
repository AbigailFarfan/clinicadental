import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Role } from "@/generated/prisma/enums";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Sidebar role={session.user.role as Role} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Topbar
          userName={session.user.name || "Usuario"}
          role={session.user.role as Role}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
