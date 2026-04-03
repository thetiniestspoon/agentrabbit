import { cn } from "@/lib/utils";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "py-12 px-6 border-t border-terra/8",
        "bg-cream-dark/30"
      )}
    >
      <div className="container max-w-5xl mx-auto text-center">
        {/* Wordmark */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">🐇</span>
          <span className="font-display text-xl text-warm-gray">
            AgentRabbit
          </span>
        </div>

        <p className="font-body text-sm text-warm-light mb-6">
          Made by real people, for real people.
        </p>

        <p className="font-body text-xs text-warm-lighter">
          &copy; {year} AgentRabbit. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
