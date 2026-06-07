import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting to Spotify...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    
    if (error) {
      setStatus(`Spotify Auth Error: ${error}`);
      setTimeout(() => navigate('/main'), 3000);
      return;
    }

    if (!code) {
      navigate('/main');
      return;
    }

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);

    setStatus("Exchanging tokens...");

    fetch(`${API_BASE_URL}/spotify/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userId: user.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus(`Failed to connect Spotify: ${data.error}`);
          setTimeout(() => navigate('/main'), 3000);
        } else {
          setStatus("Successfully connected to Spotify Premium!");
          const pendingRoom = localStorage.getItem('pendingPartyRoom');
          if (pendingRoom) {
             localStorage.removeItem('pendingPartyRoom');
             navigate(`/party/${pendingRoom}`);
          } else {
             navigate('/main');
          }
        }
      })
      .catch(err => {
        setStatus(`Network Error: ${err.message}`);
        setTimeout(() => navigate('/main'), 3000);
      });

  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1db954] opacity-10 rounded-full blur-[100px] pointer-events-none" />
      <div className="text-center relative z-10 flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-[#181818] rounded-full flex items-center justify-center shadow-xl border border-white/5 animate-bounce">
          <svg className="w-8 h-8 text-[#1db954]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.261 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
        </div>
        <h2 className="text-2xl font-black tracking-tight">{status}</h2>
      </div>
    </div>
  );
}

export default SpotifyCallback;
