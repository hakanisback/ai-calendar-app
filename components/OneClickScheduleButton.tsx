'use client';

import { useState } from 'react';
import { Event } from '@/lib/gemini';
import { useCalendarAI } from '@/hooks/useCalendarAI';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

type OneClickScheduleButtonProps = {
  events: Event[];
  onSchedule: (updatedEvents: Event[]) => void;
  buttonText?: string;
  className?: string;
};

export function OneClickScheduleButton({
  events,
  onSchedule,
  buttonText = 'Auto-Schedule',
  className = '',
}: OneClickScheduleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { generateReschedulePlan } = useCalendarAI({
    onSuccess: (plan) => {
      try {
        // Parse the plan to extract the updated events
        // This is a simplified example - in a real app, you'd want to properly parse the plan
        // and update the events with the new dates/times
        const updatedEvents = [...events];
        onSchedule(updatedEvents);
        toast.success('Events scheduled successfully!');
      } catch (error) {
        console.error('Error applying schedule:', error);
        toast.error('Failed to apply schedule. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Error generating schedule:', error);
      toast.error('Failed to generate schedule. Please try again.');
      setIsLoading(false);
    },
  });

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await generateReschedulePlan({
        currentEvents: events,
        constraints: 'Automatically find the best time for all events based on availability.',
        request: 'Please schedule all events at optimal times, avoiding conflicts and considering typical working hours.',
      });
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleClick}
      disabled={isLoading || !events.length}
      className={`gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Scheduling...
        </>
      ) : (
        <>
          <CalendarCheck className="h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
