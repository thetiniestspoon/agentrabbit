import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import AgentDetail from "./pages/AgentDetail";
import HireFlow from "./pages/HireFlow";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/agent/:id" element={<AgentDetail />} />
      <Route path="/hire/:id" element={<HireFlow />} />
    </Routes>
  );
}

export default App;
