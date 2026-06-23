import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserForm } from "@/components/usuarios/user-form";
import { Role } from "@/generated/prisma/enums";

export default async function NuevoUsuarioPage() {
  const session = await auth();
  if ((session!.user.role as Role) !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <UserForm />
    </div>
  );
}
