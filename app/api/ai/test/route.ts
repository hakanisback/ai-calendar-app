import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

export async function GET() {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
    const location = 'us-central1';
    
    // Using Gemini model
    const modelName = 'gemini-pro';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelName}:generateContent`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'What is the capital of France?'
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 256,
          topP: 0.8,
          topK: 40,
        }
      })
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Invalid JSON response from Vertex AI');
    }
    
    if (!response.ok) {
      console.error('Vertex AI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      
      throw new Error(
        responseData.error?.message || 
        responseData.message || 
        `Request failed with status ${response.status}`
      );
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
    
  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        details: error.response?.data || error.toString()
      },
      { status: 500 }
    );
  }
}
