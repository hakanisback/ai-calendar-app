import { NextResponse } from 'next/server';
import { vertexAIClient } from '@/lib/vertex-ai-rest';

export async function POST(req: Request) {
  console.log('Received request to /api/ai/rest-test');
  
  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { prompt } = body;
    
    if (!prompt) {
      console.error('No prompt provided');
      return NextResponse.json(
        { 
          error: 'Prompt is required',
          receivedBody: body 
        },
        { status: 400 }
      );
    }

    console.log('Calling Vertex AI with prompt:', prompt);
    const response = await vertexAIClient.generateContent(prompt, {
      maxOutputTokens: 512,
      temperature: 0.7,
    });

    console.log('Received response from Vertex AI');
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error: any) {
    console.error('Error in REST API test:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...error
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate content',
        message: error.message,
        details: error.response?.data || error.toString()
      },
      { 
        status: error.response?.status || 500 
      }
    );
  }
}
