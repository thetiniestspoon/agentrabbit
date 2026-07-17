import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/hooks";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function SignIn() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await signInWithMagicLink(email);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-warm-light hover:text-terra transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🐰</span>
          <h1 className="text-3xl font-display text-terra mb-2">Sign In</h1>
          <p className="text-warm-light">
            Get 3 free helper runs every day, plus access to your history.
          </p>
        </div>

        {sent ? (
          <div className="bg-sage/10 rounded-xl border border-sage/20 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-sage mx-auto mb-4" />
            <h2 className="text-xl mb-2">Check your email</h2>
            <p className="text-warm-light text-sm">
              We sent a magic link to <strong>{email}</strong>.
              Click it to sign in — no password needed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-warm-light mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-lighter" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-warm-gray placeholder:text-warm-lighter focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send magic link"
              )}
            </button>

            <p className="text-xs text-warm-lighter text-center">
              No password needed. We will email you a secure sign-in link.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
