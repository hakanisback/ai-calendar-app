'use client';

import { useState } from 'react';
import { RescheduleButton } from '@/components/RescheduleButton';

type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
};

export default function AIDemoPage() {
  // Sample events for demonstration
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Meeting',
      start: '2025-07-15T10:00:00Z',
      end: '2025-07-15T11:00:00Z',
      description: 'Weekly sync with the development team',
    },
    {
      id: '2',
      title: 'Lunch Break',
      start: '2025-07-15T12:00:00Z',
      end: '2025-07-15T13:00:00Z',
    },
    {
      id: '3',
      title: 'Client Call',
      start: '2025-07-15T14:00:00Z',
      end: '2025-07-15T15:00:00Z',
      description: 'Discuss project requirements',
    },
  ]);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">AI Calendar Assistant</h1>
          <p className="text-muted-foreground">
            Manage your schedule with AI-powered assistance
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Schedule</h2>
            <RescheduleButton 
              events={events} 
              onReschedule={(updatedEvents) => {
                setEvents(updatedEvents);
              }} 
            />
          </div>
          
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No events scheduled. Add some events to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div 
                    key={event.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-right whitespace-nowrap ml-4">
                        <div className="font-medium">
                          {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.start).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
