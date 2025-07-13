const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
require('dotenv').config();

async function testVertexAI() {
  try {
    console.log('Starting Vertex AI test...');
    
    // Initialize auth
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
    const location = 'us-central1';
    
    console.log('Project ID:', projectId);
    console.log('Location:', location);
    
    // Test endpoint
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/text-bison:predict`;
    
    const prompt = 'What is the capital of France?';
    
    console.log('\nSending request to:', endpoint);
    console.log('Prompt:', prompt);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          { prompt: prompt }
        ],
        parameters: {
          temperature: 0.2,
          maxOutputTokens: 256,
          topP: 0.8,
          topK: 40,
        }
      })
    });
    
    const data = await response.json();
    
    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('\nResponse body:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('\nError in test:', error);
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      });
    }
  }
}

testVertexAI();
