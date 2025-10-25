import type { NextAuthConfig } from 'next-auth';
import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { redis } from './redist';
import Resend from 'next-auth/providers/resend';
import { sendVerificationEmail } from '@/actions/sendEmail';

export const authConfig: NextAuthConfig = {
  adapter: UpstashRedisAdapter(redis) as any,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'Youkhana Admin <noreply@callmespike.me>',
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendVerificationEmail({ identifier, url });
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user exists in our system
      if (user.email) {
        const existingUser = await redis.hgetall(`user:${user.email}`);

        // If user doesn't exist in our system, deny sign in
        if (!existingUser || Object.keys(existingUser).length === 0) {
          return false;
        }

        // Update last sign in timestamp
        await redis.hset(`user:${user.email}`, {
          lastSignIn: new Date().toISOString(),
        });

        return true;
      }

      return false;
    },
    async session({ session, user }) {
      // Add user role to session
      if (session.user && session.user.email) {
        const userData = await redis.hgetall(`user:${session.user.email}`);

        if (userData) {
          // Add custom fields to session
          const role = userData.role as string;
          session.user.role = (role === 'MASTER_ADMIN' || role === 'ADMIN' || role === 'MEMBER')
            ? role
            : 'MEMBER';
          session.user.name = (userData.name as string) || session.user.name;
        }
      }

      return session;
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
};
