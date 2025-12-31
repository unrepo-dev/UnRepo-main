import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        const githubProfile = profile as any;
        
        try {
          // Update or create user with GitHub info
          await prisma.user.upsert({
            where: { githubId: githubProfile.id?.toString() },
            update: {
              githubUsername: githubProfile.login,
              name: githubProfile.name || githubProfile.login,
              avatar: githubProfile.avatar_url,
              email: githubProfile.email,
              lastLogin: new Date(),
            },
            create: {
              githubId: githubProfile.id?.toString(),
              githubUsername: githubProfile.login,
              name: githubProfile.name || githubProfile.login,
              avatar: githubProfile.avatar_url,
              email: githubProfile.email,
              authMethod: 'GITHUB',
            },
          });
        } catch (error) {
          console.error('Error upserting user:', error);
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      // Add GitHub info to token on sign in
      if (account && profile) {
        const githubProfile = profile as any;
        token.githubId = githubProfile.id?.toString();
        token.githubUsername = githubProfile.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.githubId) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: {
              githubId: token.githubId as string,
            },
          });

          if (dbUser) {
            // @ts-ignore - Extending session user object
            session.user.id = dbUser.id;
            (session.user as any).authMethod = dbUser.authMethod;
            (session.user as any).isTokenHolder = dbUser.isTokenHolder;
            (session.user as any).walletAddress = dbUser.walletAddress;
            (session.user as any).githubUsername = dbUser.githubUsername;
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to /app after successful GitHub login
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/app`;
      }
      // If it's an external URL (GitHub callback), redirect to /app
      return `${baseUrl}/app`;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
};
