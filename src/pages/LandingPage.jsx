import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import TopSongs from "../components/TopSongs";
import Footer from "../components/Footer";
const FloatingParticles = React.memo(function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${2 + Math.random() * 5}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${10 + Math.random() * 10}s`,
      color:
        Math.random() > 0.5
          ? "rgba(29, 185, 84, 0.4)"
          : "rgba(255, 255, 255, 0.3)",
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
});
const WaveBars = React.memo(function WaveBars() {
  return (
    <div className="flex items-end gap-1 h-16">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="w-2 bg-gradient-to-t from-[#1db954] to-[#1ed760] rounded-full animate-wave-bar"
          style={{
            height: "40%",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
});
function FeatureCard({ icon, title, description }) {
  return (
    <div className="group relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-[#1db954]/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-[0_8px_30px_rgba(29,185,84,0.2)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1db954]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-[#1db954] to-[#1ed760] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#1db954]/20">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1db954] transition-colors drop-shadow-md">
          {title}
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed drop-shadow-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: (
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      ),
      title: "Hybrid Search Engine",
      description:
        "Uses ML technologies like cosine similarity, KNN and SVD to learn your taste and find songs you'll love.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      title: "Mood-Based Search",
      description:
        "Describe how you're feeling and get perfect tracks to match your vibe.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Lightning Fast",
      description:
        "Get recommendations in seconds powered by advanced Gemini AI technology.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      title: "Party & Games Room",
      description:
        "Host live jam sessions, listen with friends, and play interactive music games.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a1a2e] text-white relative overflow-hidden flex flex-col">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {}
        <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[60%] bg-[#1db954] opacity-[0.06] rounded-full blur-[180px]" />

        {}
        <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[60%] bg-[#1ed760] opacity-[0.05] rounded-full blur-[180px]" />

        {}
        <div className="absolute top-[20%] left-[20%] w-[60%] h-[50%] bg-[#1db954] opacity-[0.03] rounded-full blur-[200px]" />
      </div>

      {}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(29, 185, 84, 0.1) 0%, transparent 25%, transparent 75%, rgba(30, 215, 96, 0.08) 100%)`,
        }}
      />

      {}
      <div className="container mx-auto max-w-6xl px-6 md:px-8 flex-1 flex flex-col relative z-10">
        {}
        <nav
          className={`flex justify-between items-center py-6 px-6 mt-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
        >
          <Link to="/" className="group flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1db954] to-[#1ed760] flex items-center justify-center shadow-lg shadow-[#1db954]/30 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-[#1db954] to-[#1ed760] bg-clip-text text-transparent drop-shadow-sm">
              AlgoRythms
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors drop-shadow-sm whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-full text-sm font-bold bg-[#1db954] text-black hover:bg-[#1ed760] transition-all hover:scale-105 shadow-lg shadow-[#1db954]/30 whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger Icon */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#1db954] focus:outline-none transition-colors"
            >
              {isMenuOpen ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden absolute top-24 left-6 right-6 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-2xl flex flex-col items-center py-8 space-y-6 shadow-2xl transition-all duration-300 origin-top z-[100] ${
            isMenuOpen
              ? "scale-y-100 opacity-100"
              : "scale-y-0 opacity-0 pointer-events-none"
          }`}
        >
          <Link
            to="/login"
            onClick={() => setIsMenuOpen(false)}
            className="text-lg font-bold text-white/70 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            onClick={() => setIsMenuOpen(false)}
            className="px-8 py-3 rounded-full text-lg font-bold bg-[#1db954] text-black hover:bg-[#1ed760] transition-all"
          >
            Get Started
          </Link>
        </div>

        {}
        <div
          className={`flex-1 flex flex-col justify-center items-center text-center py-16 px-4 my-8 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >

          {}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="block text-white drop-shadow-lg">
              Discover Music
            </span>
            <span className="block bg-gradient-to-r from-[#1db954] via-[#1ed760] to-[#1db954] bg-clip-text text-transparent animate-gradient drop-shadow-lg">
              That Moves You
            </span>
          </h1>

          {}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed drop-shadow-md">
            Experience personalized song recommendations tailored to your unique
            taste. Search by mood, artist, or let our AI surprise you.
          </p>

          {}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              to="/signup"
              className="group relative px-8 py-4 rounded-full text-base font-bold bg-[#1db954] text-black shadow-xl shadow-[#1db954]/40 hover:bg-[#1ed760] hover:scale-105 transition-all duration-300 overflow-hidden flex items-center justify-center gap-2"
            >
              <span className="relative z-10">Start Discovering</span>
              <svg
                className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </Link>

            <Link
              to="/login"
              className="group px-8 py-4 rounded-full text-base font-bold bg-white/5 backdrop-blur-sm text-white border-2 border-white/20 hover:border-[#1db954]/50 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Already a Member?</span>
            </Link>
          </div>

          {}
          <div
            className={`transition-all duration-1000 delay-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          >
            <WaveBars />
          </div>
        </div>

        {}
        <div
          className={`py-8 mb-8 transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {}
        <div
          className={`mt-auto pb-6 px-4 transition-all duration-1000 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <TopSongs />
        </div>
        
        {}
        <div className={`transition-all duration-1000 delay-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
