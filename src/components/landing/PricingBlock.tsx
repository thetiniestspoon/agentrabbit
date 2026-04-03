import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { agents, formatPrice } from "@/lib/agents";
import { cn } from "@/lib/utils";

export default function PricingBlock() {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-warm-gray mb-6">
            No subscriptions. No surprises.
          </h2>
          <p className="text-warm-light font-body text-lg leading-relaxed max-w-2xl mx-auto">
            Every helper shows its price upfront. You pay only when you hire.
            Prices start at $0.15 for a weekly digest and go up to $0.50 for an
            invoice. That is it.
          </p>
        </motion.div>

        {/* Price visual row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
                "bg-white/70 border border-terra/8"
              )}
            >
              <span className="text-xl">{agent.emoji}</span>
              <div className="text-left">
                <p className="font-body text-sm font-medium text-warm-gray leading-tight">
                  {agent.name}
                </p>
                <p className="font-body text-xs font-semibold text-terra">
                  {formatPrice(agent.priceCents)}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Spending cap callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className={cn(
            "flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl",
            "bg-sage/8 border border-sage/15",
            "max-w-xl mx-auto"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-sage/15 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-sage-dark" strokeWidth={1.8} />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-display text-lg text-warm-gray mb-1">
              Your spending, your control
            </h3>
            <p className="font-body text-sm text-warm-light leading-relaxed">
              Set a monthly spending cap and we will never let you go over it.
              Most folks spend less than the cost of a coffee each month.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
