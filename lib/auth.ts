import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin"
  },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
        otp: { label: "Doğrulama kodu", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordMatches = await compare(credentials.password, user.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        if (user.twoFactorEnabled) {
          if (!credentials.otp || !user.emailOtpHash || !user.emailOtpExpiresAt) {
            return null;
          }

          const otpMatches =
            user.emailOtpExpiresAt.getTime() > Date.now() &&
            (await compare(credentials.otp, user.emailOtpHash));
          if (!otpMatches) {
            return null;
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            emailOtpHash: null,
            emailOtpExpiresAt: null
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    }
  }
};
