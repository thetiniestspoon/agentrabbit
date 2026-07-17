import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";

// Lazy-load heavier pages
const AgentDetail = lazy(() => import("./pages/AgentDetail"));
const HireFlow = lazy(() => import("./pages/HireFlow"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Activity = lazy(() => import("./pages/Activity"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-terra border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/agent/:id" element={<AgentDetail />} />
        <Route path="/hire/:id" element={<HireFlow />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/activity" element={<Activity />} />
      </Routes>
    </Suspense>
  );
}

export default App;
