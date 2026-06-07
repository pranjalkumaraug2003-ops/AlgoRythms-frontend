import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { LoadingSpinner } from './UIComponents.jsx';
import { SpotifyIconPNG } from './IconLoader.jsx';

function TopSongCard({ song }) {
  return (
    <a
      href={song.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-80 flex-shrink-0 group bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 
                 shadow-xl border border-white/5 hover:shadow-[0_8px_30px_rgba(29,185,84,0.2)] hover:border-white/10 hover:bg-black/60"
    >
      <div className="relative overflow-hidden">
        <div
          className="h-52 w-full bg-cover bg-center transition-all duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${song.imageUrl})` }}
          alt={`${song.songName} album art`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5">
        <h2 
          className="text-xl font-bold text-white truncate mb-2 group-hover:text-[#1db954] transition-colors" 
          title={song.songName}
        >
          {song.songName}
        </h2>
        <p className="text-base text-gray-400 group-hover:text-gray-300 mb-4 truncate" title={song.artistName}>
          {song.artistName}
        </p>
        <div className="flex justify-end items-center text-gray-400">
          <SpotifyIconPNG className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
}

function ScrollingRow({ title, songs }) {
  if (!songs || songs.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-black text-white mb-8">
        {title}
      </h2>
      
      <div className="overflow-hidden scrolling-wrapper">
        <div 
          className="flex animate-scroll-x space-x-6"
          style={{ animationDuration: `${songs.length * 4}s` }}
        >
          {[...songs, ...songs].map((song, index) => (
            <TopSongCard 
              key={`${index}-${song.songName}`} 
              song={song} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TopSongs() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const CACHE_KEY = 'top_songs_cache';
  const CACHE_EXPIRATION = 3600000; // 1 hour

  useEffect(() => {
    async function fetchTopSongs() {
      // Check Cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;
          
          if (!isExpired && cachedData) {
            setData(cachedData);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Cache parse error:", e);
        }
      }

      //Fetch if no cache or expired
      try {
        const response = await fetch(`${API_BASE_URL}/top-songs`);
        if (!response.ok) {
          const d = await response.json();
          throw new Error(d.error || 'Failed to fetch top songs');
        }
        const d = await response.json();
        
        //  Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: d,
          timestamp: Date.now()
        }));
        
        setData(d);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopSongs();
  }, []); 

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 font-semibold">Could not load top songs: {error}</p>
      </div>
    );
  }

  return (
    <>
      <ScrollingRow title="Indian Top Hits" songs={data?.indianTopHits} />
      <ScrollingRow title="Global Top Hits" songs={data?.globalTopHits} />
      <ScrollingRow title="Today's Top Hits" songs={data?.todaysTopHits} />
    </>
  );
}

export default TopSongs;