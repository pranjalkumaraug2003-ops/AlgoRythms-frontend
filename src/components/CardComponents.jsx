import React, { useState } from "react";
import { LikeIcon, DislikeIcon, SpotifyIconPNG } from "./IconLoader.jsx";

function FeedbackButton({ children, onClick, ariaLabel, type, isProcessing }) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    if (isProcessing) return;

    setIsClicked(true);
    onClick(e);
    setTimeout(() => setIsClicked(false), 300);
  };

  const getColorClasses = () => {
    if (type === "like") {
      return isClicked
        ? "bg-[#1db954] text-white scale-110 border-[#1db954]"
        : "bg-white/5 text-gray-400 border-white/10 hover:bg-[#1db954] hover:text-white hover:border-[#1db954] hover:scale-110";
    } else {
      return isClicked
        ? "bg-red-500 text-white scale-110 border-red-500"
        : "bg-white/5 text-gray-400 border-white/10 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-110";
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={ariaLabel}
      disabled={isProcessing}
      className={`p-2.5 rounded-full transition-all duration-200 transform border ${getColorClasses()} ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
function Toast({ message, type, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "like" ? "bg-[#1db954]" : "bg-red-500";
  const icon = type === "like" ? "" : "";

  return (
    <div
      className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-up z-50`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-bold">{message}</span>
    </div>
  );
}

export function SongCard({ song, onFeedback, isProResult, matchScore }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const features = song.features || {};

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsProcessing(true);
    try {
      await onFeedback(song.songName, "like");
      setToast({
        message: `Added "${song.songName}" to favorites!`,
        type: "like",
      });
    } catch (error) {
      console.error("Error liking song:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDislike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsProcessing(true);
    try {
      await onFeedback(song.songName, "dislike");
      setToast({
        message: `Won't show "${song.songName}" again`,
        type: "dislike",
      });
    } catch (error) {
      console.error("Error disliking song:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}



      <div className="block group backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(29,185,84,0.2)] border relative bg-[#121212] flex flex-col h-full border-white/5 hover:border-white/10">
        
        {}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start pointer-events-none">
          {isProResult ? (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <span> AI Recommendation</span>
            </div>
          ) : <div />}
          
          {matchScore && (
            <div className="bg-black/60 backdrop-blur-md text-[#1db954] border border-[#1db954]/30 text-sm font-bold px-2 py-1 rounded-md shadow-lg">
              {Math.round(matchScore * 100)}% Match
            </div>
          )}
        </div>

        {}
        <div className="relative overflow-hidden">
          <div
            className="h-56 w-full bg-cover bg-center transition-all duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${song.imageUrl || song.coverImageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {}
        <div className="p-6">
          <h2
            className="text-xl font-bold truncate mb-2 group-hover:text-[#1db954] transition-colors text-white"
            title={song.songName}
          >
            {song.songName}
          </h2>
          <p className="group-hover:text-gray-600 mb-4 truncate text-gray-400">
            {song.artistName}
          </p>

          <div className="flex justify-between items-center mb-5 pb-5 border-b border-white/5 text-gray-400">
            <span className="text-sm font-semibold">{song.duration}</span>
            <SpotifyIconPNG className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>

          {}
          {isProResult && (song.genre || song.year || song.reason) && (
            <>
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">
                AI Recommendation
              </h3>
              <div className="space-y-2 mb-6">
                {song.genre && (
                  <div className="text-sm">
                    <span className="text-gray-500">Genre: </span>
                    <span className="font-semibold text-[#1db954]">
                      {song.genre}
                    </span>
                  </div>
                )}
                {song.year && (
                  <div className="text-sm">
                    <span className="text-gray-500">Year: </span>
                    <span className="font-semibold text-[#1db954]">
                      {song.year}
                    </span>
                  </div>
                )}
                {song.reason && (
                  <div className="text-sm text-gray-400 italic mt-3 p-3 bg-white/5 rounded-lg border border-white/5">
                    "{song.reason}"
                  </div>
                )}
              </div>
            </>
          )}

          {}
          {!isProResult && Object.keys(features).length > 0 && (
            <>
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">
                Features
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(features).map(([key, value]) => (
                  <div
                    key={key}
                    className="text-sm bg-white/5 rounded-lg p-2 border border-white/5"
                  >
                    <span className="text-gray-500 block text-sm mb-1">
                      {key}
                    </span>
                    <span className="font-bold text-[#1db954]">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {}
          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/5">
            <a
              href={`https://open.spotify.com/search/${encodeURIComponent(song.songName + ' ' + song.artistName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#1db954]/10 hover:bg-[#1db954]/20 text-[#1db954] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <SpotifyIconPNG className="w-5 h-5" />
              Open on Spotify
            </a>
          </div>

          {}
          <div className="flex justify-end space-x-3 mt-4">
            <FeedbackButton
              onClick={handleDislike}
              ariaLabel="Dislike song - won't show again"
              type="dislike"
              isProcessing={isProcessing}
            >
              <DislikeIcon />
            </FeedbackButton>

            <FeedbackButton
              onClick={handleLike}
              ariaLabel="Like song - add to favorites"
              type="like"
              isProcessing={isProcessing}
            >
              <LikeIcon />
            </FeedbackButton>
          </div>
        </div>
      </div>
    </>
  );
}

export function ArtistCard({ artist, isProResult }) {
  return (
    <a
      href={`https://open.spotify.com/search/${encodeURIComponent(artist.artistName)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block group backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(29,185,84,0.2)] border relative bg-black/40 hover:bg-black/60 border-white/5 hover:border-white/10"
    >
      {}
      {isProResult && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-black px-3 py-1.5 rounded-full shadow-lg">
           AI Recommendation
        </div>
      )}

      {}
      <div className="relative h-80 w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-all duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${artist.imageUrl || artist.coverImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

        {}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2
            className="text-3xl font-black truncate mb-3 group-hover:text-[#1db954] transition-colors text-white"
            title={artist.artistName}
          >
            {artist.artistName}
          </h2>

          {}
          {isProResult && (artist.genre || artist.reason) && (
            <div className="space-y-2 mb-4">
              {artist.genre && (
                <p className="text-sm font-bold text-[#1db954]">
                  {artist.genre}
                </p>
              )}
              {artist.reason && (
                <p className="text-sm text-gray-300 italic line-clamp-2">
                  {artist.reason}
                </p>
              )}
            </div>
          )}

          {}
          <div className="flex items-center text-white gap-2 font-bold text-sm">
            <span>View on Spotify</span>
            <SpotifyIconPNG className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </a>
  );
}

