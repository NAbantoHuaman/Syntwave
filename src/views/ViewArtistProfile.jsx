import React, { useState, useEffect } from 'react';
import { formatTime } from '../data/songs';

export default function ViewArtistProfile({
  artistName,
  onPlaySong,
  currentTrack,
  likedSongs,
  toggleLikeSong,
  onShowPlaylistDetail
}) {
  const [popularTracks, setPopularTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!artistName) return;
    
    fetchArtistData(artistName);
  }, [artistName]);

  const fetchArtistData = async (name) => {
    setIsLoading(true);
    setError(null);
    try {
      // Helper to normalize strings (remove accents/diacritics and lowercase)
      const normalizeStr = (str) => {
        if (!str) return "";
        return str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();
      };

      const searchNameNorm = normalizeStr(name);

      // 1. Fetch Top tracks (fetch a larger pool to filter and obtain actual matching songs)
      const songsUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&media=music&entity=song&limit=45`;
      const songsRes = await fetch(songsUrl);
      const songsData = await songsRes.json();

      let tracksArr = [];
      if (songsData && songsData.results) {
        // Filter strictly where track artist name matches the searched artist name
        const filteredSongs = songsData.results.filter(track => {
          if (!track.artistName) return false;
          const trackArtistNorm = normalizeStr(track.artistName);
          return trackArtistNorm.includes(searchNameNorm) || searchNameNorm.includes(trackArtistNorm);
        });

        // Take top 6 popular tracks of the actual artist
        const finalSongs = filteredSongs.slice(0, 6);

        tracksArr = finalSongs.map((track) => {
          const durationSec = track.trackTimeMillis ? track.trackTimeMillis / 1000 : 180;
          let artUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80";
          if (track.artworkUrl100) {
            artUrl = track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
          }
          return {
            id: `itunes-${track.trackId}`,
            title: track.trackName,
            artist: track.artistName || name,
            album: track.collectionName || "Sencillo",
            url: track.previewUrl || "",
            art: artUrl,
            color: getRandomColor(),
            duration: formatTime(durationSec),
            lyrics: null
          };
        });
        setPopularTracks(tracksArr);
      }

      // 2. Fetch albums (fetch a larger pool to filter and deduplicate)
      const albumsUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&media=music&entity=album&limit=40`;
      const albumsRes = await fetch(albumsUrl);
      const albumsData = await albumsRes.json();

      if (albumsData && albumsData.results) {
        // Filter strictly where album artist matches the searched artist name
        const filteredAlbums = albumsData.results.filter(album => {
          if (!album.artistName) return false;
          const albumArtistNorm = normalizeStr(album.artistName);
          return albumArtistNorm.includes(searchNameNorm) || searchNameNorm.includes(albumArtistNorm);
        });

        // Deduplicate albums by title (collectionName) to avoid duplicate deluxe/standard editions
        const seenCollectionNames = new Set();
        const uniqueAlbums = [];
        for (const album of filteredAlbums) {
          const normTitle = normalizeStr(album.collectionName);
          if (!seenCollectionNames.has(normTitle)) {
            seenCollectionNames.add(normTitle);
            uniqueAlbums.push(album);
          }
        }

        // Take top 8 albums
        const finalAlbums = uniqueAlbums.slice(0, 8);

        const formattedAlbums = finalAlbums.map((album) => {
          let artUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80";
          if (album.artworkUrl100) {
            artUrl = album.artworkUrl100.replace('100x100bb.jpg', '400x400bb.jpg');
          }
          const year = album.releaseDate ? new Date(album.releaseDate).getFullYear() : 'Álbum';
          return {
            id: `album-${album.collectionId}`,
            title: album.collectionName,
            artist: album.artistName,
            art: artUrl,
            year: year
          };
        });
        setAlbums(formattedAlbums);
      }
    } catch (err) {
      console.error("Error loading artist data:", err);
      setError("No se pudo cargar la información del artista. Por favor, verifica tu conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPopular = () => {
    if (popularTracks.length > 0) {
      onPlaySong(popularTracks, 0);
    }
  };

  // When clicking an album card, resolve and load tracks for that album dynamically!
  const handleAlbumClick = async (album) => {
    setIsLoading(true);
    try {
      // Fetch songs of the album
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(album.artist + ' ' + album.title)}&media=music&entity=song&limit=30`;
      const response = await fetch(url);
      const resData = await response.json();

      if (resData && resData.results) {
        // Filter songs strictly belonging to this album and this artist loosely
        const filteredAlbumSongs = resData.results.filter((track) => {
          if (!track.collectionName || !track.artistName) return false;
          
          const trackAlbumNorm = track.collectionName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const targetAlbumNorm = album.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          
          const trackArtistNorm = track.artistName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const targetArtistNorm = album.artist.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          
          return (trackAlbumNorm.includes(targetAlbumNorm) || targetAlbumNorm.includes(trackAlbumNorm)) &&
                 (trackArtistNorm.includes(targetArtistNorm) || targetArtistNorm.includes(trackArtistNorm));
        });

        // Map final songs
        const albumSongs = filteredAlbumSongs.map((track) => {
          const durationSec = track.trackTimeMillis ? track.trackTimeMillis / 1000 : 180;
          let artUrl = album.art;
          if (track.artworkUrl100) {
            artUrl = track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
          }
          return {
            id: `itunes-${track.trackId}`,
            title: track.trackName,
            artist: track.artistName || album.artist,
            album: track.collectionName || album.title,
            url: track.previewUrl || "",
            art: artUrl,
            color: getRandomColor(),
            duration: formatTime(durationSec),
            lyrics: null
          };
        });

        onShowPlaylistDetail("SYSTEM", album.title, albumSongs, `Álbum de ${album.artist} publicado en ${album.year}`);
      } else {
        // Fallback with a single song representing the album if fetch fails
        onShowPlaylistDetail("SYSTEM", album.title, popularTracks.slice(0, 1), `Álbum de ${album.artist}`);
      }
    } catch (e) {
      console.warn("Could not load album tracks dynamically, playing top song instead:", e);
      onShowPlaylistDetail("SYSTEM", album.title, popularTracks.slice(0, 1), `Álbum de ${album.artist}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      "rgba(232, 17, 91, 0.22)",
      "rgba(29, 185, 84, 0.22)",
      "rgba(188, 89, 0, 0.22)",
      "rgba(13, 114, 234, 0.22)",
      "rgba(80, 55, 80, 0.22)"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (isLoading && popularTracks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{
          border: '4px solid rgba(255,255,255,0.1)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          borderLeftColor: 'var(--spotify-green)',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px auto'
        }}></div>
        <h2>Cargando perfil de {artistName}...</h2>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#ff4b4b' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => fetchArtistData(artistName)} 
          style={{
            marginTop: '20px',
            backgroundColor: 'var(--spotify-green)',
            color: 'black',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 24px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const headerBgArt = popularTracks.length > 0 ? popularTracks[0].art : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800";

  return (
    <section className="view-panel" id="viewArtistProfile">
      {/* Dynamic Parallax Banner */}
      <div className="artist-profile-banner" style={{ backgroundImage: `linear-gradient(rgba(7,7,9,0.1), rgba(7,7,9,0.95)), url(${headerBgArt})` }}>
        <div className="artist-banner-contents">
          <div className="verified-badge-row">
            <svg className="verified-badge" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Artista Verificado</span>
          </div>
          <h1 className="artist-name-banner">{artistName}</h1>
          <p className="artist-stats-banner">Ocupando el Top Global • +24,930,128 oyentes mensuales</p>
        </div>
      </div>

      {/* Control Actions Row */}
      <div className="artist-actions-row">
        {popularTracks.length > 0 && (
          <button className="artist-play-action-btn" onClick={handlePlayPopular} title="Reproducir éxitos">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        )}
        <button className="artist-follow-action-btn">
          SIGUIENDO
        </button>
      </div>

      {/* Main Grid Content: Hits & Biography */}
      <div className="artist-main-grid">
        {/* Popular Tracks Table Column */}
        <div className="artist-hits-column">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Populares</h2>
          <div className="artist-hits-list">
            {popularTracks.map((song, idx) => {
              const isSongLiked = likedSongs.some(s => s.id === song.id);
              const isCurrentPlaying = currentTrack?.url === song.url;

              return (
                <div 
                  key={song.id} 
                  className={`artist-hit-row ${isCurrentPlaying ? 'active-track' : ''}`}
                  onClick={() => onPlaySong(popularTracks, idx)}
                >
                  <span className="hit-idx">{idx + 1}</span>
                  <img src={song.art} alt={song.title} className="hit-row-art" />
                  <div className="hit-row-info">
                    <span className="hit-row-title">{song.title}</span>
                    {isCurrentPlaying && <span className="hit-playing-badge">SONANDO</span>}
                  </div>
                  <span className="hit-row-album">{song.album}</span>
                  
                  <button
                    className={`row-action-btn ${isSongLiked ? 'liked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeSong(song);
                    }}
                    title={isSongLiked ? "Quitar de favoritas" : "Añadir a favoritas"}
                    style={{ marginRight: '16px' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>

                  <span className="hit-duration">{song.duration}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biography Column Card */}
        <div className="artist-bio-column">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Biografía</h2>
          <div className="artist-bio-card">
            <div className="bio-card-glow" />
            <div className="bio-card-content">
              <h3>Acerca de {artistName}</h3>
              <p>
                Con una propuesta sonora innovadora y una visión artística sin precedentes, <strong>{artistName}</strong> ha capturado de forma contundente la escena global. 
                Fusionando géneros a la perfección, su catálogo de canciones acumula millones de reproducciones diarias en todo el planeta.
              </p>
              <p className="bio-extra">
                Destaca por su excelencia de producción en alta fidelidad y composiciones con lírica profunda, consolidando su estatus como uno de los líderes icónicos de la música contemporánea y expandiendo sus fronteras con cada lanzamiento.
              </p>
              <div className="bio-badge-verified">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Fuente de datos oficiales iTunes Music</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Albums Grid Section */}
      {albums.length > 0 && (
        <div className="music-section" style={{ marginTop: '24px' }}>
          <h2 className="section-title">Álbumes oficiales</h2>
          <div className="cards-grid">
            {albums.map((album) => (
              <div 
                key={album.id} 
                className="music-card"
                onClick={() => handleAlbumClick(album)}
              >
                <div className="card-art-container">
                  <img src={album.art} alt={album.title} className="card-art" />
                  <button className="card-play-btn" title="Ver álbum">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                    </svg>
                  </button>
                </div>
                <div className="card-title" title={album.title}>{album.title}</div>
                <div className="card-desc">{album.year} • Álbum completo</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
