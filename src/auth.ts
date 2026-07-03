import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import {
  accountAgeDays,
  bioContainsCode,
  getRobloxAvatarUrl,
  getRobloxUserProfile,
  lookupRobloxUser,
  normalizeUsername,
  robloxEmail,
} from "@/lib/roblox";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "roblox-bio",
      name: "Roblox",
      credentials: {
        username: { label: "Roblox Username", type: "text" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        const username = normalizeUsername(credentials?.username ?? "");
        const code = String(credentials?.code ?? "").trim();

        if (!username || !code) return null;

        const challenge = await prisma.verificationChallenge.findFirst({
          where: {
            robloxUsername: username,
            code,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!challenge) return null;

        const robloxUser = await lookupRobloxUser(username);
        if (!robloxUser) return null;

        const profile = await getRobloxUserProfile(String(robloxUser.id));
        if (!profile || !bioContainsCode(profile.description, code)) {
          return null;
        }

        const avatarUrl = await getRobloxAvatarUrl(String(robloxUser.id));
        const email = robloxEmail(String(robloxUser.id));
        const usernameSlug = robloxUser.name.toLowerCase();

        const dbUser = await prisma.user.upsert({
          where: { robloxUserId: String(robloxUser.id) },
          create: {
            email,
            username: usernameSlug,
            robloxUserId: String(robloxUser.id),
            robloxUsername: robloxUser.name,
            displayName: robloxUser.displayName,
            avatarUrl,
            isVerified: true,
            accountAgeDays: accountAgeDays(profile.created),
            trustLevel: "RISING",
            trustScore: 10,
          },
          update: {
            displayName: robloxUser.displayName,
            avatarUrl,
            isVerified: true,
            accountAgeDays: accountAgeDays(profile.created),
          },
        });

        await prisma.verificationChallenge.deleteMany({
          where: { robloxUsername: username },
        });

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.displayName ?? robloxUser.name,
          image: dbUser.avatarUrl,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
};
