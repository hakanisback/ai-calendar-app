'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OneClickScheduleButton } from '@/components/OneClickScheduleButton';
import { CalendarView } from '@/components/CalendarView';
import { CalendarCheck, Clock, Zap, CheckCircle, Calendar, Sparkles } from 'lucide-react';

type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
};

export default function Home() {
  // Sample events for demonstration
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
    },
    {
      id: '2',
      title: 'Lunch Break',
      start: new Date(Date.now() + 7200000).toISOString(),
      end: new Date(Date.now() + 9000000).toISOString(),
    },
  ]);

  const handleSchedule = (updatedEvents: Event[]) => {
    console.log('Scheduled events:', updatedEvents);
    // In a real app, you would update your calendar state here
  };

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "One-Click Scheduling",
      description: "Let AI find the perfect time for your events instantly."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Smart Time Management",
      description: "Automatically avoid conflicts and respect your preferences."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: "Seamless Integration",
      description: "Works with your existing calendar and schedule."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AI Calendar
            </span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/ai-demo" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="/ai-demo" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/ai-demo" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Pricing
            </Link>
          </nav>
          <Button variant="outline" size="sm" asChild>
            <Link href="/ai-demo">Try Demo</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Scheduling
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Smarter Calendar,
              <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Simpler Scheduling</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Let AI handle your calendar so you can focus on what matters most.
                <Link href="/ai-demo">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Assistant
                </Link>
              </Button>
              <OneClickScheduleButton onSchedule={handleSchedule} className="w-full md:w-auto" />
            </div>
          </div>
        </header>

        {/* Main Calendar View */}
        <div className="bg-white rounded-lg shadow mb-12">
          <CalendarView />
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-primary/10 mr-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-semibold">AI Calendar</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} AI Calendar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
