const {VertexAI} = require('@google-cloud/vertexai');
require('dotenv').config();

async function testVertexAI() {
  try {
    console.log('Initializing Vertex AI...');
    
    // Initialize Vertex with your project and location
    const vertexAI = new VertexAI({
      project: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID || 'sirschedule-main',
      location: 'us-central1',
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    
    console.log('Vertex AI initialized successfully');
    
    // Try to list models
    console.log('Listing models...');
    const modelsClient = new vertexAI.preview.PredictionServiceClient();
    const [models] = await modelsClient.listModels({
      parent: `projects/${process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID}/locations/us-central1`
    });
    
    console.log('Available models:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
    });
    
  } catch (error) {
    console.error('\nError testing Vertex AI:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\nTroubleshooting:');
    console.log('1. Verify the service account has the correct permissions');
    console.log('2. Check if the Vertex AI API is enabled');
    console.log('3. Ensure the project ID and location are correct');
  }
}

testVertexAI();
