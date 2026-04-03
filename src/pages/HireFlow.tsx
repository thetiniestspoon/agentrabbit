import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAgent, formatPrice } from "@/lib/agents";
import DynamicForm from "@/components/prototype/DynamicForm";
import Nav from "@/components/prototype/Nav";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

type HireState = "form" | "confirming" | "processing" | "complete";

export default function HireFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const agent = getAgent(id || "");
  const [state, setState] = useState<HireState>("form");
  const [formData, setFormData] = useState<Record<string, any> | null>(null);

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

  function handleFormSubmit(data: Record<string, any>) {
    setFormData(data);
    setState("confirming");
  }

  function handleConfirmHire() {
    setState("processing");
    // Simulate agent execution (will be replaced by Stripe + Edge Function)
    setTimeout(() => {
      setState("complete");
    }, 2500);
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Nav />

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          to={`/agent/${agent.id}`}
          className="inline-flex items-center gap-2 text-warm-light hover:text-terra transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {agent.name}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-4xl">{agent.emoji}</span>
          <div>
            <h1 className="text-2xl md:text-3xl">Hire {agent.name}</h1>
            <p className="text-warm-light text-sm">
              by {agent.creatorName}
            </p>
          </div>
        </div>

        {/* Form state */}
        {state === "form" && (
          <>
            <p className="text-warm-gray mb-6">
              Fill in the details below. When you are ready, you will see the
              price and can confirm before anything happens.
            </p>
            <DynamicForm
              fields={agent.inputSchema}
              onSubmit={handleFormSubmit}
              submitLabel={`Review \u2014 ${formatPrice(agent.priceCents)}`}
            />
          </>
        )}

        {/* Confirmation state */}
        {state === "confirming" && formData && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl mb-4">Review your request</h2>
              <dl className="space-y-3">
                {agent.inputSchema.map((field) => {
                  const val = formData[field.key];
                  if (!val || (typeof val === "string" && !val.trim()))
                    return null;

                  let displayVal: string;
                  if (field.type === "repeatable" && Array.isArray(val)) {
                    displayVal = val
                      .map((row: Record<string, any>) =>
                        Object.values(row).filter(Boolean).join(" \u2014 ")
                      )
                      .join("\n");
                  } else if (field.type === "select" && field.options) {
                    displayVal =
                      field.options.find((o) => o.value === val)?.label || val;
                  } else {
                    displayVal = String(val);
                  }

                  return (
                    <div key={field.key}>
                      <dt className="text-xs text-warm-lighter uppercase tracking-wide">
                        {field.label}
                      </dt>
                      <dd className="text-warm-gray whitespace-pre-wrap">
                        {displayVal}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            <div className="bg-terra/5 rounded-xl border border-terra/20 p-6 text-center">
              <p className="text-sm text-warm-light mb-1">This will cost</p>
              <p className="text-3xl font-semibold text-terra mb-4">
                {formatPrice(agent.priceCents)}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setState("form")}
                  className="px-6 py-2.5 rounded-xl border border-border text-warm-gray hover:bg-cream-dark transition-colors"
                >
                  Go back
                </button>
                <button
                  onClick={handleConfirmHire}
                  className="px-8 py-2.5 rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold transition-colors"
                >
                  Hire for {formatPrice(agent.priceCents)}
                </button>
              </div>
              <p className="text-xs text-warm-lighter mt-3">
                You will be redirected to a secure payment page.
              </p>
            </div>
          </div>
        )}

        {/* Processing state */}
        {state === "processing" && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-terra animate-spin mx-auto mb-4" />
            <h2 className="text-xl mb-2">Your helper is working on this...</h2>
            <p className="text-warm-light">
              {agent.name} is preparing your result. This usually takes just a
              moment.
            </p>
          </div>
        )}

        {/* Complete state */}
        {state === "complete" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-sage" />
            </div>
            <h2 className="text-2xl mb-2">Done!</h2>
            <p className="text-warm-light mb-2">
              {agent.name} finished your request.
            </p>
            <p className="text-sm text-warm-lighter mb-8">
              (Results will display here once Supabase + LLM Gateway are wired
              in Phase 3.)
            </p>

            <div className="bg-cream-dark rounded-xl p-6 text-left font-mono text-sm text-warm-gray whitespace-pre-wrap mb-8">
              {agent.sampleOutput}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setState("form");
                  setFormData(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold transition-colors"
              >
                Hire again
              </button>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-2.5 rounded-xl border border-border text-warm-gray hover:bg-cream-dark transition-colors"
              >
                Browse more helpers
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
