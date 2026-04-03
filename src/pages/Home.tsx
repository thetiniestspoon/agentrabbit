import { Link } from "react-router-dom";
import { agents, formatPrice } from "@/lib/agents";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl text-terra">
          AgentRabbit
        </Link>
        <nav className="flex gap-4 text-sm font-medium text-warm-gray">
          <Link to="/home" className="text-terra">Browse</Link>
          <span className="text-warm-lighter">Activity</span>
          <span className="text-warm-lighter">Spending</span>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl mb-2">Meet your helpers</h1>
        <p className="text-warm-light mb-8 text-lg">
          Real helpers made by real people. Pick one and put it to work.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              to={`/agent/${agent.id}`}
              className="group block bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-4xl mb-3">{agent.emoji}</div>
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
          ))}
        </div>
      </main>
    </div>
  );
}
