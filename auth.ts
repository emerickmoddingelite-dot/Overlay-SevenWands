import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { db } from "@/lib/db";

/**
 * SevenWands uses Discord as its only authentication provider.
 *
 * We intentionally use JWT sessions here instead of the generic PrismaAdapter.
 * The PrismaAdapter expects the stock Auth.js User schema (notably a unique
 * email field and optional standard fields). SevenWands has its own User
 * model centered around the immutable Discord account ID, so keeping the
 * identity upsert explicit is both simpler and safer.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: { params: { scope: "identify email" } }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "discord") return false;

      const discordId = account.providerAccountId;
      if (!discordId) return false;

      const discordProfile = profile as {
        id?: string;
        username?: string;
        global_name?: string | null;
        avatar?: string | null;
      } | undefined;

      // The provider account ID is the authoritative Discord identity.
      // Never use email as the identity key.
      const username =
        discordProfile?.username?.trim() ||
        user.name?.trim() ||
        `Discord-${discordId}`;

      await db.user.upsert({
        where: { discordId },
        create: {
          discordId,
          username,
          globalName: discordProfile?.global_name ?? user.name ?? null,
          avatar: user.image ?? discordProfile?.avatar ?? null,
          email: user.email ?? null
        },
        update: {
          username,
          globalName: discordProfile?.global_name ?? user.name ?? null,
          avatar: user.image ?? discordProfile?.avatar ?? null,
          email: user.email ?? null
        }
      });

      return true;
    },

    async jwt({ token, account }) {
      // On the initial OAuth callback, persist the Discord ID in the token.
      if (account?.provider === "discord" && account.providerAccountId) {
        token.discordId = account.providerAccountId;
      }

      if (!token.discordId && token.sub) {
        const user = await db.user.findUnique({
          where: { id: token.sub },
          select: { discordId: true }
        });
        if (user) token.discordId = user.discordId;
      }

      // Our database user ID is the stable application identity used by all
      // ownership checks in the dashboard API.
      if (token.discordId) {
        const user = await db.user.findUnique({
          where: { discordId: String(token.discordId) },
          select: { id: true }
        });
        if (user) token.sub = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  pages: { signIn: "/login" }
});
