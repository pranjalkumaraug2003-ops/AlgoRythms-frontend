import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import Navbar from "../components/Navbar";

function Profile() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(() => {
    const userString = localStorage.getItem("currentUser");
    return userString ? JSON.parse(userString).id : null;
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [savedProfile, setSavedProfile] = useState({
    fullName: "",
    email: "",
  });
  const [createdAt, setCreatedAt] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Pro status state for Navbar (initialized from cache for instant display)
  const [proSearchStatus, setProSearchStatus] = useState(() => {
    const cached = localStorage.getItem("proSearchStatus");
    return cached ? JSON.parse(cached) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    const cached = localStorage.getItem("proSearchStatus");
    return cached ? JSON.parse(cached).is_admin || false : false;
  });
  const [timeUntilReset, setTimeUntilReset] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    async function fetchProfile() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/user/profile?userId=${userId}`,
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setFormData((prev) => ({
          ...prev,
          fullName: data.fullName,
          email: data.email,
        }));
        setSavedProfile({
          fullName: data.fullName,
          email: data.email,
        });
        setCreatedAt(data.createdAt || data.created_at || null);
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load profile data." });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [userId, navigate]);

  // Fetch Pro status for Navbar
  useEffect(() => {
    if (!userId) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/pro-search/status?userId=${userId}`);
        const data = await response.json();
        setProSearchStatus(data);
        setIsAdmin(data.is_admin || false);
        
        if (data.reset_time) {
          const reset = new Date(data.reset_time);
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
        }
      } catch (err) {
        console.error("Error fetching pro status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [userId]);
  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    if (userId) {
      try {
        await fetch(`${API_BASE_URL}/user/session/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      } catch (err) {
        console.error("Error clearing session:", err);
      }
    }

    localStorage.clear();
    window.location.href = "/login";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsSaving(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords don't match!" });
      setIsSaving(false);
      return;
    }

    try {
      const body = {
        userId,
        fullName: formData.fullName,
        password: formData.password || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Update failed");

      setMessage({ type: "success", text: "Profile updated successfully!" });

      setSavedProfile({
        fullName: formData.fullName,
        email: formData.email,
      });

      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));

      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      currentUser.fullName = formData.fullName;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password: deletePassword }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Deletion failed");
      try {
        await fetch(`${API_BASE_URL}/user/session/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      } catch (err) {
        console.error("Error clearing session:", err);
      }

      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#121212] via-[#1a1a1a] to-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1db954]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] via-[#1a1a1a] to-[#121212] text-white relative overflow-hidden">
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
          onUpgradeClick={() => navigate('/main')} // Main page has the upgrade modal
        />

        {}
        <div className="container mx-auto max-w-2xl px-6 md:px-8 py-12 mt-8">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10">
            {}
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1db954] to-[#1ed760] flex items-center justify-center text-black text-2xl font-black shadow-lg shadow-[#1db954]/30">
                {getInitials(savedProfile.fullName)}
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">
                  {savedProfile.fullName || "User"}
                </h2>
                <p className="text-sm text-gray-400">{savedProfile.email}</p>
                {createdAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Member since {formatDate(createdAt)}
                  </p>
                )}
              </div>
            </div>

            <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-[#1db954] to-[#1ed760] bg-clip-text text-transparent">
              Profile Settings
            </h2>

            {}
            {message && (
              <div
                className={`p-4 mb-6 rounded-lg border ${
                  message.type === "success"
                    ? "bg-[#1db954]/10 text-[#1db954] border-[#1db954]/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {message.type === "success" ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="font-semibold">{message.text}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] transition-all hover:border-white/20"
                />
              </div>

              {}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={formData.email}
                  disabled
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-3.5 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Email cannot be changed
                </p>
              </div>

              <div className="border-t border-white/5 my-8 pt-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Change Password
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Leave blank if you don't want to change it
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] transition-all hover:border-white/20 pr-12"
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
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] transition-all hover:border-white/20 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 hover:scale-110 transform duration-200"
                      >
                        {showConfirmPassword ? (
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
                </div>
              </div>

              {}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="group relative px-10 py-4 rounded-full text-base font-bold bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20 hover:bg-[#1ed760] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  {isSaving ? (
                    <span className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />
                  ) : (
                    <>
                      <span className="relative z-10">Save Changes</span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {}
            <div className="border-t border-red-500/20 mt-10 pt-8">
              <h3 className="text-xl font-bold text-red-400 mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteError(null);
                  setDeletePassword("");
                }}
                className="px-6 py-3 rounded-full text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-black text-red-400">
                Delete Account
              </h3>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              This will permanently delete your account and all your data
              including liked/disliked songs and search history. This action{" "}
              <span className="text-white font-semibold">cannot be undone</span>
              .
            </p>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-white mb-2">
                Confirm your password
              </label>
              <div className="relative">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 hover:scale-110 transform duration-200"
                >
                  {showDeletePassword ? (
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

            {deleteError && (
              <div className="p-3 mb-5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-sm font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-6 py-3 rounded-full text-sm font-bold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-6 py-3 rounded-full text-sm font-bold bg-red-500 text-white hover:bg-red-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : (
                  "Delete My Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
