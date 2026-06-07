import React from 'react';

export function LikeIcon({ className = "h-6 w-6" }) {
  return <img src="/icons/like.png" alt="Like" className={className} />;
}

export function DislikeIcon({ className = "h-6 w-6" }) {
  return <img src="/icons/dislike.png" alt="Dislike" className={className} />;
}

export function SearchIcon({ className = "h-6 w-6" }) {
  return <img src="/icons/search.png" alt="Search" className={className} />;
}

export function SpotifyIconPNG({ className = "h-6 w-6" }) {
  return <img src="/icons/spotify.png" alt="Spotify" className={className} />;
}