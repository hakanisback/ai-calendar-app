const {GoogleAuth} = require('google-auth-library');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Use native fetch in Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

async function listPublisherModels() {
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
    
    // List available publisher models
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/models`;
    
    console.log('\nFetching available models...');
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const responseText = await response.text();
    
    console.log('\nResponse status:', response.status);
    
    if (!response.ok) {
      console.error('Error response:', responseText);
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('\n✅ Available models:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.models && data.models.length > 0) {
        console.log('\nModel details:');
        data.models.forEach((model, index) => {
          console.log(`\nModel ${index + 1}:`);
          console.log(`- Name: ${model.name}`);
          console.log(`- Display Name: ${model.displayName || 'N/A'}`);
          console.log(`- Description: ${model.description || 'N/A'}`);
          console.log(`- Version: ${model.versionId || 'N/A'}`);
          console.log(`- Supported Actions: ${model.supportedDeploymentResourcesTypes || 'N/A'}`);
        });
      } else {
        console.log('\nNo models found in this project.');
      }
    } catch (e) {
      console.log('\nCould not parse response as JSON. Raw response:', responseText);
    }
    
  } catch (error) {
    console.error('\n❌ Error listing models:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

listPublisherModels();
