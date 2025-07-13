import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { currentEvents, constraints, request } = await req.json();
    
    console.log('Test endpoint called with:', { 
      currentEvents, 
      constraints, 
      request 
    });
    
    // For testing, just return the input data
    return NextResponse.json({
      success: true,
      message: "Test endpoint working!",
      received: { currentEvents, constraints, request },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
