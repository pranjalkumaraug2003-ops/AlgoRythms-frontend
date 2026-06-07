import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function YouTubePlayer({ videoId, title, searchString, coverUrl, onClose }) {
  const isDirectVideo = videoId && videoId.length === 11 && !videoId.includes('/');
  
  const embedUrl = isDirectVideo
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
    : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchString || title)}&autoplay=1`;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {}
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 pointer-events-none">
            <h3 className="text-white font-bold text-lg truncate drop-shadow-md pointer-events-auto pr-8">
              {title || searchString}
            </h3>
            <button
              onClick={onClose}
              className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
              aria-label="Close player"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {}
          <div className="relative pt-[56.25%] w-full bg-[#121212]">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`Playing: ${title}`}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
