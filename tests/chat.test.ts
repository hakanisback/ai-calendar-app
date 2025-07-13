// Mock the Next.js server components
jest.mock('next/server', () => {
  const original = jest.requireActual('next/server');
  return {
    ...original,
    NextResponse: {
      ...original.NextResponse,
      json: jest.fn((data, init) => ({
        json: () => Promise.resolve(data),
        status: init?.status || 200,
        ...init,
      })),
    },
  };
});

// Mock the global Response object
class MockResponse {
  private _body: any;
  private _init: ResponseInit;

  constructor(body: any, init: ResponseInit = {}) {
    this._body = body;
    this._init = init;
  }

  get ok() { return this._init.status ? this._init.status >= 200 && this._init.status < 300 : true; }
  get status() { return this._init.status || 200; }
  get statusText() { return this._init.statusText || 'OK'; }
  get headers() { return new Headers(this._init.headers); }
  get type() { return 'default' as const; }
  get url() { return ''; }
  get redirected() { return false; }
  get bodyUsed() { return false; }
  get trailer() { return Promise.resolve(new Headers()); }
  get body() { return null; }
  get bytes() { return 0; }

  clone() { return this; }
  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
  blob() { return Promise.resolve(new Blob()); }
  formData() { return Promise.resolve(new FormData()); }
  json() { return Promise.resolve(this._body); }
  text() { return Promise.resolve(JSON.stringify(this._body)); }
}

// Mock the global Response object
global.Response = MockResponse as any;

// Import the module under test after setting up mocks
import { POST } from '@/app/api/ai/chat/route';
import { createMockRequest, mockOpenAI } from './test-utils';

describe('Chat API', () => {
  // Mock the OpenAI client before all tests
  beforeAll(() => {
    mockOpenAI();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Set up environment variable for tests that need it
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  it('should process a chat message and return a response', async () => {
    // Create a mock request
    const req = createMockRequest('POST', {
      messages: [
        {
          role: 'user',
          content: 'Create a test event',
        },
      ],
    });

    // Call the API
    const response = await POST(req);
    const data = await response.json();

    // Assert the response
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('eventData');
    expect(data.eventData).toHaveProperty('title', 'Test Event');
  });

  it('should handle JSON parsing errors', async () => {
    // Create a mock request with invalid JSON
    const req = createMockRequest('POST', null);
    // Override the json method to throw an error
    jest.spyOn(req, 'json').mockRejectedValueOnce(new Error('Invalid JSON'));

    // Call the API
    const response = await POST(req);
    const data = await response.json();

    // Assert the error response
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
  });

  it('should return 500 if OPENAI_API_KEY is not set', async () => {
    // Ensure OPENAI_API_KEY is not set
    delete process.env.OPENAI_API_KEY;
    
    // Create a mock request
    const req = createMockRequest('POST', {
      messages: [
        {
          role: 'user',
          content: 'Create a test event',
        },
      ],
    });

    // Call the API
    const response = await POST(req);
    const data = await response.json();

    // Assert the error response
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('OpenAI API key not configured');
  });

  it('should handle missing messages in request', async () => {
    // Create a mock request with missing messages
    const req = createMockRequest('POST', {});

    // Call the API
    const response = await POST(req);
    const data = await response.json();

    // Assert the error response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Messages are required');
  });
});
