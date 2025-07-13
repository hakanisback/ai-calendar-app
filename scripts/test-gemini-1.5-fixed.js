const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

async function testGemini15() {
  try {
    console.log('Initializing Vertex AI with Gemini 1.5 Pro...');
    
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

    // Use the correct model name for Gemini 1.5 Pro
    const modelName = 'gemini-1.5-pro-002';
    
    console.log(`\nUsing model: ${modelName}`);
    
    // Initialize the model
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
      },
    });

    // Test prompt
    const prompt = {
      contents: [{
        role: 'user',
        parts: [{
          text: 'Tell me a short joke about programming',
        }],
      }],
    };

    console.log('\nSending request to Gemini 1.5 Pro...');
    const response = await generativeModel.generateContent(prompt);
    
    console.log('\n✅ Response from Gemini 1.5 Pro:');
    console.log(JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error testing Gemini 1.5 Pro:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testGemini15();
