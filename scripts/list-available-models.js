const {VertexAI} = require('@google-cloud/vertexai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

async function listAvailableModels() {
  try {
    console.log('Listing available models...');
    
    const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
    const location = 'us-central1';
    
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_GOOGLE_PROJECT_ID is not set in .env.local');
    }

    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
      apiEndpoint: `${location}-aiplatform.googleapis.com`,
    });

    // List models
    const models = await vertexAI.preview.getModels();
    
    console.log('\n✅ Available models:');
    models.forEach((model, index) => {
      console.log(`\nModel ${index + 1}:`);
      console.log(`Name: ${model.name}`);
      console.log(`Display Name: ${model.displayName}`);
      console.log(`Description: ${model.description}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('\n❌ Error listing models:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

listAvailableModels();
