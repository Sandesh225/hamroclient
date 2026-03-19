import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
          const res = await fetch(`${baseUrl}/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (res.ok) {
            const user = await res.json();
            return user;
          }
          return null;
        } catch (error) {
          console.error("Frontend Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.branchId = user.branchId;
        token.isProfileComplete = user.isProfileComplete;
      }

      if (trigger === "update" && session) {
        // Update the token with session data
        if (session.isProfileComplete !== undefined) {
          token.isProfileComplete = session.isProfileComplete;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "STAFF";
        session.user.branchId = token.branchId as string | null;
        session.user.isProfileComplete = token.isProfileComplete as boolean;
      }
      return session;
    },
  },
};
