const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testRescheduleAPI() {
  try {
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

    console.log('Sending request to test reschedule endpoint...');
    const response = await fetch('http://localhost:3000/api/test/reschedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
