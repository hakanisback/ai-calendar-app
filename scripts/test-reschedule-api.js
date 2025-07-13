const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Helper function to get CSRF token from HTML
async function getCSRFToken() {
  try {
    const response = await fetch('http://localhost:3000/auth/signin');
    const html = await response.text();
    const csrfTokenMatch = html.match(/name="csrfToken" value="([^"]+)"/);
    return csrfTokenMatch ? csrfTokenMatch[1] : null;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return null;
  }
}

async function testRescheduleAPI() {
  try {
    // First, try to get the session directly from the API
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    let sessionData;
    const contentType = sessionResponse.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      sessionData = await sessionResponse.json();
    } else {
      console.log('Session endpoint returned HTML, trying to sign in...');
      // If we get HTML, we need to sign in first
      const csrfToken = await getCSRFToken();
      if (!csrfToken) {
        console.error('Could not get CSRF token');
        return;
      }
      
      // Perform sign in (replace with your actual credentials if needed)
      const signInResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          csrfToken: csrfToken,
          callbackUrl: 'http://localhost:3000/test/reschedule',
          json: 'true',
          // Add your credentials here if needed
        }),
      });
      
      if (!signInResponse.ok) {
        console.error('Sign in failed:', await signInResponse.text());
        return;
      }
      
      // Try to get the session again after sign in
      const newSessionResponse = await fetch('http://localhost:3000/api/auth/session', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!newSessionResponse.ok) {
        console.error('Failed to get session after sign in');
        return;
      }
      
      sessionData = await newSessionResponse.json();
    }
    
    if (!sessionData?.user) {
      console.error('No user session found. Please sign in first.');
      console.log('Session data:', sessionData);
      return;
    }

    console.log('Successfully authenticated as:', sessionData.user.email);

    // Test data
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

    // Make the API request
    console.log('Sending request to reschedule API...');
    const response = await fetch('http://localhost:3000/api/ai/reschedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.accessToken}`
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error from API:', data);
      return;
    }

    console.log('✅ Success! Reschedule plan:');
    console.log(data.plan);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRescheduleAPI();
