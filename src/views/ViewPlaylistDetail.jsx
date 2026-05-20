import React, { useState } from 'react';

export default function ViewPlaylistDetail({
  type, // "LIKED" or "CUSTOM" or "SYSTEM" or "LOCAL"
  name,
  description,
  songs,
  onPlaySong,
  currentTrack,
  likedSongs,
  toggleLikeSong,
  customPlaylistId,
  deletePlaylist,
  removeTrackFromPlaylist,
  renamePlaylist,
  updatePlaylistDescription,
  onShowArtistProfile,
  username
}) {
  const isLikedPlaylist = type === "LIKED";
  const isCustomPlaylist = type === "CUSTOM";
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleOpenEditModal = () => {
    setEditName(name || '');
    setEditDesc(description || '');
    setShowEditModal(true);
  };

  const handleSaveDetails = (e) => {
    e?.preventDefault();
    if (editName && editName.trim()) {
      renamePlaylist(customPlaylistId, editName.trim());
      updatePlaylistDescription(customPlaylistId, editDesc.trim());
      setShowEditModal(false);
    }
  };

  const handlePlayPlaylist = () => {
    if (songs.length > 0) {
      onPlaySong(songs, 0);
    }
  };

  const getHeaderArtStyle = () => {
    if (isLikedPlaylist) {
      return {}; // Handled by CSS class and absolute centered content
    }
    if (songs.length > 0) {
      return { backgroundImage: `url(${songs[0].art})` };
    }
    return { backgroundImage: 'linear-gradient(135deg, #333 0%, #111 100%)' };
  };

  const calculateTotalDuration = (songList) => {
    let totalSeconds = 0;
    songList.forEach(song => {
      if (!song.duration) return;
      const parts = song.duration.split(':');
      if (parts.length === 2) {
        const min = parseInt(parts[0], 10);
        const sec = parseInt(parts[1], 10);
        totalSeconds += min * 60 + sec;
      } else if (parts.length === 3) {
        const hrs = parseInt(parts[0], 10);
        const min = parseInt(parts[1], 10);
        const sec = parseInt(parts[2], 10);
        totalSeconds += hrs * 3600 + min * 60 + sec;
      }
    });

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    if (hrs > 0) {
      return `cerca de ${hrs} h ${mins} min`;
    }
    return `cerca de ${mins} min`;
  };

  const getAddedDateStr = (idx) => {
    const dates = [
      "hace 2 semanas",
      "14 oct 2025",
      "24 ago 2025",
      "7 ago 2025",
      "17 jun 2025",
      "31 mar 2025",
      "12 feb 2025",
      "28 ene 2025",
      "5 dic 2024",
      "14 nov 2024"
    ];
    return dates[idx] || "hace 3 meses";
  };

  return (
    <section className={`view-panel ${isLikedPlaylist ? 'liked-view-panel' : ''}`} id="viewPlaylistDetail">
      <div className={`playlist-header-container ${isLikedPlaylist ? 'liked-header-container' : ''}`}>
        <div className={`playlist-header-art ${isLikedPlaylist ? 'liked-art-style' : ''}`} style={getHeaderArtStyle()}>
          {isLikedPlaylist && (
            <svg viewBox="0 0 24 24" fill="#ffffff" style={{ width: '88px', height: '88px' }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          )}
        </div>
        <div className="playlist-header-details">
          <span className="playlist-type">
            {isLikedPlaylist ? "Playlist" : isCustomPlaylist ? "PLAYLIST PERSONALIZADA" : "ÁLBUM"}
          </span>

          {isCustomPlaylist ? (
            <div 
              className="editable-title-wrapper" 
              onClick={handleOpenEditModal} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} 
              title="Haga clic para editar detalles"
            >
              <h1 className="playlist-name-large editable">{name}</h1>
              <svg className="edit-pencil-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', opacity: 0.6 }}>
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
          ) : (
            <h1 className="playlist-name-large" style={isLikedPlaylist ? { fontSize: '72px', fontWeight: '900', letterSpacing: '-2.5px', marginBottom: '8px' } : {}}>{name}</h1>
          )}

          {isCustomPlaylist ? (
            <div 
              className="editable-desc-wrapper" 
              onClick={handleOpenEditModal} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} 
              title="Haga clic para editar detalles"
            >
              <p className="playlist-desc editable">{description || "Sin descripción. Agrega una ahora."}</p>
              <svg className="edit-pencil-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px', opacity: 0.6 }}>
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
          ) : (
            <p className="playlist-desc">{description || "Tu dosis diaria de excelente música."}</p>
          )}

          <div className="playlist-metadata">
            <span className="metadata-author" style={{ fontWeight: '700', color: '#ffffff' }}>
              {type === "SYSTEM" ? "Synthwave" : (username || "Usuario")}
            </span>
            <span className="dot-separator">•</span>
            <span className="metadata-count">
              {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
              {isLikedPlaylist && `, ${calculateTotalDuration(songs)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="playlist-actions-row" style={isLikedPlaylist ? { padding: '16px 0 24px 0', gap: '20px' } : {}}>
        {songs.length > 0 && (
          <button className="play-action-btn" onClick={handlePlayPlaylist} title="Reproducir" style={isLikedPlaylist ? { width: '56px', height: '56px', backgroundColor: '#1ed760' } : {}}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={isLikedPlaylist ? { width: '24px', height: '24px', marginLeft: '0px', color: 'black' } : {}}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        )}

        {isLikedPlaylist && (
          <>
            <button className="playlist-utility-btn shuffle-toggle-btn" title="Aleatorio" style={{ opacity: 0.7 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>
            <button className="playlist-utility-btn download-btn" title="Descargar" style={{ opacity: 0.7 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <polyline points="8 12 12 16 16 12" />
              </svg>
            </button>
          </>
        )}

        {isCustomPlaylist && (
          <button
            className="row-action-btn"
            onClick={() => deletePlaylist(customPlaylistId)}
            style={{
              backgroundColor: 'rgba(255, 75, 75, 0.1)',
              color: '#ff4b4b',
              border: '1px solid rgba(255, 75, 75, 0.2)',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 75, 75, 0.2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 75, 75, 0.1)'}
          >
            Eliminar Playlist
          </button>
        )}

        {isLikedPlaylist && (
          <div className="far-right-list-action" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#a7a7a7', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <span>Lista</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </div>
        )}
      </div>

      {/* Song list table */}
      <div className="songs-table-container">
        <table className="songs-table">
          <thead>
            <tr>
              <th className="col-index">#</th>
              <th className="col-title">Título</th>
              <th className="col-album">Álbum</th>
              {isLikedPlaylist && <th className="col-added">Fecha en que se agregó</th>}
              {!isLikedPlaylist && <th className="col-actions">Acciones</th>}
              <th className="col-duration" style={{ textAlign: 'right', paddingRight: '24px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="duration-icon" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </th>
            </tr>
          </thead>
          <tbody>
            {songs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px' }}>
                  No hay canciones en esta lista de reproducción. ¡Busca y añade algunas en el panel de Buscar!
                </td>
              </tr>
            ) : (
              songs.map((song, idx) => {
                const isSongLiked = likedSongs.some(s => s.id === song.id);
                const isCurrentPlaying = currentTrack?.url === song.url;

                return (
                  <tr
                    key={`${song.id}-table-row`}
                    className={isCurrentPlaying ? "active-track" : ""}
                    onClick={() => onPlaySong(songs, idx)}
                  >
                    <td className="col-index">
                      <span className="song-index-num">{idx + 1}</span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="song-row-index-icon">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </td>
                    <td className="col-title">
                      <img src={song.art} alt={song.title} className="song-title-art" />
                      <div className="song-title-info">
                        <span className="song-row-title-text">{song.title}</span>
                        <div className="song-row-artist-badge-container" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          {isLikedPlaylist && (idx === 0 || idx === 4) && (
                            <span className="video-musical-badge" style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              color: '#a7a7a7',
                              fontSize: '9.5px',
                              fontWeight: '600',
                              padding: '1.5px 5px',
                              borderRadius: '3px',
                              lineHeight: '1',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              flexShrink: 0
                            }}>
                              <svg className="video-badge-icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: '10px', height: '10px' }}>
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              Video musical
                            </span>
                          )}
                          {isLikedPlaylist && (idx === 0 || idx === 4) && (
                            <span className="dot-separator" style={{ color: '#5a5a5a', fontSize: '11px' }}>•</span>
                          )}
                          <span 
                            className="song-row-artist-text"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onShowArtistProfile) onShowArtistProfile(song.artist);
                            }}
                            style={{ cursor: 'pointer', transition: 'color 0.2s', marginTop: 0 }}
                            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                          >
                            {song.artist}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="col-album">{song.album}</td>
                    {isLikedPlaylist && (
                      <td className="col-added">{getAddedDateStr(idx)}</td>
                    )}
                    {!isLikedPlaylist && (
                      <td className="col-actions">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                          <button
                            className={`row-action-btn ${isSongLiked ? 'liked' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeSong(song);
                            }}
                            title={isSongLiked ? "Quitar de favoritas" : "Añadir a favoritas"}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                          
                          {isCustomPlaylist && (
                            <button
                              className="row-action-btn remove-track-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (removeTrackFromPlaylist) {
                                  removeTrackFromPlaylist(customPlaylistId, song.id);
                                }
                              }}
                              title="Eliminar de esta playlist"
                              style={{ color: '#ff4b4b', opacity: 0.8 }}
                              onMouseEnter={(e) => e.target.style.opacity = 1}
                              onMouseLeave={(e) => e.target.style.opacity = 0.8}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="col-duration" style={{ paddingRight: '24px' }}>
                      <div className="duration-cell-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                        {isLikedPlaylist && (
                          <button
                            className={`row-action-btn inline-like-btn ${isSongLiked ? 'liked' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeSong(song);
                            }}
                            title={isSongLiked ? "Quitar de favoritas" : "Añadir a favoritas"}
                            style={{
                              opacity: isSongLiked ? 1 : 0,
                              color: isSongLiked ? '#1ed760' : '#a7a7a7',
                              transition: 'opacity 0.2s, transform 0.2s',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill={isSongLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        )}
                        <span>{song.duration}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sleek Synthwave-style "Editar Detalles" Modal Overlay */}
      {showEditModal && (
        <div className="spotify-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="spotify-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="spotify-modal-header">
              <h2>Editar detalles</h2>
              <button className="spotify-modal-close-btn" onClick={() => setShowEditModal(false)} title="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px', height: '18px' }}>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveDetails}>
              <div className="spotify-modal-body">
                <div className="spotify-details-grid">
                  {/* Left: Album cover preview */}
                  <div 
                    className="spotify-details-art-preview"
                    style={{
                      backgroundImage: songs.length > 0 ? `url(${songs[0].art})` : 'linear-gradient(135deg, #333 0%, #111 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {songs.length === 0 && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                      </svg>
                    )}
                    <div className="spotify-details-art-overlay">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '28px', height: '28px', marginBottom: '4px' }}>
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                      <span>Editar foto</span>
                    </div>
                  </div>

                  {/* Right: Input fields */}
                  <div className="spotify-details-form">
                    <div className="spotify-input-wrapper">
                      <label className="spotify-input-label" htmlFor="editPlaylistName">Nombre</label>
                      <input
                        id="editPlaylistName"
                        className="spotify-modal-input"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nombre de la playlist"
                        required
                        autoFocus
                      />
                    </div>
                    
                    <div className="spotify-input-wrapper">
                      <label className="spotify-input-label" htmlFor="editPlaylistDesc">Descripción</label>
                      <textarea
                        id="editPlaylistDesc"
                        className="spotify-modal-textarea"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Añade una descripción opcional"
                        maxLength={200}
                      />
                    </div>
                  </div>
                </div>

                <div className="spotify-modal-disclaimer">
                  Al continuar, aceptas que permites el acceso a la imagen elegida para subir. Asegúrate de tener derecho a subir la imagen.
                </div>
              </div>

              <div className="spotify-modal-footer">
                <button type="submit" className="spotify-modal-btn btn-primary" disabled={!editName.trim()}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
