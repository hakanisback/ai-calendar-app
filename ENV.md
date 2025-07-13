# Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL="file:./dev.db"

# Optional (for production)
# NODE_ENV=production
# NEXT_PUBLIC_BASE_URL=https://your-production-url.com
```

## Getting an OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/account/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it as the value for `OPENAI_API_KEY` in your `.env` file

## Database Configuration

The application uses SQLite by default with Prisma ORM. The database file will be created automatically at `prisma/dev.db` when you run the application for the first time.

For production, you might want to use a different database like PostgreSQL or MySQL. Update the `DATABASE_URL` in your `.env` file accordingly.

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is included in `.gitignore` by default
- For production, make sure to set up proper environment variables in your hosting provider
- Keep your OpenAI API key secure and never expose it in client-side code
