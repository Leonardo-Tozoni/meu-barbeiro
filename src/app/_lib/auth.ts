import { db } from "@/app/_lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const userWithBarber = await db.user.findUnique({
        where: { id: user.id },
        include: { barber: true },
      });

      session.user = {
        ...session.user,
        id: user.id,
        role: userWithBarber?.role || "CLIENT",
        barbershopId: userWithBarber?.barber?.barbershopId,
      } as {
        id: string;
        name: string;
        email: string;
        role: string;
        barbershopId?: string;
      };

      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
