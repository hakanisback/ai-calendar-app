'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authConfig } from '@/auth';

// Helper function to handle session check
async function checkSession() {
  const session = await getSession();
  return session;
}

export default function RescheduleTest() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Check session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const sessionData = await checkSession();
        setSession(sessionData);
        if (!sessionData) {
          router.push('/api/auth/signin?callbackUrl=/test/reschedule');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setApiError('Failed to verify session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    verifySession();
  }, [router]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-6 text-gray-600">You need to be signed in to access this page.</p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/test/reschedule' })}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }
  const [events, setEvents] = useState(`[
    {
      "id": "1",
      "title": "Team Meeting",
      "start": "2025-07-15T10:00:00Z",
      "end": "2025-07-15T11:00:00Z"
    },
    {
      "id": "2",
      "title": "Lunch Break",
      "start": "2025-07-15T12:00:00Z",
      "end": "2025-07-15T13:00:00Z"
    }
  ]`);
  
  const [constraints, setConstraints] = useState('');
  const [request, setRequest] = useState('I need to schedule a 1-hour client call tomorrow');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setApiError('Please sign in to continue');
      return;
    }
    
    setIsSubmitting(true);
    setApiError('');
    setApiResponse('');
    
    try {
      const parsedEvents = JSON.parse(events);
      
      // Get the JWT token from the session
      const token = await fetch('/api/auth/session')
        .then(res => res.json())
        .then(data => data?.accessToken || '')
        .catch(() => '');
      
      const res = await fetch('/api/ai/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentEvents: parsedEvents,
          constraints,
          request,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate reschedule plan');
      }
      
      setApiResponse(data.plan);
    } catch (err) {
      console.error('Error:', err);
      setApiError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reschedule Test</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Events (JSON):</label>
          <textarea
            value={events}
            onChange={(e) => setEvents(e.target.value)}
            className="w-full h-40 p-2 border rounded font-mono text-sm"
            placeholder="Paste your events array here..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Constraints (optional):</label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            className="w-full h-20 p-2 border rounded"
            placeholder="Enter any scheduling constraints..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Your Request:</label>
          <input
            type="text"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="What would you like to schedule?"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Generating...' : 'Generate Reschedule Plan'}
        </button>
      </form>
      
      {apiError && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{apiError}</p>
        </div>
      )}
      
      {apiResponse && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <h2 className="text-lg font-semibold mb-2">Reschedule Plan:</h2>
          <div className="whitespace-pre-wrap">{apiResponse}</div>
        </div>
      )}
    </div>
  );
}
