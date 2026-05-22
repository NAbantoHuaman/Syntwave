import React, { useState, useEffect } from 'react';
import { formatTime } from '../data/songs';

export default function ViewArtistProfile({
  artistName,
  onPlaySong,
  currentTrack,
  likedSongs,
  toggleLikeSong,
  onShowPlaylistDetail,
  customPlaylists,
  addTrackToPlaylist
}) {
  const [popularTracks, setPopularTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  useEffect(() => {
    if (!artistName) return;
    
    fetchArtistData(artistName);
  }, [artistName]);

  const fetchJsonp = (url) => {
    return new Promise((resolve, reject) => {
      const callbackName = 'deezer_callback_' + Math.round(1000000 * Math.random());
      const script = document.createElement('script');
      window[callbackName] = (data) => {
        delete window[callbackName];
        document.body.removeChild(script);
        resolve(data);
      };
      script.src = url + (url.includes('?') ? '&' : '?') + 'output=jsonp&callback=' + callbackName;
      script.onerror = () => {
        delete window[callbackName];
        document.body.removeChild(script);
        reject(new Error("JSONP request failed"));
      };
      document.body.appendChild(script);
    });
  };

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
      const songsUrl = `https://api.deezer.com/search?q=${encodeURIComponent(name)}&limit=45`;
      const songsData = await fetchJsonp(songsUrl);

      let tracksArr = [];
      if (songsData && songsData.data) {
        // Filter strictly where track artist name matches the searched artist name
        const filteredSongs = songsData.data.filter(track => {
          if (!track.artist || !track.artist.name) return false;
          const trackArtistNorm = normalizeStr(track.artist.name);
          return trackArtistNorm.includes(searchNameNorm) || searchNameNorm.includes(trackArtistNorm);
        });

        // Take top 6 popular tracks of the actual artist
        const finalSongs = filteredSongs.slice(0, 6);

        tracksArr = finalSongs.map((track) => {
          let artUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80";
          if (track.album && track.album.cover_xl) artUrl = track.album.cover_xl;
          else if (track.album && track.album.cover_big) artUrl = track.album.cover_big;
          else if (track.artist && track.artist.picture_xl) artUrl = track.artist.picture_xl;

          return {
            id: `deezer-${track.id}`,
            title: track.title,
            artist: track.artist ? track.artist.name : name,
            album: track.album ? track.album.title : "Sencillo",
            url: track.preview || "",
            art: artUrl,
            color: getRandomColor(),
            duration: formatTime(track.duration || 180),
            lyrics: null
          };
        });
        setPopularTracks(tracksArr);
      }

      // 2. Fetch albums (fetch a larger pool to filter and deduplicate)
      const albumsUrl = `https://api.deezer.com/search/album?q=${encodeURIComponent(name)}&limit=40`;
      const albumsData = await fetchJsonp(albumsUrl);

      if (albumsData && albumsData.data) {
        // Filter strictly where album artist matches the searched artist name
        const filteredAlbums = albumsData.data.filter(album => {
          if (!album.artist || !album.artist.name) return false;
          const albumArtistNorm = normalizeStr(album.artist.name);
          return albumArtistNorm.includes(searchNameNorm) || searchNameNorm.includes(albumArtistNorm);
        });

        // Deduplicate albums by title to avoid duplicate editions
        const seenCollectionNames = new Set();
        const uniqueAlbums = [];
        for (const album of filteredAlbums) {
          const normTitle = normalizeStr(album.title);
          if (!seenCollectionNames.has(normTitle)) {
            seenCollectionNames.add(normTitle);
            uniqueAlbums.push(album);
          }
        }

        // Take top 8 albums
        const finalAlbums = uniqueAlbums.slice(0, 8);

        const formattedAlbums = finalAlbums.map((album) => {
          let artUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80";
          if (album.cover_xl) artUrl = album.cover_xl;
          else if (album.cover_big) artUrl = album.cover_big;

          return {
            id: `album-${album.id}`,
            title: album.title,
            artist: album.artist ? album.artist.name : name,
            art: artUrl,
            year: 'Álbum'
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
      const url = `https://api.deezer.com/search?q=${encodeURIComponent(album.artist + ' ' + album.title)}&limit=30`;
      const resData = await fetchJsonp(url);

      if (resData && resData.data) {
        // Filter songs strictly belonging to this album and this artist loosely
        const filteredAlbumSongs = resData.data.filter((track) => {
          if (!track.album || !track.album.title || !track.artist || !track.artist.name) return false;
          
          const trackAlbumNorm = track.album.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const targetAlbumNorm = album.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          
          const trackArtistNorm = track.artist.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const targetArtistNorm = album.artist.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          
          return (trackAlbumNorm.includes(targetAlbumNorm) || targetAlbumNorm.includes(trackAlbumNorm)) &&
                 (trackArtistNorm.includes(targetArtistNorm) || targetArtistNorm.includes(trackArtistNorm));
        });

        // Map final songs
        const albumSongs = filteredAlbumSongs.map((track) => {
          let artUrl = album.art;
          if (track.album && track.album.cover_xl) artUrl = track.album.cover_xl;
          else if (track.album && track.album.cover_big) artUrl = track.album.cover_big;

          return {
            id: `deezer-${track.id}`,
            title: track.title,
            artist: track.artist ? track.artist.name : album.artist,
            album: track.album ? track.album.title : album.title,
            url: track.preview || "",
            art: artUrl,
            color: getRandomColor(),
            duration: formatTime(track.duration || 180),
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
    <div className="artist-profile-mobile-view">
      {/* 1. Header Hero Banner */}
      <div className="artist-mobile-hero" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(18,18,18,1) 100%), url(${headerBgArt})` }}>
        <div className="artist-mobile-header-top">
          <button className="back-btn" onClick={() => window.history.back()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </div>
        <h1 className="artist-mobile-title">{artistName}</h1>
      </div>

      <div className="artist-mobile-content">
        <p className="artist-monthly-listeners">55.2 M oyentes mensuales</p>
        
        {/* 2. Action Row */}
        <div className="artist-mobile-actions">
           <div className="actions-left">
             <img src={headerBgArt} className="artist-avatar-mini" alt="artist" />
             <button className="btn-siguiendo">Siguiendo</button>
             <button className="btn-more-dots">⋮</button>
           </div>
           <div className="actions-right">
             <button className="btn-shuffle">
               <svg viewBox="0 0 24 24" fill="currentColor">
                 <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
               </svg>
             </button>
             {popularTracks.length > 0 && (
               <button className="btn-play-green" onClick={handlePlayPopular}>
                 <svg viewBox="0 0 24 24" fill="currentColor">
                   <path d="M8 5v14l11-7z"/>
                 </svg>
               </button>
             )}
           </div>
        </div>

        {/* 3. Tabs */}
        <div className="artist-mobile-tabs">
           <span className="active">Música</span>
           <span>Clips</span>
           <span>Eventos</span>
           <span>Tienda</span>
        </div>

        {/* 4. Populares */}
        {popularTracks.length > 0 && (
          <section className="artist-mobile-section">
             <h2>Populares</h2>
             <div className="popular-list-mobile">
               {popularTracks.slice(0, 5).map((song, idx) => (
                  <div className="popular-row-mobile" key={song.id} onClick={() => onPlaySong(popularTracks, idx)}>
                    <span className="pop-index">{idx + 1}</span>
                    <img src={song.art} alt={song.title} />
                    <div className="pop-info">
                      <span className={`pop-title ${currentTrack?.url === song.url ? 'active' : ''}`}>{song.title}</span>
                      <span className="pop-plays">{(Math.floor(Math.random() * (3000 - 100)) + 100)},{Math.floor(Math.random() * 999).toString().padStart(3, '0')},{Math.floor(Math.random() * 999).toString().padStart(3, '0')}</span>
                    </div>
                    <button className="btn-more-dots" onClick={(e) => { e.stopPropagation(); toggleLikeSong(song); }}>⋮</button>
                  </div>
               ))}
             </div>
          </section>
        )}

        {/* 5. Selección del artista */}
        {albums.length > 0 && (
          <section className="artist-mobile-section">
             <h2>Selección del artista</h2>
             <div className="artist-pick-card" onClick={() => handleAlbumClick(albums[0])}>
                <img src={albums[0].art} alt={albums[0].title} className="pick-art" />
                <div className="pick-info">
                   <div className="pick-author">
                     <img src={headerBgArt} className="pick-author-avatar" alt="artist"/> 
                     Publicado por {artistName}
                   </div>
                   <div className="pick-title">{albums[0].title}</div>
                   <div className="pick-type">Álbum</div>
                 </div>
             </div>
          </section>
        )}

        {/* 6. Lanzamientos populares */}
        {albums.length > 0 && (
          <section className="artist-mobile-section">
             <div className="section-header-row">
               <h2>Lanzamientos populares</h2>
               <span className="show-all">Mostrar todo</span>
             </div>
             <div className="releases-list">
               {albums.slice(0, 4).map(album => (
                  <div className="release-row" key={album.id} onClick={() => handleAlbumClick(album)}>
                    <img src={album.art} alt={album.title} />
                    <div className="release-info">
                       <span className="rel-title">{album.title}</span>
                       <span className="rel-year">Álbum • {Math.floor(Math.random() * (2024 - 2000 + 1) + 2000)}</span>
                    </div>
                  </div>
               ))}
             </div>
             <div className="center-pill-container">
               <button className="btn-outline-pill">Ver discografía</button>
             </div>
          </section>
        )}

        {/* 7. Con el artista */}
        <section className="artist-mobile-section">
           <h2>Con {artistName}</h2>
           <div className="horizontal-scroll-row">
              <div className="scroll-card">
                 <img src={headerBgArt} alt="this is" />
                 <span className="scroll-title">This is {artistName}</span>
                 <span className="scroll-desc">This is: {artistName}. Sus mejores éxitos...</span>
              </div>
              <div className="scroll-card">
                 <img src={headerBgArt} style={{ filter: 'hue-rotate(90deg)' }} alt="radio" />
                 <span className="scroll-title">{artistName} Radio</span>
                 <span className="scroll-desc">{artistName}, JAY-Z, Green Day, Slipknot...</span>
              </div>
           </div>
        </section>

        {/* 8. Clips */}
        <section className="artist-mobile-section">
           <h2>Clips de {artistName}</h2>
           <div className="horizontal-scroll-row clips-row">
              <div className="clip-card" style={{backgroundImage: `linear-gradient(transparent, rgba(0,0,0,0.8)), url(${headerBgArt})`}}>
                 <span className="clip-title">Brad Delson on "Friendly Fire"</span>
              </div>
              <div className="clip-card" style={{backgroundImage: `linear-gradient(transparent, rgba(0,0,0,0.8)), url(${headerBgArt})`, filter: 'hue-rotate(45deg)'}}>
                 <span className="clip-title">Mike Shinoda on "QWERTY"</span>
              </div>
           </div>
        </section>

        {/* 9. Información */}
        <section className="artist-mobile-section">
           <h2>Información</h2>
           <div className="info-card-mobile">
             <div className="info-hero-img" style={{backgroundImage: `url(${headerBgArt})`}}></div>
             <div className="info-card-content">
                <span className="info-rank">N.º 51 en el mundo</span>
                <div className="info-row">
                   <div className="info-col">
                      <span className="info-name">{artistName}</span>
                      <span className="info-listeners">55.2 M oyentes mensuales</span>
                   </div>
                   <button className="btn-siguiendo">Siguiendo</button>
                </div>
                <p className="info-bio">{artistName} is the magnetic hub of an emotional and cultural community—staggering in scope, intimate in connection, and wholly unique. Blending sonic and visual inspiration u... <span className="see-more">ver más</span></p>
             </div>
           </div>
        </section>
        
        {/* 10. Playlists del artista */}
        <section className="artist-mobile-section" style={{marginBottom: '100px'}}>
           <h2>Playlists del artista</h2>
           <div className="horizontal-scroll-row">
              <div className="scroll-card">
                 <img src={headerBgArt} style={{ filter: 'hue-rotate(180deg)' }} alt="best of" />
                 <span className="scroll-title">{artistName}: Best of Playlist</span>
                 <span className="scroll-desc">{artistName}</span>
              </div>
              <div className="scroll-card">
                 <img src={headerBgArt} style={{ filter: 'hue-rotate(270deg)' }} alt="complete" />
                 <span className="scroll-title">{artistName}: Complete Playlist</span>
                 <span className="scroll-desc">{artistName}</span>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}
