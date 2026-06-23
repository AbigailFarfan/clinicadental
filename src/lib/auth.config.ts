import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/pacientes") ||
        nextUrl.pathname.startsWith("/citas") ||
        nextUrl.pathname.startsWith("/historial") ||
        nextUrl.pathname.startsWith("/usuarios");
      const isApiProtected =
        nextUrl.pathname.startsWith("/api") &&
        !nextUrl.pathname.startsWith("/api/auth");

      if (isProtected || isApiProtected) {
        if (isLoggedIn) return true;
        return false;
      }

      if (nextUrl.pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
