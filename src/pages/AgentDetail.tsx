import { useParams, Link } from "react-router-dom";
import { agents, formatPrice } from "@/lib/agents";
import { ArrowLeft, Shield, Sparkles } from "lucide-react";

export default function AgentDetail() {
  const { id } = useParams();
  const agent = agents.find((a) => a.id === id);

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-warm-light hover:text-terra transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to helpers
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-6xl mb-4">{agent.emoji}</div>
        <h1 className="text-3xl md:text-4xl mb-2">{agent.name}</h1>
        <p className="text-warm-light text-lg mb-6">{agent.tagline}</p>

        {/* Creator story */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <p className="text-sm italic text-warm-light mb-1">
            Created by {agent.creatorName}
          </p>
          <p className="text-warm-gray">&ldquo;{agent.creatorStory}&rdquo;</p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-xl mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-honey" />
            What this helper does
          </h2>
          <p className="text-warm-gray leading-relaxed">{agent.description}</p>
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

        {/* Hire CTA */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border -mx-6 px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div>
              <p className="text-sm text-warm-light">Hiring costs</p>
              <p className="text-2xl font-semibold text-terra">
                {formatPrice(agent.priceCents)}
              </p>
            </div>
            <button
              className="bg-terra hover:bg-terra-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors text-lg"
              onClick={() => alert("Stripe integration coming in Phase 3!")}
            >
              Hire for {formatPrice(agent.priceCents)}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
