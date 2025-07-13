import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601 format
  end: string;   // ISO 8601 format
}

interface RequestBody {
  messages: ChatMessage[];
  events: CalendarEvent[];
  timezone?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_API_KEY is not set');
    return NextResponse.json({ error: 'Server configuration error: API key missing' }, { status: 500 });
  }

  try {
    const { messages: originalMessages, events = [], timezone = 'Europe/Istanbul' }: RequestBody = await request.json();

    if (!originalMessages || originalMessages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }



    const genAI = new GoogleGenerativeAI(apiKey);

    const now = new Date();
    const currentDateStr = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    }).format(now);

            const existingEventsStr = events.length > 0
      ? `The user's calendar already has these events, each with a unique ID: ${events.map(e => `(ID: ${e.id}) \"${e.title}\" from ${new Date(e.start).toLocaleString(undefined, { timeZone: timezone })} to ${new Date(e.end).toLocaleString(undefined, { timeZone: timezone })}`).join('; ')}. `
      : 'The user\'s calendar is currently empty. ';

    const systemInstruction = `You are Kai, a friendly and sharp AI calendar assistant. Your goal is to help users manage their calendar. The user is in the '${timezone}' timezone, and the current date is ${currentDateStr}. ${existingEventsStr}

Your tasks are:
1.  **Schedule Events:** When a user asks to schedule an event, collect the title, date, and time. Check for conflicts with existing events. If a conflict exists, ask the user for confirmation before proceeding. Once all details are clear, respond with a JSON object: { "action": "schedule_event", "eventDetails": { "title": "...", "startTimeISO": "...", "endTimeISO": "..." }, "confirmationMessage": "..." }.
2.  **Cancel Events:** If the user asks to cancel or delete an event, identify the event by its title or time from the list provided. You MUST ask for confirmation before deleting. Once confirmed, respond with a JSON object: { "action": "cancel_event", "eventDetails": { "id": "..." }, "confirmationMessage": "..." }. Use the event's ID from the list.

Always be conversational. Ask for one piece of missing information at a time. Respond ONLY with a valid JSON object when an action is complete. Otherwise, continue the conversation normally.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
      systemInstruction: systemInstruction,
    });

    // The last message must be from the user.
    const lastMessage = originalMessages[originalMessages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Invalid final message. Must be from user.' }, { status: 400 });
    }
    const lastMessageContent = lastMessage.content;

    // Process the rest of the messages for the history
    let historyMessages = originalMessages.slice(0, -1);

    // 1. Find the first user message and discard any preceding assistant messages.
    const firstUserIndex = historyMessages.findIndex(m => m.role === 'user');
    if (firstUserIndex !== -1) {
        historyMessages = historyMessages.slice(firstUserIndex);
    } else {
        historyMessages = []; // No user messages in history, so it's empty
    }

    // 2. Ensure roles alternate correctly, dropping any malformed sequences.
    const validHistory = [];
    if (historyMessages.length > 0) {
        let expectedRole = 'user';
        for (const message of historyMessages) {
            if (message.role === expectedRole) {
                validHistory.push(message);
                expectedRole = expectedRole === 'user' ? 'assistant' : 'user';
            }
        }
    }

    // Convert the valid history to the format required by the SDK.
    const history = validHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model', // Map 'assistant' to 'model'
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessageContent);
    const responseText = result.response.text();

    // Use a regex to find a JSON object within the response text
    // Regex to find a JSON object within ```json ... ``` or as a standalone object.
    const jsonRegex = /```json\s*\n({[\s\S]*?})\n```|({[\s\S]*?})/;
    const match = responseText.match(jsonRegex);

    if (match && (match[1] || match[2])) {
      const jsonString = match[1] || match[2];
      try {
        const parsedResponse = JSON.parse(jsonString);
        
        if (parsedResponse.action === 'schedule_event' && parsedResponse.eventDetails) {
          const eventDetails = parsedResponse.eventDetails;
          const confirmationMessage = parsedResponse.confirmationMessage || 'Event scheduled!';

          const event = {
            id: `evt-${Date.now()}`,
            title: eventDetails.title || 'New Event',
            start: eventDetails.startTimeISO,
            end: eventDetails.endTimeISO,
            description: eventDetails.description,
            location: eventDetails.location,
          };

          return NextResponse.json({ 
            message: { role: 'assistant', content: confirmationMessage },
            action: { type: 'schedule', event: event }
          });
        } else if (parsedResponse.action === 'cancel_event' && parsedResponse.eventDetails?.id) {
            const { id } = parsedResponse.eventDetails;
            const confirmationMessage = parsedResponse.confirmationMessage || 'Event cancelled!';

            return NextResponse.json({
                message: { role: 'assistant', content: confirmationMessage },
                action: { type: 'cancel', eventId: id }
            });
        }
      } catch (e) {
        console.error('Failed to parse extracted JSON:', e);
        // Fall through to return plain text if JSON is invalid
      }
    }

    // If no valid, structured JSON is found, return the response as a plain text message.
    return NextResponse.json({ 
      message: { role: 'assistant', content: responseText },
      event: null 
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
