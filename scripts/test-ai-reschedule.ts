/**
 * Test script for the AI Rescheduling feature
 * Run with: npx tsx scripts/test-ai-reschedule.ts
 */

import { generateReschedulePlan } from '../lib/gemini';

// Test data
const testEvents = [
  {
    id: 'test-1',
    title: 'Team Sync',
    start: '2025-07-15T10:00:00Z',
    end: '2025-07-15T11:00:00Z',
    description: 'Daily standup with the team'
  },
  {
    id: 'test-2',
    title: 'Lunch Break',
    start: '2025-07-15T12:00:00Z',
    end: '2025-07-15T13:00:00Z'
  },
  {
    id: 'test-3',
    title: 'Client Meeting',
    start: '2025-07-15T14:00:00Z',
    end: '2025-07-15T15:30:00Z',
    description: 'Project kickoff with new client'
  }
];

const testConstraints = `- No meetings before 9 AM or after 5 PM
- Need at least 30 minutes between meetings
- Prefer shorter meetings when possible
- Must include time for lunch between 12 PM - 1 PM`;

const testRequest = `I need to move all my meetings to next week because I'll be out sick tomorrow.`;

async function runTest() {
  console.log('🚀 Starting AI Rescheduling Test...\n');
  
  console.log('📅 Current Schedule:');
  testEvents.forEach(event => {
    console.log(`- ${event.title}: ${new Date(event.start).toLocaleString()} - ${new Date(event.end).toLocaleTimeString()}`);
  });
  
  console.log('\n🔄 Generating reschedule plan...\n');
  
  try {
    const startTime = Date.now();
    
    const result = await generateReschedulePlan({
      currentEvents: testEvents,
      constraints: testConstraints,
      request: testRequest
    });
    
    const duration = Date.now() - startTime;
    
    if (result.success && result.plan) {
      console.log('✅ Success! Here\'s the AI\'s rescheduling plan:\n');
      console.log(result.plan);
      console.log(`\n⏱️  Generated in ${duration}ms`);
    } else {
      console.error('❌ Failed to generate reschedule plan:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
runTest();
