import React, { useState, useEffect, useCallback } from "react";

import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL, PARTY_API_URL } from "../config";
import Navbar from "../components/Navbar";

import SearchForm from "../components/SearchForm";

import ResultsGrid from "../components/ResultsGrid";

import ProSearchButton from "../components/ProSearchButton";

import UserPlaylists from "../components/UserPlaylists";

import { LoadingSpinner, ErrorMessage, SuccessMessage } from "../components/UIComponents";
import Footer from "../components/Footer";

function Main() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(() => {
    const userString = localStorage.getItem("currentUser");

    if (!userString) return null;

    try {
      const user = JSON.parse(userString);

      return user.id;
    } catch (e) {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    const userString = localStorage.getItem("currentUser");

    if (!userString) return false;

    try {
      const user = JSON.parse(userString);

      return user.is_admin || false;
    } catch (e) {
      return false;
    }
  });

  const [query, setQuery] = useState(() => {
    return localStorage.getItem("lastQuery") || "";
  });

  const [searchType, setSearchType] = useState(() => {
    return localStorage.getItem("lastSearchType") || "song";
  });

  const [results, setResults] = useState(() => {
    const savedResults = localStorage.getItem("lastResults");

    try {
      return savedResults ? JSON.parse(savedResults) : null;
    } catch (e) {
      return null;
    }
  });

  const [error, setError] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const [proSearchStatus, setProSearchStatus] = useState(() => {
    const saved = localStorage.getItem("proSearchStatus");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {  }
    }
    return null;
  });

  const [showProSuggestion, setShowProSuggestion] = useState(false);

  const [isProSearchEnabled, setIsProSearchEnabled] = useState(false);

  const [timeUntilReset, setTimeUntilReset] = useState("");

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [isCreatingParty, setIsCreatingParty] = useState(false);
  const [isJoiningParty, setIsJoiningParty] = useState(false);

  const [playlistRefreshTrigger, setPlaylistRefreshTrigger] = useState(0);
  const [likedSongs, setLikedSongs] = useState([]);
  const [dislikedSongs, setDislikedSongs] = useState([]);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);
  const loadInitialData = useCallback(async () => {
    if (!userId) return;
    try {
      const [statusRes, playlistRes] = await Promise.all([
        fetch(`${API_BASE_URL}/pro-search/status?userId=${userId}`),
        fetch(`${API_BASE_URL}/user/stats?userId=${userId}`),
      ]);
      if (statusRes.ok) {
        const data = await statusRes.json();
        setProSearchStatus(data);
        localStorage.setItem("proSearchStatus", JSON.stringify(data));
        setIsAdmin(data.is_admin || false);
      }
      if (playlistRes.ok) {
        const data = await playlistRes.json();
        setLikedSongs(data.liked_songs || []);
        setDislikedSongs(data.disliked_songs || []);
      }
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadInitialData();
    }
  }, [userId, loadInitialData]);
  useEffect(() => {
    if (proSearchStatus?.in_cooldown && userId) {
      const interval = setInterval(() => {
        if (document.visibilityState === "visible") fetchProSearchStatus();
      }, 10000); // Check every 10 seconds, only while the tab is visible

      return () => clearInterval(interval);
    }
  }, [proSearchStatus?.in_cooldown, userId]);
  const [cooldownEndTime, setCooldownEndTime] = useState(null);
  useEffect(() => {
    if (proSearchStatus?.in_cooldown && proSearchStatus?.cooldown_seconds > 0) {
      setCooldownEndTime(Date.now() + proSearchStatus.cooldown_seconds * 1000);
    } else if (!proSearchStatus?.in_cooldown) {
      setCooldownEndTime(null);
    }
  }, [proSearchStatus?.in_cooldown, proSearchStatus?.cooldown_seconds]);
  useEffect(() => {
    const updateTimer = () => {
      if (cooldownEndTime) {
        const remaining = Math.max(0, cooldownEndTime - Date.now());

        if (remaining <= 0) {
          setCooldownEndTime(null);
          setTimeUntilReset("Refreshing...");
          fetchProSearchStatus();
          return;
        }

        const totalSeconds = Math.floor(remaining / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        setTimeUntilReset(`${hours}h ${minutes}m`);
        return;
      }
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(
      updateTimer,
      cooldownEndTime ? 1000 : 60000,
    );

    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  useEffect(() => {
    localStorage.setItem("lastQuery", query);
  }, [query]);

  useEffect(() => {
    localStorage.setItem("lastSearchType", searchType);
  }, [searchType]);

  useEffect(() => {
    if (results) {
      localStorage.setItem("lastResults", JSON.stringify(results));
    } else {
      localStorage.removeItem("lastResults");
    }
  }, [results]);

  const placeHolderText = {
    song: "Search song (e.g., 'Tum Hi Ho' or 'Husn by Anuv Jain')",

    artist: "Search artist (e.g., 'Arijit Singh')",
  };

  const handleSearchTypeChange = (newType) => {
    if (searchType === newType) return;

    setSearchType(newType);

    setResults(null);

    setShowProSuggestion(false);
  };

  const fetchProSearchStatus = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/pro-search/status?userId=${userId}`,
      );

      if (response.ok) {
        const data = await response.json();

        setProSearchStatus(data);
        localStorage.setItem("proSearchStatus", JSON.stringify(data));

        setIsAdmin(data.is_admin || false);
      }
    } catch (err) {
      console.error("Error fetching Pro Search status:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchProSearchStatus();
    // Skip the network poll while the tab is hidden; refresh once on return.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchProSearchStatus();
    }, 30000);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchProSearchStatus();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchProSearchStatus]);

  // Countdown timer for Navbar
  useEffect(() => {
    if (!proSearchStatus?.reset_time) return;

    const reset = new Date(proSearchStatus.reset_time);
    const updateTimer = () => {
      const now = new Date();
      const diff = reset - now;
      if (diff <= 0) {
        setTimeUntilReset("00:00");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeUntilReset(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [proSearchStatus?.reset_time]);
  const handlePlaylistRefresh = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user/stats?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLikedSongs(data.liked_songs || []);
        setDislikedSongs(data.disliked_songs || []);
      }
    } catch (err) {
      console.error("Error refreshing playlists:", err);
    }
  }, [userId]);

  const handleMoodSearch = async () => {
    if (!proSearchStatus?.can_use && !isAdmin) {
      setError(`Daily mood search limit reached. Resets in ${timeUntilReset}`);
      return;
    }

    setError(null);
    setIsLoading(true);
    setShowProSuggestion(false);

    try {
      const endpoint = `${API_BASE_URL}/mood-search`;
      const body = { mood: query, userId, proEnabled: false }; // Always use Gemini

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 429 && !isAdmin) {
        setError(
          data.error ||
            `Daily mood search limit reached. Resets in ${timeUntilReset}`,
        );

        setProSearchStatus({ ...proSearchStatus, can_use: false, in_cooldown: data.in_cooldown || false, cooldown_seconds: data.cooldown_seconds || 0 });
        fetchProSearchStatus();
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Mood search failed");
      }

      setResults(data);
      fetchProSearchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();

    setError(null);

    setShowProSuggestion(false);
    if (searchType === "mood") {
      await handleMoodSearch();
      return;
    }

    if (isProSearchEnabled) {
      handleProSearch();

      return;
    }

    setIsLoading(true);
    const tryFetch = async (retries = 1) => {
      try {
        const endpoint = `${API_BASE_URL}/recommend`;
        const body = { query, searchType, userId };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status >= 500 && retries > 0) {
            await new Promise(r => setTimeout(r, 2000));
            return tryFetch(retries - 1);
          }
          if (data.suggest_pro && proSearchStatus?.can_use) {
            setShowProSuggestion(true);
          }
          throw new Error(data.error || "Server is warming up... please try again in a moment.");
        }

        setResults(data);
        setShowProSuggestion(false);
      } catch (err) {
        if (retries > 0 && (err.name === 'TypeError' || err.message.includes('fetch'))) {
          await new Promise(r => setTimeout(r, 2000));
          return tryFetch(retries - 1);
        }
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    await tryFetch();
  };

  const handleProSearch = async () => {
    if (!proSearchStatus?.can_use && !isAdmin) {
      setError(`Daily Pro Search limit reached. Resets in ${timeUntilReset}`);

      return;
    }

    setError(null);

    setIsLoading(true);
    const tryFetch = async (retries = 1) => {
      try {
        const endpoint = `${API_BASE_URL}/pro-search`;
        const body = { query, searchType, userId };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.status === 429 && !isAdmin) {
          setError(
            data.error ||
              `Daily Pro Search limit reached. Resets in ${timeUntilReset}`,
          );

          setProSearchStatus({ ...proSearchStatus, can_use: false, in_cooldown: data.in_cooldown || false, cooldown_seconds: data.cooldown_seconds || 0 });
          fetchProSearchStatus();
          return;
        }

        if (!response.ok) {
          if (response.status >= 500 && retries > 0) {
            await new Promise(r => setTimeout(r, 2000));
            return tryFetch(retries - 1);
          }
          throw new Error(data.error || "Pro Search is warming up. Try again in a moment.");
        }

        setResults(data);
        fetchProSearchStatus();
        setIsProSearchEnabled(false);
      } catch (err) {
        if (retries > 0 && (err.name === 'TypeError' || err.message.includes('fetch'))) {
          await new Promise(r => setTimeout(r, 2000));
          return tryFetch(retries - 1);
        }
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    await tryFetch();
  };

  const handleCheckoutPlus = async () => {
    setIsCheckoutLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Please log in again");
      const resOrder = await fetch(`${API_BASE_URL}/subscription/create-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId }),
      });
      const orderData = await resOrder.json();
      if (!resOrder.ok) throw new Error(orderData.error || "Failed to create order");
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AlgoRythms Inc.",
        description: "AlgoRythms Plus Subscription",
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const resVerify = await fetch(`${API_BASE_URL}/subscription/verify-payment`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                userId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await resVerify.json();
            if (!resVerify.ok) throw new Error(verifyData.error || "Payment verification failed");
            
            await fetchProSearchStatus();
            setShowUpgradeModal(false);
            alert("Payment successful! Welcome to AlgoRythms Plus.");
          } catch (err) {
            console.error(err);
            alert(`Payment verification error: ${err.message}`);
          }
        },
        prefill: {
          name: "AlgoRythms User",
          email: "user@example.com",
        },
        theme: {
          color: "#1db954"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCreateParty = async () => {
    setIsCreatingParty(true);
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const res = await fetch(`${PARTY_API_URL}/party/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          userId,
          displayName: currentUser.fullName || 'Host'
        })
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/party/${data.roomCode}`);
      } else {
        setError(data.error || "Failed to create party");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsCreatingParty(false);
    }
  };

  const handleJoinParty = async (e) => {
    e.preventDefault();
    const cleanCode = joinRoomCode.trim().toUpperCase();
    if (!cleanCode) return;
    
    setIsJoiningParty(true);
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const res = await fetch(`${PARTY_API_URL}/party/join`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          userId, 
          roomCode: cleanCode,
          displayName: currentUser.fullName || 'Guest'
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Option A: Use the cleanCode we already have to be safe
        navigate(`/party/${cleanCode}`);
      } else {
        setError(data.error || "Failed to join party. Invalid code.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsJoiningParty(false);
    }
  };

  const handleFeedback = async (songName, feedback) => {
    try {
      await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ songName, feedback, userId }),
      });

      if (feedback === "dislike" && results) {
        setResults({
          ...results,

          recommendations: results.recommendations.filter(
            (s) => s.songName !== songName,
          ),
        });
      }

      setSuccess(`Thanks for the feedback! Your preferences are being updated.`);
      setTimeout(() => setSuccess(null), 3000);
      setPlaylistRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error sending feedback:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");

    localStorage.removeItem("token");

    localStorage.removeItem("lastQuery");

    localStorage.removeItem("lastSearchType");

    localStorage.removeItem("lastResults");

    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] via-[#1a1a1a] to-[#121212] relative overflow-hidden">
      {}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#1db954] opacity-[0.08] rounded-full blur-[120px]" />

        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#1ed760] opacity-[0.06] rounded-full blur-[100px]" />
      </div>

      {}

      <div className="relative z-10">
        {}

        <Navbar 
          isAdmin={isAdmin}
          proSearchStatus={proSearchStatus}
          timeUntilReset={timeUntilReset}
          onLogout={handleLogout}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />

        {}

        <div className="container mx-auto max-w-6xl px-6 md:px-8 py-12">
          
          {}
          <div className="mb-12 bg-black/40 border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-purple-500/10">
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-purple-500 opacity-20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-50%] left-[-10%] w-[300px] h-[300px] bg-pink-500 opacity-20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-sm font-black tracking-widest text-white mb-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                  NEW FEATURE
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Host a Jam Session</h2>
                <p className="text-white/60 font-medium mb-3">Create a live party room, invite friends, sync your queue, and let everyone vote on what plays next!</p>
                <div className="flex items-center gap-2 text-xs font-bold text-white/40 italic">
                  <span>This feature is currently under development. Its use is limited and some functions may not work as expected.</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <button 
                  onClick={handleCreateParty}
                  disabled={isCreatingParty}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/20 whitespace-nowrap flex items-center justify-center min-w-[160px]"
                >
                  {isCreatingParty ? "Starting..." : "+ CREATE PARTY"}
                </button>
                
                <div className="hidden sm:block text-white/30 font-black">OR</div>
                
                <form onSubmit={handleJoinParty} className="flex w-full sm:w-auto max-w-full sm:max-w-[240px]">
                  <input
                    type="text"
                    placeholder="ROOM CODE"
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value)}
                    maxLength={5}
                    className="w-full bg-black/50 border border-white/10 rounded-l-xl py-4 flex-1 px-4 text-white placeholder:text-white/30 uppercase text-center font-mono font-bold focus:outline-none focus:border-purple-500/50"
                  />
                  <button 
                    type="submit"
                    disabled={isJoiningParty || !joinRoomCode.trim()}
                    className="bg-white/10 border border-white/10 border-l-0 px-6 font-black rounded-r-xl text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    JOIN
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <SearchForm
              query={query}
              setQuery={setQuery}
              searchType={searchType}
              setSearchType={handleSearchTypeChange}
              handleSearch={handleSearch}
              isLoading={isLoading}
              placeHolderText={placeHolderText[searchType]}
              isProSearchEnabled={isProSearchEnabled}
              setIsProSearchEnabled={setIsProSearchEnabled}
              proSearchStatus={proSearchStatus}
              timeUntilReset={timeUntilReset}
            />
          </div>

          {}

          {showProSuggestion && proSearchStatus?.can_use && (
            <ProSearchButton
              onClick={handleProSearch}
              remaining={proSearchStatus.remaining}
              isLoading={isLoading}
            />
          )}

          <ResultsGrid
            isLoading={isLoading}
            error={error}
            results={results}
            onFeedback={handleFeedback}
          />

          {success && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
              <SuccessMessage message={success} />
            </div>
          )}

          <UserPlaylists
            userId={userId}
            refreshTrigger={playlistRefreshTrigger}
            initialLikedSongs={likedSongs}
            initialDislikedSongs={dislikedSongs}
            onRefresh={handlePlaylistRefresh}
          />
        </div>
        
        <Footer />
      </div>

      {}
      {showUpgradeModal && (
        <div 
          onClick={() => setShowUpgradeModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-8 relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
          >
            {}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-500/20 rounded-full blur-[60px] pointer-events-none" />

            {}
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-5 right-5 z-50 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2.5 rounded-full"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {}
            <div className="text-center relative z-10 pt-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 mb-6 shadow-xl shadow-purple-500/30">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                AlgoRythms <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Plus</span>
              </h2>
              
              <p className="text-gray-400 mb-8 text-sm leading-relaxed px-2">
                Unleash the full power of AI. Don't let daily limits hold you back from finding your perfect soundtrack.
              </p>

              <div className="space-y-4 mb-8 text-left bg-black/30 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500/20 p-1.5 rounded-full text-purple-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-white/90 font-medium">Unlimited AI Pro & Mood Searches</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500/20 p-1.5 rounded-full text-purple-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-white/90 font-medium">Priority server response times</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500/20 p-1.5 rounded-full text-purple-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-white/90 font-medium">More features coming soon!</span>
                </div>
              </div>

              <button 
                disabled
                className="w-full relative group overflow-hidden bg-white/10 text-white/50 py-4 rounded-2xl font-black text-lg transition-all border border-white/10 cursor-not-allowed"
              >
                Coming Soon
              </button>
              
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="mt-5 text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;
