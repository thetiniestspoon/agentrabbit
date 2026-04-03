import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { agents, formatPrice } from "@/lib/agents";
import { cn } from "@/lib/utils";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export default function MeetTheHelpers() {
  return (
    <section className="py-24 px-6 bg-cream-dark/40">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-warm-gray mb-4">
            Meet the helpers
          </h2>
          <p className="text-warm-light font-body text-lg max-w-lg mx-auto">
            Each one was made by a real person to solve a real problem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              <Link
                to={`/agent/${agent.id}`}
                className={cn(
                  "block p-6 rounded-2xl h-full",
                  "bg-white/80 border border-terra/8",
                  "hover:-translate-y-1 hover:shadow-xl hover:shadow-terra/8",
                  "transition-all duration-300 ease-out",
                  "group"
                )}
              >
                {/* Emoji avatar */}
                <div className="w-16 h-16 rounded-2xl bg-cream-dark flex items-center justify-center text-3xl mb-5 group-hover:scale-105 transition-transform duration-300">
                  {agent.emoji}
                </div>

                {/* Name and tagline */}
                <h3 className="font-display text-xl text-warm-gray mb-1.5">
                  {agent.name}
                </h3>
                <p className="font-body text-warm-light text-sm leading-relaxed mb-4">
                  {agent.tagline}
                </p>

                {/* Creator */}
                <p className="font-body text-sm text-warm-lighter italic mb-5">
                  by {agent.creatorName}
                </p>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-semibold",
                      "bg-terra/10 text-terra-dark"
                    )}
                  >
                    {formatPrice(agent.priceCents)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-medium",
                      "bg-sage/10 text-sage-dark"
                    )}
                  >
                    {agent.category}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
