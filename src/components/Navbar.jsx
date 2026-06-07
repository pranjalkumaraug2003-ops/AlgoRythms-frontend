import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ 
  isAdmin, 
  proSearchStatus, 
  timeUntilReset, 
  onLogout, 
  onUpgradeClick,
  wsConnected = true // Default to true if not in PartyRoom
}) {
  const location = useLocation();
  const isHomePage = location.pathname === '/main' || location.pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <Link
          to="/main"
          className="text-xl sm:text-2xl font-black bg-gradient-to-r from-[#1db954] to-[#1ed760] bg-clip-text text-transparent tracking-tight hover:scale-105 transition-transform duration-200 z-10"
        >
          AlgoRythms
        </Link>

        {/* Hamburger Icon */}
        <div className="md:hidden z-10 flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white hover:text-[#1db954] focus:outline-none transition-all active:scale-90"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          {isAdmin && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-black px-4 py-2 rounded-full shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>ADMIN</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!proSearchStatus ? (
              <div className="text-sm font-bold text-white/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                Pro: …
              </div>
            ) : isAdmin ? (
              <div className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/30">
                Pro: UNLIMITED ∞
              </div>
            ) : proSearchStatus.is_plus ? (
              <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/30 shadow-lg shadow-purple-500/20">
                Pro: UNLIMITED ∞ (PLUS)
              </div>
            ) : proSearchStatus.in_cooldown ? (
              <div className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/30 animate-pulse">
                Resets in {timeUntilReset}
              </div>
            ) : proSearchStatus.can_use ? (
              <div className="text-sm font-bold text-[#1db954] bg-[#1db954]/10 px-3 py-1.5 rounded-full border border-[#1db954]/30">
                Pro: {proSearchStatus.remaining}/10
              </div>
            ) : (
              <div className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/30">
                Resets in {timeUntilReset}
              </div>
            )}

            {!isAdmin && !proSearchStatus?.is_plus && onUpgradeClick && (
              <button 
                onClick={onUpgradeClick}
                className="text-sm font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform whitespace-nowrap"
              >
                UPGRADE
              </button>
            )}
          </div>

          {!isHomePage && (
            <Link
              to="/main"
              className="text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              Home
            </Link>
          )}

          <Link
            to="/profile"
            className="text-sm font-bold text-white/70 hover:text-white transition-colors"
          >
            Profile
          </Link>

          <Link
            to="/about"
            className="text-sm font-bold text-white/70 hover:text-white transition-colors"
          >
            About
          </Link>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-full text-sm font-bold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all font-sans"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-3xl border-b border-white/10 flex flex-col items-center py-6 space-y-6 shadow-2xl transition-all duration-300 origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
        {isAdmin && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-black px-4 py-2 rounded-full shadow-lg">
            <span>ADMIN</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {!proSearchStatus ? (
            <div className="text-sm font-bold text-white/30 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              Pro: …
            </div>
          ) : isAdmin ? (
            <div className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/30">
              Pro: UNLIMITED ∞
            </div>
          ) : proSearchStatus.is_plus ? (
            <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/30 shadow-lg shadow-purple-500/20">
              Pro: UNLIMITED ∞ (PLUS)
            </div>
          ) : proSearchStatus.in_cooldown ? (
            <div className="text-sm font-bold text-red-400 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/30 animate-pulse">
              Resets in {timeUntilReset}
            </div>
          ) : proSearchStatus.can_use ? (
            <div className="text-sm font-bold text-[#1db954] bg-[#1db954]/10 px-4 py-2 rounded-full border border-[#1db954]/30">
              Pro: {proSearchStatus.remaining}/10
            </div>
          ) : (
            <div className="text-sm font-bold text-red-400 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/30">
              Resets in {timeUntilReset}
            </div>
          )}

          {!isAdmin && !proSearchStatus?.is_plus && onUpgradeClick && (
            <button 
              onClick={() => { onUpgradeClick(); setIsMobileMenuOpen(false); }}
              className="text-sm font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform"
            >
              UPGRADE
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 w-full px-6">
          {!isHomePage && (
            <Link
              to="/main"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2 text-lg font-bold text-white/70 hover:text-white transition-colors border-b border-white/5"
            >
              Home
            </Link>
          )}

          <Link
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center py-2 text-lg font-bold text-white/70 hover:text-white transition-colors border-b border-white/5"
          >
            Profile
          </Link>

          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center py-2 text-lg font-bold text-white/70 hover:text-white transition-colors border-b border-white/5"
          >
            About
          </Link>

          <button
            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
            className="mt-2 w-full max-w-[200px] px-4 py-3 rounded-full text-sm font-bold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all font-sans"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
