import React, { useState, useEffect } from 'react';
import { formatTime } from '../data/songs';

export default function ViewSearch({
  searchQuery,
  setSearchQuery,
  onPlaySong,
  currentTrack,
  likedSongs,
  toggleLikeSong,
  customPlaylists,
  addTrackToPlaylist,
  onShowArtistProfile
}) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeDropdownTrackId, setActiveDropdownTrackId] = useState(null);

  // Category tags search
  const handleCategorySearch = (category) => {
    setSearchQuery(category);
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setResults([]);
      setError(null);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchTracks(searchQuery);
    }, 500); // Debounce searches to avoid excessive API pounding

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchTracks = async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use iTunes Search API to get official commercial music metadata and artwork
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=30`;
      
      const response = await fetch(url);
      const resData = await response.json();

      if (resData && resData.results) {
        const formatted = resData.results
          .map((track) => {
            const durationSec = track.trackTimeMillis ? track.trackTimeMillis / 1000 : 180;
            
            // Get high resolution artwork (600x600) instead of the default 100x100
            let artUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80";
            if (track.artworkUrl100) {
              artUrl = track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
            }

            return {
              id: `itunes-${track.trackId}`,
              title: track.trackName,
              artist: track.artistName || "Artista Desconocido",
              album: track.collectionName || "Sencillo",
              url: track.previewUrl || "", // Preview MP3 URL acts as a metadata fallback
              art: artUrl,
              // Generate a random pleasant color theme for the ambient glow
              color: getRandomAmbientColor(),
              duration: formatTime(durationSec),
              // Generate dynamic timed smart lyrics based on the real song metadata
              lyrics: null
            };
          });
        setResults(formatted);
      } else {
        setError("Error de búsqueda en el servidor de música.");
      }
    } catch (err) {
      console.error("API error:", err);
      setError("No se pudo conectar al servidor de música. Revisa tu conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomAmbientColor = () => {
    const colors = [
      "rgba(232, 17, 91, 0.22)",  // Pink
      "rgba(255, 0, 127, 0.22)",  // Synthwave Pink
      "rgba(188, 89, 0, 0.22)",   // Orange
      "rgba(13, 114, 234, 0.22)",  // Blue
      "rgba(80, 55, 80, 0.22)",   // Purple
      "rgba(230, 219, 116, 0.18)" // Yellow
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const toggleDropdown = (e, trackId) => {
    e.stopPropagation();
    if (activeDropdownTrackId === trackId) {
      setActiveDropdownTrackId(null);
    } else {
      setActiveDropdownTrackId(trackId);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const closeAll = () => setActiveDropdownTrackId(null);
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  return (
    <section className="view-panel" id="viewSearch">
      {/* Category explorer if search is empty */}
      {(!searchQuery || searchQuery.trim() === "") && (
        <>
          <h2 className="section-title">Explorar todo</h2>
          <div className="genres-grid">
            <div className="genre-card" style={{ '--bg-color': '#e8115b' }} onClick={() => handleCategorySearch('Pop')}>
              <span>Pop</span>
              <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=60" alt="Pop" />
            </div>
            <div className="genre-card" style={{ '--bg-color': '#1db954' }} onClick={() => handleCategorySearch('Lofi Chill')}>
              <span>Lofi Chill</span>
              <img src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150&auto=format&fit=crop&q=60" alt="Lofi" />
            </div>
            <div className="genre-card" style={{ '--bg-color': '#bc5900' }} onClick={() => handleCategorySearch('Synthwave')}>
              <span>Synthwave</span>
              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60" alt="Synthwave" />
            </div>
            <div className="genre-card" style={{ '--bg-color': '#7d4b32' }} onClick={() => handleCategorySearch('Acustico')}>
              <span>Acústico</span>
              <img src="https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&auto=format&fit=crop&q=60" alt="Acoustic" />
            </div>
            <div className="genre-card" style={{ '--bg-color': '#503750' }} onClick={() => handleCategorySearch('Cinematic')}>
              <span>Cinemático</span>
              <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&auto=format&fit=crop&q=60" alt="Cinematic" />
            </div>
            <div className="genre-card" style={{ '--bg-color': '#0d72ea' }} onClick={() => handleCategorySearch('Electronic')}>
              <span>Electrónica</span>
              <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=60" alt="Electronic" />
            </div>
          </div>
        </>
      )}

      {/* Real-time search results panel */}
      {searchQuery && searchQuery.trim() !== "" && (
        <div className="search-results-container">
          <h3 className="section-title">Resultados de búsqueda</h3>

          {isLoading && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{
                border: '4px solid rgba(255,255,255,0.1)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                borderLeftColor: 'var(--spotify-green)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px auto'
              }}></div>
              <span>Buscando canciones en la biblioteca libre...</span>
              <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              `}</style>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ff4b4b' }}>
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <span>No se encontraron canciones para "{searchQuery}"</span>
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className="search-split-view-container">
              <div className="search-top-split">
                {/* Left Column: Artista Principal */}
                <div className="search-artist-col">
                  <h4 className="split-col-title">Artista Principal</h4>
                  <div 
                    className="verified-artist-card" 
                    onClick={() => onShowArtistProfile(results[0].artist)}
                  >
                    <div className="artist-card-bg-glow" style={{ backgroundImage: `url(${results[0].art})` }} />
                    <img src={results[0].art} alt={results[0].artist} className="artist-card-avatar" />
                    <h2 className="artist-card-name">{results[0].artist}</h2>
                    <span className="artist-card-role-badge">
                      <svg className="verified-badge-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Artista Verificado
                    </span>
                    <button 
                      className="artist-card-play-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaySong(results, 0);
                      }}
                      title={`Reproducir música de ${results[0].artist}`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right Column: Canciones Destacadas */}
                <div className="search-tracks-col">
                  <h4 className="split-col-title">Canciones populares</h4>
                  <div className="top-tracks-mini-list">
                    {results.slice(0, 4).map((song) => {
                      const isSongLiked = likedSongs.some(s => s.id === song.id);
                      const isCurrentPlaying = currentTrack?.url === song.url;
                      const songIndex = results.findIndex(r => r.id === song.id);
                      return (
                        <div 
                          key={song.id} 
                          className={`mini-track-row ${isCurrentPlaying ? 'active-track' : ''}`}
                          onClick={() => onPlaySong(results, songIndex)}
                        >
                          <img src={song.art} alt={song.title} className="mini-track-art" />
                          <div className="mini-track-info">
                            <span className="mini-track-title">{song.title}</span>
                            <span 
                              className="mini-track-artist"
                              onClick={(e) => {
                                e.stopPropagation();
                                onShowArtistProfile(song.artist);
                              }}
                            >
                              {song.artist}
                            </span>
                          </div>
                          
                          {/* Mini Actions */}
                          <button
                            className={`row-action-btn ${isSongLiked ? 'liked' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeSong(song);
                            }}
                            title={isSongLiked ? "Quitar de favoritas" : "Añadir a favoritas"}
                            style={{ marginRight: '8px' }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                          
                          <span className="mini-track-duration">{song.duration}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Otras canciones */}
              {results.length > 4 && (
                <div className="search-bottom-results" style={{ marginTop: '32px' }}>
                  <h4 className="split-col-title" style={{ marginBottom: '16px' }}>Otras canciones</h4>
                  <div className="search-results-list">
                    {results.slice(4).map((song) => {
                      const isSongLiked = likedSongs.some(s => s.id === song.id);
                      const isCurrentPlaying = currentTrack?.url === song.url;
                      
                      return (
                        <div
                          key={song.id}
                          className={`search-song-row ${isCurrentPlaying ? 'active-track' : ''}`}
                          onClick={() => onPlaySong(results, results.findIndex(r => r.id === song.id))}
                        >
                          <img src={song.art} alt={song.title} className="search-row-art" />
                          
                          <div className="search-row-info">
                            <span className="search-row-title">{song.title}</span>
                            <span 
                              className="search-row-artist-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                onShowArtistProfile(song.artist);
                              }}
                              style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                display: 'inline-block',
                                marginTop: '2px',
                                cursor: 'pointer',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                            >
                              {song.artist}
                            </span>
                          </div>

                          <span className="search-row-album">{song.album}</span>

                          {/* Like button */}
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

                          {/* Playlist dropdown button */}
                          <div style={{ position: 'relative' }}>
                            <button
                              className="row-action-btn"
                              onClick={(e) => toggleDropdown(e, song.id)}
                              title="Añadir a lista..."
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(90deg)' }}>
                                <circle cx="12" cy="12" r="1"/>
                                <circle cx="12" cy="5" r="1"/>
                                <circle cx="12" cy="19" r="1"/>
                              </svg>
                            </button>

                            {activeDropdownTrackId === song.id && (
                              <div
                                className="playlist-dropdown-menu"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: 'absolute',
                                  bottom: '30px',
                                  right: '0',
                                  backgroundColor: '#18181c',
                                  border: '1px solid var(--border-light)',
                                  borderRadius: '6px',
                                  boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                                  padding: '6px 0',
                                  zIndex: '20',
                                  minWidth: '180px'
                                }}
                              >
                                <div style={{
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  color: 'var(--text-inactive)',
                                  borderBottom: '1px solid var(--border-light)',
                                  fontWeight: '700',
                                  textTransform: 'uppercase'
                                }}>
                                  Añadir a playlist
                                </div>
                                {customPlaylists.length === 0 ? (
                                  <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Crea una playlist en la barra lateral primero.
                                  </div>
                                ) : (
                                  customPlaylists.map((pl) => (
                                    <button
                                      key={pl.id}
                                      onClick={() => {
                                        addTrackToPlaylist(pl.id, song);
                                        setActiveDropdownTrackId(null);
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-main)',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        display: 'block'
                                      }}
                                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                      {pl.name}
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>

                          <span className="search-row-duration">{song.duration}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

