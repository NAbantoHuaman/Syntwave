import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import RightDrawer from './components/RightDrawer';
import FullscreenPlayer from './components/FullscreenPlayer';
import ViewHome from './views/ViewHome';
import ViewSearch from './views/ViewSearch';
import ViewPlaylistDetail from './views/ViewPlaylistDetail';
import ViewArtistProfile from './views/ViewArtistProfile';
import ViewUserProfile from './views/ViewUserProfile';
import ViewLogin from './views/ViewLogin';
import { SEED_SONGS, formatTime } from './data/songs';

// LRC parser to convert [mm:ss.xx] Lyric lines into timed objects
const parseLrc = (lrcText) => {
  if (!lrcText) return null;
  const lines = lrcText.split('\n');
  const parsed = [];
  const timeRegex = /\[(\d+):(\d+)(?:\.(\d+))?\]/;
  
  for (const line of lines) {
    const timeMatch = line.match(timeRegex);
    if (!timeMatch) continue;
    
    const minutes = parseInt(timeMatch[1], 10);
    const seconds = parseInt(timeMatch[2], 10);
    const ms = timeMatch[3] ? parseInt(timeMatch[3].padEnd(3, '0').slice(0, 3), 10) : 0;
    const totalSeconds = minutes * 60 + seconds + ms / 1000;
    
    const text = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim();
    if (text) {
      parsed.push({ time: totalSeconds, text });
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
};

// Plain lyrics parser to space out text evenly over track duration
const parsePlainLyrics = (plainText, trackDurationSec) => {
  if (!plainText) return null;
  const lines = plainText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  
  const duration = trackDurationSec > 0 ? trackDurationSec : 180;
  const interval = duration / (lines.length + 1);
  
  return lines.map((text, idx) => ({
    time: Math.floor((idx + 1) * interval),
    text
  }));
};

export default function App() {
  // References for Web Audio API
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  
  // YouTube Iframe references
  const ytPlayerRef = useRef(null);

  // Core Playback State
  const [seedSongs, setSeedSongs] = useState(SEED_SONGS);

  const [isUsingYt, setIsUsingYt] = useState(() => {
    const saved = localStorage.getItem('isUsingYt');
    return saved === 'true';
  });
  const [currentPlaylist, setCurrentPlaylist] = useState(() => {
    const saved = localStorage.getItem('currentPlaylist');
    return saved ? JSON.parse(saved) : SEED_SONGS;
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const saved = localStorage.getItem('currentTrackIndex');
    return saved ? parseInt(saved, 10) : -1;
  });
  const [currentTrack, setCurrentTrack] = useState(() => {
    const saved = localStorage.getItem('currentTrack');
    return saved ? JSON.parse(saved) : null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('volume');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [currentTime, setCurrentTime] = useState(() => {
    const saved = localStorage.getItem('currentTime');
    return saved ? parseFloat(saved) : 0;
  });
  const [duration, setDuration] = useState(() => {
    const saved = localStorage.getItem('currentDuration');
    return saved ? parseFloat(saved) : 0;
  });

  const [hasBeenPlayedInSession, setHasBeenPlayedInSession] = useState(false);

  const updateCurrentTime = (time) => {
    setCurrentTime(time);
    localStorage.setItem('currentTime', time.toString());
  };

  // Persistence / Playlist State
  const [likedSongs, setLikedSongs] = useState(() => {
    const saved = localStorage.getItem('likedSongs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    const saved = localStorage.getItem('customPlaylists');
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      username: 'Synthwave User',
      avatarColor: '#ff007f',
      preferredGenre: '',
      creationDate: 'Mayo 2026'
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('isLoggedIn');
    return saved === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [secondsListened, setSecondsListened] = useState(() => {
    const saved = localStorage.getItem('secondsListened');
    if (saved) return parseInt(saved, 10);
    const oldMinutes = localStorage.getItem('simulatedMinutesListened');
    if (oldMinutes) {
      const val = parseInt(oldMinutes, 10) * 60;
      localStorage.setItem('secondsListened', val.toString());
      return val;
    }
    return 0;
  });

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setSecondsListened(prev => {
          const next = prev + 1;
          localStorage.setItem('secondsListened', next.toString());
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const handleLogin = (userObj) => {
    setIsLoggedIn(true);
    setCurrentUser(userObj);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userObj));
    
    // Sync active profile view details
    setUserProfile({
      username: userObj.username,
      avatarColor: userObj.avatarColor || '#ff007f',
      preferredGenre: userObj.preferredGenre || '',
      creationDate: userObj.creationDate || 'Mayo 2026'
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    setActiveView('home');
  };

  // Routing State
  const [activeView, setActiveView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Screen Overlay Player State
  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState(false);
  const [artistNameContext, setArtistNameContext] = useState('');

  // Recently Played State (max 6 unique)
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    const saved = localStorage.getItem('recentlyPlayed');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyPlayedPlaylists, setRecentlyPlayedPlaylists] = useState(() => {
    const saved = localStorage.getItem('recentlyPlayedPlaylists');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Specific detail page view variables
  const [playlistDetail, setPlaylistDetail] = useState({
    type: 'SYSTEM',
    name: 'Recomendados',
    description: 'Tu dosis diaria de excelente música.',
    songs: SEED_SONGS,
    playlistId: null
  });


  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('customPlaylists', JSON.stringify(customPlaylists));
  }, [customPlaylists]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        username: userProfile.username,
        avatarColor: userProfile.avatarColor,
        preferredGenre: userProfile.preferredGenre
      };
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      const savedUsers = localStorage.getItem('registeredUsers');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const updatedUsers = users.map(u => {
          if (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) {
            return {
              ...u,
              username: userProfile.username,
              avatarColor: userProfile.avatarColor,
              preferredGenre: userProfile.preferredGenre
            };
          }
          return u;
        });
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      }
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    localStorage.setItem('recentlyPlayedPlaylists', JSON.stringify(recentlyPlayedPlaylists));
  }, [recentlyPlayedPlaylists]);

  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  // Fetch real popular pop hits on load to make home screen dynamic and real
  useEffect(() => {
    let active = true;
    const fetchRealHomeSongs = async () => {
      try {
        const queryUrl = 'https://itunes.apple.com/search?term=pop+hits&media=music&entity=song&limit=15';
        const response = await fetch(queryUrl);
        if (!response.ok) throw new Error('Network response not ok');
        const data = await response.json();
        
        if (!active) return;
        
        if (data && data.results && data.results.length > 0) {
          const formatted = data.results.map((track) => {
            const durationSec = track.trackTimeMillis ? track.trackTimeMillis / 1000 : 180;
            const mins = Math.floor(durationSec / 60);
            const secs = Math.floor(durationSec % 60);
            const durationStr = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

            let artUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80";
            if (track.artworkUrl100) {
              artUrl = track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
            }

            const colors = [
              "rgba(232, 17, 91, 0.22)",
              "rgba(29, 185, 84, 0.22)",
              "rgba(188, 89, 0, 0.22)",
              "rgba(13, 114, 234, 0.22)",
              "rgba(80, 55, 80, 0.22)",
              "rgba(230, 219, 116, 0.18)"
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            return {
              id: `itunes-${track.trackId}`,
              title: track.trackName,
              artist: track.artistName || "Artista Desconocido",
              album: track.collectionName || "Sencillo",
              url: track.previewUrl || "",
              art: artUrl,
              color: randomColor,
              duration: durationStr,
              lyrics: null
            };
          });

          setSeedSongs(formatted);
          
          setCurrentPlaylist(prev => {
            // Clean up any remaining mock/fictional tracks or empty playlist
            const hasMock = prev.some(s => String(s.id).startsWith('song-'));
            if (hasMock || prev.length === 0) {
              return formatted;
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn("Failed to load real iTunes songs for home feed:", err);
      }
    };

    fetchRealHomeSongs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('currentTrack', JSON.stringify(currentTrack));
    } else {
      localStorage.removeItem('currentTrack');
    }
  }, [currentTrack]);

  useEffect(() => {
    localStorage.setItem('currentPlaylist', JSON.stringify(currentPlaylist));
  }, [currentPlaylist]);

  useEffect(() => {
    localStorage.setItem('currentTrackIndex', currentTrackIndex.toString());
  }, [currentTrackIndex]);

  useEffect(() => {
    localStorage.setItem('isUsingYt', isUsingYt.toString());
  }, [isUsingYt]);

  useEffect(() => {
    localStorage.setItem('currentDuration', duration.toString());
  }, [duration]);

  // Audio elements event binding and handlers
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleTimeUpdate = () => {
      updateCurrentTime(audioElement.currentTime);
    };

    const handleDurationChange = () => {
      const realDur = audioElement.duration || 0;
      setDuration(realDur);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log("Play failed", e));
      } else {
        triggerNextTrack();
      }
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('durationchange', handleDurationChange);
    audioElement.addEventListener('loadedmetadata', handleDurationChange);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('durationchange', handleDurationChange);
      audioElement.removeEventListener('loadedmetadata', handleDurationChange);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, currentPlaylist, currentTrackIndex, currentTrack]);

  // Sync isPlaying state with audio element or YouTube player
  useEffect(() => {
    if (!currentTrack) return;

    if (isPlaying) {
      if (isUsingYt) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
          ytPlayerRef.current.playVideo();
        }
      } else if (audioRef.current && audioRef.current.getAttribute('src')) {
        // Resume audio context if suspended (browser requirements)
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        audioRef.current.play().catch((err) => {
          console.log("Autoplay blocked or load error:", err);
        });
      }
    } else {
      if (isUsingYt) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
        }
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, isUsingYt]);

  // Sync volume state with audio and YouTube elements
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      ytPlayerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Set ambient theme color smoothly
  useEffect(() => {
    if (currentTrack) {
      document.documentElement.style.setProperty('--ambient-theme-color', currentTrack.color);
    }
  }, [currentTrack]);

  // Dynamic lyrics fetching from LRCLIB for the current track
  useEffect(() => {
    if (!currentTrack) return;
    

    let active = true;
    
    const loadRealLyrics = async () => {
      if (currentTrack.lyricsLoaded) return;

      try {
        const title = currentTrack.title;
        const artist = currentTrack.artist;
        
        const query = `${artist} - ${title}`;
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
        const res = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'SynthwavePremiumCloneReact/1.0 (contact@example.com)'
          }
        });
        
        if (!res.ok) throw new Error('LRCLIB fetch failed');
        
        const data = await res.json();
        if (!active) return;

        if (data && data.length > 0) {
          const bestMatch = data[0];
          let parsedLyrics = null;
          
          if (bestMatch.syncedLyrics) {
            parsedLyrics = parseLrc(bestMatch.syncedLyrics);
          } else if (bestMatch.plainLyrics) {
            parsedLyrics = parsePlainLyrics(bestMatch.plainLyrics, bestMatch.duration || getMetadataDurationSec());
          }
          
          if (parsedLyrics && parsedLyrics.length > 0) {
            setCurrentTrack(prev => {
              if (prev && prev.id === currentTrack.id) {
                return {
                  ...prev,
                  lyrics: parsedLyrics,
                  lyricsLoaded: true
                };
              }
              return prev;
            });
            return;
          }
        }
        
        // If no lyrics found
        setCurrentTrack(prev => {
          if (prev && prev.id === currentTrack.id) {
            return {
              ...prev,
              lyrics: null,
              lyricsLoaded: true
            };
          }
          return prev;
        });
      } catch (err) {
        console.warn("Failed to load real lyrics from LRCLIB:", err);
        setCurrentTrack(prev => {
          if (prev && prev.id === currentTrack.id) {
            return {
              ...prev,
              lyrics: null,
              lyricsLoaded: true
            };
          }
          return prev;
        });
      }
    };

    loadRealLyrics();

    return () => {
      active = false;
    };
  }, [currentTrack?.id]);

  // Load and initialize YouTube IFrame Player API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initializeYtPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube Player API has loaded successfully.");
      initializeYtPlayer();
    };
  }, []);

  const initializeYtPlayer = () => {
    if (ytPlayerRef.current) return;
    try {
      new window.YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: '',
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: (event) => {
            console.log("YouTube hidden player initialized successfully.");
            ytPlayerRef.current = event.target;
            event.target.setVolume(volume * 100);
          },
          onStateChange: (event) => {
            // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
            const state = event.data;
            if (state === 1) {
              setIsPlaying(true);
            } else if (state === 2) {
              setIsPlaying(false);
            } else if (state === 0) {
              if (isRepeat) {
                event.target.seekTo(0);
                event.target.playVideo();
              } else {
                triggerNextTrack();
              }
            }
          }
        }
      });
    } catch (e) {
      console.warn("Error creating YouTube player instance:", e);
    }
  };

  // Sync YouTube Volume independently when it changes
  useEffect(() => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      ytPlayerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Sincronizar tiempo del reproductor de YouTube
  useEffect(() => {
    let timer;
    if (isPlaying && isUsingYt && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
      timer = setInterval(() => {
        try {
          const curr = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || 0;
          updateCurrentTime(curr);
          if (dur > 0) {
            setDuration(dur);
          }
        } catch (e) {
          // ignore
        }
      }, 250);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isUsingYt]);

  // Initialize Audio Context on first interaction
  const initAudioCtx = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;
      console.log("Web Audio API initialized successfully.");
    } catch (e) {
      console.warn("Could not initiate Web Audio API.", e);
    }
  };

  const playSong = async (playlist, index, startTime = 0, playlistContext = null) => {
    initAudioCtx();
    setCurrentPlaylist([...playlist]);
    setCurrentTrackIndex(index);
    const track = playlist[index];
    
    if (track) {
      setCurrentTrack(track);
      setIsPlaying(true);
      setHasBeenPlayedInSession(true);

      // Add to recently played (uniquely prepended, capped at 6)
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(s => s.id !== track.id);
        return [track, ...filtered].slice(0, 6);
      });

      if (playlistContext) {
        registerPlayedPlaylist(playlistContext);
      }

      // Stop conventional audio first
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }
      
      // Stop YT player first
      if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
        ytPlayerRef.current.stopVideo();
      }


      // It's a standard/iTunes catalog track. Resolve and play from YouTube!
      try {
        const query = `${track.artist} - ${track.title}`;
        const searchRes = await fetch(`/api/search-youtube?q=${encodeURIComponent(query)}`);
        const searchData = await searchRes.json();
        
        if (searchData.videoId) {
          console.log(`Resolved YouTube Video ID: ${searchData.videoId} for query: ${query}`);
          setIsUsingYt(true);
          
          if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
            ytPlayerRef.current.loadVideoById({
              videoId: searchData.videoId,
              startSeconds: startTime
            });
            ytPlayerRef.current.playVideo();
          } else {
            console.warn("YouTube player is not fully initialized yet. Falling back to iTunes preview URL.");
            setIsUsingYt(false);
            playConventionalTrack(track, startTime);
          }
        } else {
          console.warn("No video resolved from YouTube proxy. Falling back to iTunes preview URL.");
          setIsUsingYt(false);
          playConventionalTrack(track, startTime);
        }
      } catch (err) {
        console.error("Failed to fetch from YouTube proxy:", err);
        setIsUsingYt(false);
        playConventionalTrack(track, startTime);
      }
    }
  };

  const playConventionalTrack = (track, startTime = 0) => {
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.load();
        if (startTime > 0) {
          audioRef.current.currentTime = startTime;
        }
        audioRef.current.play().catch(e => console.log("Play failed", e));
      }
    }, 50);
  };

  const triggerNextTrack = () => {
    if (currentPlaylist.length === 0) return;
    
    let nextIndex = currentTrackIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % currentPlaylist.length;
    }

    playSong(currentPlaylist, nextIndex);
  };

  const triggerPrevTrack = () => {
    if (currentPlaylist.length === 0) return;

    // If song played for more than 3s, restart it instead of changing song
    if (isUsingYt && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
      if (ytPlayerRef.current.getCurrentTime() > 3) {
        ytPlayerRef.current.seekTo(0);
        updateCurrentTime(0);
        return;
      }
    } else if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      updateCurrentTime(0);
      return;
    }

    let prevIndex = currentTrackIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
      prevIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    }

    playSong(currentPlaylist, prevIndex);
  };

  const togglePlayPause = () => {
    if (!currentTrack) {
      playSong(SEED_SONGS, 0);
    } else {
      if (!hasBeenPlayedInSession) {
        playSong(currentPlaylist, currentTrackIndex, currentTime);
      } else if (isUsingYt && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        if (isPlaying) {
          ytPlayerRef.current.pauseVideo();
        } else {
          ytPlayerRef.current.playVideo();
        }
      } else {
        setIsPlaying(!isPlaying);
      }
    }
  };

  // Get track's official metadata duration in seconds (parsed from the duration string like "3:32")
  const getMetadataDurationSec = () => {
    if (!currentTrack || !currentTrack.duration) return 0;
    const parts = currentTrack.duration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return parseInt(currentTrack.duration, 10) || 0;
  };

  const metadataDuration = getMetadataDurationSec();
  const isPreviewTrack = currentTrack && currentTrack.id && String(currentTrack.id).startsWith('itunes-') && !isUsingYt;
  const shouldScale = isPreviewTrack && duration > 0 && metadataDuration > duration;

  // Simulated times to map 30s previews perfectly to the full song duration
  const displayDuration = shouldScale ? metadataDuration : duration;
  const displayCurrentTime = shouldScale && duration > 0
    ? (currentTime / duration) * metadataDuration
    : currentTime;

  const handleSeek = (time) => {
    if (isUsingYt && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(time);
      updateCurrentTime(time);
    } else if (audioRef.current) {
      if (shouldScale) {
        const percentage = time / metadataDuration;
        const actualTime = percentage * duration;
        audioRef.current.currentTime = actualTime;
        updateCurrentTime(actualTime);
      } else {
        audioRef.current.currentTime = time;
        updateCurrentTime(time);
      }
    }
  };

  // Likes synchronization
  const toggleLikeSong = (song) => {
    const isSongLiked = likedSongs.some(s => s.id === song.id);
    if (isSongLiked) {
      setLikedSongs(likedSongs.filter(s => s.id !== song.id));
    } else {
      setLikedSongs([...likedSongs, song]);
    }
  };

  const toggleLikeCurrentTrack = () => {
    if (currentTrack) {
      toggleLikeSong(currentTrack);
    }
  };

  // Playlists Creation/Management
  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      songs: [],
      description: `Disfruta de tu playlist personalizada: ${name}.`
    };
    setCustomPlaylists([...customPlaylists, newPlaylist]);
  };

  const addTrackToPlaylist = (playlistId, track) => {
    setCustomPlaylists(customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        // Prevent duplicate songs in playlist
        const exists = pl.songs.some(s => s.id === track.id);
        if (exists) return pl;
        return { ...pl, songs: [...pl.songs, track] };
      }
      return pl;
    }));
  };

  const deletePlaylist = (playlistId) => {
    setCustomPlaylists(customPlaylists.filter(pl => pl.id !== playlistId));
    setActiveView('home');
  };

  const removeTrackFromPlaylist = (playlistId, trackId) => {
    setCustomPlaylists(customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, songs: pl.songs.filter(s => s.id !== trackId) };
      }
      return pl;
    }));
  };

  const renamePlaylist = (playlistId, newName) => {
    setCustomPlaylists(customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, name: newName };
      }
      return pl;
    }));
    if (playlistDetail.playlistId === playlistId) {
      setPlaylistDetail(prev => ({ ...prev, name: newName }));
    }
  };

  const updatePlaylistDescription = (playlistId, newDesc) => {
    setCustomPlaylists(customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, description: newDesc };
      }
      return pl;
    }));
    if (playlistDetail.playlistId === playlistId) {
      setPlaylistDetail(prev => ({ ...prev, description: newDesc }));
    }
  };

  const registerPlayedPlaylist = (playlist) => {
    if (!playlist || !playlist.name) return;
    setRecentlyPlayedPlaylists(prev => {
      const playlistId = playlist.id || playlist.playlistId || playlist.name;
      const filtered = prev.filter(p => (p.id || p.playlistId || p.name) !== playlistId);
      
      const newEntry = {
        id: playlistId,
        type: playlist.type || 'SYSTEM',
        name: playlist.name,
        description: playlist.description || playlist.desc || '',
        songs: playlist.songs || [],
        art: playlist.art || (playlist.songs && playlist.songs[0]?.art) || null,
        color: playlist.color || null,
        playlistId: playlist.playlistId || null,
        artistName: playlist.artistName || null
      };
      return [newEntry, ...filtered].slice(0, 8);
    });
  };

  const handleSelectRecentlyPlayedItem = (item) => {
    if (item.type === 'LIKED') {
      showLikedPlaylist();
    } else if (item.type === 'CUSTOM') {
      const found = customPlaylists.find(pl => pl.id === item.playlistId);
      if (found) {
        showCustomPlaylist(found);
      } else {
        showCustomPlaylist(item);
      }
    } else if (item.type === 'ARTIST') {
      showArtistProfile(item.name);
    } else {
      showPlaylistDetail(item.type, item.name, item.songs, item.description);
    }
  };

  const showArtistProfile = (artistName) => {
    setArtistNameContext(artistName);
    setActiveView('artist-profile');
    registerPlayedPlaylist({
      type: 'ARTIST',
      name: artistName,
      description: `Perfil del artista ${artistName}`,
      songs: [],
      playlistId: null,
      artistName: artistName
    });
  };

  // Navigations routing selection
  const showLikedPlaylist = () => {
    const pl = {
      type: 'LIKED',
      name: 'Canciones favoritas',
      description: 'Tu colección personal de éxitos favoritos.',
      songs: likedSongs,
      playlistId: null
    };
    setPlaylistDetail(pl);
    setActiveView('liked');
    registerPlayedPlaylist(pl);
  };

  const showCustomPlaylist = (playlist) => {
    const pl = {
      type: 'CUSTOM',
      name: playlist.name,
      description: `Disfruta de tu playlist personalizada: ${playlist.name}.`,
      songs: playlist.songs,
      playlistId: playlist.id
    };
    setPlaylistDetail(pl);
    setActiveView(`custom-${playlist.id}`);
    registerPlayedPlaylist(pl);
  };

  const showPlaylistDetail = (type, name, songs, customDesc = null) => {
    const pl = {
      type,
      name,
      description: customDesc,
      songs,
      playlistId: null
    };
    setPlaylistDetail(pl);
    setActiveView('detail');
    registerPlayedPlaylist(pl);
  };

  if (!isLoggedIn) {
    return <ViewLogin onLogin={handleLogin} />;
  }

  return (
    <div className={`app-container ${isDrawerOpen ? 'drawer-open' : ''}`}>
      {/* Ambient background glow that morphs with track colors */}
      <div className="ambient-glow" id="ambientGlow"></div>

      <header className="global-top-bar">
        <div className="global-header-left" onClick={() => setActiveView('home')}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="logo-icon">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.783-8.893-.982-.336.076-.67-.135-.746-.472-.076-.336.136-.67.472-.746 3.856-.88 7.15-.506 9.814 1.128.294.18.387.563.21.865zm1.223-2.724c-.226.367-.707.487-1.074.26-2.717-1.67-6.862-2.155-10.07-1.18-.413.125-.85-.106-.975-.519-.125-.413.106-.85.519-.975 3.67-1.114 8.236-.575 11.34 1.332.366.226.486.708.26 1.082zm.106-2.833C14.372 8.796 8.52 8.602 5.137 9.628c-.53.16-1.09-.14-1.25-.67-.16-.53.14-1.09.67-1.25 3.883-1.178 10.347-.954 14.43 1.47.478.284.634.902.35 1.38-.284.478-.902.634-1.38.35z"/>
          </svg>
        </div>

        <div className="global-header-center">
          <button 
            className={`home-round-btn ${activeView === 'home' ? 'active' : ''}`} 
            onClick={() => setActiveView('home')}
            title="Inicio"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 22h-10c-.8 0-1.5-.7-1.5-1.5v-10c0-.5.2-1 .6-1.4l10-8.2c.5-.4 1.3-.4 1.8 0l10 8.2c.4.4.6.9.6 1.4v10c0 .8-.7 1.5-1.5 1.5h-10zM3 20h8v-6h2v6h8v-9.5L12 5.2 3 10.5V20z"/>
            </svg>
          </button>
          
          <div className="global-search-container" onClick={() => {
            if (activeView !== 'search') setActiveView('search');
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="search-input-icon">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="¿Qué quieres reproducir?"
              id="globalSearchInput"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'search') setActiveView('search');
              }}
              onFocus={() => {
                if (activeView !== 'search') setActiveView('search');
              }}
              autoComplete="off"
            />
            <button className="search-library-pill-btn" title="Explorar todo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                <path d="M6 6h10M6 10h10"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="global-header-right">
          <button className="global-header-btn" title="Novedades">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="global-header-btn" title="Actividad de amigos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </button>
          <div 
            className="global-user-avatar" 
            onClick={() => setActiveView('user-profile')} 
            title={`Perfil de ${userProfile.username}`}
            style={{ backgroundColor: userProfile.avatarColor, cursor: 'pointer' }}
          >
            <span>{userProfile.username ? userProfile.username.trim().charAt(0).toUpperCase() : 'U'}</span>
          </div>
        </div>
      </header>

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        likedSongsCount={likedSongs.length}
        customPlaylists={customPlaylists}
        createPlaylist={createPlaylist}
        onSelectLikedSongs={showLikedPlaylist}
        onSelectCustomPlaylist={showCustomPlaylist}
        onSelectArtist={showArtistProfile}
      />

      <main className="main-content">
        {/* View Switch Routing Panels */}
        {activeView === 'user-profile' && (
          <ViewUserProfile
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            likedSongsCount={likedSongs.length}
            customPlaylistsCount={customPlaylists.length}
            recentlyPlayed={recentlyPlayed}
            onPlaySong={(song) => playSong(recentlyPlayed, recentlyPlayed.findIndex(s => s.id === song.id))}
            setActiveView={setActiveView}
            onLogout={handleLogout}
            secondsListened={secondsListened}
          />
        )}

        {activeView === 'home' && (
          <ViewHome
            seedSongs={seedSongs}
            onPlaySong={playSong}
            onShowPlaylistDetail={showPlaylistDetail}
            recentlyPlayed={recentlyPlayed}
            recentlyPlayedPlaylists={recentlyPlayedPlaylists}
            onSelectItem={handleSelectRecentlyPlayedItem}
            onShowArtistProfile={showArtistProfile}
          />
        )}

        {activeView === 'search' && (
          <ViewSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onPlaySong={playSong}
            currentTrack={currentTrack}
            likedSongs={likedSongs}
            toggleLikeSong={toggleLikeSong}
            customPlaylists={customPlaylists}
            addTrackToPlaylist={addTrackToPlaylist}
            onShowArtistProfile={showArtistProfile}
          />
        )}

        {activeView === 'liked' && (
          <ViewPlaylistDetail
            type="LIKED"
            name={playlistDetail.name}
            description={playlistDetail.description}
            songs={likedSongs} // Feed state directly to keep in-sync instantly
            onPlaySong={playSong}
            currentTrack={currentTrack}
            likedSongs={likedSongs}
            toggleLikeSong={toggleLikeSong}
            onShowArtistProfile={showArtistProfile}
            username={userProfile.username}
          />
        )}


        {activeView.startsWith('custom-') && (
          <ViewPlaylistDetail
            type="CUSTOM"
            name={playlistDetail.name}
            description={playlistDetail.description}
            // Feed the live playlist songs from customPlaylists state
            songs={customPlaylists.find(pl => pl.id === playlistDetail.playlistId)?.songs || []}
            onPlaySong={playSong}
            currentTrack={currentTrack}
            likedSongs={likedSongs}
            toggleLikeSong={toggleLikeSong}
            customPlaylistId={playlistDetail.playlistId}
            deletePlaylist={deletePlaylist}
            removeTrackFromPlaylist={removeTrackFromPlaylist}
            renamePlaylist={renamePlaylist}
            updatePlaylistDescription={updatePlaylistDescription}
            onShowArtistProfile={showArtistProfile}
            username={userProfile.username}
          />
        )}

        {activeView === 'detail' && (
          <ViewPlaylistDetail
            type="SYSTEM"
            name={playlistDetail.name}
            description={playlistDetail.description}
            songs={playlistDetail.songs}
            onPlaySong={playSong}
            currentTrack={currentTrack}
            likedSongs={likedSongs}
            toggleLikeSong={toggleLikeSong}
            onShowArtistProfile={showArtistProfile}
            username={userProfile.username}
          />
        )}

        {activeView === 'artist-profile' && (
          <ViewArtistProfile
            artistName={artistNameContext}
            onPlaySong={playSong}
            currentTrack={currentTrack}
            likedSongs={likedSongs}
            toggleLikeSong={toggleLikeSong}
            onShowPlaylistDetail={showPlaylistDetail}
          />
        )}
      </main>

      <RightDrawer
        currentTrack={currentTrack}
        currentTime={displayCurrentTime}
        onSeek={handleSeek}
        analyser={analyserRef.current}
        isPlaying={isPlaying}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        nextTrack={triggerNextTrack}
        prevTrack={triggerPrevTrack}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        isRepeat={isRepeat}
        setIsRepeat={setIsRepeat}
        volume={volume}
        setVolume={setVolume}
        currentTime={displayCurrentTime}
        duration={displayDuration}
        onSeek={handleSeek}
        isLiked={currentTrack ? likedSongs.some(s => s.id === currentTrack.id) : false}
        toggleLikeCurrentTrack={toggleLikeCurrentTrack}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        isFullScreenPlayerOpen={isFullScreenPlayerOpen}
        setIsFullScreenPlayerOpen={setIsFullScreenPlayerOpen}
      />

      <FullscreenPlayer
        isOpen={isFullScreenPlayerOpen}
        onClose={() => setIsFullScreenPlayerOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        nextTrack={triggerNextTrack}
        prevTrack={triggerPrevTrack}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        isRepeat={isRepeat}
        setIsRepeat={setIsRepeat}
        volume={volume}
        setVolume={setVolume}
        currentTime={displayCurrentTime}
        duration={displayDuration}
        onSeek={handleSeek}
        isLiked={currentTrack ? likedSongs.some(s => s.id === currentTrack.id) : false}
        toggleLikeCurrentTrack={toggleLikeCurrentTrack}
      />

      {/* Central Audio Tag */}
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous"></audio>

      {/* Hidden YouTube Player container */}
      <div id="youtube-player" style={{ position: 'absolute', top: '-1000px', left: '-1000px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}></div>
    </div>
  );
}
