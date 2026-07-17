import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAgent, formatPrice } from "@/lib/agents";
import { useAuth, useCredits, useFreeRuns, useHireAgent } from "@/lib/hooks";
import DynamicForm from "@/components/prototype/DynamicForm";
import Nav from "@/components/prototype/Nav";
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Zap, Coins } from "lucide-react";

type HireState = "form" | "confirming" | "processing" | "complete" | "error";

export default function HireFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const agent = getAgent(id || "");
  const { isAuthenticated } = useAuth();
  const { balance, canAfford, refetch: refetchCredits } = useCredits();
  const { remaining: freeRunsLeft, refetch: refetchFreeRuns } = useFreeRuns();
  const { hire, loading: hiring, result, error: hireError, reset } = useHireAgent();
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

  // Check if this could be a free run
  const isQuick = agent.priceCents <= 100; // Quick agents are $1 or less
  const canGetFreeRun = isQuick && freeRunsLeft > 0;
  const canPay = canAfford(agent.priceCents);

  function handleFormSubmit(data: Record<string, any>) {
    setFormData(data);
    setState("confirming");
  }

  async function handleConfirmHire() {
    if (!formData) return;

    // Must be signed in
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    setState("processing");

    const result = await hire(agent!.id, formData);

    if (result) {
      setState("complete");
      refetchCredits();
      refetchFreeRuns();
    } else {
      setState("error");
    }
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
              submitLabel={
                canGetFreeRun
                  ? `Review — Free (${freeRunsLeft} left today)`
                  : `Review — ${formatPrice(agent.priceCents)}`
              }
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
              {canGetFreeRun ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-honey" />
                    <p className="text-sm text-warm-light">Free run</p>
                  </div>
                  <p className="text-3xl font-semibold text-sage mb-1">Free</p>
                  <p className="text-xs text-warm-lighter mb-4">
                    {freeRunsLeft} of 3 free runs remaining today
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-warm-light mb-1">This will cost</p>
                  <p className="text-3xl font-semibold text-terra mb-1">
                    {formatPrice(agent.priceCents)}
                  </p>
                  <p className="text-xs text-warm-lighter mb-4">
                    <Coins className="w-3 h-3 inline mr-1" />
                    Your balance: {formatPrice(balance)}
                  </p>
                </>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setState("form")}
                  className="px-6 py-2.5 rounded-xl border border-border text-warm-gray hover:bg-cream-dark transition-colors"
                >
                  Go back
                </button>
                {!isAuthenticated ? (
                  <button
                    onClick={() => navigate("/sign-in")}
                    className="px-8 py-2.5 rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold transition-colors"
                  >
                    Sign in to hire
                  </button>
                ) : !canGetFreeRun && !canPay ? (
                  <button
                    disabled
                    className="px-8 py-2.5 rounded-xl bg-warm-lighter text-white font-semibold cursor-not-allowed"
                    title="Credit packs coming soon!"
                  >
                    Need more credits
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmHire}
                    className="px-8 py-2.5 rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold transition-colors"
                  >
                    {canGetFreeRun
                      ? "Hire for free"
                      : `Hire for ${formatPrice(agent.priceCents)}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processing state */}
        {state === "processing" && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-terra animate-spin mx-auto mb-4" />
            <h2 className="text-xl mb-2">Your helper is working on this...</h2>
            <p className="text-warm-light">
              {agent.name} is preparing your result.
              {isQuick
                ? " This usually takes just a moment."
                : " A team of specialists is collaborating. This may take 15-30 seconds."}
            </p>
          </div>
        )}

        {/* Error state */}
        {state === "error" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl mb-2">Something went wrong</h2>
            <p className="text-warm-light mb-6">
              {hireError?.message || "The helper couldn't complete your request."}
            </p>
            <button
              onClick={() => {
                reset();
                setState("form");
              }}
              className="px-6 py-2.5 rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Complete state */}
        {state === "complete" && result && (
          <div className="py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-sage" />
              </div>
              <div>
                <h2 className="text-xl">Done!</h2>
                <p className="text-warm-light text-sm">
                  {result.wasFreeRun
                    ? "Free run"
                    : `${formatPrice(result.creditsSpent)} spent`}
                  {" \u2022 "}
                  {(result.executionTimeMs / 1000).toFixed(1)}s
                </p>
              </div>
            </div>

            {/* Result output */}
            <div className="bg-card rounded-xl border border-border p-6 mb-8 prose prose-sm max-w-none">
              <div
                className="text-warm-gray whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: result.output
                    .replace(/^## /gm, '<h2 class="text-lg font-semibold mt-4 mb-2 text-warm-dark">')
                    .replace(/^### /gm, '<h3 class="text-base font-semibold mt-3 mb-1 text-warm-dark">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^- /gm, '\u2022 ')
                    .replace(/\n/g, '<br/>'),
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  reset();
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
