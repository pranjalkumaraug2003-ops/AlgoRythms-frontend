import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Navbar from '../components/Navbar';
import developerAvatar from '../assets/developer_avatar.png';

function About() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const [userId] = React.useState(() => {
    const userString = localStorage.getItem("currentUser");
    return userString ? JSON.parse(userString).id : null;
  });

  const [proSearchStatus, setProSearchStatus] = React.useState(() => {
    const cached = localStorage.getItem("proSearchStatus");
    return cached ? JSON.parse(cached) : null;
  });
  const [isAdmin, setIsAdmin] = React.useState(() => {
    const cached = localStorage.getItem("proSearchStatus");
    return cached ? JSON.parse(cached).is_admin || false : false;
  });
  const [timeUntilReset, setTimeUntilReset] = React.useState("");

  React.useEffect(() => {
    if (!userId) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/pro-search/status?userId=${userId}`);
        const data = await response.json();
        setProSearchStatus(data);
        setIsAdmin(data.is_admin || false);
        
        if (data.reset_time) {
          const reset = new Date(data.reset_time);
          const updateTimer = () => {
            const now = new Date();
            const diff = reset - now;
            if (diff <= 0) {
              setTimeUntilReset("00:00");
              return;
            }
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeUntilReset(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
          };
          updateTimer();
          const timer = setInterval(updateTimer, 1000);
          return () => clearInterval(timer);
        }
      } catch (err) {
        console.error("Error fetching pro status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] via-[#1a1a1a] to-[#121212] text-white relative overflow-hidden">
      
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#1db954] opacity-[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#1ed760] opacity-[0.06] rounded-full blur-[100px]" />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-[#1db954] opacity-[0.04] rounded-full blur-[80px]" />
      </div>

      {}
      <div className="relative z-10">
        
        {}
        {}
        <Navbar 
          isAdmin={isAdmin}
          proSearchStatus={proSearchStatus}
          timeUntilReset={timeUntilReset}
          onLogout={handleLogout}
          onUpgradeClick={() => window.location.href = '/main'}
        />

        {}
        <div className="container mx-auto max-w-5xl px-6 md:px-12 py-12">
          
          {}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-[#1db954] to-[#1ed760] bg-clip-text text-transparent mb-6 tracking-tight">
              About The Project
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Discovering the engineering and passion behind your personalized music journey
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">

            {}
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl hover:border-white/20 transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-1 h-12 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full" />
                <h2 className="text-3xl font-black text-white">How It Works</h2>
              </div>
              
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p className="text-lg">
                  AlgoRythms isn't just a search engine; it's a smart recommendation system powered by machine learning and high-fidelity AI.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/5 p-6 rounded-xl border border-[#1db954]/20 shadow-lg shadow-[#1db954]/5 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-[#1db954] font-bold mb-2">Base Search</h3>
                    <p className="text-sm text-gray-400">Hybrid search Engine that is based on ML technologies like cosine similarity, KNN and SVD for higly accurate recommendations.</p>
                  </div>
                  
                  <div className="bg-white/5 p-6 rounded-xl border border-[#1db954]/20 shadow-lg shadow-[#1db954]/5 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-[#1db954] font-bold mb-2">Pro Search</h3>
                    <p className="text-sm text-gray-400">AI-powered deep search using Google's Gemini, designed to find exactly what's in your head.</p>
                  </div>
                  
                  <div className="bg-white/5 p-6 rounded-xl border border-[#1db954]/20 shadow-lg shadow-[#1db954]/5 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-[#1db954] font-bold mb-2">Mood Search</h3>
                    <p className="text-sm text-gray-400">Simply tell us your vibe, and our AI constructs a personalized playlist matching your energy.</p>
                  </div>
                  
                  <div className="bg-white/5 p-6 rounded-xl border border-[#1db954]/20 shadow-lg shadow-[#1db954]/5 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-[#1db954] font-bold mb-2">Jam Room</h3>
                    <p className="text-sm text-gray-400">Real-time synchronized listening rooms where you can jam with friends anywhere in the world.</p>
                  </div>

                  <div className="bg-white/5 p-6 rounded-xl border border-[#1db954]/20 shadow-lg shadow-[#1db954]/5 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-[#1db954] font-bold mb-2">User Feedback</h3>
                    <p className="text-sm text-gray-400">Like or dislike songs to train our engine. This ensures your recommendations evolve and never feel repetitive!</p>
                  </div>

                  <div className="bg-white/5 p-6 rounded-xl border border-[#1db954]/20 shadow-lg shadow-[#1db954]/5 hover:bg-white/[0.07] transition-all">
                    <h3 className="text-[#1db954] font-bold mb-1">Game Room</h3>
                    <p className="text-sm text-gray-400">Interactive social music games like "Fill the Lyrics" and "Guess the Song" to challenge your friends!</p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl hover:border-white/20 transition-all duration-300 relative overflow-hidden">
              {}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1db954] to-transparent opacity-50" />

              <h2 className="text-3xl font-black text-white mb-8">Meet the Developer</h2>
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {}
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full flex-shrink-0 border-4 border-[#1db954]/30 shadow-2xl shadow-[#1db954]/20 relative group overflow-hidden">
                  <img 
                    src={developerAvatar} 
                    alt="Developer Profile" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#1db954] mb-2">
                    Pranjal Kumar
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest font-bold">
                    Web Developer & ML Enthusiast
                  </p>
                  
                  <p className="text-gray-300 mb-4 leading-relaxed text-base">
                    Hi, I’m Pranjal, a Computer Science student at DTU, currently building AlgoRythms. It’s basically what happens when Spotify and ChatGPT have a very ambitious child.
                  </p>
                  
                  <p className="text-gray-300 mb-4 leading-relaxed text-base">
                    It’s a one-developer project, just me. So if you spot a bug, congratulations, you’ve discovered a feature under development. If anything breaks, behaves weirdly, or just feels off, feel free to reach out. I probably broke it 5 minutes ago and am already trying to fix it.
                  </p>

                  <p className="text-gray-300 mb-8 leading-relaxed text-base italic opacity-80">
                    Some parts of the app are still a work in progress, and there’s a lot more coming soon like a mobile app, more games, and better features, assuming I don’t procrastinate.
                  </p>

                  {}
                  <div className="flex gap-4 flex-wrap">
                    <a 
                      href="https://github.com/Pranjal-148" 
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-sm font-bold"
                    >
                      GitHub
                    </a>
                    <a 
                      href="mailto:algorythms.app@gmail.com" 
                      className="px-5 py-2.5 bg-[#1db954]/10 text-[#1db954] hover:bg-[#1db954]/20 border border-[#1db954]/30 hover:border-[#1db954]/50 rounded-lg transition-all text-sm font-bold"
                    >
                      Email
                    </a>
                    <a 
                      href="https://www.instagram.com/k_pran_jal/" 
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-sm font-bold"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="text-center pt-12 border-t border-white/5">
              <h3 className="text-2xl font-bold text-white mb-6">Coming Soon</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm font-semibold hover:border-[#1db954]/30 hover:text-[#1db954] transition-all">
                  User Playlists
                </span>
                <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm font-semibold hover:border-[#1db954]/30 hover:text-[#1db954] transition-all">
                  User Taste Profile
                </span>
                <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm font-semibold hover:border-[#1db954]/30 hover:text-[#1db954] transition-all">
                  Mobile App
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default About;