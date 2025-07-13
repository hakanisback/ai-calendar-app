# AI-Powered Calendar Rescheduling

This feature uses Google's Gemini 1.5 Pro model to provide intelligent rescheduling suggestions for your calendar events.

## Features

- **Smart Rescheduling**: Get AI-powered suggestions for rescheduling your calendar events
- **Custom Constraints**: Specify your availability preferences and constraints
- **Natural Language Processing**: Describe your scheduling needs in plain English
- **Responsive UI**: Clean, user-friendly interface with loading states and error handling

## Setup

1. **Environment Variables**:
   Add these to your `.env.local` file:
   ```
   GCP_PROJECT_ID=your-google-cloud-project-id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   ```

2. **Service Account**:
   - Create a service account in Google Cloud Console
   - Enable the Vertex AI API
   - Download the JSON key file and place it in your project directory
   - Update the `GOOGLE_APPLICATION_CREDENTIALS` path

## Usage

1. Click the "AI Reschedule" button in the calendar view
2. Describe what you'd like to reschedule
3. Add any constraints or preferences
4. Review the AI's suggestions
5. Apply the changes to your calendar

## Implementation Details

- **Backend**: Node.js with Next.js API routes
- **AI Model**: Google Gemini 1.5 Pro
- **Frontend**: React with TypeScript
- **State Management**: React hooks

## Cost Considerations

- **Pricing**: Based on token usage (input + output)
- **Estimate**: ~600,000 operations with $1,000 credit
- **Monitoring**: Set up budget alerts in Google Cloud Console

## Error Handling

- Invalid or missing parameters return 400
- Authentication errors return 401
- Server errors return 500 with details in development

## Testing

1. Unit tests: `npm test`
2. Manual testing: Use the demo page at `/calendar`
3. API testing: Use Postman or cURL to test the `/api/ai/reschedule` endpoint
