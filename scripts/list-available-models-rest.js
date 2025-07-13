const {GoogleAuth} = require('google-auth-library');
const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

async function listAvailableModels() {
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
      if (data.models && data.models.length > 0) {
        console.log('\n✅ Available models:');
        data.models.forEach(model => {
          console.log(`- ${model.name} (${model.displayName || 'No display name'})`);
        });
      } else {
        console.log('\nNo models found in this project.');
        console.log('You may need to enable the Vertex AI API or deploy a model first.');
      }
    } catch (e) {
      console.log('\nCould not parse response as JSON. Raw response:', responseText);
    }
    
    // List available publisher models
    const publisherModelsEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models`;
    
    console.log('\nFetching available publisher models...');
    const publisherResponse = await fetch(publisherModelsEndpoint, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const publisherResponseText = await publisherResponse.text();
    
    console.log('\nPublisher models response status:', publisherResponse.status);
    
    if (!publisherResponse.ok) {
      console.error('Error response for publisher models:', publisherResponseText);
    } else {
      try {
        const data = JSON.parse(publisherResponseText);
        if (data.models && data.models.length > 0) {
          console.log('\n✅ Available publisher models:');
          data.models.forEach(model => {
            console.log(`- ${model.name} (${model.displayName || 'No display name'})`);
          });
        } else {
          console.log('\nNo publisher models found.');
        }
      } catch (e) {
        console.log('\nCould not parse publisher models response as JSON. Raw response:', publisherResponseText);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error listing models:');
    console.error(error.message);
  }
}

listAvailableModels();
