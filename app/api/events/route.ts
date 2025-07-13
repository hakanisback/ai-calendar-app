import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase-admin';
import { listEvents, createEvent } from '@/lib/google-calendar';

// Define types for raw query results
type RawEvent = {
  id: string;
  title: string;
  description: string | null;
  start: Date;
  end: Date;
  location: string | null;
  timezone: string;
  userId: string;
  googleEventId: string | null;
  syncStatus: string;
  syncError: string | null;
  createdAt: Date;
  updatedAt: Date;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
};

// Define the event response type
interface EventResponse {
  id: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  location: string | null;
  timezone: string;
  userId: string;
  googleEventId: string | null;
  syncStatus: string;
  syncError: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// Helper function to handle authentication errors
function handleAuthError(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
  console.error('Authentication error:', errorMessage);
  return NextResponse.json(
    { error: errorMessage },
    { status: 401 }
  );
}

// Helper function to handle server errors
function handleServerError(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Internal server error';
  console.error('Server error:', errorMessage);
  return NextResponse.json(
    { error: errorMessage },
    { status: 500 }
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timezone = searchParams.get('timezone') || 'UTC';
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      );
    }

    try {
      // First try to get events from Google Calendar
      const googleEvents = await listEvents(startDate, endDate);
      
      // Format Google Calendar events to match our response type
      const formattedEvents = googleEvents.map(event => ({
        id: event.id || '',
        title: event.summary || 'Untitled Event',
        description: event.description || null,
        start: event.start?.dateTime || event.start?.date || new Date().toISOString(),
        end: event.end?.dateTime || event.end?.date || new Date().toISOString(),
        location: event.location || null,
        timezone: timezone,
        googleEventId: event.id || null,
        syncStatus: 'SYNCED',
        syncError: null,
        userId: event.creator?.email || 'unknown',
        user: {
          id: event.creator?.email || 'unknown',
          name: event.creator?.displayName || null,
          email: event.creator?.email || null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      return NextResponse.json(formattedEvents);
      
    } catch (googleError) {
      console.error('Error fetching from Google Calendar, falling back to database:', googleError);
      
      // Fallback to database if Google Calendar fails
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json(
          { error: 'Authorization header is required' },
          { status: 401 }
        );
      }

      const idToken = authHeader.split('Bearer ')[1];
      if (!idToken) {
        return NextResponse.json(
          { error: 'Bearer token is required' },
          { status: 401 }
        );
      }

      if (!adminAuth) {
        return NextResponse.json(
          { error: 'Firebase Admin SDK not initialized' },
          { status: 500 }
        );
      }

      let uid;
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        uid = decodedToken.uid;
      } catch (authError) {
        return handleAuthError(authError);
      }

      // Get events from database
      const events = await prisma.$queryRaw<RawEvent[]>`
        SELECT 
          e.*,
          u.id as "user_id",
          u.name as "user_name",
          u.email as "user_email"
        FROM "Event" e
        JOIN "User" u ON e."userId" = u.id
        WHERE e."userId" = ${uid}
        AND (
          (e.start >= ${new Date(startDate)} AND e.end <= ${new Date(endDate)}) OR
          (e.start <= ${new Date(startDate)} AND e.end >= ${new Date(endDate)}) OR
          (e.start <= ${new Date(startDate)} AND e.end >= ${new Date(startDate)} AND e.end <= ${new Date(endDate)}) OR
          (e.start >= ${new Date(startDate)} AND e.start <= ${new Date(endDate)} AND e.end >= ${new Date(endDate)})
        )
        ORDER BY e.start ASC
      `;

      const formattedEvents: EventResponse[] = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        location: event.location,
        timezone: event.timezone,
        userId: event.userId,
        googleEventId: event.googleEventId,
        syncStatus: event.syncStatus,
        syncError: event.syncError,
        user: {
          id: event.user_id,
          name: event.user_name,
          email: event.user_email
        },
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString()
      }));

