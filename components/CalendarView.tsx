'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { Button } from './ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  allDay?: boolean;
  extendedProps?: {
    description?: string;
    location?: string;
  };
}

export function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load events from Google Calendar
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const response = await fetch(
          `/api/calendar/events?start=${now.toISOString()}&end=${thirtyDaysFromNow.toISOString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleEventClick = (clickInfo: any) => {
    // Handle event click (e.g., show event details in a modal)
    console.log('Event clicked:', clickInfo.event);
  };

  const handleDateSelect = (selectInfo: any) => {
    // Handle date selection (e.g., create a new event)
    console.log('Date selected:', selectInfo);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading calendar...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Calendar</h2>
        <Button>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, googleCalendarPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          selectable={true}
          select={handleDateSelect}
          height="auto"
          nowIndicator={true}
          editable={true}
          selectMirror={true}
          dayMaxEvents={true}
          googleCalendarApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
          eventSources={[
            {
              googleCalendarId: 'primary',
              className: 'gcal-event'
            }
          ]}
        />
      </div>
    </div>
  );
}
