import React, { useState } from 'react';

export default function Sidebar({
  activeView,
  setActiveView,
  likedSongsCount,
  customPlaylists,
  createPlaylist,
  onSelectLikedSongs,
  onSelectCustomPlaylist,
  onSelectArtist
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

  // Mock artists from the user's screenshot
  const mockArtists = [
    { name: "Don Diablo", art: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=100&auto=format&fit=crop&q=80" },
    { name: "Parkway Drive", art: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=100&auto=format&fit=crop&q=80" },
    { name: "Axwell / Ingrosso", art: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80" },
    { name: "ILLENIUM", art: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80" }
  ];

  // Followed albums
  const mockAlbums = [
    { name: "Future Nostalgia", artist: "Dua Lipa", art: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=100&auto=format&fit=crop&q=80" },
    { name: "After Hours", artist: "The Weeknd", art: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format&fit=crop&q=80" }
  ];

  return (
    <aside className="sidebar" aria-label="Navegación Principal">
      <div className="sidebar-library">
        {/* Tu biblioteca Header with pill creation button */}
        <div className="library-header">
          <div className="library-title-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10M6 10h10"/>
            </svg>
            <span>Tu biblioteca</span>
          </div>
          
          <button className="sidebar-pill-create-btn" onClick={handleCreatePlaylist} title="Crear Playlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5v14"/>
            </svg>
            <span>Crear</span>
          </button>
        </div>

        {/* Bubble Filters: Todos, Playlists, Artistas, Álbumes */}
        <div className="sidebar-filter-bubbles">
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

        {/* Magnifying search glass & Recientes Sorting */}
        <div className="sidebar-sorting-row">
          <button className="sidebar-search-small-btn" title="Buscar en biblioteca">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
          <div className="sorting-recent" style={{ cursor: 'pointer' }}>
            <span>Recientes</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* List of library playlists & artists */}
        <div className="library-list">
          {/* Liked Songs (Tus me gusta) with purple gradient and heart */}
          {(activeFilter === 'Todos' || activeFilter === 'Playlists') && (
            <div
              className={`library-item ${activeView === 'liked' ? 'active' : ''}`}
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
              className={`library-item ${activeView === `custom-${pl.id}` ? 'active' : ''}`}
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

          {/* Circular Avatar Artists from screenshot */}
          {(activeFilter === 'Todos' || activeFilter === 'Artistas') && mockArtists.map((artist, idx) => (
            <div
              key={`sidebar-artist-${idx}`}
              className="library-item sidebar-artist-item"
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
              key={`sidebar-album-${idx}`}
              className="library-item sidebar-album-item"
              style={{ cursor: 'pointer' }}
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
      </div>

      {/* Sleek Synthwave-style Custom Create Playlist Modal Overlay */}
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
                  <label className="spotify-input-label" htmlFor="playlistNameInput">Nombre de la lista</label>
                  <input
                    id="playlistNameInput"
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
    </aside>
  );
}
