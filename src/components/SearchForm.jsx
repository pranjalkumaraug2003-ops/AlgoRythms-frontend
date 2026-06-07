import React, { useState } from "react";
import { SearchIcon } from "./IconLoader.jsx";

const MOOD_PRESETS = [
  { label: "Happy", icon: "/icons/happy.png", value: "happy" },
  { label: "Sad", icon: "/icons/sad.png", value: "sad" },
  { label: "Energetic", icon: "/icons/energetic.png", value: "energetic" },
  { label: "Chill", icon: "/icons/chill.png", value: "chill" },
  { label: "Romantic", icon: "/icons/romantic.png", value: "romantic" },
  { label: "Focused", icon: "/icons/focused.png", value: "focused" },
  { label: "Angry", icon: "/icons/angry.png", value: "angry" },
  { label: "Nostalgic", icon: "/icons/nostalgic.png", value: "nostalgic" },
  { label: "Anxious", icon: "/icons/Anxious.png", value: "anxious" },
  { label: "Hopeful", icon: "/icons/hopeful.png", value: "hopeful" },
];

function SearchForm({
  query,
  setQuery,
  searchType,
  setSearchType,
  handleSearch,
  isLoading,
  placeHolderText,
  isProSearchEnabled,
  setIsProSearchEnabled,
  proSearchStatus,
  timeUntilReset,
}) {
  const [selectedMood, setSelectedMood] = useState(null);

  const handleProToggle = () => {
    if (!proSearchStatus?.can_use) {
      return;
    }
    setIsProSearchEnabled(!isProSearchEnabled);
  };

  const handleMoodSelect = (mood) => {
    if (selectedMood?.value === mood.value) {
      setSelectedMood(null);
      setQuery("");
    } else {
      setSelectedMood(mood);
      setQuery(`I'm feeling ${mood.label.toLowerCase()}`);
    }
  };

  const handleCustomMoodChange = (e) => {
    setQuery(e.target.value);
    if (selectedMood && !e.target.value.includes(selectedMood.label)) {
      setSelectedMood(null);
    }
  };

  const isMoodTab = searchType === "mood";

  return (
    <div className="max-w-3xl mx-auto mb-12">
      {}
      <div className="flex justify-center p-1.5 backdrop-blur-xl rounded-full mb-8 shadow-xl border bg-black/40 border-white/5">
        <button
          onClick={() => setSearchType("song")}
          className={`flex-1 py-2 px-3 md:py-3 md:px-6 rounded-full text-sm md:text-base font-bold transition-all duration-300 ${
            searchType === "song"
              ? "bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Song
        </button>
        <button
          onClick={() => setSearchType("artist")}
          className={`flex-1 py-2 px-3 md:py-3 md:px-6 rounded-full text-sm md:text-base font-bold transition-all duration-300 ${
            searchType === "artist"
              ? "bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Artist
        </button>
        <button
          onClick={() => setSearchType("mood")}
          className={`flex-1 py-2 px-3 md:py-3 md:px-6 rounded-full text-sm md:text-base font-bold transition-all duration-300 ${
            searchType === "mood"
              ? "bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Mood
        </button>
      </div>

      {}
      {isMoodTab && (
        <div className="mb-6">
          {}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {MOOD_PRESETS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold transition-all duration-200 border ${
                  selectedMood?.value === mood.value
                    ? "bg-[#1db954] text-black border-[#1db954] shadow-lg shadow-[#1db954]/20"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <img
                  src={mood.icon}
                  alt={mood.label}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                {mood.label}
              </button>
            ))}
          </div>

          {}
          <div className="text-center">
            <input
              type="text"
              value={query}
              onChange={handleCustomMoodChange}
              placeholder="Or describe your mood... (e.g. 'feeling lonely on a rainy evening')"
              className="w-full max-w-xl mx-auto backdrop-blur-xl border rounded-full px-6 py-3 focus:outline-none focus:border-[#1db954] focus:shadow-[0_0_20px_rgba(29,185,84,0.2)] transition-all duration-300 bg-black/40 text-white placeholder-gray-500 border-white/10"
            />
          </div>
        </div>
      )}

      {}
      {!isMoodTab && (
        <form
          onSubmit={handleSearch}
          className="flex rounded-full shadow-2xl backdrop-blur-xl border overflow-hidden transition-all duration-300 focus-within:border-[#1db954] focus-within:shadow-[0_0_30px_rgba(29,185,84,0.2)] bg-black/40 border-white/10 hover:border-white/20"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeHolderText}
            className="flex-1 block w-full bg-transparent border-0 px-6 py-5 text-base focus:outline-none text-white placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-6 py-3 border-0 text-base font-bold shadow-sm text-black bg-[#1db954] hover:bg-[#1ed760] focus:outline-none disabled:opacity-50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black"></div>
            ) : (
              <SearchIcon className="h-6 w-6" />
            )}
          </button>
        </form>
      )}

      {}
      {isMoodTab && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold shadow-sm text-black bg-[#1db954] hover:bg-[#1ed760] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                <span>Finding songs...</span>
              </>
            ) : (
              <>
                <SearchIcon className="h-5 w-5" />
                <span>Find Music for Your Mood</span>
              </>
            )}
          </button>
        </div>
      )}

      {}
      {!isMoodTab && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleProToggle}
            disabled={!proSearchStatus?.can_use}
            className={`group flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              isProSearchEnabled
                ? "bg-[#1db954] text-black shadow-lg shadow-[#1db954]/30"
                : "bg-black/40 backdrop-blur-xl text-gray-400 border border-white/10 hover:border-[#1db954]/50 hover:text-[#1db954]"
            } ${!proSearchStatus?.can_use ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>
              {isProSearchEnabled
                ? "Pro Search ON"
                : proSearchStatus?.can_use
                  ? "Enable Pro Search"
                  : `Resets in ${timeUntilReset}`}
            </span>
            {isProSearchEnabled && (
              <span className="text-sm bg-black/20 px-2 py-1 rounded-full font-bold">
                {proSearchStatus?.remaining} left
              </span>
            )}
          </button>
        </div>
      )}

      {}
      {isProSearchEnabled && !isMoodTab && (
        <div className="mt-4 text-center">
          <p className="text-sm text-[#1db954] font-semibold flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            AI-powered search active • Better results for songs not in database
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchForm;
