'use client';
import { useState } from 'react';

type TestCase = {
  name: string;
  currentEvents: any[];
  constraints: string;
  request: string;
};

export default function SimpleTestPage() {
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTest, setActiveTest] = useState<string>('empty');

  const testCases: Record<string, TestCase> = {
    empty: {
      name: 'Empty Schedule',
      currentEvents: [],
      constraints: 'No constraints',
      request: 'Schedule a 1-hour team meeting tomorrow afternoon'
    },
    busy: {
      name: 'Busy Schedule',
      currentEvents: [
        {
          id: '1',
          title: 'Team Standup',
          start: '2025-07-14T09:00:00.000Z',
          end: '2025-07-14T10:00:00.000Z'
        },
        {
          id: '2',
          title: 'Lunch Break',
          start: '2025-07-14T12:00:00.000Z',
          end: '2025-07-14T13:00:00.000Z'
        },
        {
          id: '3',
          title: 'Client Call',
          start: '2025-07-14T14:00:00.000Z',
          end: '2025-07-14T15:30:00.000Z'
        }
      ],
      constraints: [
        '- Working hours: 9:00 AM - 6:00 PM',
        '- No meetings before 9:00 AM or after 6:00 PM',
        '- At least 15 minutes between meetings',
        '- No meetings during lunch (12:00 PM - 1:00 PM)'
      ].join('\n'),
      request: 'Find a 1-hour slot for a team sync'
    }
  };

  const testAPI = async (testCase: TestCase) => {
    setIsLoading(true);
    setOutput('Calling API...');
    
    try {
      const response = await fetch('/api/ai/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEvents: testCase.currentEvents,
          constraints: testCase.constraints,
          request: testCase.request
        })
      });
      
      const data = await response.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setOutput(`Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = (testKey: string) => {
    setActiveTest(testKey);
    testAPI(testCases[testKey]);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AI Calendar - API Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(testCases).map(([key, test]) => (
            <button
              key={key}
              onClick={() => runTest(key)}
              disabled={isLoading}
              className={`px-4 py-2 rounded ${
                activeTest === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {test.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Data</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Current Events:</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded mb-4 overflow-auto max-h-40">
              {JSON.stringify(testCases[activeTest].currentEvents, null, 2)}
            </pre>
            
            <h3 className="font-medium mb-2">Constraints:</h3>
            <pre className="whitespace-pre-line text-sm bg-gray-100 p-2 rounded mb-4">
              {testCases[activeTest].constraints}
            </pre>
            
            <h3 className="font-medium mb-2">Request:</h3>
            <p className="bg-gray-100 p-2 rounded">{testCases[activeTest].request}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">API Response</h2>
          <div className="bg-white p-4 rounded-lg shadow h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : output ? (
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {output}
              </pre>
            ) : (
              <div className="text-gray-500 italic">
                Click a test case to see the API response
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
