import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const functions: OpenAI.ChatCompletionCreateParams.Function[] = [
  {
    name: 'create_event',
    description: 'Parse a natural-language scheduling request into a calendar event',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short event title' },
        description: { type: 'string', description: 'Optional longer description' },
        start: {
          type: 'string',
          description: 'ISO 8601 date-time string for event start',
        },
        end: {
          type: 'string',
          description: 'ISO 8601 date-time string for event end',
        },
      },
      required: ['title', 'start', 'end'],
    },
  },
];

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that converts natural language scheduling requests into structured event data.',
        },
        { role: 'user', content: prompt },
      ],
      functions,
      function_call: { name: 'create_event' },
    });

    const choice = completion.choices[0];
    const args = choice.message.function_call?.arguments;

    return NextResponse.json({ data: JSON.parse(args || '{}') });
  } catch (err: unknown) {
    console.error('OpenAI API error:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: `OpenAI error: ${errorMessage}` }, { status: 500 });
  }
}
