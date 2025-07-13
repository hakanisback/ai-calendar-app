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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Calendar Rescheduling</h1>
        <p className="text-muted-foreground">
          Try rescheduling your events with the power of AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Schedule</h2>
              <RescheduleButton 
                events={events} 
                onReschedule={(updatedEvents) => {
                  setEvents(updatedEvents);
                }} 
              />
            </div>
            
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No events scheduled. Add some events to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div 
                      key={event.id}
                      className="p-4 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-right whitespace-nowrap">
                          <div>{new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">How It Works</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>Click the "AI Reschedule" button above</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>Describe what you'd like to reschedule in plain English</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>Add any constraints or preferences</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <p>Review and apply the AI's suggestions</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Example Requests</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const promptInput = document.querySelector('textarea#request');
                  if (promptInput) {
                    (promptInput as HTMLTextAreaElement).value = 
                      'I need to move the team meeting to the afternoon and ensure I have at least 30 minutes between all events.';
                  }
                }}
                className="text-left p-3 bg-muted/50 hover:bg-muted rounded-md text-sm w-full transition-colors"
              >
                "Move the team meeting to the afternoon and ensure I have at least 30 minutes between all events."
              </button>
              <button
                onClick={() => {
                  const promptInput = document.querySelector('textarea#request');
                  if (promptInput) {
                    (promptInput as HTMLTextAreaElement).value = 
                      'I need to schedule a 2-hour focus block for project work tomorrow morning.';
                  }
                }}
                className="text-left p-3 bg-muted/50 hover:bg-muted rounded-md text-sm w-full transition-colors"
              >
                "I need to schedule a 2-hour focus block for project work tomorrow morning."
              </button>
              <button
                onClick={() => {
                  const promptInput = document.querySelector('textarea#request');
                  if (promptInput) {
                    (promptInput as HTMLTextAreaElement).value = 
                      'Can we move all my meetings to next week? I have a deadline on Friday.';
                  }
                }}
                className="text-left p-3 bg-muted/50 hover:bg-muted rounded-md text-sm w-full transition-colors"
              >
                "Can we move all my meetings to next week? I have a deadline on Friday."
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
