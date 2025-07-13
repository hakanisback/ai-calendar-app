import { GoogleAuth } from 'google-auth-library';

interface VertexAIParams {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export class VertexAIClient {
  private projectId: string;
  private location: string;
  private auth: GoogleAuth;
  private serviceAccountPath: string;

  constructor() {
    this.projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID || '';
    this.location = 'us-central1';
    this.serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
    
    if (!this.projectId) {
      console.error('Missing NEXT_PUBLIC_GOOGLE_PROJECT_ID environment variable');
    }
    
    if (!this.serviceAccountPath) {
      console.error('Missing GOOGLE_APPLICATION_CREDENTIALS environment variable');
    } else {
      console.log('Using service account file:', this.serviceAccountPath);
    }

    try {
      this.auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        keyFilename: this.serviceAccountPath,
      });
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      console.log('Getting access token...');
      const client = await this.auth.getClient();
      const token = await client.getAccessToken();
      
      if (!token.token) {
        throw new Error('Failed to get access token: Token is empty');
      }
      
      console.log('Successfully obtained access token');
      return token.token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting access token:', errorMessage);
      throw new Error(`Failed to get access token: ${errorMessage}`);
    }
  }

  async generateContent(prompt: string, params: VertexAIParams = {}) {
    console.log('Generating content with prompt:', prompt.substring(0, 50) + '...');
    
    // Using the stable text-bison model with the correct endpoint format
    const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/text-bison:predict`;
    
    console.log('API Endpoint:', endpoint);
    
    try {
      const accessToken = await this.getAccessToken();
      
      const requestBody = {
        instances: [
          { 
            prompt: prompt
          }
        ],
        parameters: {
          temperature: params.temperature ?? 0.2,
          maxOutputTokens: params.maxOutputTokens ?? 256,
          topP: params.topP ?? 0.8,
          topK: params.topK ?? 40,
        }
      };

      console.log('Sending request to Vertex AI:', JSON.stringify({
        endpoint,
        headers: {
          'Authorization': 'Bearer [REDACTED]',
          'Content-Type': 'application/json',
        },
        body: {
          ...requestBody,
          instances: [{
            ...requestBody.instances[0],
            prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '')
          }]
        }
      }, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vertex AI API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Vertex AI API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Successfully generated content');
      return responseData;
      
    } catch (error) {
      console.error('Error in generateContent:', error);
      throw error;
    }
  }
}

export const vertexAIClient = new VertexAIClient();
