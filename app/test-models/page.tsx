'use client';

import { useState, useEffect } from 'react';

export default function TestModels() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ai/list-models');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch models');
        }
        
        setModels(data.models || []);
      } catch (err: any) {
        console.error('Error fetching models:', err);
        setError(err.message || 'Failed to load models');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Available Vertex AI Models</h1>
      
      {loading ? (
        <div>Loading models...</div>
      ) : error ? (
        <div className="text-red-600">
          <p>Error: {error}</p>
          <p className="mt-4 text-sm">
            Make sure you have the Vertex AI API enabled and proper permissions set up.
            You can enable it at: <br/>
            <a 
              href="https://console.cloud.google.com/vertex-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Google Cloud Console - Vertex AI
            </a>
          </p>
        </div>
      ) : models.length === 0 ? (
        <div>
          <p>No models found in your project.</p>
          <p className="mt-2">
            You may need to enable the Vertex AI API or deploy a model first.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Models:</h2>
          <ul className="list-disc pl-5 space-y-2">
            {models.map((model) => (
              <li key={model.name} className="font-mono text-sm">
                {model.displayName || model.name}
                <div className="text-xs text-gray-500">
                  {model.name}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
