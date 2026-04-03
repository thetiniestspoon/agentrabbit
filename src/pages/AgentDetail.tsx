import { useParams, Link } from "react-router-dom";
import { getAgent, formatPrice } from "@/lib/agents";
import Nav from "@/components/prototype/Nav";
import { ArrowLeft, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AgentDetail() {
  const { id } = useParams();
  const agent = getAgent(id || "");

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">Helper not found</p>
          <Link to="/home" className="text-terra underline">
            Browse all helpers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-20">
      <Nav />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-warm-light hover:text-terra transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to helpers
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-6xl mb-4">{agent.emoji}</div>
          <h1 className="text-3xl md:text-4xl mb-2">{agent.name}</h1>
          <p className="text-warm-light text-lg mb-6">{agent.tagline}</p>

          {/* Creator story */}
          <div className="bg-card rounded-xl border border-border p-5 mb-6">
            <p className="text-sm italic text-warm-light mb-1">
              Created by {agent.creatorName}
            </p>
            <p className="text-warm-gray">
              &ldquo;{agent.creatorStory}&rdquo;
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-honey" />
              What this helper does
            </h2>
            <p className="text-warm-gray leading-relaxed">
              {agent.description}
            </p>
          </div>

          {/* Permissions */}
          <div className="bg-sage/5 rounded-xl border border-sage/20 p-5 mb-6">
            <h3 className="text-sm font-semibold text-sage-dark mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permissions
            </h3>
            <p className="text-sm text-warm-gray">
              This helper will: read the information you type in, generate a
              result, and show it to you. That is it. Nothing else. Your
              information is not saved or shared.
            </p>
          </div>

          {/* Sample output */}
          <div className="mb-8">
            <h2 className="text-xl mb-3">Sample result</h2>
            <div className="bg-cream-dark rounded-xl p-5 font-mono text-sm text-warm-gray whitespace-pre-wrap">
              {agent.sampleOutput}
            </div>
          </div>
        </motion.div>

        {/* Sticky hire CTA */}
        <div className="fixed bottom-0 md:bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-40 md:z-50">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-warm-light">Hiring costs</p>
              <p className="text-2xl font-semibold text-terra">
                {formatPrice(agent.priceCents)}
              </p>
            </div>
            <Link
              to={`/hire/${agent.id}`}
              className="bg-terra hover:bg-terra-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors text-lg inline-block"
            >
              Hire for {formatPrice(agent.priceCents)}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
