import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-black/40 backdrop-blur-2xl py-8 px-6 md:px-12 relative overflow-hidden">
      {/* Subtle background glow element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-20 bg-[#1db954]/5 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 relative z-10">
        
        {/* Brand Column */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black mb-3 tracking-tighter flex items-center">
              <span className="text-white">Algo</span>
              <span className="bg-gradient-to-r from-[#1db954] to-[#1ed760] bg-clip-text text-transparent">Rythms</span>
            </h3>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              The next generation music discovery platform. Discover new tracks, 
              explore artists, and curate your perfect vibe with the power of artificial intelligence.
            </p>
          </div>
          <div className="text-sm text-gray-500 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} AlgoRythms Inc. All rights reserved.
          </div>
        </div>

        {/* Links Column */}
        <div className="md:col-span-3 lg:col-span-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 drop-shadow-sm">Legal</h4>
          <ul className="space-y-2.5 text-sm text-gray-400 font-medium tracking-wide">
            <li>
              <Link to="/terms-of-service" className="group flex items-center gap-2.5 hover:text-white transition-colors duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#1db954] transition-colors duration-300"></span>
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="group flex items-center gap-2.5 hover:text-white transition-colors duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#1db954] transition-colors duration-300"></span>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="group flex items-center gap-2.5 hover:text-white transition-colors duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#1db954] transition-colors duration-300"></span>
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Attributions Column */}
        <div className="md:col-span-4 lg:col-span-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 drop-shadow-sm">Attributions</h4>
          <ul className="space-y-3 text-sm text-gray-400 leading-relaxed">
            <li className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors duration-300 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1db954]/0 via-[#1db954]/5 to-[#1db954]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
              <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center shrink-0 border border-white/10 text-white/80 shadow-sm relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-[#1db954]/30">
                <svg className="w-3.5 h-3.5 text-[#1db954]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </div>
              <div className="relative z-10 pt-0.5">
                <strong className="text-gray-200 block mb-0.5 font-semibold text-sm">Music metadata by Spotify.</strong>
                <span className="opacity-70 text-xs block leading-snug">Spotify & the Spotify logo are trademarks of Spotify AB. All audio linking is provided without hosting.</span>
              </div>
            </li>
            
            <li className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors duration-300 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
              <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center shrink-0 border border-white/10 text-white/80 shadow-sm relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-red-500/30">
                <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              <div className="relative z-10 pt-0.5">
                <strong className="text-gray-200 block mb-0.5 font-semibold text-sm">Playback powered by YouTube.</strong>
                <span className="opacity-70 text-xs block leading-snug">Music playback is provided via YouTube embedded players in compliance with API Terms of Service.</span>
              </div>
            </li>
            
            <li className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors duration-300 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
              <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center shrink-0 border border-white/10 text-white/80 shadow-sm relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-blue-400/30">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <div className="relative z-10 pt-0.5">
                <strong className="text-gray-200 block mb-0.5 font-semibold text-sm">AI recommendations by Gemini.</strong>
                <span className="opacity-70 text-xs block leading-snug">Suggestions generated via Google Gemini AI may not always be 100% accurate.</span>
              </div>
            </li>
          </ul>
        </div>
        
      </div>
    </footer>
  );
}
