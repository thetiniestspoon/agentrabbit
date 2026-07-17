import { useState, useCallback } from 'react';
import { supabase } from '../supabase';

interface HireResult {
  hireId: string;
  output: string;
  executionTimeMs: number;
  wasFreeRun: boolean;
  creditsSpent: number;
}

interface HireError {
  message: string;
  code?: string;
}

export function useHireAgent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HireResult | null>(null);
  const [error, setError] = useState<HireError | null>(null);

  const hire = useCallback(async (agentSlug: string, input: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ar-execute-agent', {
        body: { agentSlug, input },
      });

      if (fnError) {
        setError({ message: fnError.message, code: 'FUNCTION_ERROR' });
        return null;
      }

      if (data?.error) {
        setError({ message: data.error, code: data.code });
        return null;
      }

      const hireResult: HireResult = {
        hireId: data.hireId,
        output: data.output,
        executionTimeMs: data.executionTimeMs,
        wasFreeRun: data.wasFreeRun,
        creditsSpent: data.creditsSpent,
      };

      setResult(hireResult);
      return hireResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError({ message, code: 'NETWORK_ERROR' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    hire,
    loading,
    result,
    error,
    reset,
  };
}
