# AI-Powered Calendar Assistant

A smart calendar application that allows you to manage events using natural language. Built with Next.js, TypeScript, Tailwind CSS, and OpenAI's GPT-3.5 Turbo.

## Features

- 🗓️ Interactive calendar view with month, week, and day views
- 💬 Chat interface for natural language event creation
- 🤖 AI-powered event parsing using OpenAI's function calling
- 📅 Real-time event updates
- 🔄 Drag and drop event rescheduling

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- OpenAI API key
- SQLite (included with Node.js)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- OpenAI API key (get one from [OpenAI](https://platform.openai.com/account/api-keys))

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/ai-calendar.git
cd ai-calendar
```

2. **Run the setup script**

```bash
# Make the script executable if needed
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

3. **Update your environment variables**

After running the setup script, update the `.env` file with your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Start the development server**

```bash
npm run dev
```

5. **Open your browser**

Visit [http://localhost:3000](http://localhost:3000) to see your AI Calendar Assistant in action!

### Manual Setup (Alternative)

If you prefer to set up the project manually, follow these steps:

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (copy from `.env.example` to `.env` and update values)

3. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:

```bash
npm run dev
```

## Usage

1. **View Events**: The calendar displays all your events. Switch between month, week, and day views.
2. **Create Events**: Use natural language in the chat interface to create events. For example:
   - "Add a meeting with John tomorrow at 2pm"
   - "Schedule a dentist appointment next Monday at 10am for 1 hour"
   - "Lunch with Sarah on Friday at 12:30pm"
3. **Edit Events**: Click and drag events to reschedule them, or drag the edges to adjust their duration.
4. **Confirm Events**: The AI will ask for confirmation before creating events. Review the details and confirm or cancel.

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Calendar**: FullCalendar
- **AI**: OpenAI GPT-3.5 Turbo with function calling
- **Database**: SQLite with Prisma ORM

## Project Structure

- `/app` - Next.js app directory with page routes
  - `/api` - API routes for events and AI integration
  - `/calendar` - Main calendar page with chat interface
- `/lib` - Shared utilities and Prisma client
- `/prisma` - Database schema and migrations

## Deployment

### Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import the repository on Vercel
3. Add your `OPENAI_API_KEY` as an environment variable
4. Deploy!

### Self-Hosting

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## License

MIT
