import React, { useRef, useEffect, useState } from 'react';
import { formatTime } from '../data/songs';

export default function FullscreenPlayer({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  togglePlayPause,
  nextTrack,
  prevTrack,
  isShuffle,
  setIsShuffle,
  isRepeat,
  setIsRepeat,
  volume,
  setVolume,
  currentTime,
  duration,
  onSeek,
  isLiked,
  toggleLikeCurrentTrack,
  customPlaylists,
  addTrackToPlaylist
}) {
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const progressContainerRef = useRef(null);
  const volumeContainerRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Calculate active lyrics line
  const activeLineIndex = currentTrack?.lyrics
    ? currentTrack.lyrics.reduce((acc, line, idx) => {
        if (currentTime >= line.time) {
          return idx;
        }
        return acc;
      }, -1)
    : -1;

  // Auto-scroll active lyric line into center of container
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLineIndex]);

  const handleProgressClick = (e) => {
    if (!duration || !progressContainerRef.current) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * duration);
  };

  const handleProgressMouseDown = () => {
    const handleMouseMove = (moveEvent) => {
      if (!duration || !progressContainerRef.current) return;
      const rect = progressContainerRef.current.getBoundingClientRect();
      const clickX = moveEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      onSeek(percentage * duration);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleVolumeClick = (e) => {
    if (!volumeContainerRef.current) return;
    const rect = volumeContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVol = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(newVol);
  };

  const handleVolumeMouseDown = () => {
    const handleMouseMove = (moveEvent) => {
      if (!volumeContainerRef.current) return;
      const rect = volumeContainerRef.current.getBoundingClientRect();
      const clickX = moveEvent.clientX - rect.left;
      const newVol = Math.max(0, Math.min(1, clickX / rect.width));
      setVolume(newVol);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  const hasLyrics = currentTrack.lyrics && currentTrack.lyrics.length > 0;

  return (
    <div className={`fullscreen-player ${isOpen ? 'open' : ''}`}>
      {/* Ambient Moving Gradient Backdrop */}
      <div 
        className="fullscreen-ambient-bg" 
        style={{ 
          '--track-color': currentTrack.color || 'rgba(29, 185, 84, 0.18)' 
        }} 
      />

      <div className="fullscreen-header">
        <button className="minimize-btn" onClick={onClose} title="Minimizar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
        <div className="header-meta">
          <span className="playing-from-tag">REPRODUCIENDO CANCIÓN</span>
          <span className="album-name-tag">{currentTrack.album}</span>
        </div>
        <div style={{ width: '48px' }}></div> {/* Spacer */}
      </div>

      <div className={`fullscreen-body-layout ${!hasLyrics ? 'no-lyrics' : ''}`}>
        {/* Left Column: Visual details (Cover Art and titles) */}
        <div className="fullscreen-visual-column">
          <div className="fullscreen-art-container">
            <img 
              src={currentTrack.art} 
              alt={currentTrack.title} 
              className={`fullscreen-large-art ${isPlaying ? 'playing' : ''}`}
            />
          </div>
          
          <div className="fullscreen-track-info-row">
            <div className="fullscreen-titles-block">
              <h1 className="fullscreen-song-title">{currentTrack.title}</h1>
              <p className="fullscreen-song-artist">{currentTrack.artist}</p>
            </div>
            
            <button 
              className={`fullscreen-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={toggleLikeCurrentTrack}
              title={isLiked ? "Quitar de favoritas" : "Añadir a favoritas"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Add to Playlist button */}
            <div style={{ position: 'relative' }}>
              <button 
                className="fullscreen-like-btn"
                onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                title="Añadir a playlist"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>

              {showPlaylistDropdown && (
                <div
                  className="playlist-dropdown-menu"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    bottom: '44px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255, 0, 127, 0.15)',
                    borderRadius: '8px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.6), 0 0 20px rgba(255,0,127,0.08)',
                    padding: '6px 0',
                    zIndex: '9999',
                    minWidth: '200px',
                    backdropFilter: 'blur(12px)',
                    animation: 'fadeInUp 0.2s ease'
                  }}
                >
                  <div style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    color: '#ff007f',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Añadir a playlist
                  </div>
                  {(!customPlaylists || customPlaylists.length === 0) ? (
                    <div style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Crea una playlist primero.
                    </div>
                  ) : (
                    customPlaylists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          addTrackToPlaylist(pl.id, currentTrack);
                          setShowPlaylistDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '9px 14px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--text-main)',
                          textAlign: 'left',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'block',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,0,127,0.08)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        {pl.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seeker / Progress bar inside Visual Column */}
          <div className="fullscreen-timeline-container">
            <div 
              className="fullscreen-progress-slider-container"
              ref={progressContainerRef}
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
            >
              <div className="fullscreen-progress-filled" style={{ width: `${progressPercent}%` }} />
              <div className="fullscreen-progress-handle" style={{ left: `${progressPercent}%` }} />
            </div>
            <div className="fullscreen-time-stamps">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Full controls below progress */}
          <div className="fullscreen-controls-row">
            <button 
              className={`fs-control-btn ${isShuffle ? 'active' : ''}`}
              onClick={() => setIsShuffle(!isShuffle)}
              title="Aleatorio"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M4 20l7.2-7.2M21 3L9 15M4 4l5 5M21 20h-5v-5"/>
              </svg>
            </button>

            <button className="fs-control-btn" onClick={prevTrack} title="Anterior">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6L18 18V6z"/>
              </svg>
            </button>

            <button className="fs-play-btn" onClick={togglePlayPause} title="Reproducir/Pausar">
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button className="fs-control-btn" onClick={nextTrack} title="Siguiente">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            <button 
              className={`fs-control-btn ${isRepeat ? 'active' : ''}`}
              onClick={() => setIsRepeat(!isRepeat)}
              title="Repetir"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4M21 5H9a7 7 0 0 0-7 7v1M7 23l-4-4 4-4M3 19h12a7 7 0 0 0 7-7v-1"/>
              </svg>
            </button>
          </div>

          {/* Volume Control */}
          <div className="fullscreen-volume-wrapper">
            <button 
              className="fs-control-btn"
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              title={volume === 0 ? "Activar sonido" : "Silenciar"}
            >
              {volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              )}
            </button>
            <div 
              className="fs-volume-slider-container"
              ref={volumeContainerRef}
              onClick={handleVolumeClick}
              onMouseDown={handleVolumeMouseDown}
            >
              <div className="fs-volume-filled" style={{ width: `${volumePercent}%` }} />
              <div className="fs-volume-handle" style={{ left: `${volumePercent}%` }} />
            </div>
          </div>
        </div>

        {/* Right Column: Scrolling Lyrics */}
        {hasLyrics && (
          <div className="fullscreen-lyrics-column">
            <div className="fs-lyrics-header">Letras Sincronizadas</div>
            <div className="fs-lyrics-scroll-box" ref={lyricsContainerRef}>
              {currentTrack.lyrics.map((line, idx) => {
                const isActive = idx === activeLineIndex;
                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    className={`fs-lyric-line ${isActive ? 'active' : ''}`}
                    onClick={() => onSeek(line.time)}
                  >
                    {line.text}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
