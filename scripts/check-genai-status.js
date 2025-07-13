const {GoogleAuth} = require('google-auth-library');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Use native fetch in Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

async function checkGenAIStatus() {
  try {
    console.log('Checking Generative AI status...');
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_GOOGLE_PROJECT_ID is not set in environment variables');
    }
    
    // Check Vertex AI API status
    const serviceUsageEndpoint = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/aiplatform.googleapis.com`;
    
    console.log('\nChecking Vertex AI API status...');
    const serviceResponse = await fetch(serviceUsageEndpoint, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const serviceData = await serviceResponse.json();
    
    console.log('\nVertex AI API Status:');
    console.log(`- Name: ${serviceData.name}`);
    console.log(`- State: ${serviceData.state}`);
    
    if (serviceData.state !== 'ENABLED') {
      console.log('\n❌ Vertex AI API is not enabled. Please enable it from the Google Cloud Console.');
      console.log(`Visit: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=${projectId}`);
      return;
    }
    
    console.log('\n✅ Vertex AI API is enabled.');
    
    // Check if the project has access to the Generative AI features
    const endpoint = `https://${projectId}.aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/us-central1/featureOnlineStores`;
    
    console.log('\nChecking Generative AI features...');
    const featureResponse = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!featureResponse.ok) {
      const errorData = await featureResponse.json();
      console.log('\nFeature check response:', errorData);
      
      if (featureResponse.status === 403) {
        console.log('\n❌ Your project might not have access to the Generative AI features.');
        console.log('Please ensure you have the following IAM roles:');
        console.log('- roles/aiplatform.user');
        console.log('- roles/serviceusage.serviceUsageViewer');
        console.log('\nYou can add these roles to your service account at:');
        console.log(`https://console.cloud.google.com/iam-admin/iam?project=${projectId}`);
      }
      return;
    }
    
    const featureData = await featureResponse.json();
    console.log('\nGenerative AI features:', JSON.stringify(featureData, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error checking Generative AI status:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

checkGenAIStatus();
