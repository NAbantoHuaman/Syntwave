import React, { useRef, useEffect } from 'react';
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
  setIsFullScreenPlayerOpen
}) {
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
    <footer className="player-bar">
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
        )}
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
