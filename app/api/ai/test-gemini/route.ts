import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function GET() {
  try {
    // Simple test prompt
    const prompt = 'Hello, Gemini! Can you tell me the current date and time?';
    
    // Call the Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Gemini API Test Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to connect to Gemini API',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
