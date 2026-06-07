import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Profile from "./pages/Profile";
import About from "./pages/About";
import PartyRoom from "./pages/PartyRoom";
import GamesRoom from "./pages/GamesRoom";
import SpotifyCallback from "./pages/SpotifyCallback";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPolicy from "./pages/RefundPolicy";
import Snowfall from "./components/Snowfall";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("currentUser");
  });

  const [isSnowing, setIsSnowing] = useState(() => {
    const savedSnowState = localStorage.getItem("isSnowing");
    return savedSnowState === "true";
  });

  useEffect(() => {
    localStorage.setItem("isSnowing", isSnowing);
  }, [isSnowing]);

  return (
    <Router>
      <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-[#1db954] selection:text-black relative antialiased">
        <Snowfall isSnowing={isSnowing} />

        {}
        <button
          onClick={() => setIsSnowing(!isSnowing)}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white text-[12px] sm:text-sm font-semibold tracking-wide hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-2xl hover:scale-105"
        >
          <span className="text-base"></span>
          <span>{isSnowing ? "Stop Snow" : "Let it Snow"}</span>
        </button>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />

          <Route
            path="/main"
            element={isAuthenticated ? <Main /> : <Navigate to="/login" />}
          />

          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />

          <Route
            path="/party/:roomCode"
            element={isAuthenticated ? <PartyRoom /> : <Navigate to="/login" />}
          />
          <Route
            path="/party/:roomCode/games"
            element={isAuthenticated ? <GamesRoom /> : <Navigate to="/login" />}
          />
          <Route
            path="/spotify-callback"
            element={<SpotifyCallback />}
          />

          <Route path="/about" element={<About />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
