import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth } from '@/lib/auth-utils';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export const maxDuration = 30; // 30 seconds max for AI processing
export const dynamic = 'force-dynamic';

// Helper function to format events for the prompt
function formatEvents(events: any[]) {
  if (!events || events.length === 0) return 'No existing events.';
  
  return events.map(event => {
    const start = new Date(event.start).toLocaleString();
    const end = new Date(event.end).toLocaleString();
    return `- ${event.title} (${start} - ${end})`;
  }).join('\n');
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const authResponse = await requireAuth();
    if (authResponse instanceof NextResponse) {
      return authResponse; // Return the error response
    }
    
    const user = authResponse;
    console.log('Processing request for user:', user.email);

    const { currentEvents = [], constraints = '', request = '' } = await req.json();
    
    if (!request) {
      return NextResponse.json(
        { error: 'Request is required' },
        { status: 400 }
      );
    }

    // Format the prompt for Gemini
    const prompt = `You are an AI assistant that helps with calendar scheduling and rescheduling.

Current Schedule:
${formatEvents(currentEvents)}

Constraints:
${constraints || 'No specific constraints provided.'}

Request: ${request}

Please provide a detailed response with:
1. Suggested time slots that fit the request and constraints
2. Any conflicts with existing events
3. Recommended next steps

Format your response in markdown.`;

    // Call the Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      suggestion: text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Reschedule error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate reschedule suggestion',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
