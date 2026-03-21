import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";


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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        // Return the user object, mapped to match our extended NextAuth User type
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          branchId: user.branchId,
          isProfileComplete: user.isProfileComplete,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // The user object is only present on the first sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = (user as any).companyId;
        token.branchId = user.branchId;
        token.isProfileComplete = user.isProfileComplete;
      }

      if (trigger === "update" && session) {
        if (session.isProfileComplete !== undefined) {
          token.isProfileComplete = session.isProfileComplete;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SYSTEM_ADMIN" | "COMPANY_ADMIN" | "BRANCH_MANAGER" | "AGENT";
        session.user.companyId = token.companyId as string | null;
        session.user.branchId = token.branchId as string | null;
        session.user.isProfileComplete = token.isProfileComplete as boolean;
      }
      return session;
    },
  },
};
