import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Get the Gemini Pro model
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro-latest',
  generationConfig: {
    temperature: 0.3,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

export interface ReschedulePlan {
  success: boolean;
  plan?: string;
  error?: string;
}

export async function generateReschedulePlan(params: {
  currentEvents: Event[];
  constraints: string;
  request: string;
}): Promise<ReschedulePlan> {
  const { currentEvents, constraints, request } = params;
  
  const prompt = `
    You are an AI scheduling assistant. Help reschedule the user's calendar.
    
    Current Events (in UTC):
    ${JSON.stringify(currentEvents, null, 2)}
    
    User Constraints:
    ${constraints}
    
    User Request:
    ${request}
    
    Please provide a detailed rescheduling plan that considers the following:
    1. Time zone awareness (all times are in UTC)
    2. No overlapping events
    3. Respect user's working hours (9 AM - 5 PM by default unless specified)
    4. Include buffer times between meetings
    5. Prioritize events based on importance
    
    Format your response with clear sections and bullet points.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const plan = response.text();
    
    return {
      success: true,
      plan
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating reschedule plan:', errorMessage);
    return {
      success: false,
      error: errorMessage || 'Failed to generate reschedule plan'
    };
  }
}
