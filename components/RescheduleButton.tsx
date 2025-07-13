'use client';

import { useState, useCallback } from 'react';
import { Event } from '@/lib/gemini';
import { useCalendarAI } from '@/hooks/useCalendarAI';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

export function RescheduleButton({
  events,
  onReschedule,
}: {
  events: Event[];
  onReschedule?: (updatedEvents: Event[]) => void;
}) {
  const [constraints, setConstraints] = useState('');
  const [request, setRequest] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { 
    generateReschedulePlan, 
    plan,
    isLoading, 
    error,
    reset
  } = useCalendarAI({
    onSuccess: (data) => {
      console.log('Reschedule plan generated:', data);
      // Auto-scroll to the plan when it's ready
      setTimeout(() => {
        const planElement = document.getElementById('ai-plan');
        planElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (err) => {
      console.error('Error generating reschedule plan:', err);
    },
  });

  const handleRequestChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequest(e.target.value);
  }, []);

  const handleConstraintsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConstraints(e.target.value);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;
    
    try {
      await generateReschedulePlan({
        currentEvents: events,
        constraints: constraints || '',
        request,
      });
    } catch (error) {
      console.error('Error generating reschedule plan:', error);
    }
  };

  const handleApplyChanges = () => {
    if (plan && onReschedule) {
      try {
        // Parse the plan to extract the updated events
        const updatedEvents = [...events];
        // This is a simplified example - in a real app, you'd want to properly parse the plan
        // and update the events with the new dates/times
        onReschedule(updatedEvents);
        reset();
        setIsOpen(false);
      } catch (err) {
        console.error('Error applying changes:', err);
      }
    }
  };

  // This function is kept for future implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApply = () => {
    // This is a simplified version. In a real app, you'd parse the AI's response
    // and update the calendar events accordingly.
    alert('In a real implementation, this would apply the suggested changes to your calendar.');
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          AI Reschedule
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI-Powered Rescheduling</DialogTitle>
          <DialogDescription>
            Let AI help you find the best time for your events based on your preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
          <div className="space-y-2">
            <Label htmlFor="request">What would you like to reschedule?</Label>
            <Textarea
              id="request"
              placeholder="E.g., I need to schedule a team meeting next week, and I have a dentist appointment on Wednesday at 2 PM"
              value={request}
              onChange={handleRequestChange}
              className="min-h-[100px]"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="constraints">Any constraints or preferences?</Label>
            <Textarea
              id="constraints"
              placeholder="E.g., No meetings after 4 PM, prefer mornings for deep work, must include time zone: Europe/Istanbul"
              value={constraints}
              onChange={handleConstraintsChange}
              className="min-h-[80px]"
              disabled={isLoading}
            />
          </div>

          <div className="flex-1 flex flex-col space-y-2">
            <Label>Suggested Reschedule Plan</Label>
            <ScrollArea className="border rounded-md p-4 flex-1 bg-muted/20 h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="sr-only">Generating plan...</span>
                </div>
              ) : error ? (
                <div className="text-destructive">{error}</div>
              ) : plan ? (
                <div className="space-y-2">
                  {plan.split('\n').map((line: string, i: number) => (
                    <p key={i} className="text-sm">
                      {line || <br />}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  Enter your request and click "Generate Plan" to see suggestions.
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsOpen(false);
                reset();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button 
                type="submit" 
                disabled={isLoading || !request.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </Button>
              
              {plan && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyChanges}
                  className="flex-1"
                >
                  Apply Changes
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
