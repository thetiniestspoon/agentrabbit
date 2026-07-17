import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export function useCredits() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('ar_credit_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setBalance(data.balance);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    refetch: fetchBalance,
    /** Format credits as dollar amount */
    formatted: `$${(balance / 100).toFixed(2)}`,
    /** Check if user can afford a hire */
    canAfford: (credits: number) => balance >= credits,
  };
}
