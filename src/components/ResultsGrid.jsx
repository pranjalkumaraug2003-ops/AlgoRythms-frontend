import { SongCard, ArtistCard } from "./CardComponents.jsx";
import { LoadingSpinner, ErrorMessage } from "./UIComponents.jsx";
import TopSongs from "./TopSongs.jsx";

function ResultsGrid({ isLoading, error, results, onFeedback }) {
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!results) {
    return <TopSongs />;
  }

  if (results.recommendations.length === 0) {
    return (
      <div className="text-center py-20 px-6 backdrop-blur-xl rounded-2xl border bg-black/40 border-white/10">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/5">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">All out!</h3>
          <p className="text-base text-gray-400">
            Looks like we've run out of recommendations for this query. Try a
            new search!
          </p>
        </div>
      </div>
    );
  }

  const isProResult = results.source === "gemini_pro";

  return (
    <div className="mt-12 animate-fade-in-up">
      <div className="flex flex-col mb-10 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Your Recommendations</h2>

          <div className="flex flex-wrap gap-2 sm:gap-3">
          {isProResult && (
            <div className="flex shrink-0 items-center justify-center gap-2 bg-[#1db954]/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-[#1db954]/50 shadow-[0_0_15px_rgba(29,185,84,0.2)]">
              <span className="font-black text-xs sm:text-sm uppercase tracking-widest text-[#1db954]">AI Powered</span>
            </div>
          )}

          {results.type === "mood" && (
            <div className="flex shrink-0 items-center justify-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-purple-500/30">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-black text-xs sm:text-sm">Mood Match</span>
            </div>
          )}
          </div>
        </div>

        {isProResult && (
          <div className="bg-black/60 border border-[#1db954]/30 rounded-2xl p-4 shadow-[0_8px_30px_rgba(29,185,84,0.1)] flex items-start gap-4 text-sm text-gray-300">
            <svg className="w-6 h-6 shrink-0 text-[#1db954]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="leading-relaxed mt-0.5">
              <strong className="text-white font-bold">Results generated using AI (Google Gemini)</strong> and may not always be accurate. 
              Music metadata is securely provided by Spotify algorithms.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(results.type === "song" || results.type === "mood") &&
          results.recommendations.map((song, index) => (
            <div
              key={index}
              className="animate-bounce-in card-hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <SongCard
                song={song}
                onFeedback={onFeedback}
                isProResult={isProResult || results.type === "mood"}
                matchScore={song.matchScore}
              />
            </div>
          ))}

        {results.type === "artist" &&
          results.recommendations.map((artist, index) => (
            <div
              key={index}
              className="animate-bounce-in card-hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ArtistCard artist={artist} isProResult={isProResult} />
            </div>
          ))}
      </div>


    </div>
  );
}

export default ResultsGrid;
