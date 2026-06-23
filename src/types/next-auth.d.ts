import { Role } from "@/generated/prisma/enums";
import "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: User & {
      id: string;
      role: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
