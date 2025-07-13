import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI-Powered Calendar
          </h1>
          <p className="text-lg text-muted-foreground">
            Intelligent scheduling powered by Google's Gemini AI
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/ai-demo">
              Try AI Rescheduling
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/simple">
              View Simple Calendar
            </Link>
          </Button>
        </div>
        
        <div className="pt-8 text-sm text-muted-foreground">
          <p>Powered by Next.js, Google Gemini AI, and Firebase</p>
        </div>
      </div>
    </div>
  );
}
