const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

async function testGeminiAPI() {
  try {
    console.log('Initializing Gemini API...');
    
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not set in .env.local');
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the latest Gemini 1.5 Pro model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro-latest',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
    
    const prompt = 'Tell me a short joke about programming';
    
    console.log(`\nSending prompt: "${prompt}"`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ Gemini API Response:');
    console.log(text);
    
  } catch (error) {
    console.error('\n❌ Error calling Gemini API:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testGeminiAPI();
