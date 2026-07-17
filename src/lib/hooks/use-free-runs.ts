import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const MAX_FREE_RUNS = 3;

export function useFreeRuns() {
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUsed(0);
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('ar_free_runs')
      .select('count')
      .eq('user_id', user.id)
      .eq('run_date', today)
      .single();

    if (!error && data) {
      setUsed(data.count);
    } else {
      setUsed(0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    used,
    remaining: Math.max(0, MAX_FREE_RUNS - used),
    max: MAX_FREE_RUNS,
    loading,
    refetch: fetchUsage,
    hasFreePuns: MAX_FREE_RUNS - used > 0,
  };
}
