import React, { useRef, useEffect, useState } from 'react';
import { formatTime } from '../data/songs';

export default function PlayerBar({
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
  isDrawerOpen,
  setIsDrawerOpen,
  isFullScreenPlayerOpen,
  setIsFullScreenPlayerOpen,
  customPlaylists,
  addTrackToPlaylist
}) {
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const progressContainerRef = useRef(null);
  const volumeContainerRef = useRef(null);

  const handleProgressClick = (e) => {
    if (!duration || !progressContainerRef.current) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * duration);
  };

  const handleVolumeClick = (e) => {
    if (!volumeContainerRef.current) return;
    const rect = volumeContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVol = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(newVol);
  };

  // Drag handler helpers for progress
  const handleProgressMouseDown = (e) => {
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

  // Drag handler helpers for volume
  const handleVolumeMouseDown = (e) => {
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <footer 
      className="player-bar"
      onClick={(e) => {
        // En móvil (viewport <= 768px), hacer clic en la barra flotante abre el reproductor a pantalla completa,
        // excepto si se hace clic en botones interactivos (como favorito o reproducir/pausar) o menús desplegables.
        if (window.innerWidth <= 768 && currentTrack) {
          if (
            e.target.closest('.play-pause-btn') || 
            e.target.closest('.player-like-btn') || 
            e.target.closest('.playlist-dropdown-menu')
          ) {
            return;
          }
          setIsFullScreenPlayerOpen(true);
        }
      }}
    >
      {/* 2px Hairline Progress Bar for Mobile floating capsule view */}
      <div className="mobile-progress-hairline" style={{ width: `${progressPercent}%` }} />

      {/* Player Left: Track Details */}
      <div 
        className={`player-track-details ${currentTrack ? 'clickable' : ''}`}
        onClick={() => currentTrack && setIsFullScreenPlayerOpen(true)}
        style={{ cursor: currentTrack ? 'pointer' : 'default' }}
        title={currentTrack ? "Click para ampliar a pantalla completa" : ""}
      >
        <div className="track-art-wrapper">
          {currentTrack ? (
            <img src={currentTrack.art} alt={currentTrack.title} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          )}
        </div>
        <div className="track-text-details">
          <span className="track-title">{currentTrack ? currentTrack.title : "Selecciona una canción"}</span>
          <span className="track-artist">{currentTrack ? currentTrack.artist : "Escoge un tema para comenzar"}</span>
        </div>
        {currentTrack && (
          <>
            <button
              className={`player-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleLikeCurrentTrack();
              }}
              title={isLiked ? "Quitar de favoritas" : "Añadir a favoritas"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Add to Playlist button */}
            <div style={{ position: 'relative' }}>
              <button
                className="player-like-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistDropdown(!showPlaylistDropdown);
                }}
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
                    bottom: '40px',
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
          </>
        )}
      </div>

      {/* Controles móviles de reproducción rápida */}
      <div className="mobile-player-controls">
        <button
          className="mobile-control-btn device-btn"
          onClick={(e) => {
            e.stopPropagation();
            alert("Dispositivos disponibles: Simulado en Syntwave Mobile.");
          }}
          title="Dispositivos"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
            <path d="M4 6h16v10H4z"/>
            <path d="M12 20v-4"/>
            <path d="M9 20h6"/>
          </svg>
        </button>

        {currentTrack && (
          <button
            className={`mobile-control-btn like-checkmark-btn ${isLiked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleLikeCurrentTrack();
            }}
            title={isLiked ? "Añadido a favoritas" : "Añadir a favoritas"}
          >
            {isLiked ? (
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '22px', height: '22px' }}>
                <circle cx="12" cy="12" r="10" fill="#1db954"/>
                <path d="m9 12 2 2 4-4" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '22px', height: '22px' }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            )}
          </button>
        )}

        <button
          className="mobile-control-btn play-pause-btn-quick"
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          title="Reproducir/Pausar"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Player Center: Playback Controls */}
      <div className="player-controls-container">
        <div className="control-buttons">
          <button
            className={`player-btn ${isShuffle ? 'active' : ''}`}
            onClick={() => setIsShuffle(!isShuffle)}
            title="Aleatorio"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 3h5v5M4 20l7.2-7.2M21 3L9 15M4 4l5 5M21 20h-5v-5"/>
            </svg>
          </button>
          
          <button className="player-btn" onClick={prevTrack} title="Anterior">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6L18 18V6z"/>
            </svg>
          </button>

          <button className="play-pause-btn" onClick={togglePlayPause} title="Reproducir/Pausar">
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" id="pauseIcon">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" id="playIcon">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button className="player-btn" onClick={nextTrack} title="Siguiente">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

          <button
            className={`player-btn ${isRepeat ? 'active' : ''}`}
            onClick={() => setIsRepeat(!isRepeat)}
            title="Repetir"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1l4 4-4 4M21 5H9a7 7 0 0 0-7 7v1M7 23l-4-4 4-4M3 19h12a7 7 0 0 0 7-7v-1"/>
            </svg>
          </button>
        </div>

        {/* Seeker Progress Bar */}
        <div className="progress-bar-wrapper">
          <span className="time-stamp">{formatTime(currentTime)}</span>
          <div
            className="progress-slider-container"
            ref={progressContainerRef}
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            <div className="progress-filled" style={{ width: `${progressPercent}%` }} />
            <div className="progress-handle" style={{ left: `${progressPercent}%` }} />
          </div>
          <span className="time-stamp">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Right: Utility controls */}
      <div className="player-utility-container">
        <button
          className={`player-btn ${isFullScreenPlayerOpen ? 'active' : ''}`}
          onClick={() => setIsFullScreenPlayerOpen(true)}
          title="Ampliar a pantalla completa"
          disabled={!currentTrack}
          style={{ opacity: currentTrack ? 1 : 0.5, cursor: currentTrack ? 'pointer' : 'not-allowed' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
        </button>

        <button
          className={`player-btn ${isDrawerOpen ? 'active' : ''}`}
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          title="Letras y Visualizador"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M3 20h.01M3 12h.01M3 4h.01M12 12h9M12 4h9M7 12h.01M7 4h.01M7 20h.01"/>
          </svg>
        </button>

        <div className="volume-control-wrapper">
          <button
            className="player-btn"
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
            className="volume-slider-container"
            ref={volumeContainerRef}
            onClick={handleVolumeClick}
            onMouseDown={handleVolumeMouseDown}
          >
            <div className="volume-filled" style={{ width: `${volumePercent}%` }} />
            <div className="volume-handle" style={{ left: `${volumePercent}%` }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
