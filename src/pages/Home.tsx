import { Link } from "react-router-dom";
import { agents, formatPrice } from "@/lib/agents";
import Nav from "@/components/prototype/Nav";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl mb-2">Meet your helpers</h1>
        <p className="text-warm-light mb-8 text-lg">
          Real helpers made by real people. Pick one and put it to work.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={`/agent/${agent.id}`}
                className="group block bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {agent.emoji}
                </div>
                <h2 className="text-xl font-display mb-1">{agent.name}</h2>
                <p className="text-warm-light text-sm mb-3">{agent.tagline}</p>
                <p className="text-xs italic text-warm-lighter mb-4">
                  by {agent.creatorName}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-sage/10 text-sage-dark px-2 py-1 rounded-full">
                    {agent.category}
                  </span>
                  <span className="text-sm font-semibold bg-terra text-white px-3 py-1 rounded-full">
                    {formatPrice(agent.priceCents)}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
