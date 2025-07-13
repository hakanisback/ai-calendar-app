const {GoogleAuth} = require('google-auth-library');
const fetch = require('node-fetch');
require('dotenv').config();

async function listModels() {
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
    
    // List available models
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/models`;
    
    console.log('\nFetching models...');
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Invalid JSON response from Vertex AI API');
    }
    
    if (!response.ok) {
      console.error('Error response from Vertex AI API:', data);
      throw new Error(`Failed to list models: ${data.error?.message || 'Unknown error'}`);
    }
    
    console.log('\n=== Available Models ===');
    if (!data.models || data.models.length === 0) {
      console.log('No models found in this project.');
      console.log('You may need to enable the Vertex AI API or deploy a model first.');
      return;
    }
    
    data.models.forEach(model => {
      console.log('\nModel:', model.name);
      console.log('Display Name:', model.displayName || 'N/A');
      console.log('Description:', model.description || 'N/A');
      console.log('Version:', model.versionId || 'N/A');
      console.log('Supported Actions:', model.supportedDeploymentResourcesTypes || 'N/A');
    });
    
  } catch (error) {
    console.error('\nError:', error.message);
    
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the Vertex AI API is enabled at: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com');
    console.log('2. Verify your service account has the "AI Platform Admin" role');
    console.log('3. Check that your project has billing enabled');
    console.log('4. Ensure the project ID and location are correct');
  }
}

listModels();
