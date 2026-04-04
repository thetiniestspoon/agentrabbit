import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated warm gradient background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 30% 50%, #FDF6EC 0%, #F5E6D0 40%, #FDF6EC 100%)",
              "radial-gradient(ellipse at 70% 30%, #F5E6D0 0%, #FDF6EC 40%, #F0BD6F20 100%)",
              "radial-gradient(ellipse at 50% 70%, #FDF6EC 0%, #D4856E15 40%, #F5E6D0 100%)",
              "radial-gradient(ellipse at 30% 50%, #FDF6EC 0%, #F5E6D0 40%, #FDF6EC 100%)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Soft decorative shapes */}
        <motion.div
          className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-terra/5 blur-3xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-[10%] w-80 h-80 rounded-full bg-sage/5 blur-3xl"
          animate={{ y: [0, 15, 0], scale: [1, 0.95, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-[40%] left-[50%] w-48 h-48 rounded-full bg-honey/5 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      <div className="container max-w-3xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Small warm badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-cream-dark/80 border border-terra/10"
          >
            <span className="text-lg">🐇</span>
            <span className="text-sm font-body font-medium text-warm-gray tracking-wide">
              Now accepting early neighbors
            </span>
          </motion.div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight text-warm-gray mb-6">
            Hire an AI helper.{" "}
            <br className="hidden sm:block" />
            <span className="text-terra">Pay pennies.</span>{" "}
            <br className="hidden sm:block" />
            Save hours.
          </h1>

          <p className="text-lg sm:text-xl text-warm-light font-body leading-relaxed max-w-xl mx-auto mb-10">
            Real helpers for real life. No subscriptions. No jargon.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "w-full py-4 px-6 rounded-xl",
                "bg-sage/10 border border-sage/30",
                "text-sage-dark font-body font-medium text-center"
              )}
            >
              You are on the list!{" "}
              <Link to="/home" className="underline hover:text-terra transition-colors">
                Browse helpers now
              </Link>
            </motion.div>
          ) : (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className={cn(
                  "flex-1 px-5 py-3.5 rounded-xl",
                  "bg-white/80 border border-terra/15",
                  "font-body text-warm-gray placeholder:text-warm-lighter",
                  "focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra/30",
                  "transition-all duration-200"
                )}
              />
              <button
                type="submit"
                className={cn(
                  "px-7 py-3.5 rounded-xl",
                  "bg-terra text-cream font-body font-semibold",
                  "hover:bg-terra-dark active:scale-[0.98]",
                  "transition-all duration-200",
                  "shadow-md shadow-terra/20 hover:shadow-lg hover:shadow-terra/25"
                )}
              >
                Join the Waitlist
              </button>
            </>
          )}
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-6 space-y-3"
        >
          <p className="text-sm text-warm-lighter font-body">
            Free to browse. You only pay when you hire a helper.
          </p>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-terra hover:text-terra-dark font-body font-medium transition-colors"
          >
            Browse helpers now &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
