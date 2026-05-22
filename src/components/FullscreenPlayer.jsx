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
  addTrackToPlaylist,
  createPlaylist
}) {
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [mobileTab, setMobileTab] = useState('player'); // 'player' | 'lyrics'
  const [isSongOptionsOpen, setIsSongOptionsOpen] = useState(false);
  const [isAddPlaylistOpen, setIsAddPlaylistOpen] = useState(false);
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
        <div className="header-meta">
          <span className="playing-from-tag">REPRODUCIENDO DESDE ARTISTA</span>
          <span className="album-name-tag">{currentTrack.artist}</span>
        </div>
        <button className="options-btn-top" onClick={() => setIsSongOptionsOpen(true)} title="Opciones" style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>

      <div className={`fullscreen-body-layout ${!hasLyrics ? 'no-lyrics' : ''} mobile-tab-${mobileTab}`}>
        {/* Left Column: Visual details (Cover Art and titles) */}
        <div className="fullscreen-visual-column">
          <div className="fullscreen-art-container">
            <img 
              src={currentTrack.art} 
              alt={currentTrack.title} 
              className={`fullscreen-large-art ${isPlaying ? 'playing' : ''}`}
            />
          </div>
          
          {/* Línea de letra activa destacada en tiempo real bajo la carátula */}
          {hasLyrics && activeLineIndex !== -1 && (
            <div className="active-lyric-caption-bubble" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
              <span className="active-lyric-caption-text" style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                color: '#fff', 
                padding: '4px 8px', 
                borderRadius: '6px', 
                fontSize: '12px', 
                fontWeight: '600' 
              }}>
                {currentTrack.lyrics[activeLineIndex].text}
              </span>
            </div>
          )}
          
          <div className="fullscreen-track-info-row">
            <div className="fullscreen-titles-block">
              <h1 className="fullscreen-song-title">{currentTrack.title}</h1>
              <p className="fullscreen-song-artist">{currentTrack.artist}</p>
            </div>
            
            <div className="fullscreen-actions-right">
              <button 
                className={`fullscreen-add-playlist-btn ${isLiked ? 'liked' : ''}`}
                onClick={toggleLikeCurrentTrack}
                title={isLiked ? "Añadido a tus Me Gusta" : "Añadir a tus Me Gusta"}
                style={{ background: 'transparent', border: 'none', color: isLiked ? '#1db954' : '#b3b3b3', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isLiked ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '28px', height: '28px' }}>
                    <circle cx="12" cy="12" r="10" fill="#1db954"/>
                    <path d="m9 12 2 2 4-4" fill="none" stroke="#121212" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                )}
              </button>
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
              className={`fs-control-btn shuffle-btn-glow ${isShuffle ? 'active' : ''}`}
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
              className={`fs-control-btn repeat-btn-glow ${isRepeat ? 'active' : ''}`}
              onClick={() => setIsRepeat(!isRepeat)}
              title="Repetir"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4M21 5H9a7 7 0 0 0-7 7v1M7 23l-4-4 4-4M3 19h12a7 7 0 0 0 7-7v-1"/>
              </svg>
            </button>
          </div>

          {/* Fila Inferior de Utilidades Móviles (Dispositivo, Compartir, Cola) */}
          <div className="fullscreen-footer-utility-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <button className="fs-utility-btn" onClick={() => alert("Dispositivos: Simulado en Syntwave Mobile.")} title="Dispositivos" style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <rect x="2" y="2" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </button>

            <button className="fs-utility-btn" onClick={() => alert("Compartir: ¡Copia el enlace de esta joya de Syntwave!")} title="Compartir" style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>

            <button className="fs-utility-btn" onClick={() => alert("Cola de reproducción: ¡Viene el siguiente temazo pop en un momento!")} title="Cola de reproducción" style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
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

      {/* Bottom Sheet de Opciones de Canción (`...`) */}
      {isSongOptionsOpen && (
        <div className="mobile-bottom-sheet-backdrop" onClick={() => setIsSongOptionsOpen(false)}>
          <div className="mobile-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div className="sheet-handle" />
              <div className="sheet-track-preview">
                <img src={currentTrack.art} alt={currentTrack.title} className="preview-art" />
                <div className="preview-details">
                  <h4>{currentTrack.title}</h4>
                  <p>{currentTrack.artist}</p>
                </div>
              </div>
            </div>
            <div className="sheet-options-list">
              <button 
                className="sheet-option-item" 
                onClick={() => { 
                  setIsSongOptionsOpen(false); 
                  alert("Compartir: ¡Copia el enlace de esta joya de Syntwave!");
                }}
              >
                <div className="option-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </div>
                <div className="option-details">
                  <span className="option-title">Compartir</span>
                  <span className="option-desc">Comparte esta canción con tus amigos.</span>
                </div>
              </button>

              <button 
                className="sheet-option-item" 
                onClick={() => { 
                  setIsSongOptionsOpen(false); 
                  if (hasLyrics) setMobileTab(mobileTab === 'player' ? 'lyrics' : 'player');
                }}
              >
                <div className="option-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8"/>
                  </svg>
                </div>
                <div className="option-details">
                  <span className="option-title">Letra • {hasLyrics ? 'Activada' : 'No disponible'}</span>
                  <span className="option-desc">Visualiza y canta la letra sincronizada.</span>
                </div>
              </button>

              <button 
                className="sheet-option-item" 
                onClick={() => { 
                  setIsSongOptionsOpen(false); 
                  setIsAddPlaylistOpen(true); 
                }}
              >
                <div className="option-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div className="option-details">
                  <span className="option-title">Agregar a playlist</span>
                  <span className="option-desc">Guarda esta canción en una de tus playlists.</span>
                </div>
              </button>

              <button 
                className="sheet-option-item" 
                onClick={() => { 
                  setIsSongOptionsOpen(false); 
                  toggleLikeCurrentTrack(); 
                }}
              >
                <div className="option-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <div className="option-details">
                  <span className="option-title">{isLiked ? 'Quitar de Favoritas' : 'Añadir a Favoritas'}</span>
                  <span className="option-desc">Administra esta canción en tu biblioteca.</span>
                </div>
              </button>
            </div>
            <button className="sheet-cancel-btn" onClick={() => setIsSongOptionsOpen(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet de Añadir a Playlist */}
      {isAddPlaylistOpen && (
        <div className="mobile-bottom-sheet-backdrop" onClick={() => setIsAddPlaylistOpen(false)}>
          <div className="mobile-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header playlist-sheet-header">
              <div className="sheet-handle" />
              <h3>Agregar a playlist</h3>
              <button 
                className="new-playlist-sheet-btn"
                onClick={() => {
                  const plName = prompt("Introduce el nombre de la nueva playlist:");
                  if (plName && plName.trim()) {
                    createPlaylist(plName.trim());
                  }
                }}
              >
                Nueva playlist
              </button>
            </div>
            <div className="sheet-options-list scrollable-sheet-list">
              {(!customPlaylists || customPlaylists.length === 0) ? (
                <div className="empty-playlists-notice" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No tienes playlists creadas. ¡Crea una arriba!
                </div>
              ) : (
                customPlaylists.map((pl) => {
                  const alreadyHasSong = pl.songs.some(s => s.id === currentTrack.id);
                  return (
                    <button 
                      key={pl.id}
                      className="sheet-option-item playlist-item-option"
                      onClick={() => {
                        addTrackToPlaylist(pl.id, currentTrack);
                        setIsAddPlaylistOpen(false);
                      }}
                    >
                      <div className="playlist-mini-art">
                        {pl.songs[0] ? (
                          <img src={pl.songs[0].art} alt={pl.name} />
                        ) : (
                          <div className="empty-playlist-art">🎵</div>
                        )}
                      </div>
                      <div className="option-details">
                        <span className="option-title">{pl.name}</span>
                        <span className="option-desc">{pl.songs.length} canciones</span>
                      </div>
                      {alreadyHasSong && (
                        <div className="checkmark-playlist-added" style={{ color: '#1db954', fontSize: '18px', fontWeight: 'bold' }}>✓</div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <button className="sheet-cancel-btn" onClick={() => setIsAddPlaylistOpen(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
