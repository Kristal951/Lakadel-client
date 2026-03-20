import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      currency?: string;
      role?: string;
      isGuest?: boolean;
      guestID?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    currency?: string;
    role?: string;
    image?: string | null;
    isGuest?: boolean;
    guestID?: string | null;
  }
}