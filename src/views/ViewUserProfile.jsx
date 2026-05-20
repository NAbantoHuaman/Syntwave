import React, { useState } from 'react';

const PRESET_AVATAR_COLORS = [
  { name: 'Synthwave Magenta', hex: '#ff007f' },
  { name: 'Deep Purple', hex: '#8e2de2' },
  { name: 'Vibrant Pink', hex: '#e8115b' },
  { name: 'Sky Blue', hex: '#0d72ea' },
  { name: 'Warm Orange', hex: '#bc5900' },
  { name: 'Classic Charcoal', hex: '#4f5d75' }
];

export default function ViewUserProfile({
  userProfile,
  setUserProfile,
  likedSongsCount,
  customPlaylistsCount,
  recentlyPlayed,
  onPlaySong,
  setActiveView,
  onLogout,
  secondsListened
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(userProfile.username);
  const [editColor, setEditColor] = useState(userProfile.avatarColor);

  const handleOpenEdit = () => {
    setEditName(userProfile.username);
    setEditColor(userProfile.avatarColor);
    setShowEditModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (editName && editName.trim()) {
      setUserProfile(prev => ({
        ...prev,
        username: editName.trim(),
        avatarColor: editColor
      }));
      setShowEditModal(false);
    }
  };

  const handleGenreSelect = (genre) => {
    setUserProfile(prev => ({
      ...prev,
      preferredGenre: prev.preferredGenre === genre ? '' : genre
    }));
  };

  // Extract initial for avatar badge
  const getInitial = (name) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <section className="view-panel user-profile-view" id="viewUserProfile">
      {/* Header Banner */}
      <div className="profile-header-container">
        <div 
          className="profile-avatar-large" 
          style={{ backgroundColor: userProfile.avatarColor }}
          onClick={handleOpenEdit}
          title="Cambiar avatar"
        >
          <span>{getInitial(userProfile.username)}</span>
          <div className="profile-avatar-hover-overlay">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span>Editar</span>
          </div>
        </div>

        <div className="profile-header-details">
          <span className="profile-tag">Perfil</span>
          <h1 className="profile-name-large">{userProfile.username}</h1>
          
          <div className="profile-stats">
            <span>Miembro desde {userProfile.creationDate}</span>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="artist-actions-row" style={{ padding: '8px 0', flexWrap: 'wrap', gap: '8px' }}>
        <button 
          className="artist-follow-action-btn"
          onClick={handleOpenEdit}
          style={{ borderColor: 'var(--text-muted)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Editar Perfil
        </button>

        <button 
          className="artist-follow-action-btn"
          onClick={() => setActiveView('home')}
          style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}
        >
          Volver a Inicio
        </button>

        <button 
          className="artist-follow-action-btn profile-logout-btn"
          onClick={onLogout}
          style={{ borderColor: 'rgba(232, 17, 91, 0.4)', color: '#e8115b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>

      {/* Grid Dashboard */}
      <div className="profile-dashboard-grid">
        {/* Column 1: Listening stats & preferences */}
        <div className="dashboard-card">
          <div>
            <h3 className="dashboard-card-title">Tus Estadísticas en Tiempo Real</h3>
            <p className="card-desc">Información en vivo basada en tu biblioteca local persistida en tu navegador.</p>
          </div>

          <div className="stats-numerical-row">
            <div className="stat-item">
              <span className="stat-value">{likedSongsCount}</span>
              <div className="stat-label">Favoritas</div>
            </div>
            
            <div className="stat-item">
              <span className="stat-value">{customPlaylistsCount}</span>
              <div className="stat-label">Playlists</div>
            </div>

            <div className="stat-item">
              <span 
                className="stat-value" 
                style={{ 
                  fontSize: secondsListened > 59 ? '1.05rem' : '1.3rem', 
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.5px' 
                }}
              >
                {(() => {
                  const mins = Math.floor(secondsListened / 60);
                  const secs = secondsListened % 60;
                  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                })()}
              </span>
              <div className="stat-label">Tiempo</div>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>Tu Género Favorito</h4>
            <p className="card-desc" style={{ marginBottom: '12px' }}>Selecciona tu género predilecto para personalizar tu experiencia visual.</p>
            <div className="genre-badge-selector">
              {['Pop', 'Electrónica', 'Lofi Chill', 'Rock', 'Synthwave', 'Cinemático'].map((genre) => {
                const isActive = userProfile.preferredGenre === genre;
                return (
                  <span
                    key={genre}
                    className={`genre-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handleGenreSelect(genre)}
                  >
                    {genre}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Recently Played Tracks */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '260px' }}>
          <div>
            <h3 className="dashboard-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', color: '#ff007f' }}>
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Escuchado Recientemente
            </h3>
            <p className="card-desc">Tus últimas reproducciones en esta sesión. Haz clic para reproducir.</p>
          </div>

          <div className="profile-recent-songs-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxHeight: '200px', overflowY: 'auto' }}>
            {recentlyPlayed && recentlyPlayed.length > 0 ? (
              recentlyPlayed.map((song, idx) => (
                <div 
                  key={song.id || idx} 
                  className="profile-recent-song-item"
                  onClick={() => onPlaySong(song)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      <img 
                        src={song.art} 
                        alt={song.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div className="play-overlay-hover" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease'
                      }}>
                        <svg viewBox="0 0 24 24" fill="white" style={{ width: '16px', height: '16px' }}>
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '170px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {song.title}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {song.artist}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {song.duration}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '24px 8px',
                textAlign: 'center',
                flex: 1
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ width: '40px', height: '40px', marginBottom: '8px', opacity: 0.5 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12h8"/>
                </svg>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>Sin historial aún</span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>¡Empieza a reproducir música para ver tus temas!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Overlay */}
      {showEditModal && (
        <div className="spotify-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="spotify-modal-card small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="spotify-modal-header">
              <h2>Detalles del perfil</h2>
              <button className="spotify-modal-close-btn" onClick={() => setShowEditModal(false)} title="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px', height: '18px' }}>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile}>
              <div className="spotify-modal-body">
                <div className="spotify-input-wrapper">
                  <label className="spotify-input-label" htmlFor="editProfileUsername">Nombre de usuario</label>
                  <input
                    id="editProfileUsername"
                    className="spotify-modal-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Elige tu alias"
                    autoFocus
                    required
                  />
                </div>

                <div className="spotify-input-wrapper" style={{ marginTop: '16px' }}>
                  <label className="spotify-input-label">Tema del Avatar (Color)</label>
                  <div className="avatar-preset-color-grid">
                    {PRESET_AVATAR_COLORS.map((col) => {
                      const isSelected = editColor === col.hex;
                      return (
                        <div 
                          key={col.hex}
                          className={`avatar-color-circle ${isSelected ? 'selected' : ''}`}
                          style={{ backgroundColor: col.hex }}
                          onClick={() => setEditColor(col.hex)}
                          title={col.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="spotify-modal-footer create-footer">
                <button type="button" className="spotify-modal-btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
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
