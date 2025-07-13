const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function checkVertexSetup() {
  try {
    console.log('Checking Vertex AI setup...');
    
    // Verify environment variables
    const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
    const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_GOOGLE_PROJECT_ID is not set in .env.local');
    }
    
    if (!keyFile) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set in .env.local');
    }
    
    console.log(`Project ID: ${projectId}`);
    console.log(`Service account key file: ${keyFile}`);
    
    // Initialize auth
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFile: keyFile,
    });
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    
    // Test API access
    const location = 'us-central1';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/models`;
    
    console.log('\nTesting API endpoint:', endpoint);
    
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
    console.error('\nError checking Vertex AI setup:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify the service account has these roles:');
    console.log('   - Vertex AI User');
    console.log('   - Service Usage Admin');
    console.log('2. Ensure the Vertex AI API is enabled');
    console.log('3. Check if the project has billing enabled');
    console.log('4. Verify the service account key file exists and is valid');
  }
}

checkVertexSetup();
