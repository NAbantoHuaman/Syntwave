import React, { useState } from 'react';

export default function ViewLibrary({
  activeView,
  setActiveView,
  likedSongsCount,
  customPlaylists,
  createPlaylist,
  onSelectLikedSongs,
  onSelectCustomPlaylist,
  onSelectArtist,
  userProfile,
  setIsCreateSheetOpen
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const handleCreatePlaylist = (e) => {
    e.stopPropagation();
    const nextNumber = customPlaylists.length + 1;
    setNewPlaylistName(`Mi playlist #${nextNumber}`);
    setShowCreateModal(true);
  };

  const handleConfirmCreate = (e) => {
    e?.preventDefault();
    if (newPlaylistName && newPlaylistName.trim() !== "") {
      createPlaylist(newPlaylistName.trim());
      setShowCreateModal(false);
      setNewPlaylistName('');
    }
  };

  // Mock artists same as Sidebar
  const mockArtists = [
    { name: "Don Diablo", art: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=100&auto=format&fit=crop&q=80" },
    { name: "Parkway Drive", art: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=100&auto=format&fit=crop&q=80" },
    { name: "Axwell / Ingrosso", art: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80" },
    { name: "ILLENIUM", art: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80" }
  ];

  // Mock albums same as Sidebar
  const mockAlbums = [
    { name: "Future Nostalgia", artist: "Dua Lipa", art: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=100&auto=format&fit=crop&q=80" },
    { name: "After Hours", artist: "The Weeknd", art: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format&fit=crop&q=80" }
  ];

  return (
    <div className="view-library-mobile">
      <div className="library-mobile-header">
        <div className="library-title-group">
          {/* Avatar bubble at the left (links to user profile) */}
          <div 
            className="mobile-header-avatar"
            style={{ 
              backgroundColor: userProfile?.avatarColor || 'var(--accent-glow)',
              cursor: 'pointer'
            }}
            onClick={() => setActiveView('user-profile')}
            title="Ver perfil"
          >
            {userProfile?.username ? userProfile.username.trim().charAt(0).toUpperCase() : 'U'}
          </div>
          <h1>Tu biblioteca</h1>
        </div>
        
        <div className="library-header-actions">
          <button className="library-action-btn search-btn" onClick={() => setActiveView('search')} title="Buscar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
          <button className="library-action-btn plus-btn" onClick={() => setIsCreateSheetOpen(true)} title="Añadir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5v14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bubble Filters: Todos, Playlists, Artistas, Álbumes */}
      <div className="sidebar-filter-bubbles library-mobile-bubbles">
        {['Todos', 'Playlists', 'Artistas', 'Álbumes'].map((filter) => (
          <span
            key={filter}
            className={`bubble ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </span>
        ))}
      </div>

      {/* Recientes Sorting */}
      <div className="sidebar-sorting-row library-mobile-sorting">
        <div className="sorting-recent-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="sort-arrows-icon">
            <path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"/>
          </svg>
          <span>Recientes</span>
        </div>
        <button className="sidebar-layout-btn" title="Cambiar diseño" onClick={() => alert("Diseño de cuadrícula premium activado.")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>
      </div>

      {/* List of library items */}
      <div className="library-mobile-list">
        {/* Liked Songs */}
        {(activeFilter === 'Todos' || activeFilter === 'Playlists') && (
          <div
            className={`library-item mobile-item ${activeView === 'liked' ? 'active' : ''}`}
            onClick={onSelectLikedSongs}
          >
            <div className="playlist-art liked-art">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="playlist-info">
              <span className="playlist-title font-medium">Tus me gusta</span>
              <span className="playlist-subtitle">Playlist • {likedSongsCount} {likedSongsCount === 1 ? 'canción' : 'canciones'}</span>
            </div>
          </div>
        )}

        {/* Custom Playlists */}
        {(activeFilter === 'Todos' || activeFilter === 'Playlists') && customPlaylists.map((pl) => (
          <div
            key={pl.id}
            className={`library-item mobile-item ${activeView === `custom-${pl.id}` ? 'active' : ''}`}
            onClick={() => onSelectCustomPlaylist(pl)}
          >
            <div
              className="playlist-art"
              style={{
                backgroundImage: pl.songs.length > 0 ? `url(${pl.songs[0].art})` : 'linear-gradient(135deg, #333 0%, #111 100%)',
                borderRadius: '4px'
              }}
            />
            <div className="playlist-info">
              <span className="playlist-title font-medium">{pl.name}</span>
              <span className="playlist-subtitle">Playlist • {pl.songs.length} {pl.songs.length === 1 ? 'canción' : 'canciones'}</span>
            </div>
          </div>
        ))}

        {/* Circular Avatar Artists */}
        {(activeFilter === 'Todos' || activeFilter === 'Artistas') && mockArtists.map((artist, idx) => (
          <div
            key={`mobile-artist-${idx}`}
            className="library-item mobile-item mobile-artist-item"
            onClick={() => onSelectArtist && onSelectArtist(artist.name)}
          >
            <div
              className="playlist-art circular-artist-art"
              style={{
                backgroundImage: `url(${artist.art})`,
                borderRadius: '50%'
              }}
            />
            <div className="playlist-info">
              <span className="playlist-title font-medium">{artist.name}</span>
              <span className="playlist-subtitle">Artista</span>
            </div>
          </div>
        ))}

        {/* Followed Albums */}
        {(activeFilter === 'Todos' || activeFilter === 'Álbumes') && mockAlbums.map((album, idx) => (
          <div
            key={`mobile-album-${idx}`}
            className="library-item mobile-item mobile-album-item"
          >
            <div
              className="playlist-art"
              style={{
                backgroundImage: `url(${album.art})`,
                borderRadius: '4px'
              }}
            />
            <div className="playlist-info">
              <span className="playlist-title font-medium">{album.name}</span>
              <span className="playlist-subtitle">Álbum • {album.artist}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sleek Synthwave Create Playlist Modal Overlay for mobile */}
      {showCreateModal && (
        <div className="spotify-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="spotify-modal-card small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="spotify-modal-header">
              <h2>Crear lista de reproducción</h2>
              <button className="spotify-modal-close-btn" onClick={() => setShowCreateModal(false)} title="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px', height: '18px' }}>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleConfirmCreate}>
              <div className="spotify-modal-body">
                <div className="spotify-input-wrapper">
                  <label className="spotify-input-label" htmlFor="mobilePlaylistNameInput">Nombre de la lista</label>
                  <input
                    id="mobilePlaylistNameInput"
                    className="spotify-modal-input"
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Mi playlist #1"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="spotify-modal-footer create-footer">
                <button type="button" className="spotify-modal-btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="spotify-modal-btn btn-primary" disabled={!newPlaylistName.trim()}>
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
