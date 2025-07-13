import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

const MODELS_TO_TEST = [
  'gemini-1.0-pro',
  'gemini-1.0-pro-001',
  'gemini-1.0-pro-002',
  'gemini-1.5-pro',
  'gemini-1.5-pro-001',
  'gemini-1.5-pro-002',
  'gemini-pro',
  'gemini-pro-vision'
];

export async function GET() {
  if (!process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID) {
    return NextResponse.json(
      { success: false, error: 'NEXT_PUBLIC_GOOGLE_PROJECT_ID is not set' },
      { status: 400 }
    );
  }

  const results = [];
  const vertex = new VertexAI({
    project: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID,
    location: 'us-central1',
  });

  // Test each model
  for (const modelName of MODELS_TO_TEST) {
    try {
      const model = vertex.preview.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.2,
        },
      });

      // Try a simple generation
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Say "Hello"' }] }],
      });
      
      // Get the response text safely
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No text in response';
      
      results.push({
        model: modelName,
        status: 'success',
        response: responseText
      });
    } catch (error: any) {
      results.push({
        model: modelName,
        status: 'error',
        error: error.message
      });
    }
  }

  return NextResponse.json({
    success: true,
    projectId: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID,
    location: 'us-central1',
    results
  });
}
