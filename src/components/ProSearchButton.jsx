import React from "react";

function ProSearchButton({ onClick, remaining, isLoading }) {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="bg-black/40 backdrop-blur-2xl border border-[#1db954]/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-[#1db954]/10 hover:border-[#1db954]/50 transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl font-black text-white mb-3">
              Song not found in database
            </h3>
            <p className="text-gray-400 text-base">
              Try{" "}
              <span className="text-[#1db954] font-bold">Pro Search</span>{" "}
              powered by AI for better results
            </p>
          </div>

          <button
            onClick={onClick}
            disabled={isLoading}
            className="group relative px-8 py-4 rounded-full text-base font-bold bg-gradient-to-r from-[#1db954] to-[#1ed760] text-black shadow-lg shadow-[#1db954]/30 hover:shadow-[#1db954]/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 whitespace-nowrap overflow-hidden"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Use Pro Search ({remaining} left)</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProSearchButton;