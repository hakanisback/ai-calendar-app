'use client';

import { useState, useEffect } from 'react';

export default function CheckVertex() {
  const [status, setStatus] = useState({
    loading: true,
    isEnabled: false,
    error: '',
    serviceInfo: null as any
  });

  useEffect(() => {
    const checkVertexStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, loading: true }));
        const response = await fetch('/api/check-vertex');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check Vertex AI status');
        }
        
        setStatus({
          loading: false,
          isEnabled: data.isEnabled,
          error: '',
          serviceInfo: data.serviceInfo
        });
      } catch (error: any) {
        console.error('Error checking Vertex AI status:', error);
        setStatus({
          loading: false,
          isEnabled: false,
          error: error.message || 'Failed to check Vertex AI status',
          serviceInfo: null
        });
      }
    };

    checkVertexStatus();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Vertex AI Status Check</h1>
      
      {status.loading ? (
        <div>Checking Vertex AI status...</div>
      ) : status.error ? (
        <div className="text-red-600">
          <p>Error: {status.error}</p>
          <p className="mt-4">
            This usually means there's an issue with your Google Cloud setup.
            Please make sure:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>You have a valid Google Cloud project</li>
            <li>Your service account has the necessary permissions</li>
            <li>Your project ID is correct: <code className="bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID}</code></li>
          </ul>
        </div>
      ) : (
        <div>
          <div className={`p-4 rounded-md mb-6 ${
            status.isEnabled 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            <h2 className="text-xl font-semibold mb-2">
              Vertex AI API: {status.isEnabled ? 'Enabled' : 'Not Enabled'}
            </h2>
            
            {!status.isEnabled && (
              <div className="mt-2">
                <p className="mb-2">To enable Vertex AI API:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Go to the <a 
                    href="https://console.cloud.google.com/vertex-ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Vertex AI Dashboard
                  </a></li>
                  <li>Click "Enable API" if prompted</li>
                  <li>Wait a few minutes for the API to be enabled</li>
                  <li>Refresh this page to verify</li>
                </ol>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Service Information:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(status.serviceInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
