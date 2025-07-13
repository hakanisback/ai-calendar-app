import { useState } from 'react';
import { Event } from '@/lib/gemini';

interface UseCalendarAIOptions {
  onSuccess?: (plan: string) => void;
  onError?: (error: string) => void;
}

export function useCalendarAI(options?: UseCalendarAIOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  const generateReschedulePlan = async (params: {
    currentEvents: Event[];
    constraints?: string;
    request: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentEvents: params.currentEvents,
          constraints: params.constraints,
          request: params.request,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate reschedule plan');
      }

      setPlan(data.plan);
      options?.onSuccess?.(data.plan);
      return data.plan;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while generating the reschedule plan';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    generateReschedulePlan, 
    isLoading, 
    error, 
    plan,
    reset: () => {
      setError(null);
      setPlan(null);
    }
  };
}
