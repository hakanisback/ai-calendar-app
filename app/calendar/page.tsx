'use client';

import { useCallback, useEffect, useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getUserTimezone } from '@/lib/timezone';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  allDay?: boolean;
}

type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isLoading?: boolean;
  isError?: boolean;
  event?: {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    timezone?: string;
  } | null;
}

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    // Initialize state from localStorage if available
    if (typeof window !== 'undefined') {
      const savedEvents = localStorage.getItem('calendarEvents');
      if (savedEvents) {
        try {
          return JSON.parse(savedEvents);
        } catch (e) {
          console.error('Failed to parse events from localStorage', e);
          return [];
        }
      }
    }
    return [];
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingEvent, setPendingEvent] = useState<CalendarEvent | null>(null);
  const [message, setMessage] = useState('');

  // Load demo events
  const loadDemoEvents = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const demoEvents = [
      {
        id: '1',
        title: 'Team Standup',
        start: new Date(today.setHours(10, 0, 0)).toISOString(),
        end: new Date(today.setHours(10, 30, 0)).toISOString(),
        description: 'Daily team sync',
      },
      {
        id: '2',
        title: 'Lunch Break',
        start: new Date(today.setHours(12, 0, 0)).toISOString(),
        end: new Date(today.setHours(13, 0, 0)).toISOString(),
        description: 'Time to eat!',
      },
      {
        id: '3',
        title: 'Project Planning',
        start: new Date(tomorrow.setHours(14, 0, 0)).toISOString(),
        end: new Date(tomorrow.setHours(15, 30, 0)).toISOString(),
        description: 'Sprint planning session',
      }
    ];
    
    setEvents(demoEvents);
  }, []);

  // Fetch events for the current user
  const fetchEvents = useCallback(async (uid: string) => {
    try {
      // For demo purposes, we'll use the demo events
      loadDemoEvents();
    } catch (error) {
      console.error('Error fetching events:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: 'Failed to load calendar events. Please try again later.',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [loadDemoEvents]);

  // Handle authentication and initial data loading
  useEffect(() => {
    if (loading) return; // Wait until auth state is determined

    if (!user) {
      // For a logged-out user, if no events are in localStorage, load demo events.
      if (events.length === 0) {
          loadDemoEvents();
      }
    } else {
      fetchEvents(user.uid);
    }
  }, [user, loading, fetchEvents, loadDemoEvents]);

  // Effect to initialize/reset chat with a welcome message on every load
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: "Hi there! What can I help you schedule or change?",
        timestamp: new Date().toISOString(),
      }
    ]);
    // This effect should run on mount to reset the chat state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    } else {
        // If all events are deleted, clear storage
        localStorage.removeItem('calendarEvents');
    }
  }, [events]);

  // Handle event creation
  const handleCreateEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      // For demo purposes, create a new event with a random ID
      const newEvent: CalendarEvent = {
        ...event,
        id: `event-${Date.now()}`,
      };
      
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }, []);

  // Handle event updates
  const handleUpdateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      // For demo purposes, update the event in the local state
      setEvents(prev => 
        prev.map(e => 
          e.id === eventId 
            ? { ...e, ...updates, id: eventId } 
            : e
        )
      );
      
      return { ...updates, id: eventId };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }, []);

  // Handle event deletion
  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      // For demo purposes, just remove the event from local state
      setEvents(prev => prev.filter(e => e.id !== eventId));
      
      // Show success message
      setMessages(prev => [...prev, {
        id: `delete-${Date.now()}`,
        role: 'system',
        content: 'Event deleted successfully',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error deleting event:', error);
      // Show error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Failed to delete event',
        timestamp: new Date().toISOString()
      }]);
      throw error;
    }
  }, []);

  // Handle date selection (for creating new events)
  const handleDateSelect = useCallback((selectInfo: { start: Date; end: Date; allDay: boolean }) => {
    setPendingEvent({
      id: '',
      title: 'New Event',
      start: selectInfo.start.toISOString(),
      end: selectInfo.end.toISOString(),
      allDay: selectInfo.allDay
    });
  }, []);

  // Handle event click (for viewing/editing events)
  const handleEventClick = useCallback((info: { 
    event: { 
      id: string; 
      title: string; 
      start: Date | null; 
      end: Date | null; 
      allDay: boolean;
      extendedProps: { description?: string };
    };
    jsEvent: MouseEvent;
  }) => {
    info.jsEvent.preventDefault();
    info.jsEvent.stopPropagation();
    
    if (!info.event.start || !info.event.end) return;
    
    setPendingEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start.toISOString(),
      end: info.event.end.toISOString(),
      description: info.event.extendedProps.description || '',
      allDay: info.event.allDay || false
    });
  }, []);

  // Handle saving pending event
  const handleSaveEvent = useCallback(async () => {
    if (!pendingEvent) return;
    
    try {
      if (pendingEvent.id) {
        // Update existing event
        await handleUpdateEvent(pendingEvent.id, {
          title: pendingEvent.title,
          start: pendingEvent.start,
          end: pendingEvent.end,
          description: pendingEvent.description,
          allDay: pendingEvent.allDay
        });
      } else {
        // Create new event
        await handleCreateEvent({
          title: pendingEvent.title,
          start: pendingEvent.start,
          end: pendingEvent.end,
          description: pendingEvent.description,
          allDay: pendingEvent.allDay
        });
      }
      setPendingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      // Show error message to user
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Failed to save event. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [pendingEvent, handleCreateEvent, handleUpdateEvent]);

  const sendMessage = useCallback(async (content: string) => {
    if (messages.some(msg => msg.isLoading)) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const tempAssistantMessageId = `temp-${Date.now()}`;
    const tempAssistantMessage: ChatMessage = {
      id: tempAssistantMessageId,
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    const currentHistory = [...messages, userMessage];
    setMessages([...currentHistory, tempAssistantMessage]);

    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentHistory.map(({ role, content }) => ({ role, content })),
          events: events, // Send current events for clash detection
          timezone: userTimezone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown API error occurred');
      }

      const aiMessage: ChatMessage = {
        id: tempAssistantMessageId,
        role: 'assistant',
        content: data.message?.content || 'Sorry, I could not understand the response.',
        timestamp: new Date().toISOString(),
        isLoading: false,
      };

      setMessages(prev => prev.map(msg => (msg.id === tempAssistantMessageId ? aiMessage : msg)));

      // Handle the action from the API (schedule or cancel)
      if (data.action) {
        if (data.action.type === 'schedule' && data.action.event) {
          const newCalEvent: CalendarEvent = {
            id: data.action.event.id || `cal-evt-${Date.now()}`,
            title: data.action.event.title,
            start: data.action.event.start,
            end: data.action.event.end,
            description: data.action.event.description,
          };
          setEvents(prev => [...prev, newCalEvent]);
        } else if (data.action.type === 'cancel' && data.action.eventId) {
          setEvents(prev => prev.filter(e => e.id !== data.action.eventId));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: tempAssistantMessageId,
        role: 'assistant',
        content: `Sorry, an error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        isLoading: false,
        isError: true,
      };
      setMessages(prev => prev.map(msg => (msg.id === tempAssistantMessageId ? errorMessage : msg)));
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        sendMessage(message);
        setMessage('');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Calendar View */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow p-4 h-full">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            nowIndicator={true}
            editable={true}
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            height="100%"
          />
        </div>
      </div>
      
      {/* Chat Panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {msg.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Input Form */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me to schedule or reschedule an event..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={handleKeyDown}
              disabled={messages.some(m => m.isLoading)}
            />
            <button
              type="submit"
              disabled={!message.trim() || messages.some(m => m.isLoading)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {messages.some(m => m.isLoading) ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Event Form Modal */}
      {pendingEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setPendingEvent(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {pendingEvent.id ? 'Edit Event' : 'New Event'}
              </h2>
              <button 
                onClick={() => setPendingEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={pendingEvent.title}
                  onChange={(e) => 
                    setPendingEvent({ ...pendingEvent, title: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start
                </label>
                <input
                  type="datetime-local"
                  value={pendingEvent.start.slice(0, 16)}
                  onChange={(e) =>
                    setPendingEvent({ ...pendingEvent, start: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End
                </label>
                <input
                  type="datetime-local"
                  value={pendingEvent.end.slice(0, 16)}
                  onChange={(e) =>
                    setPendingEvent({ ...pendingEvent, end: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={pendingEvent.description || ''}
                  onChange={(e) =>
                    setPendingEvent({ ...pendingEvent, description: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md h-24"
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <div>
                  {pendingEvent.id && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this event?')) {
                          await handleDeleteEvent(pendingEvent.id!);
                          setPendingEvent(null);
                        }
                      }}
                      className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-500 rounded-md border border-red-500 hover:border-transparent transition-colors"
                    >
                      Delete Event
                    </button>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setPendingEvent(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    disabled={!pendingEvent.title || !pendingEvent.start || !pendingEvent.end}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {pendingEvent.id ? 'Update' : 'Save'} Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
