import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function GamesRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [navigate]);

  const games = [
    {
      id: 'fill-lyrics',
      title: 'Fill the Lyrics',
      description: 'Test your memory! Complete the missing lines from trending hits.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'from-purple-500 to-indigo-600',
      status: 'Coming Soon'
    },
    {
      id: 'guess-song',
      title: 'Guess the Song',
      description: 'Listen to a 5-second snippet and identify the track before time runs out.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-600',
      status: 'Coming Soon'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden text-white font-sans selection:bg-[#1db954]/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-[#1db954]/05 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-500/03 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/party/${roomCode}`)} className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
              Games Room
            </h1>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
            <span className="text-white/50 text-sm font-bold uppercase tracking-wider">Room Code</span>
            <span className="font-mono font-black text-[#1db954] tracking-widest">{roomCode}</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Choose Your Challenge</h2>
          <p className="text-white/40 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Level up your party with interactive music games. Compete with your friends and climb the local leaderboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {games.map((game) => (
            <div 
              key={game.id}
              className="group relative bg-[#121212] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:border-[#1db954]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center"
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none`} />
              
              <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${game.color} flex items-center justify-center mb-8 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <div className="text-white scale-125">{game.icon}</div>
              </div>

              <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-[#1db954] transition-colors">{game.title}</h3>
              <p className="text-white/40 mb-10 font-medium leading-relaxed max-w-[280px]">{game.description}</p>
              
              <div className="mt-auto">
                <button 
                  disabled 
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-black tracking-[0.2em] uppercase text-white/30 cursor-not-allowed group-hover:border-white/20 transition-all"
                >
                  {game.status}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-gradient-to-br from-[#181818] to-black border border-white/5 rounded-[2.5rem] p-10 text-center relative overflow-hidden group hover:border-[#1db954]/20 transition-colors">
          <div className="absolute inset-0 bg-[#1db954] opacity-[0.02] pointer-events-none" />
          <h3 className="text-xl font-black text-[#1db954] mb-3 uppercase tracking-widest">How to play</h3>
          <p className="text-white/50 max-w-xl mx-auto font-medium leading-relaxed">
            The games room is currently under development. Once live, the host can start a round, and all participants will see the game interface synced in real-time. Points will be awarded for speed and accuracy!
          </p>
        </div>
      </div>
    </div>
  );
}

export default GamesRoom;
