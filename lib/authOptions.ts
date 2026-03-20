// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {prisma} from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          role: user.role,
          image: user.image,
          isGuest: user.isGuest,
          guestID: user.guestID,
        } as any;
      },
    }),
  ],

  session: { strategy: "jwt" },

  events: {
    async createUser({ user }) {
      if (!user?.email) return;

      try {
        await prisma.user.update({
          where: { email: user.email },
          data: {
            image: user.image ?? null,
            name: user.name ?? null,  
            authProvider: "GOOGLE",
          },
        });
      } catch (e) {
        console.error("events.createUser persist google image failed:", e);
      }
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.currency = (user as any).currency ?? "NGN";
        token.role = (user as any).role ?? "USER";
        token.image = (user as any).image ?? null;
        token.isGuest = (user as any).isGuest ?? false;
        token.guestID = (user as any).guestID ?? null;
      }

      if (
        token.email &&
        (token.id == null ||
          token.role == null ||
          token.currency == null ||
          token.image === undefined ||
          token.isGuest === undefined ||
          token.guestID === undefined)
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            id: true,
            role: true,
            currency: true,
            image: true,
            isGuest: true,
            guestID: true,
          },
        });

        if (dbUser) {
          token.id = token.id ?? dbUser.id;
          token.role = token.role ?? dbUser.role ?? "USER";
          token.currency = token.currency ?? dbUser.currency ?? "NGN";
          token.image = token.image ?? dbUser.image ?? null;
          token.isGuest = token.isGuest ?? dbUser.isGuest ?? false;
          token.guestID = token.guestID ?? dbUser.guestID ?? null;
        } else {
          token.role = token.role ?? "USER";
          token.currency = token.currency ?? "NGN";
          token.image = token.image ?? null;
          token.isGuest = token.isGuest ?? false;
          token.guestID = token.guestID ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).currency = token.currency ?? "NGN";
      (session.user as any).role = token.role ?? "USER";
      (session.user as any).image = token.image ?? null;
      (session.user as any).isGuest = (token as any).isGuest ?? false;
      (session.user as any).guestID = (token as any).guestID ?? null;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
};