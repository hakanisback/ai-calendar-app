import NextAuth, { type NextAuthConfig, type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Extend the Session type to include our custom fields
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      timezone?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    timezone?: string | null;
  }
}

// Enable debug logging in development
const debug = process.env.NODE_ENV === 'development';

// Main auth configuration
export const authConfig: NextAuthConfig = {
  basePath: '/api/auth',
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
      },
    },
  },
  
  // Use Prisma adapter
  adapter: PrismaAdapter(prisma as any),
  
  // Configure providers
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
          ].join(' '),
        },
      },
    }),
  ],
  
  // Debug logging
  debug,
  
  // Logger configuration
  logger: {
    error(error: Error) {
      console.error('🔴 Auth Error:', error);
    },
    warn(code: string) {
      console.warn('🟠 Auth Warning:', code);
    },
    debug(code: string, metadata?: any) {
      if (code.includes('token')) {
        console.debug('🔵 Auth Debug:', code);
      } else if (metadata) {
        console.debug('🔵 Auth Debug:', code, JSON.stringify(metadata, null, 2));
      } else {
        console.debug('🔵 Auth Debug:', code);
      }
    },
  },
  
  // Callbacks
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
        session.user.timezone = (user as any).timezone || 'UTC';
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          const existingUser = await (prisma as any).user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            // Update existing user
            await (prisma as any).user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image,
              },
            });
          }
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
  },
  
  // Custom pages
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  // Events
  events: {
    async signIn(message: any) {
      console.log('Sign In Event:', message);
    },
    async signOut(message: any) {
      console.log('Sign Out Event:', message);
    },
  }
};

// Initialize NextAuth with our config
const authInstance = NextAuth(authConfig);

// Export the auth handlers and functions
export const { handlers, auth } = authInstance;

// Export individual methods for convenience
export const signIn = authInstance.signIn;
export const signOut = authInstance.signOut;

// Export auth options for API routes
export const authOptions = authConfig;
