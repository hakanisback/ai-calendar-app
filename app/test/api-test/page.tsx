'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function APITestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    if (status !== 'authenticated') {
      setError('Please sign in first');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const testData = {
        currentEvents: [
          {
            id: "1",
            title: "Team Meeting",
            start: "2025-07-15T10:00:00Z",
            end: "2025-07-15T11:00:00Z"
          },
          {
            id: "2",
            title: "Lunch Break",
            start: "2025-07-15T12:00:00Z",
            end: "2025-07-15T13:00:00Z"
          }
        ],
        constraints: "- No meetings before 9 AM\n- Must have at least 30 minutes between meetings",
        request: "Schedule a 1-hour client call tomorrow"
      };

      console.log('Sending request with data:', testData);
      const res = await fetch('/api/test/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const text = await res.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Failed to parse JSON: ${text}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
        <p className="mb-6">You need to sign in to test the API</p>
        <button
          onClick={() => signIn('google')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Test Page</h1>
        <div className="text-sm text-gray-600">
          Signed in as {session.user?.email}
        </div>
      </div>
      
      <button
        onClick={testAPI}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        {isLoading ? 'Testing...' : 'Test Reschedule API'}
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="font-bold mb-2">Error:</h2>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {response && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <pre className="p-4 bg-gray-100 rounded overflow-auto">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
