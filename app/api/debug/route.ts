import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not Set',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not Set',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not Set',
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: 'success',
      message: 'Debug information',
      env: envVars,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Debug error';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        status: 'error',
        message: errorMessage,
        stack: errorStack
      },
      { status: 500 }
    );
  }
}