      return NextResponse.json(formattedEvents);
    }

  } catch (error: any) {
    console.error('Error in GET /api/events:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch events',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, start, end, description, location, timezone, userId } = await req.json();
    
    if (!title || !start || !end || !userId) {
      return NextResponse.json(
        { error: 'Title, start, end, and userId are required' },
        { status: 400 }
      );
    }

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK not initialized' },
        { status: 500 }
      );
    }

    // Verify the user with Firebase Admin
    try {
      await adminAuth.getUser(userId);
    } catch (error) {
      console.error('Error verifying user:', error);
      return handleAuthError(error);
    }

    // First try to create the event in Google Calendar
    try {
      const googleEvent = await createEvent({
        summary: title,
        description: description || undefined,
        location: location || undefined,
        start: {
          dateTime: new Date(start).toISOString(),
          timeZone: timezone || 'UTC',
        },
        end: {
          dateTime: new Date(end).toISOString(),
          timeZone: timezone || 'UTC',
        },
        reminders: {
          useDefault: true,
        },
      });

      // If Google Calendar creation succeeds, store in our database
      const result = await prisma.$queryRaw<RawEvent[]>`
        WITH inserted_event AS (
          INSERT INTO "Event" (
            "title", 
            "description", 
            "start", 
            "end", 
            "location", 
            "timezone", 
            "userId",
            "googleEventId",
            "syncStatus",
            "syncError",
            "createdAt", 
            "updatedAt"
          ) 
          VALUES (
            ${title}, 
            ${description || null}, 
            ${new Date(start).toISOString()}::timestamp, 
            ${new Date(end).toISOString()}::timestamp, 
            ${location || null}, 
            ${timezone || 'UTC'}, 
            ${userId},
            ${googleEvent.id || null},
            'SYNCED',
            NULL,
            NOW(), 
            NOW()
          )
          RETURNING *
        )
        SELECT 
          e.*,
          u.id as "user_id",
          u.name as "user_name",
          u.email as "user_email"
        FROM inserted_event e
        JOIN "User" u ON e."userId" = u.id
      `;
      
      const event = result[0];
      if (!event) throw new Error('Failed to create event');

      // Format the response
      const formattedEvent: EventResponse = {
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        location: event.location,
        timezone: event.timezone,
        userId: event.userId,
        googleEventId: event.googleEventId,
        syncStatus: event.syncStatus,
        syncError: event.syncError,
        user: {
          id: event.user_id,
          name: event.user_name,
          email: event.user_email
        },
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString()
      };

      return NextResponse.json(formattedEvent, { status: 201 });

    } catch (googleError) {
      console.error('Error creating Google Calendar event, falling back to local storage:', googleError);
      
      // Fallback to local storage if Google Calendar fails
      const result = await prisma.$queryRaw<RawEvent[]>`
        WITH inserted_event AS (
          INSERT INTO "Event" (
            "title", 
            "description", 
            "start", 
            "end", 
            "location", 
            "timezone", 
            "userId",
            "syncStatus",
            "syncError",
            "createdAt", 
            "updatedAt"
          ) 
          VALUES (
            ${title}, 
            ${description || null}, 
            ${new Date(start).toISOString()}::timestamp, 
            ${new Date(end).toISOString()}::timestamp, 
            ${location || null}, 
            ${timezone || 'UTC'}, 
            ${userId},
            'FAILED',
            ${googleError instanceof Error ? googleError.message : 'Unknown error'},
            NOW(), 
            NOW()
          )
          RETURNING *
        )
        SELECT 
          e.*,
          u.id as "user_id",
          u.name as "user_name",
          u.email as "user_email"
        FROM inserted_event e
        JOIN "User" u ON e."userId" = u.id
      `;
      
      const event = result[0];
      if (!event) throw new Error('Failed to create event');

      // Format the response
      const formattedEvent: EventResponse = {
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        location: event.location,
        timezone: event.timezone,
        userId: event.userId,
        googleEventId: event.googleEventId,
        syncStatus: event.syncStatus,
        syncError: event.syncError,
        user: {
          id: event.user_id,
          name: event.user_name,
          email: event.user_email
        },
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString()
      };

      return NextResponse.json(formattedEvent, { status: 201 });
    }

  } catch (error: any) {
    console.error('Error in POST /api/events:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create event',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
