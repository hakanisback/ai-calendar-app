import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';

if (!process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_GOOGLE_PROJECT_ID environment variable is not set');
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
}

type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

console.log('Initializing VertexAI with project:', process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID);
console.log('Using credentials from:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Initialize Vertex with your project and location
const vertex = new VertexAI({
  project: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID,
  location: 'us-central1',
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
});

// Initialize the Gemini model
export const generativeModel = vertex.preview.getGenerativeModel({
  // Using the full resource name for the model
  // Format: projects/{project}/locations/{location}/publishers/google/models/{model}
  model: `projects/${process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-pro`,
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.9,
    topP: 1,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

export async function generateText(prompt: string): Promise<string> {
  try {
    const result = await generativeModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });
    return result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text available';
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

export async function chatWithGemini(messages: ChatMessage[]) {
  try {
    const chat = generativeModel.startChat({
      history: messages.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
    
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    return result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text available';
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
}
