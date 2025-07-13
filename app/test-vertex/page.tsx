'use client';

import { useState } from 'react';

export default function TestVertexAI() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse('');
    
    try {
      console.log('Sending request to /api/ai/rest-test with prompt:', prompt);
      const res = await fetch('/api/ai/rest-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const responseText = await res.text();
      console.log('Raw response:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }

      if (!res.ok) {
        console.error('API Error:', {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          body: responseData
        });
        
        const errorMessage = responseData?.error?.message || 
                           responseData?.message || 
                           `Request failed with status ${res.status}`;
        throw new Error(errorMessage);
      }

      console.log('API Response:', responseData);
      setResponse(JSON.stringify(responseData, null, 2));
    } catch (err: any) {
      console.error('Error in handleSubmit:', {
        message: err.message,
        stack: err.stack,
        ...(err.response && { response: err.response })
      });
      
      const errorMessage = err.response?.data?.error?.message || 
                         err.response?.data?.message || 
                         err.message || 
                         'Something went wrong';
      
      setError(errorMessage);
      setResponse(JSON.stringify({
        error: errorMessage,
        details: err.response?.data || err.toString()
      }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Vertex AI REST API Test</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your prompt:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border rounded-md min-h-[100px]"
              placeholder="Ask me anything..."
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`px-4 py-2 rounded-md text-white ${
              isLoading || !prompt.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send to Vertex AI'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] text-sm">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
