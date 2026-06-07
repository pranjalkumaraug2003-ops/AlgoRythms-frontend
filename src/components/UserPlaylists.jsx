import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotifyIconPNG } from "./IconLoader.jsx";
import { API_BASE_URL } from "../config";

function HeartIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      className="w-4 h-4 transition-transform duration-300"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function PlaylistSongCard({
  songName,
  playlistType,
  onRemove,
  removing,
  index,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const generateGradient = (name) => {
    const colors = [
      ["#1db954", "#1ed760"], ["#8b5cf6", "#a78bfa"],
      ["#3b82f6", "#60a5fa"], ["#f59e0b", "#fbbf24"],
      ["#ec4899", "#f472b6"], ["#06b6d4", "#22d3ee"],
      ["#ef4444", "#f87171"], ["#10b981", "#34d399"],
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorPair = colors[Math.abs(hash) % colors.length];
    return `linear-gradient(135deg, ${colorPair[0]}20, ${colorPair[1]}20)`;
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const searchTerm = encodeURIComponent(songName);
        const response = await fetch(`https://itunes.apple.com/search?term=${searchTerm}&media=music&limit=1`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const artwork = data.results[0].artworkUrl100;
          setImageUrl(artwork.replace("100x100", "300x300"));
        }
      } catch (err) {
        console.error("Failed to fetch song image:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImage();
  }, [songName]);

  const accentColor = playlistType === "liked" ? "#1db954" : "#ef4444";
  const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(songName)}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 20, stiffness: 100, delay: index * 0.03 }}
      className="group relative glass-pane glass-pane-hover rounded-xl overflow-hidden"
    >
      <div className="relative h-40 w-full overflow-hidden">
        {isLoading ? (
          <div className="h-full w-full animate-shimmer" style={{ background: generateGradient(songName) }} />
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt={songName} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-115" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 group-hover:opacity-60 transition-opacity" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-zinc-900/50">
            <SpotifyIconPNG className="h-10 w-10 opacity-20" />
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
           <a 
            href={spotifyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-[#1db954] text-black transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-xl hover:bg-[#1ed760]"
           >
             <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M7 6v12l10-6z" />
             </svg>
           </a>
        </div>

        {/* Remove Button */}
        <button
          onClick={(e) => { e.preventDefault(); onRemove(songName); }}
          disabled={removing}
          className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/90 hover:bg-red-600 text-white hover:text-white z-30 shadow-2xl border border-white/10"
        >
          <RemoveIcon />
        </button>

        <div className="absolute bottom-2 left-3 z-10">
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor, boxShadow: `0 0 10px ${accentColor}80` }} />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">
                {playlistType === "liked" ? "Liked" : "Disliked"}
              </span>
           </div>
        </div>
      </div>

      
    </motion.div>
  );
}

function PlaylistSection({
  title,
  icon,
  accentColor,
  songs,
  playlistType,
  onRemove,
  removingSet,
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-500 ${isOpen ? (playlistType === 'liked' ? 'accent-glow-green' : 'accent-glow-red') : ''}`}
      style={{
        background: "rgba(10, 10, 10, 0.4)",
        border: `1px solid ${isOpen ? accentColor + "40" : "rgba(255,255,255,0.06)"}`,
        backdropFilter: "blur(20px)",
      }}
    >
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-5 transition-all duration-300 hover:bg-white/5 relative group"
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2 rounded-lg" style={{ background: accentColor + "15", color: accentColor }}>
            {icon}
          </div>
          <div className="flex flex-col items-start">
            <span className="font-black text-white text-base tracking-tight uppercase">
              {title}
            </span>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Collection • {songs.length} Tracks
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
           <span className="text-white/20 group-hover:text-white/50 transition-colors">
            <ChevronIcon open={isOpen} />
          </span>
        </div>

        {/* Glossy background element */}
        {isOpen && (
            <div className="absolute inset-0 opacity-15 pointer-events-none" 
                 style={{ background: `radial-gradient(circle at top left, ${accentColor}40, transparent 70%)` }} />
        )}
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 pt-2">
          {songs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-white/20">
               <div className="mb-3 opacity-20">{icon}</div>
               <p className="text-sm font-bold uppercase tracking-widest">Empty Selection</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {songs.map((songName, index) => (
                    <PlaylistSongCard
                    key={songName}
                    songName={songName}
                    playlistType={playlistType}
                    onRemove={onRemove}
                    removing={removingSet.has(songName)}
                    index={index}
                    />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function UserPlaylists({ userId, refreshTrigger, initialLikedSongs, initialDislikedSongs, onRefresh }) {
  const [likedSongs, setLikedSongs] = useState(initialLikedSongs || []);
  const [dislikedSongs, setDislikedSongs] = useState(initialDislikedSongs || []);
  const [isLoading, setIsLoading] = useState(!initialLikedSongs && !initialDislikedSongs);
  const [removingLiked, setRemovingLiked] = useState(new Set());
  const [removingDisliked, setRemovingDisliked] = useState(new Set());
  useEffect(() => {
    if (initialLikedSongs) setLikedSongs(initialLikedSongs);
  }, [initialLikedSongs]);
  useEffect(() => {
    if (initialDislikedSongs) setDislikedSongs(initialDislikedSongs);
  }, [initialDislikedSongs]);

  const fetchPlaylists = useCallback(async () => {
    if (!userId) return;
    if (onRefresh) {
      await onRefresh();
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/user/stats?userId=${userId}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setLikedSongs(data.liked_songs || []);
      setDislikedSongs(data.disliked_songs || []);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, onRefresh]);
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists, refreshTrigger]);

  const handleRemove = async (songName, playlistType) => {
    const setRemoving =
      playlistType === "liked" ? setRemovingLiked : setRemovingDisliked;
    const setSongs =
      playlistType === "liked" ? setLikedSongs : setDislikedSongs;

    setRemoving((prev) => new Set(prev).add(songName));

    try {
      const res = await fetch(`${API_BASE_URL}/user/playlist/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, songName, playlistType }),
      });

      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s !== songName));
      }
    } catch (err) {
      console.error("Failed to remove song:", err);
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(songName);
        return next;
      });
    }
  };

  const hasAnySongs = likedSongs.length > 0 || dislikedSongs.length > 0;

  if (isLoading) return null;

  if (!hasAnySongs) return null;

  return (
    <div className="mt-12">
      {}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-white/40"
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
          <h2 className="text-3xl font-black text-white tracking-tight">
            My Playlists
          </h2>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {}
        {likedSongs.length > 0 && (
          <PlaylistSection
            title="Liked Songs"
            icon={<HeartIcon />}
            accentColor="#1db954"
            songs={likedSongs}
            playlistType="liked"
            onRemove={(name) => handleRemove(name, "liked")}
            removingSet={removingLiked}
          />
        )}

        {}
        {dislikedSongs.length > 0 && (
          <PlaylistSection
            title="Disliked Songs"
            icon={<BanIcon />}
            accentColor="#ef4444"
            songs={dislikedSongs}
            playlistType="disliked"
            onRemove={(name) => handleRemove(name, "disliked")}
            removingSet={removingDisliked}
          />
        )}
      </div>

      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export default UserPlaylists;
