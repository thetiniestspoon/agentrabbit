import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/prototype/Nav";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  Coins,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface HireRecord {
  id: string;
  agent_id: string;
  input_data: Record<string, unknown>;
  output_data: { text: string } | null;
  credits_spent: number;
  was_free_run: boolean;
  tier: string;
  status: string;
  execution_time_ms: number | null;
  created_at: string;
  ar_agents: {
    name: string;
    emoji: string;
    slug: string;
  };
}

export default function Activity() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hires, setHires] = useState<HireRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    async function fetchHires() {
      const { data, error } = await supabase
        .from("ar_hires")
        .select("*, ar_agents(name, emoji, slug)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setHires(data as unknown as HireRecord[]);
      }
      setLoading(false);
    }

    fetchHires();
  }, [isAuthenticated, authLoading, navigate]);

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  function formatTime(ms: number | null): string {
    if (!ms) return "--";
    return `${(ms / 1000).toFixed(1)}s`;
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-sage" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-terra animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-warm-lighter" />;
    }
  };

  // Stats
  const totalSpent = hires.reduce((sum, h) => sum + h.credits_spent, 0);
  const totalHires = hires.length;
  const freeHires = hires.filter((h) => h.was_free_run).length;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Nav />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl md:text-3xl mb-2">Activity</h1>
        <p className="text-warm-light text-sm mb-6">Your recent hires</p>

        {/* Stats bar */}
        {!loading && hires.length > 0 && (
          <div className="flex gap-4 mb-6 text-sm">
            <span className="bg-card rounded-lg border border-border px-3 py-1.5">
              {totalHires} hires
            </span>
            <span className="bg-card rounded-lg border border-border px-3 py-1.5 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-terra" />
              {(totalSpent / 100).toFixed(2)} spent
            </span>
            {freeHires > 0 && (
              <span className="bg-card rounded-lg border border-border px-3 py-1.5 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-honey" />
                {freeHires} free
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-terra animate-spin mx-auto mb-4" />
            <p className="text-warm-light">Loading your activity...</p>
          </div>
        ) : hires.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🐰</span>
            <h2 className="text-xl mb-2">No hires yet</h2>
            <p className="text-warm-light mb-6">
              Hire a helper to see your activity here.
            </p>
            <Link
              to="/home"
              className="px-6 py-2.5 rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold transition-colors inline-block"
            >
              Browse helpers
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {hires.map((hire) => (
              <div
                key={hire.id}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Header row */}
                <button
                  onClick={() => toggleExpand(hire.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-cream-dark/50 transition-colors text-left"
                >
                  <span className="text-2xl">{hire.ar_agents?.emoji ?? "🐰"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {hire.ar_agents?.name ?? "Unknown Agent"}
                      </span>
                      {statusIcon(hire.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-warm-lighter">
                      <span>{formatDate(hire.created_at)}</span>
                      <span>·</span>
                      <span>{formatTime(hire.execution_time_ms)}</span>
                      <span>·</span>
                      {hire.was_free_run ? (
                        <span className="flex items-center gap-0.5 text-honey">
                          <Zap className="w-3 h-3" /> Free
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Coins className="w-3 h-3" />
                          {(hire.credits_spent / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  {expandedId === hire.id ? (
                    <ChevronUp className="w-4 h-4 text-warm-lighter" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-warm-lighter" />
                  )}
                </button>

                {/* Expanded content */}
                {expandedId === hire.id && (
                  <div className="px-4 pb-4 border-t border-border">
                    {hire.output_data?.text ? (
                      <div className="mt-3 text-sm text-warm-gray whitespace-pre-wrap max-h-96 overflow-y-auto bg-cream-dark/30 rounded-lg p-3">
                        {hire.output_data.text}
                      </div>
                    ) : hire.status === "failed" ? (
                      <p className="mt-3 text-sm text-red-500">
                        This hire failed. No output was generated.
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-warm-lighter">
                        No output available.
                      </p>
                    )}

                    {hire.ar_agents?.slug && (
                      <Link
                        to={`/hire/${hire.ar_agents.slug}`}
                        className="inline-block mt-3 text-xs text-terra hover:underline"
                      >
                        Hire again
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
