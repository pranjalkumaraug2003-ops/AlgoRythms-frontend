import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center py-20">
      <div
        className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1db954]"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      <p className="text-gray-400 mt-6 text-base font-semibold">Finding your perfect match...</p>
    </div>
  );
}

export function ErrorMessage({ error }) {
  return (
    <div className="bg-red-500/10 border-2 border-red-500/50 text-red-400 px-6 py-4 rounded-2xl relative max-w-2xl mx-auto backdrop-blur-xl" role="alert">
      <div className="flex items-start gap-4">
        <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <div>
          <strong className="font-black text-base block mb-1">Oops!</strong>
          <span className="block text-sm">{error}</span>
        </div>
      </div>
    </div>
  );
}

export function SuccessMessage({ message }) {
  return (
    <div className="bg-green-500/10 border-2 border-green-500/50 text-green-400 px-6 py-4 rounded-2xl relative max-w-2xl mx-auto backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300" role="alert">
      <div className="flex items-start gap-4">
        <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM14.707 9.293a1 1 0 00-1.414-1.414L10 10.586 8.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <div>
          <strong className="font-black text-base block mb-1">Success!</strong>
          <span className="block text-sm">{message}</span>
        </div>
      </div>
    </div>
  );
}

export function SpotifyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block h-5 w-5" 
    >
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.889 13.75c-.2.313-.563.438-.875.25-2.5-1.5-5.625-1.813-9.313-.938-.313.063-.625-.125-.688-.438-.063-.313.125-.625.438-.688 3.938-.938 7.313-.563 10.063 1.125.313.188.438.563.25.875zm.563-2.75c-.25.375-.75.5-1.125.25-2.75-1.688-6.625-2.188-10.938-1.188-.375.063-.75-.188-.813-.563-.063-.375.188-.75.563-.813 4.688-1.063 8.875-.5 11.875 1.375.375.188.5.75.25 1.125zm.5-3c-.25.438-.813.625-1.25.375-3.375-2.063-8.75-2.688-12.813-1.5-.438.125-.938-.188-1.063-.625-.125-.438.188-.938.625-1.063 4.563-1.25 10.375-.563 14.125 1.5.438.25.625.813.375 1.25z" />
    </svg>
  );
}