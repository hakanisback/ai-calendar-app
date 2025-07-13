const {GoogleAuth} = require('google-auth-library');
const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

async function testTextBison() {
  try {
    console.log('Testing Text Bison model...');
    
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
    
    // Using the text-bison model
    const modelId = 'text-bison@001';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`;
    
    console.log(`\nSending request to Text Bison (${modelId})...`);
    
    const requestBody = {
      instances: [
        { prompt: 'Tell me a short joke about programming' }
      ],
      parameters: {
        temperature: 0.2,
        maxOutputTokens: 256,
        topP: 0.8,
        topK: 40
      }
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
    
    if (!response.ok) {
      console.error('Error response:', responseText);
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('\n✅ Text Bison response:');
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('\nRaw response:', responseText);
    }
    
  } catch (error) {
    console.error('\n❌ Error testing Text Bison:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testTextBison();
