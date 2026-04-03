import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CTASection() {
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
    <section className="py-28 px-6">
      <div className="container max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl text-warm-gray mb-4">
            Ready to try it?
          </h2>
          <p className="text-warm-light font-body text-lg mb-10 max-w-md mx-auto">
            Join the neighborhood. We will let you know when the doors open.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "w-full py-4 px-6 rounded-xl",
                "bg-sage/10 border border-sage/30",
                "text-sage-dark font-body font-medium"
              )}
            >
              Welcome aboard! We will be in touch.
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

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-warm-lighter font-body"
        >
          No credit card needed to browse. You only pay when you hire a helper.
        </motion.p>
      </div>
    </section>
  );
}
