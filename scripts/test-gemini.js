require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { generateText } = require('../lib/vertex-ai');

async function testGemini() {
  try {
    console.log('Testing Gemini integration...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID);
    console.log('Credentials path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    const prompt = 'Hello! Can you tell me a short joke about programming?';
    console.log('\nSending prompt:', prompt);
    
    const response = await generateText(prompt);
    console.log('\n✅ Gemini Response:');
    console.log(response);
    
    console.log('\n✅ Gemini integration test successful!');
  } catch (error) {
    console.error('\n❌ Error testing Gemini:');
    console.error(error);
    
    if (error.message.includes('ENOENT')) {
      console.error('\nMake sure the service account key file exists at the specified path.');
      console.error('Current GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    }
    
    if (error.message.includes('Could not load the default credentials')) {
      console.error('\nAuthentication failed. Please verify:');
      console.error('1. The service account key file exists and is valid');
      console.error('2. The service account has the correct permissions');
      console.error('3. The GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly');
    }
  }
}

testGemini();
