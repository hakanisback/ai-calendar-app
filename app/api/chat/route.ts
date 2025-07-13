import { NextResponse } from 'next/server';
import { chatWithGemini } from '@/lib/vertex-ai';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  timezone?: string;
  userId?: string;
}

export async function POST(req: Request) {
  console.log('Received chat request');
  
  try {
    // Parse and validate request body
    let requestBody: RequestBody;
    try {
      const body = await req.text();
      console.log('Request body:', body);
      requestBody = JSON.parse(body);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json(
        { error: 'Invalid request body', details: e instanceof Error ? e.message : 'Unknown error' },
        { status: 400 }
      );
    }

    const { messages, timezone = 'UTC', userId = 'anonymous' } = requestBody;
    console.log(`Processing request from user ${userId} in timezone ${timezone}`);
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate message format
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content || typeof lastMessage.content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    console.log('Last message content:', lastMessage.content.substring(0, 100) + '...');
    
    try {
      // Convert messages to Vertex AI format
      const vertexMessages = messages.map(msg => {
        // Map 'assistant' role to 'model' for Vertex AI
        const role = msg.role === 'assistant' ? 'model' as const : 'user' as const;
        return {
          role,
          parts: [{ text: msg.content }]
        };
      });
      
      // Call Vertex AI
      const response = await chatWithGemini(vertexMessages);
      
      // Format the response to match the frontend's expected format
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error calling Vertex AI:', error);
      return NextResponse.json(
        { 
          error: 'Failed to process message with AI',
          details: process.env.NODE_ENV === 'development' 
            ? (error instanceof Error ? error.message : 'Unknown error')
            : undefined
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : undefined
      },
      { status: 500 }
    );
  }
}
