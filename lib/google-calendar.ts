import { google, calendar_v3 } from 'googleapis';
import { getAuthToken } from '@/auth-utils';

// Define types for Google Calendar API
type GoogleCalendarEvent = calendar_v3.Schema$Event;

// Initialize Google Calendar API
export async function getGoogleAuthClient() {
  const accessToken = await getAuthToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated with Google or missing access token');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    // Add any additional token fields needed
  });

  return oauth2Client;
}

// Helper function to handle Google API errors
function handleGoogleApiError<T>(error: unknown, context: string): T {
  const err = error as Error & { code?: string; message: string };
  console.error(`Google API Error (${context}):`, error);
  
  if (err.code === '401') {
    throw new Error('Authentication failed. Please sign in again.');
  }
  
  if (err.code === '403') {
    throw new Error('Permission denied. Please check your Google Calendar permissions.');
  }
  
  if (err.code === '404') {
    throw new Error('The requested resource was not found.');
  }
  
  throw new Error(`Failed to ${context}: ${err.message || 'Unknown error'}`);
}

export async function listEvents(timeMin: string, timeMax: string): Promise<GoogleCalendarEvent[]> {
  try {
    const auth = await getGoogleAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500, // Maximum allowed by Google Calendar API
      timeZone: 'UTC',
    });

    return response.data.items || [];
  } catch (error) {
    return handleGoogleApiError<GoogleCalendarEvent[]>(error, 'list events');
  }
}

export async function createEvent(event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
  try {
    const auth = await getGoogleAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    // Validate required fields
    if (!event.summary) {
      event.summary = 'New Event';
    }
    
    if (!event.start || !event.end) {
      throw new Error('Event must have start and end times');
    }

    // Format the event for Google Calendar API
    const googleEvent: calendar_v3.Schema$Event = {
      ...event,
      summary: event.summary,
      description: event.description || '',
      location: event.location || '',
      start: {
        dateTime: event.start.dateTime || new Date().toISOString(),
        timeZone: event.start.timeZone || 'UTC',
      },
      end: {
        dateTime: event.end.dateTime || new Date(Date.now() + 3600000).toISOString(),
        timeZone: event.end.timeZone || 'UTC',
      },
      attendees: event.attendees?.map(attendee => ({
        email: attendee.email,
        displayName: attendee.displayName,
        responseStatus: attendee.responseStatus,
      })),
      reminders: event.reminders || {
        useDefault: true,
      },
      // Add conference data for Google Meet
      conferenceData: event.conferenceData || {
        createRequest: {
          requestId: Math.random().toString(36).substring(2, 15),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: googleEvent,
    });

    return response.data;
  } catch (error) {
    return handleGoogleApiError<GoogleCalendarEvent>(error, 'create event');
  }
}

export async function updateEvent(eventId: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  try {
    const auth = await getGoogleAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    // Get the existing event first to preserve fields not being updated
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    // Merge the existing event with the updates
    const updatedEvent: calendar_v3.Schema$Event = {
      ...existingEvent.data,
      ...event,
      // Ensure required fields are preserved
      id: eventId,
      start: event.start || existingEvent.data.start,
      end: event.end || existingEvent.data.end,
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      conferenceDataVersion: 1,
      requestBody: updatedEvent,
      sendUpdates: 'all', // Notify attendees of the update
    });

    return response.data;
  } catch (error) {
    return handleGoogleApiError<GoogleCalendarEvent>(error, 'update event');
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  try {
    const auth = await getGoogleAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all', // Notify attendees
    });
    
    return true;
  } catch (error) {
    // If the event is not found (404) or already deleted (410), consider it successful
    const typedError = error as { code?: string | number; message?: string };
    if (typedError.code === 404 || typedError.code === 410 || typedError.code === '404' || typedError.code === '410') {
      console.log('Event not found or already deleted');
      return true;
    }
    
    return handleGoogleApiError<boolean>(error, 'delete event');
  }
}
