const {PredictionServiceClient} = require('@google-cloud/aiplatform').v1;
const {helpers} = require('@google-cloud/aiplatform/build/src/helpers');

async function listModels() {
  console.log('Listing available models...');
  
  const client = new PredictionServiceClient({
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
  
  const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
  const location = 'us-central1';
  const parent = `projects/${projectId}/locations/${location}`;
  
  console.log(`Project: ${projectId}`);
  console.log(`Location: ${location}`);
  
  try {
    // List available models
    const [models] = await client.listModels({
      parent,
    });
    
    console.log('\n=== Available Models ===');
    if (models.length === 0) {
      console.log('No models found in this project.');
      console.log('You may need to enable the Vertex AI API or deploy a model first.');
      return;
    }
    
    models.forEach(model => {
      console.log(`\nModel: ${model.name}`);
      console.log(`Display Name: ${model.displayName || 'N/A'}`);
      console.log(`Description: ${model.description || 'N/A'}`);
      console.log(`Supported Actions: ${model.supportedDeploymentResourcesTypes || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('\nError listing models:');
    console.error(error.message);
    
    if (error.details) {
      console.error('\nError details:');
      console.error(JSON.stringify(error.details, null, 2));
    }
    
    console.log('\nMake sure:');
    console.log('1. The Vertex AI API is enabled for your project');
    console.log('2. Your service account has the necessary permissions');
    console.log('3. The project ID and location are correct');
  }
}

listModels();
