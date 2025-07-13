import { NextRequest } from 'next/server';
import { Readable } from 'stream';

interface MockRequestInit extends RequestInit {
  url?: string;
}

// Create a proper ReadableStream from a string
function stringToReadableStream(str: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(str));
      controller.close();
    }
  });
}

export function createMockRequest(
  method: string = 'GET',
  body: any = null,
  headers: Record<string, string> = { 'Content-Type': 'application/json' },
  url: string = 'http://localhost:3000/api/ai/chat'
): NextRequest {
  const requestInit: MockRequestInit = {
    method,
    headers: new Headers(headers),
  };

  // Create a mock request with proper typing
  const request = new Request(url, requestInit) as unknown as NextRequest;
  
  // Add json method to the request
  Object.defineProperty(request, 'json', {
    value: () => Promise.resolve(body),
    writable: true,
  });
  
  // Add nextUrl property for NextRequest
  Object.defineProperty(request, 'nextUrl', {
    value: new URL(url, 'http://localhost:3000'),
    writable: true,
  });
  
  // Add cookies property for NextRequest
  Object.defineProperty(request, 'cookies', {
    value: {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
    },
    writable: true,
  });
  
  // Add clone method
  request.clone = function() {
    return createMockRequest(method, body, headers, url);
  };
  
  // Add body getter
  Object.defineProperty(request, 'body', {
    get: () => body ? stringToReadableStream(JSON.stringify(body)) : null,
    set: () => {},
  });
  
  // Add bodyUsed property
  Object.defineProperty(request, 'bodyUsed', {
    value: false,
    writable: true,
  });
  
  return request as unknown as NextRequest;
}

export function mockOpenAI() {
  jest.mock('openai', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: 'I can help you create an event.',
                  function_call: {
                    name: 'create_event',
                    arguments: JSON.stringify({
                      title: 'Test Event',
                      start: '2023-01-01T10:00:00Z',
                      end: '2023-01-01T11:00:00Z',
                      description: 'This is a test event',
                    }),
                  },
                },
              },
            ],
          }),
        },
      },
    })),
  }));
}
