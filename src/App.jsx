import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Snowfall from "./components/Snowfall";

// Route-level code splitting: each page is loaded on demand so the initial
// bundle only carries the shell, not all 12 pages at once.
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Main = lazy(() => import("./pages/Main"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const PartyRoom = lazy(() => import("./pages/PartyRoom"));
const GamesRoom = lazy(() => import("./pages/GamesRoom"));
const SpotifyCallback = lazy(() => import("./pages/SpotifyCallback"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
      <div className="w-8 h-8 rounded-full border-2 border-[#1db954] border-t-transparent animate-spin" />
    </div>
  );
}

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

        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
