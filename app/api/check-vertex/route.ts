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
    
    // Check if Vertex AI API is enabled
    const serviceUsageEndpoint = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/aiplatform.googleapis.com`;
    
    const response = await fetch(serviceUsageEndpoint, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      isEnabled: data.state === 'ENABLED',
      serviceInfo: data
    });
    
  } catch (error: any) {
    console.error('Error checking Vertex AI status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check Vertex AI status',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
