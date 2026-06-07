import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { SpotifyIconPNG } from "../components/IconLoader";
const FloatingNotes = React.memo(function FloatingNotes() {
  const notes = ["♪", "♫", "♬", "♩", "", ""];
  const noteData = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      note: notes[Math.floor(Math.random() * notes.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${12 + Math.random() * 8}s`,
      size: `${16 + Math.random() * 20}px`,
    }));
  }, []); // Empty dependency array = only generate once

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {noteData.map((data) => (
        <span
          key={data.id}
          className="music-note"
          style={{
            left: data.left,
            animationDelay: data.delay,
            animationDuration: data.duration,
            fontSize: data.size,
          }}
        >
          {data.note}
        </span>
      ))}
    </div>
  );
});

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (error) {
      setShakeError(true);
      const timer = setTimeout(() => setShakeError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setIsAuthenticated(true);
      navigate("/main");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#121212] via-[#1a1a1a] to-[#121212] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {}
      <FloatingNotes />

      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#1db954] rounded-full blur-[150px] animate-pulse-glow" />
        <div
          className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-purple-500 rounded-full blur-[100px] animate-pulse-glow opacity-[0.05]"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div
        className={`max-w-md w-full space-y-8 relative z-10 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
      >
        {}
        <div className="text-center animate-slide-up-fade">
          <Link to="/" className="inline-block group">
            <h1 className="text-5xl font-black bg-gradient-to-r from-[#1db954] to-[#1ed760] bg-clip-text text-transparent tracking-tight hover:scale-105 transition-transform duration-300 animate-bounce-subtle pb-1">
              AlgoRythms
            </h1>
          </Link>
          <h2
            className="mt-6 text-3xl font-bold text-white tracking-tight animate-slide-up-fade"
            style={{ animationDelay: "0.1s" }}
          >
            Welcome back
          </h2>
          <p
            className="mt-2 text-sm text-gray-400 animate-slide-up-fade"
            style={{ animationDelay: "0.2s" }}
          >
            Log in to continue your music journey
          </p>
        </div>

        {}
        <div
          className={`bg-black/40 backdrop-blur-2xl py-10 px-6 shadow-2xl rounded-2xl border border-white/10 sm:px-12 relative overflow-hidden animate-slide-up-fade ${shakeError ? "animate-shake" : ""}`}
          style={{ animationDelay: "0.3s" }}
        >
          {}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#1db954] to-transparent opacity-50" />

          <form className="space-y-6" onSubmit={handleSubmit}>
            {}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm animate-shake">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div
              className="animate-slide-up-fade"
              style={{ animationDelay: "0.4s" }}
            >
              <label className="block text-sm font-semibold text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                className="appearance-none block w-full px-4 py-3.5 bg-[#2a2a2a] border border-white/10 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200 hover:border-white/20 input-glow"
                placeholder="name@example.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div
              className="animate-slide-up-fade"
              style={{ animationDelay: "0.5s" }}
            >
              <label className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="appearance-none block w-full px-4 py-3.5 bg-[#2a2a2a] border border-white/10 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition-all duration-200 hover:border-white/20 input-glow pr-12"
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 hover:scale-110 transform duration-200"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div
              className="animate-slide-up-fade"
              style={{ animationDelay: "0.6s" }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border-0 text-base font-bold rounded-full text-black bg-[#1db954] hover:bg-[#1ed760] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1db954] focus:ring-offset-[#121212] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1db954]/20 overflow-hidden btn-shine"
              >
                {isLoading ? (
                  <span className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 flex items-center gap-2">
                      Log In
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  </>
                )}
              </button>
            </div>
          </form>

          {}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black/40 text-gray-400 font-semibold">
                  Or continue with
                </span>
              </div>
            </div>

            {}
            <div className="mt-6">
              <button
                type="button"
                className="w-full inline-flex justify-center items-center gap-3 py-3.5 px-4 border border-white/10 rounded-lg shadow-sm bg-[#2a2a2a] text-sm font-semibold text-white hover:bg-[#333333] hover:border-white/20 transition-all duration-200"
              >
                <SpotifyIconPNG className="h-5 w-5" />
                <span>Continue with Spotify</span>
              </button>
            </div>
          </div>

          {}
          <p
            className="mt-8 text-center text-sm text-gray-400 animate-slide-up-fade"
            style={{ animationDelay: "0.7s" }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-[#1db954] hover:text-[#1ed760] transition-colors hover:underline underline-offset-4"
            >
              Sign up for AlgoRythms
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
