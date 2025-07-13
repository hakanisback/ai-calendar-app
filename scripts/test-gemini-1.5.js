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

    // Initialize the Gemini model
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: 'gemini-1.5-pro-001',
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
    console.log(response.response.candidates[0].content.parts[0].text);
    
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
