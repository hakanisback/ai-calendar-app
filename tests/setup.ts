// Mock the global Request object
class MockRequest extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    super(url, init);
  }
}

global.Request = MockRequest as any;

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

global.Response = MockResponse as any;

// Mock the Next.js server components
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      ...init,
    })),
  },
}));
