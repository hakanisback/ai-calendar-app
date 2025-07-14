'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function TestGeminiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGemini = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/test-gemini');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to test Gemini API');
      }
      
      setResult(data);
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message || 'An error occurred while testing Gemini API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Gemini API Test</h1>
      
      <div className="space-y-4">
        <Button 
          onClick={testGemini}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Gemini Connection'
          )}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-700 font-medium">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-green-700 font-medium">Success!</h3>
              <p className="text-green-600">Gemini API is working correctly.</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="font-medium mb-2">Response from Gemini:</h3>
              <div className="whitespace-pre-wrap bg-white p-4 rounded border">
                {result.response}
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/10 text-sm">
              <h3 className="font-medium mb-2">Raw Response:</h3>
              <pre className="overflow-auto max-h-60 p-2 bg-black/5 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
