const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');
require('dotenv').config();

async function testVertexAI() {
  try {
    console.log('Authenticating with Google Cloud...');
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID || 'sirschedule-main';
    const location = 'us-central1';
    
    console.log('Project ID:', projectId);
    console.log('Location:', location);
    
    // Test the Vertex AI endpoint
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/models`;
    
    console.log('\nTesting endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const responseText = await response.text();
    console.log('\nResponse status:', response.status);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Raw response:', responseText);
    }
    
  } catch (error) {
    console.error('\nError:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
  }
}

testVertexAI();
