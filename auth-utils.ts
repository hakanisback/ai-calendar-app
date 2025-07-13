import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { DefaultSession } from 'next-auth';

export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return { user: session.user, session };
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

// Extend the session type to include the access token
declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    error?: string;
  }
}

export async function getAuthToken() {
  const session = await auth();
  if (session?.error) {
    console.error('Auth error:', session.error);
    return null;
  }
  return session?.accessToken || null;
}
