import React, { useState, useEffect, useRef, startTransition } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL, PARTY_API_URL, PARTY_WS_URL } from '../config';

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-slide-up min-w-[280px] max-w-[400px] ${
            t.type === 'error'
              ? 'bg-red-950/90 border-red-500/30 text-red-200'
              : t.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
              : 'bg-[#1a1a1a]/90 border-white/10 text-white/90'
          }`}
        >
          <div className="flex-shrink-0">
            {t.type === 'error' ? (
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            ) : t.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          <p className="text-sm font-semibold flex-1">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-white/40 hover:text-white transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
    </div>
  );
}

function PartyRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentPlayback, setCurrentPlayback] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const playerRef = useRef(null);
  const playerReadyRef = useRef(false);
  const pendingSyncRef = useRef(null);
  const currentSongIdRef = useRef(null);
  const wsRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const userRef = useRef(null);
  const roomStateRef = useRef(null);
  const hostIdRef = useRef(null);
  const didConnectRef = useRef(false);
  const toastIdRef = useRef(0);
  const clockOffsetRef = useRef(0);
  const ntpSyncedRef = useRef(false);
  const ntpDataRef = useRef([]);
  const lastVersions = useRef(new Map());
  const handleWsMessageRef = useRef(null);
  const pendingSyncStateRef = useRef(null);   // sync_state deferred until NTP synced
  const playbackAnchorRef = useRef(null);     // { positionSec, serverMs, isPlaying, songId }
  const driftIntervalRef = useRef(null);

  function parseISO8601Duration(duration) {
    if (!duration) return 0;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    return hours * 3600 + minutes * 60 + seconds;
  }

  function showToast(message, type = 'info') {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4500);
  }
  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  useEffect(() => {
    roomStateRef.current = roomState;
    if (roomState) hostIdRef.current = roomState.host_id;
  }, [roomState]);

  useEffect(() => {
    if (didConnectRef.current) return;
    didConnectRef.current = true;
    let ignore = false;

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) { navigate('/login'); return; }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    userRef.current = user;

    const token = localStorage.getItem('token');
    fetch(`${PARTY_API_URL}/party/${roomCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => { if (!res.ok) throw new Error("Room not found"); return res.json(); })
      .then(data => {
        if (ignore) return;
        setRoomState(data);
        hostIdRef.current = data.host_id;
        if (data.currentSong) { setCurrentPlayback(data.currentSong); setIsPlaying(data.is_playing); }
        connectWebSocket(roomCode, user.id);
      })
      .catch(err => {
        if (!ignore) setError(err.message);
      });

    return () => {
      ignore = true;
      didConnectRef.current = false;
      if (wsRef.current) wsRef.current.close(1000, 'Component unmounting');
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [roomCode, navigate]);

  function sendNtpProbe(ws) {
    const t0 = performance.now();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'ntp_request', data: { t0 } }));
    }
  }

  function connectWebSocket(roomCode, userId) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.close(1000, 'Replacing with new connection');
    }

    let attempt = 0;
    const connect = () => {
      const token = localStorage.getItem('token');
      const wsUrl = `${PARTY_WS_URL}/party/ws/${roomCode}?token=${token}`;
      console.log(`[Jam] Connecting WebSocket to: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        attempt = 0;
        setWsConnected(true);
        ws.send(JSON.stringify({ 
          event: 'join_room', 
          data: { displayName: userRef.current?.fullName || 'Guest' } 
        }));
        
        ntpDataRef.current = [];
        ntpSyncedRef.current = false;
        sendNtpProbe(ws);

        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          if (wsRef.current === ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'pong', data: {} }));
          }
        }, 25000);
      };

      ws.onclose = (e) => {
        if (wsRef.current !== ws) return;
        setWsConnected(false);
        clearInterval(heartbeatIntervalRef.current);
        if (e.code === 4001 || e.code === 1000) return;
        if (attempt >= 8) { setError('Lost connection to room'); return; }
        
        const base = Math.min(500 * Math.pow(2, attempt), 30000);
        const jitter = base * 0.3 * (Math.random() * 2 - 1);
        const delay = Math.round(base + jitter);
        attempt++;
        setTimeout(connect, delay);
      };

      handleWsMessageRef.current = handleWsMessage;
      ws.onmessage = (rawEvent) => {
        try {
          const envelope = JSON.parse(rawEvent.data);
          const { type, payload, v } = envelope;
          
          if (v && v > 0) {
            const lastV = lastVersions.current.get(type) ?? 0;
            if (v <= lastV) return;
            lastVersions.current.set(type, v);
          }
          
          if (type) {
            handleWsMessageRef.current?.(type, payload || envelope.data);
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };
      
      ws.onerror = () => {};
    };
    
    connect();
  }

  // Applies a server sync_state to the player: computes the true current
  // position (accounting for network + elapsed time) and seeks/loads.
  // Also records a playback anchor used for drift correction.
  function applyServerSync({ currentSong, is_playing, current_time, server_timestamp_ms }) {
    const nowMs = ntpSyncedRef.current
      ? (performance.now() + clockOffsetRef.current)
      : (Date.now() + clockOffsetRef.current);
    const networkLatencyMs = nowMs - server_timestamp_ms;
    const adjustedTime = current_time + (networkLatencyMs / 1000);

    playbackAnchorRef.current = {
      positionSec: current_time,
      serverMs: server_timestamp_ms,
      isPlaying: is_playing,
      songId: currentSong.songId
    };

    if (playerReadyRef.current && playerRef.current) {
      if (currentSongIdRef.current !== currentSong.songId) {
        currentSongIdRef.current = currentSong.songId;
        playerRef.current.loadVideoById({ videoId: currentSong.youtubeId, startSeconds: adjustedTime });
        if (!is_playing) playerRef.current.pauseVideo();
      } else {
        playerRef.current.seekTo(adjustedTime, true);
        if (!is_playing) playerRef.current.pauseVideo();
      }
    } else {
      pendingSyncRef.current = {
        youtubeId: currentSong.youtubeId,
        seekTo: adjustedTime,
        autoPlay: is_playing,
        songId: currentSong.songId
      };
    }
  }

  // Expected playback position (seconds) right now, from the last anchor.
  function computeExpectedPosition() {
    const a = playbackAnchorRef.current;
    if (!a || !a.isPlaying) return null;
    const nowServerMs = performance.now() + clockOffsetRef.current;
    const elapsed = Math.max(0, (nowServerMs - a.serverMs) / 1000);
    return a.positionSec + elapsed;
  }

  function handleWsMessage(type, payload) {
    const p = playerRef.current;

    switch (type) {
      case 'ping':
        wsRef.current?.send(JSON.stringify({ event: 'pong', data: {} }));
        break;

      case 'ntp_response': {
        const { t0, t1, t2 } = payload;
        const t3 = performance.now();
        const rtt = t3 - t0;
        const offset = ((t1 - t0) + (t2 - t3)) / 2;
        ntpDataRef.current.push({ rtt, offset });
        
        if (ntpDataRef.current.length < 5) {
          setTimeout(() => sendNtpProbe(wsRef.current), 50 + Math.random() * 30);
        } else {
          const sorted = [...ntpDataRef.current].sort((a,b) => a.rtt - b.rtt);
          const best = sorted.slice(0, 3);
          clockOffsetRef.current = best[1].offset;
          ntpSyncedRef.current = true;
          console.log(`NTP synced. Offset: ${clockOffsetRef.current.toFixed(2)}ms`);
          // Apply any join-time state that arrived before we had a clock offset
          if (pendingSyncStateRef.current) {
            const pending = pendingSyncStateRef.current;
            pendingSyncStateRef.current = null;
            applyServerSync(pending);
          }
        }
        break;
      }

      case 'sync_state': {
        const { host_id, queue, participants, currentSong, is_playing, current_time, server_timestamp_ms } = payload;
        startTransition(() => {
          setRoomState(prev => ({ ...prev, host_id, queue: queue || [], participants: participants || [] }));
          hostIdRef.current = host_id;
        });

        if (currentSong) {
          setCurrentPlayback(currentSong);
          setIsPlaying(is_playing);
          setRoomState(prev => prev ? { ...prev, currentSong, is_playing } : prev);

          const syncData = { currentSong, is_playing, current_time, server_timestamp_ms };
          if (ntpSyncedRef.current) {
            applyServerSync(syncData);
          } else {
            // Defer the seek until NTP finishes — otherwise a skewed device
            // clock places a late-joiner at the wrong position.
            pendingSyncStateRef.current = syncData;
          }
        }
        break;
      }

      case 'sync_play': {
        const { videoId, song, current_time, execute_at_ms } = payload;
        // Always (re)load on an explicit play command. Duplicate deliveries are
        // already filtered by the version (v) dedup in onmessage, so this lets
        // the host replay or go back to the same track without it being ignored.
        currentSongIdRef.current = song.songId;
        
        const localExecuteAt = ntpSyncedRef.current 
            ? execute_at_ms - clockOffsetRef.current
            : performance.now() + Math.max(0, execute_at_ms - Date.now());
            
        const delayMs = Math.max(0, localExecuteAt - performance.now());

        setCurrentPlayback(song);
        setIsPlaying(true);
        setRoomState(prev => prev ? { ...prev, currentSong: song, is_playing: true } : prev);

        playbackAnchorRef.current = {
          positionSec: current_time,
          serverMs: execute_at_ms,
          isPlaying: true,
          songId: song.songId
        };

        setTimeout(() => {
          if (playerRef.current && playerReadyRef.current) {
            playerRef.current.loadVideoById({ videoId, startSeconds: current_time });
          } else {
            pendingSyncRef.current = { youtubeId: videoId, seekTo: current_time, autoPlay: true, songId: song.songId };
          }
        }, Math.max(0, delayMs - 100));
        break;
      }

      case 'sync_playback': {
        const { action, current_time, execute_at_ms } = payload;
        const localExecuteAt = ntpSyncedRef.current 
            ? execute_at_ms - clockOffsetRef.current
            : performance.now() + Math.max(0, execute_at_ms - Date.now());
        const delayMs = Math.max(0, localExecuteAt - performance.now());
        
        if (action === 'play') {
          setTimeout(() => {
            if (playerRef.current && playerReadyRef.current) {
              playerRef.current.seekTo(current_time, true);
              playerRef.current.playVideo();
            }
          }, delayMs);
        } else {
          setTimeout(() => {
            if (playerRef.current && playerReadyRef.current) {
              playerRef.current.pauseVideo();
              playerRef.current.seekTo(current_time, true);
            }
          }, delayMs);
        }
        setIsPlaying(action === 'play');
        setRoomState(prev => prev ? { ...prev, is_playing: action === 'play' } : prev);

        playbackAnchorRef.current = {
          positionSec: current_time,
          serverMs: execute_at_ms,
          isPlaying: action === 'play',
          songId: currentSongIdRef.current
        };
        break;
      }

      case 'sync_seek': {
        const { current_time, execute_at_ms } = payload;
        const localExecuteAt = ntpSyncedRef.current
            ? execute_at_ms - clockOffsetRef.current
            : performance.now() + Math.max(0, execute_at_ms - Date.now());
        const delayMs = Math.max(0, localExecuteAt - performance.now());

        playbackAnchorRef.current = {
          positionSec: current_time,
          serverMs: execute_at_ms,
          isPlaying: playbackAnchorRef.current?.isPlaying ?? true,
          songId: currentSongIdRef.current
        };

        setTimeout(() => {
          if (playerRef.current && playerReadyRef.current) {
            playerRef.current.seekTo(current_time, true);
          }
        }, delayMs);
        break;
      }

      case 'user_joined':
        if (payload.participants) setRoomState(prev => prev ? { ...prev, participants: payload.participants } : prev);
        showToast(`${payload.displayName || 'Someone'} joined the party 🎉`, 'info');
        break;

      case 'user_left':
        if (payload.participants) setRoomState(prev => prev ? { ...prev, participants: payload.participants } : prev);
        break;

      case 'queue_update':
      case 'queue_snapshot':
        setRoomState(prev => prev ? { ...prev, queue: payload.queue || [] } : prev);
        break;

      case 'vote_update':
        setRoomState(prev => prev ? { ...prev, queue: payload.queue || [] } : prev);
        break;

      case 'host_changed':
        setRoomState(prev => prev ? { ...prev, host_id: payload.newHostId } : prev);
        hostIdRef.current = payload.newHostId;
        if (payload.newHostId === userRef.current?.id) showToast('You are now the host! 🎧', 'success');
        if (payload.reason === 'host_disconnected') showToast('Host left. A new host has been assigned.', 'info');
        break;

      case 'playback_ended':
        setCurrentPlayback(null);
        setIsPlaying(false);
        currentSongIdRef.current = null;
        playbackAnchorRef.current = null;
        setRoomState(prev => prev ? { ...prev, currentSong: null, is_playing: false } : prev);
        if (p?.pauseVideo) p.pauseVideo();
        break;

      case 'song_blocked':
        showToast(payload.message || 'Error playing song, skipping...', 'error');
        break;

      case 'error':
        showToast(payload.message || 'Something went wrong', 'error');
        break;
    }
  }

  function handleSongEnded() {
    const u = userRef.current;
    if (u && hostIdRef.current === u.id && wsRef.current?.readyState === WebSocket.OPEN) {
      const finishedId = currentSongIdRef.current || roomStateRef.current?.currentSong?.songId;
      wsRef.current.send(JSON.stringify({ event: 'song_finished', data: { songId: finishedId } }));
    }
  }

  const getAverageRtt = () => {
    if (ntpDataRef.current.length === 0) return 150;
    return ntpDataRef.current.reduce((sum, item) => sum + item.rtt, 0) / ntpDataRef.current.length;
  };

  function skipSong() {
    if (wsRef.current?.readyState === WebSocket.OPEN && roomStateRef.current?.currentSong) {
      wsRef.current.send(JSON.stringify({
        event: 'skip_song',
        data: { songId: roomStateRef.current.currentSong.songId, rtt: getAverageRtt() }
      }));
    }
  }

  function previousSong() {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'previous_song',
        data: { rtt: getAverageRtt() }
      }));
    }
  }

  function reportBlocked(youtubeId, songId) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'report_blocked',
        data: { youtubeId, songId }
      }));
    }
  }

  function initYouTubePlayer() {
    const checkAndCreate = () => {
      if (!document.getElementById('jam-youtube-player')) {
        setTimeout(checkAndCreate, 100);
        return;
      }
      if (window.YT && typeof window.YT.Player === 'function') {
        if (!playerRef.current) createPlayer();
      } else {
        setTimeout(checkAndCreate, 100);
      }
    };

    if (window.YT && typeof window.YT.Player === 'function') {
      checkAndCreate();
    } else if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      checkAndCreate();
    } else {
      checkAndCreate();
    }
  }

  function createPlayer() {
    console.log('[Jam] Creating YouTube Player Instance');
    const origin = window.location.origin;
    playerRef.current = new window.YT.Player('jam-youtube-player', {
      height: '100', width: '100',
      playerVars: { 
        autoplay: 1, 
        controls: 0, 
        disablekb: 1, 
        fs: 0, 
        rel: 0, 
        modestbranding: 1, 
        origin: origin,
        enablejsapi: 1,
        widget_referrer: origin
      },
      events: {
        onReady: () => {
          playerReadyRef.current = true;
          setIsPlayerReady(true);
          if (pendingSyncRef.current) { 
            const { youtubeId, seekTo, autoPlay, songId } = pendingSyncRef.current;
            pendingSyncRef.current = null;
            currentSongIdRef.current = songId;
            playerRef.current.loadVideoById({ videoId: youtubeId, startSeconds: seekTo });
            if (!autoPlay) playerRef.current.pauseVideo();
          }
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.ENDED) handleSongEnded();
          
          const isPlayerPlaying = (e.data === window.YT.PlayerState.PLAYING);
          const isPlayerPaused = (e.data === window.YT.PlayerState.PAUSED);

          if (isPlayerPlaying || isPlayerPaused) {
            setIsPlaying(isPlayerPlaying);
            
            // Only the HOST drives the shared room state. 
            // Guests strictly follow commands and don't report local state changes back to roomState
            // to prevent desync feedback loops.
            if (userRef.current?.id === hostIdRef.current) {
              setRoomState(prev => prev ? { ...prev, is_playing: isPlayerPlaying } : prev);
            }
          }
        },
        onError: (e) => {
          if ([100, 101, 150].includes(e.data)) {
            const cs = roomStateRef.current?.currentSong;
            showToast('Playback error: This video might be restricted. Try adding a "Lyrics" or "Non-official" version.', 'error');
            if (cs?.youtubeId) reportBlocked(cs.youtubeId, cs.songId);
            handleSongEnded();
          }
        }
      }
    });
  }

  useEffect(() => {
    initYouTubePlayer();
    return () => { if (playerRef.current?.destroy) playerRef.current.destroy(); };
  }, [roomCode]);

  // Guest drift correction: gently re-sync guests whose player has drifted from
  // the host. Host is the source of truth and is skipped. Only nudges when the
  // player is actually playing the current song and drift is meaningful but not
  // absurd (a huge gap usually means a song change is mid-flight).
  useEffect(() => {
    const id = setInterval(() => {
      try {
        if (userRef.current?.id === hostIdRef.current) return;   // host: skip
        if (!ntpSyncedRef.current || !playerReadyRef.current || !playerRef.current) return;
        const anchor = playbackAnchorRef.current;
        if (!anchor || !anchor.isPlaying) return;
        if (anchor.songId !== currentSongIdRef.current) return;

        const player = playerRef.current;
        if (player.getPlayerState && player.getPlayerState() !== 1) return;  // 1 = PLAYING

        const expected = computeExpectedPosition();
        if (expected == null || typeof player.getCurrentTime !== 'function') return;
        const actual = player.getCurrentTime();
        if (typeof actual !== 'number') return;

        const drift = Math.abs(actual - expected);
        if (drift > 1.5 && drift < 30) {
          player.seekTo(expected, true);
        }
      } catch { /* player not ready / transient */ }
    }, 15000);
    driftIntervalRef.current = id;
    return () => clearInterval(id);
  }, []);

  const handlePlayPause = () => {
    if (!currentUser || currentUser.id !== roomState?.host_id) {
      showToast('Only the host can control playback', 'info');
      return;
    }
    const p = playerRef.current;
    if (!p) return;
    
    // Explicitly determine the target state to prevent toggle mismatch
    const nextPlayingState = !isPlaying;
    const currentTime = p.getCurrentTime?.() || 0;
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`[Jam] Requesting ${nextPlayingState ? 'PLAY' : 'PAUSE'} at ${currentTime}`);
      wsRef.current.send(JSON.stringify({ 
        event: 'play_pause', 
        data: { 
          current_time: currentTime,
          isPlaying: nextPlayingState,
          rtt: getAverageRtt()
        } 
      }));
    }
  };

  const playSong = (videoId, songId) => {
    if (!videoId || !currentUser || currentUser.id !== roomState?.host_id) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'play_song', data: { songId: songId || videoId, rtt: getAverageRtt() } }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/music/search?q=${encodeURIComponent(searchQuery)}`);
      let data = null;
      try { data = await res.json(); } catch { /* non-JSON body */ }

      if (res.ok && Array.isArray(data)) {
        setSearchResults(data);
        if (data.length === 0) showToast('No results found. Try a different search.', 'info');
      } else {
        const msg =
          (data && (data.detail || data.message || data.error)) ||
          (res.status === 429
            ? 'Too many searches — please wait a minute and try again.'
            : 'Search failed. Please try again.');
        showToast(msg, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while searching. Check your connection.', 'error');
    }
    finally { setIsSearching(false); }
  };

  const handleAddSong = (song) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WS Sending add_song:', song.youtubeId);
      wsRef.current.send(JSON.stringify({
        event: 'add_song',
        data: { 
          songName: song.songName, 
          artistName: song.artistName, 
          youtubeId: song.youtubeId, 
          coverImageUrl: song.coverImageUrl,
          duration_seconds: parseISO8601Duration(song.duration_seconds || 'PT0S')
        }
      }));
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveSong = (songId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'remove_song', data: { songId } }));
    }
  };

  const handleVote = (songId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'vote_song', data: { songId } }));
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-red-500 opacity-[0.06] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#1db954] opacity-[0.04] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="text-center z-10 max-w-md">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
            <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black mb-3 tracking-tight">Oops! Something went wrong</h1>
          <p className="text-white/40 mb-2 text-sm font-bold uppercase tracking-widest">Error Details</p>
          <div className="bg-red-500/5 border border-red-500/15 rounded-2xl px-5 py-3 mb-8">
            <p className="text-red-300/80 text-sm font-semibold">{error}</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all font-bold text-sm">
              Try Again
            </button>
            <button onClick={() => navigate('/main')} className="px-6 py-3 bg-[#1db954] text-black rounded-full hover:bg-[#1ed760] transition-all font-black text-sm hover:scale-105 active:scale-95 shadow-lg shadow-[#1db954]/20">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!roomState) {
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">Loading Party...</div>;
  }

  const isHost = roomState.host_id === currentUser?.id;
  const sortedQueue = roomState.queue || [];
  const joinUrl = `${window.location.origin}/party/${roomCode}`;

  if (!hasInteracted && !isHost) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-[#1db954]/10 rounded-full blur-[120px] animate-pulse" />
        </div>
        <div className="relative z-10 max-w-sm">
          <div className="w-24 h-24 bg-[#1db954]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#1db954]/20 shadow-[0_0_50px_rgba(29,185,84,0.15)]">
            <svg className="w-12 h-12 text-[#1db954]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to join?</h1>
          <p className="text-white/50 mb-10 font-medium leading-relaxed">
            Tap the button below to sync with the party and unlock the audio.
          </p>
          <button
            onClick={() => {
              setHasInteracted(true);
              playerRef.current?.playVideo?.();
            }}
            className="w-full px-10 py-5 bg-[#1db954] text-black rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(29,185,84,0.3)]"
          >
            🎧 Tap to Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden text-white font-sans selection:bg-[#1db954]/30">
      {/* Top Disclaimer Bar */}
      <div className="bg-[#1db954] text-black text-[11px] font-black uppercase tracking-[0.2em] py-2 px-6 text-center sticky top-0 z-[100] shadow-[0_4px_20px_rgba(29,185,84,0.3)]">
        <span className="opacity-70">Notice:</span> This feature is currently under development. Its use is limited and some functions may not work as expected.
      </div>

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-[#1db954]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#1db954]/05 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[-5%] w-[40vw] h-[40vw] bg-[#1db954]/03 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Navigation */}
      <nav className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-2">
          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate('/main')}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-lg sm:text-2xl font-black text-[#1db954] truncate tracking-tight">
              Party Mode
              {!wsConnected && (
                <span className="text-red-400 text-xs ml-1 animate-pulse hidden sm:inline">
                  (Reconnecting...)
                </span>
              )}
            </h1>
            {!wsConnected && (
              <span className="sm:hidden w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Room code */}
            <div className="bg-white/5 border border-white/10 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2">
              <span className="hidden sm:inline text-white/50 text-[10px] font-black uppercase tracking-widest">
                Room
              </span>
              <span className="font-mono font-black text-[#1db954] text-sm sm:text-base tracking-widest">
                {roomCode}
              </span>
            </div>

            {/* Host badge */}
            {isHost && (
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.2em] text-[#1db954] bg-[#1db954]/10 px-3 py-1 rounded-full border border-[#1db954]/20">
                Host
              </span>
            )}
            {isHost && (
              <span className="sm:hidden w-8 h-8 flex items-center justify-center bg-[#1db954]/10 rounded-full border border-[#1db954]/20 text-xs">
                🎧
              </span>
            )}

            {/* Participants Button */}
            <button
              onClick={() => setShowParticipants(true)}
              className="relative w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
            >
              <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              {(roomState?.participants?.length || 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1db954] rounded-full text-black text-[9px] font-black flex items-center justify-center">
                  {roomState.participants.length}
                </span>
              )}
            </button>

            {/* QR Button */}
            <button
              onClick={() => setShowQR(true)}
              className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
            >
              <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            </button>
          </div>
        </div>
        {!wsConnected && (
          <div className="sm:hidden bg-red-500/10 border-t border-red-500/10 py-1 text-center text-red-100 text-[10px] font-black tracking-widest uppercase animate-pulse">
            Connection Lost • Reconnecting
          </div>
        )}
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl relative z-10">

        {/*Now Playing */}
        <div className="w-full bg-gradient-to-br from-[#181818] via-[#121212] to-black border border-white/5 rounded-[2.5rem] mb-10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group transition-all duration-500 hover:border-[#1db954]/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1db954]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Hidden YouTube player */}
          <div id="jam-youtube-player" className="absolute opacity-0 pointer-events-none -top-[1000px] -left-[1000px]"></div>

          {currentPlayback ? (
            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 w-full text-center sm:text-left">
              <div className="relative group/art flex-shrink-0">
                <div className="absolute inset-0 bg-[#1db954] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700" />
                <img
                  src={currentPlayback.coverImageUrl || currentPlayback.coverUrl || `https://img.youtube.com/vi/${currentPlayback.youtubeId}/mqdefault.jpg`}
                  alt="now playing"
                  className="w-40 h-40 rounded-[2rem] shadow-[0_0_30px_rgba(0,0,0,0.5)] object-cover relative z-10 transition-transform duration-500 group-hover:scale-105 border border-white/10"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#1db954] tracking-[0.4em] uppercase mb-2 flex items-center gap-2 justify-center sm:justify-start">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#1db954] animate-pulse' : 'bg-gray-500'}`} />
                  {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
                </p>
                <h2 className="text-3xl font-black text-white truncate w-full mb-1 drop-shadow-lg">{currentPlayback.songName}</h2>
                <p className="text-[#1db954] text-lg font-bold truncate w-full opacity-80">{currentPlayback.artistName}</p>

                <div className="flex items-center justify-center sm:justify-start gap-5 mt-6">
                  {/* Skip Back / Previous */}
                  <button
                    onClick={previousSong}
                    disabled={!isHost}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/40 hover:text-[#1db954] disabled:text-white/10 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" transform="scale(-1,1) translate(-24,0)" /></svg>
                  </button>

                  {/* Main Play/Pause Button */}
                  {isHost ? (
                    <button
                      onClick={handlePlayPause}
                      className={`relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center transition-all duration-500 group/btn hover:scale-110 active:scale-95 cursor-pointer`}
                      style={{
                        background: isPlaying
                          ? 'linear-gradient(135deg, #1db954, #1ed760)'
                          : 'linear-gradient(135deg, #ffffff, #e0e0e0)',
                        boxShadow: isPlaying
                          ? '0 0 30px rgba(29,185,84,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
                          : '0 0 30px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: isPlaying ? '0 0 50px rgba(29,185,84,0.6)' : '0 0 50px rgba(255,255,255,0.3)' }}
                      />
                      {isPlaying ? (
                        <svg className="w-8 h-8 text-black relative z-10" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="5" width="4" height="14" rx="1" />
                          <rect x="14" y="5" width="4" height="14" rx="1" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-black relative z-10 ml-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center bg-white/5 border border-white/10 cursor-not-allowed group/btn">
                      {isPlaying ? (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                      ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/20 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      )}
                      <div className="absolute inset-0 rounded-full flex items-end justify-end p-2 opacity-50 group-hover/btn:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-[#1db954]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Skip Forward / Next */}
                  <button
                    onClick={skipSong}
                    disabled={!isHost}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/40 hover:text-[#1db954] disabled:text-white/10 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                  </button>
                </div>

                {!isHost && (
                  <p className="text-white/30 text-sm mt-3 font-medium">Only the host can control playback</p>
                )}
              </div>
            </div>
          ) : !isPlayerReady ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-[#1db954] border-t-transparent animate-spin mb-4" />
              <p className="text-white/50 font-bold uppercase tracking-widest text-sm">Initializing Jam Engine...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="relative w-28 h-28 mb-8 flex items-center justify-center group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1db954]/20 to-[#1ed760]/20 rounded-full animate-pulse blur-xl group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute inset-2 bg-black/80 rounded-full border border-[#1ed760]/30 shadow-[0_0_30px_rgba(29,185,84,0.15)] group-hover:scale-105 transition-transform duration-500"></div>
                <svg className="w-11 h-11 text-[#1db954] relative z-10 drop-shadow-[0_0_15px_rgba(29,185,84,0.8)] group-hover:rotate-12 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Ready to Jam</h2>
              <p className="text-base text-gray-400 max-w-sm text-center mb-8 leading-relaxed">
                {isHost
                  ? "You're the DJ! Search below to add tracks to your queue, then hit play to start the session."
                  : "Waiting for the host to start the music. You can add songs to the queue below!"}
              </p>
              {isHost && sortedQueue.length > 0 && (
                <button onClick={() => playSong(sortedQueue[0]?.youtubeId, sortedQueue[0]?.songId)}
                  className="flex items-center gap-3 bg-[#1db954] text-black px-8 py-4 rounded-full font-black tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(29,185,84,0.4)] hover:shadow-[0_0_40px_rgba(29,185,84,0.6)]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  START JAM SESSION
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative group/search">
            <div className="absolute inset-0 bg-[#1db954] opacity-0 group-focus-within/search:opacity-5 blur-xl transition-opacity duration-500 rounded-full" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search to add a song to the queue..."
              className="w-full bg-[#121212] border border-white/5 rounded-full py-4 pl-12 pr-24 sm:py-5 sm:pl-16 sm:pr-32 text-sm sm:text-base text-white placeholder:text-white/20 focus:outline-none focus:border-[#1db954]/40 focus:bg-[#181818] transition-all duration-300 font-bold shadow-2xl backdrop-blur-sm" />
            <svg className="w-7 h-7 text-[#1db954] opacity-50 absolute left-6 top-1/2 -translate-y-1/2 group-focus-within/search:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {searchQuery && (
              <button type="submit" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-black bg-[#1db954] text-black px-4 sm:px-8 py-2 sm:py-2.5 rounded-full hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1db954]/20 hover:scale-105 active:scale-95">
                {isSearching ? '...' : 'SEARCH'}
              </button>
            )}
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4 bg-[#181818] border border-white/10 rounded-2xl p-2 max-h-64 overflow-y-auto shadow-xl">
              {searchResults.map((song, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors gap-4 group">
                  <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                    <img src={song.coverImageUrl || "https://placehold.co/40x40/222/FFF?text=Music"} alt="cover" className="w-10 h-10 rounded-lg object-cover shadow-md flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-sm truncate">{song.songName}</p>
                      <p className="text-white/50 text-xs truncate">{song.artistName}</p>
                    </div>
                  </div>
                  <button onClick={() => handleAddSong(song)}
                    className="w-full sm:w-auto px-4 py-2 bg-[#1db954] text-black text-sm font-black rounded-full hover:bg-[#1ed760] hover:scale-105 active:scale-95 transition-all whitespace-nowrap opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shadow-md">
                    + ADD TO QUEUE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-10 bg-gradient-to-br from-purple-900/40 via-[#121212] to-black border border-purple-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-500 shadow-2xl">
          <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-purple-500 opacity-10 rounded-full blur-[80px] pointer-events-none group-hover:opacity-20 transition-opacity" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full text-xs font-black tracking-widest text-purple-400 mb-3 border border-purple-500/30">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                INTERACTIVE
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Enter the Games Room</h3>
              <p className="text-white/50 text-sm font-medium leading-relaxed max-w-md">
                Bored of just listening? Challenge your friends to musical quests like Fill the Lyrics and Guess the Song!
              </p>
            </div>
            <button 
              onClick={() => navigate(`/party/${roomCode}/games`)}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Play Games
            </button>
          </div>
        </div>

        <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black tracking-tight">Live Queue</h3>
            <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full text-white/50">{sortedQueue.length} Songs</span>
          </div>

          <div className="space-y-2">
            {sortedQueue.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-medium">
                The queue is empty. Search above to add the first song!
              </div>
            ) : (
              sortedQueue.map((song, idx) => {
                const isCurrentlyPlaying = currentPlayback?.songId === song.songId;
                const hasVoted = song.voters?.includes(currentUser?.id);
                return (
                  <div key={song.songId} className={`flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 group ${idx === 0 ? 'bg-gradient-to-r from-[#1db954]/20 to-transparent border border-[#1db954]/30 shadow-[0_0_20px_rgba(29,185,84,0.1)]' : 'hover:bg-white/[0.03] border border-transparent hover:border-white/5'}`}>
                    {/* Position */}
                    <div className="flex-shrink-0 w-8 text-center text-white/20 font-black text-lg group-hover:text-[#1db954]/50 transition-colors">
                      {idx + 1}
                    </div>

                    {/* Cover Art */}
                    <div className="relative flex-shrink-0">
                      <img src={song.coverImageUrl || song.coverUrl || "https://placehold.co/40x40/222/FFF?text=Music"} alt="cover" className="w-14 h-14 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300" />
                      {idx === 0 && <div className="absolute inset-0 rounded-2xl border-2 border-[#1db954]/50 animate-pulse" />}
                    </div>

                    {/* Song Info + Inline play button */}
                    <div className="flex-1 min-w-0 flex items-center gap-4 group/play">
                      {isHost && isPlayerReady && (
                        <button
                          onClick={() => {
                            if (isCurrentlyPlaying) handlePlayPause();
                            else playSong(song.youtubeId, song.songId);
                          }}
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg transform active:scale-90 ${
                            isCurrentlyPlaying
                              ? 'bg-[#1db954] text-black scale-110 opacity-100'
                              : 'bg-white/10 text-white opacity-0 group-hover/play:opacity-100 hover:bg-[#1db954] hover:text-black hover:scale-110'
                          }`}
                        >
                          {isCurrentlyPlaying && isPlaying ? (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                          ) : (
                            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          )}
                        </button>
                      )}
                      <div className="min-w-0">
                        <p className={`font-bold truncate ${idx === 0 ? 'text-[#1db954]' : 'text-white'}`}>{song.songName}</p>
                        <p className="text-white/50 text-xs truncate">{song.artistName}</p>
                      </div>
                    </div>

                    {/* ─── Upvote Toggle Button (replaces up/down) ─── */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(song.songId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 group/vote ${
                          hasVoted
                            ? 'bg-[#1db954]/20 border-[#1db954]/40 text-[#1db954] shadow-[0_0_12px_rgba(29,185,84,0.2)]'
                            : 'bg-black/40 border-white/10 text-white/50 hover:border-[#1db954]/30 hover:text-[#1db954]'
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${hasVoted ? 'scale-110' : 'group-hover/vote:scale-110'}`}
                          fill={hasVoted ? 'currentColor' : 'none'}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={hasVoted ? 0 : 2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                        <span className={`text-sm font-black min-w-[12px] text-center ${song.votes > 0 ? 'text-[#1db954]' : ''}`}>
                          {song.votes || 0}
                        </span>
                      </button>

                      {/* Remove Song */}
                      {(isHost || song.addedBy === currentUser?.id) && (
                        <button
                          onClick={() => handleRemoveSong(song.songId)}
                          className="p-1.5 rounded-full hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors"
                          title="Remove song"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-black/40 hover:text-black bg-black/5 hover:bg-black/10 rounded-full p-2 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-black text-black mb-2">Scan to Join</h3>
            <p className="text-black/50 text-sm mb-6 font-medium">Join Party <span className="font-mono font-bold text-black bg-black/5 px-2 py-0.5 rounded">{roomCode}</span></p>
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-black/5 inline-block mb-6">
              <QRCodeSVG value={joinUrl} size={200} />
            </div>
            <p className="text-sm text-black/40 font-bold uppercase tracking-widest">Powered by AlgoRythms</p>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Participants Drawer */}
      {showParticipants && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowParticipants(false)} />
          <div className="relative bg-[#111] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:w-80 sm:mr-4 max-h-[70vh] sm:max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h3 className="font-black text-white flex items-center gap-2">
                In this Party
                <span className="text-xs py-0.5 px-2 bg-white/5 rounded-full text-white/40 font-bold">
                   {roomState?.participants?.length || 0}
                </span>
              </h3>
              <button onClick={() => setShowParticipants(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {(roomState?.participants || []).map((p) => {
                const userId = typeof p === 'string' ? p : p.userId;
                const displayName = typeof p === 'string' ? 'Guest' : p.displayName;
                const isThisHost = userId === roomState?.host_id;
                const isYou = userId === currentUser?.id;
                const initials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

                return (
                  <div key={userId} className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1db954]/20 to-[#1db954]/5 border border-[#1db954]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="text-[#1db954] text-xs font-black">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-bold text-sm truncate block">
                        {displayName}{isYou ? ' (You)' : ''}
                      </span>
                      {isThisHost && (
                        <span className="text-[10px] font-black text-[#1db954] uppercase tracking-widest bg-[#1db954]/10 px-1.5 py-0.5 rounded-full border border-[#1db954]/20 inline-block mt-0.5">
                          HOST
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartyRoom;
