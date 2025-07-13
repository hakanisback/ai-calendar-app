'use client';

import { SessionProvider } from 'next-auth/react';
import { authConfig } from '@/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      session={null} // Session is handled by NextAuth
      basePath={authConfig.basePath}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
