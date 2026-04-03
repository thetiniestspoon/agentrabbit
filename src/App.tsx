import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import AgentDetail from "./pages/AgentDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/agent/:id" element={<AgentDetail />} />
    </Routes>
  );
}

export default App;
