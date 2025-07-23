import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./lib/db";
import authConfig from "./auth.config";
import { getAccountByUserId, getUserById } from "./features/auth/actions";

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user || !account) return false;

      const existingUser = await db.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        const newUser = await db.user.create({
          data: {
            email: user.email!,
            name: user.name,
            image: user.image,
            accounts: {
              create: {
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            },
          },
        });

        if (!newUser) return false;
      } else {
        const exisitingAccount = await db.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        });

        if (!exisitingAccount) {
          await db.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            },
          });
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (!token.sub) return token;

      const exisitingUser = await getUserById(token.sub);
      if (!exisitingUser) return token;

      const exisitingAccount = await getAccountByUserId(exisitingUser.id);

      token.name = exisitingUser.name;
      token.email = exisitingUser.email;
      token.role = exisitingUser.role;

      return token;
    },

    async session({ session, token }) {
      if(token.sub && session.user) {
        session.user.id = token.sub;
      }

      if(token.role && session.user) {
        session.user.role = token.role;
      }

      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
