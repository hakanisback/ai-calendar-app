const {GoogleAuth} = require('google-auth-library');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Use native fetch in Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

async function testGemini() {
  try {
    console.log('Authenticating with Google Cloud...');
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
    const location = 'us-central1';
    
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_GOOGLE_PROJECT_ID is not set in environment variables');
    }
    
    console.log(`\nProject: ${projectId}`);
    console.log(`Location: ${location}`);
    
    // Gemini 1.5 Pro endpoint
    const modelId = 'gemini-1.5-pro-002';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:streamGenerateContent`;
    
    console.log(`\nSending request to Gemini 1.5 Pro (${modelId})...`);
    
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{
          text: 'Tell me a short joke about programming'
        }]
      }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
      },
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const responseText = await response.text();
    
    console.log('\nResponse status:', response.status);
    console.log('Response headers:', JSON.stringify(response.headers.raw(), null, 2));
    
    if (!response.ok) {
      console.error('Error response:', responseText);
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('\n✅ Gemini 1.5 Pro response:');
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('\nRaw response:', responseText);
    }
    
  } catch (error) {
    console.error('\n❌ Error testing Gemini 1.5 Pro:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testGemini();
