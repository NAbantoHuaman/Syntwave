import React, { useState } from 'react';

export default function ViewHome({
  seedSongs,
  onPlaySong,
  onShowPlaylistDetail,
  recentlyPlayed = [],
  recentlyPlayedPlaylists = [],
  onSelectItem,
  onShowArtistProfile
}) {
  const hr = new Date().getHours();
  let greeting = "Buenas tardes";
  if (hr >= 6 && hr < 12) {
    greeting = "Buenos días";
  } else if (hr >= 18 || hr < 6) {
    greeting = "Buenas noches";
  }

  // State for content filters
  const [activeFilter, setActiveFilter] = useState('Todo');

  // Safely group dynamic songs for mixes
  const getMixSongs = (indices) => {
    return indices
      .map(idx => seedSongs[idx])
      .filter(song => song !== undefined);
  };

  // Curated lists for grid greeting cards (2x2 or 4 columns)
  const electroSongs = getMixSongs([0, 3, 6, 9, 12]);
  const popSongs = getMixSongs([1, 4, 7, 10, 13]);
  const darkSongs = getMixSongs([2, 5, 8, 11, 14]);
  const rockSongs = getMixSongs([1, 5, 9, 12]);

  const welcomeGridCards = [
    {
      id: "wc-electro",
      type: "SYSTEM",
      title: "Electro",
      name: "Electro",
      songs: electroSongs,
      art: seedSongs[0]?.art || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      description: "Mix especial de Electro"
    },
    {
      id: "wc-pop",
      type: "SYSTEM",
      title: "Bruno Mars Mix",
      name: "Bruno Mars Mix",
      songs: popSongs,
      art: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
      description: "Mix especial de Bruno Mars Mix"
    },
    {
      id: "wc-dark",
      type: "SYSTEM",
      title: "MÚSICA DARK",
      name: "MÚSICA DARK",
      songs: darkSongs,
      art: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400",
      description: "Mix especial de MÚSICA DARK"
    },
    {
      id: "wc-rock",
      type: "SYSTEM",
      title: "Space-Rock",
      name: "Space-Rock",
      songs: rockSongs,
      art: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400",
      description: "Mix especial de Space-Rock"
    }
  ];

  // Dynamic welcome cards fusion (max 8)
  const combinedWelcomeCards = [];
  const addedNames = new Set();

  if (recentlyPlayedPlaylists && recentlyPlayedPlaylists.length > 0) {
    recentlyPlayedPlaylists.forEach(item => {
      if (!addedNames.has(item.name)) {
        addedNames.add(item.name);
        combinedWelcomeCards.push({
          id: item.id || item.name,
          title: item.name,
          name: item.name,
          type: item.type || 'SYSTEM',
          songs: item.songs || [],
          art: item.art || (item.songs && item.songs[0]?.art) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
          color: item.color,
          description: item.description,
          playlistId: item.playlistId,
          artistName: item.artistName
        });
      }
    });
  }

  welcomeGridCards.forEach(card => {
    if (combinedWelcomeCards.length < 8 && !addedNames.has(card.title)) {
      addedNames.add(card.title);
      combinedWelcomeCards.push(card);
    }
  });

  const finalWelcomeCards = combinedWelcomeCards.slice(0, 8);

  // Recommended Radio stations with circular avatars and green RADIO labels
  const recommendedRadios = [
    {
      id: "r-paparoach",
      artist: "Papa Roach",
      desc: "Con Linkin Park, Limp Bizkit y más",
      art: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80",
      songs: getMixSongs([2, 5, 8, 11, 14])
    },
    {
      id: "r-alesso",
      artist: "Alesso",
      desc: "Con Swedish House Mafia, Nadia Ali, John...",
      art: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
      songs: getMixSongs([0, 4, 8, 12])
    },
    {
      id: "r-dondiablo",
      artist: "Don Diablo",
      desc: "Con Third Party, Justin Mylo, MashBit y más",
      art: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
      songs: getMixSongs([3, 6, 9, 12])
    },
    {
      id: "r-chainsmokers",
      artist: "The Chainsmokers",
      desc: "Con Jonas Blue, Avicii, Martin Garrix y más",
      art: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
      songs: getMixSongs([1, 4, 7, 10, 13])
    },
    {
      id: "r-illenium",
      artist: "ILLENIUM",
      desc: "Con Hoang, Seven Lions, FLOTE y más",
      art: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80",
      songs: getMixSongs([0, 3, 6, 9, 12, 14])
    },
    {
      id: "r-avicii",
      artist: "Avicii",
      desc: "Con Axwell / Ingrosso, Flo Rida, Zedd y más",
      art: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
      songs: getMixSongs([1, 5, 8, 12])
    },
    {
      id: "r-tiesto",
      artist: "Tiësto",
      desc: "Con James Hype, Topic, Ofenbach y más",
      art: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80",
      songs: getMixSongs([0, 3, 7, 10, 13])
    }
  ];

  // Daily Mixes with exclusive premium covers
  const dailyMixes = [
    {
      id: "dm-1",
      name: "Mix diario 1",
      desc: "Con Don Diablo, Alesso y grandes del electro.",
      color: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      songs: getMixSongs([0, 3, 6, 9, 12])
    },
    {
      id: "dm-2",
      name: "Mix diario 2",
      desc: "Con Bruno Mars, pop enérgico y hits mundiales.",
      color: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
      songs: getMixSongs([1, 4, 7, 10, 13])
    },
    {
      id: "dm-3",
      name: "Mix diario 3",
      desc: "Suaves baladas acústicas y melódicos acordes.",
      color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      songs: getMixSongs([2, 5, 8, 11, 14])
    },
    {
      id: "dm-4",
      name: "Mix diario 4",
      desc: "Synthwave oscuro, beats retro y nostalgia sintética.",
      color: "linear-gradient(135deg, #da4453 0%, #89216b 100%)",
      songs: getMixSongs([0, 2, 5, 9, 12])
    },
    {
      id: "dm-5",
      name: "Mix diario 5",
      desc: "Pistas enérgicas de rock alternativo e indie.",
      color: "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)",
      songs: getMixSongs([2, 6, 10, 14])
    },
    {
      id: "dm-6",
      name: "Mix diario 6",
      desc: "Sesiones ambientales relajantes para concentrarte.",
      color: "linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)",
      songs: getMixSongs([1, 4, 8, 11, 13])
    }
  ];

  return (
    <section className="view-panel" id="viewHome">
      {/* Category Filter Pills (Todo, Música, Podcasts) */}
      <div className="home-filter-row">
        <span 
          className={`home-filter-pill ${activeFilter === 'Todo' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Todo')}
        >
          Todo
        </span>
        <span 
          className={`home-filter-pill ${activeFilter === 'Música' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Música')}
        >
          Música
        </span>
        <span 
          className={`home-filter-pill ${activeFilter === 'Podcasts' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Podcasts')}
        >
          Podcasts
        </span>
      </div>

      {activeFilter !== 'Podcasts' && (
        <>
          <div className="home-hero">
            <h1 id="greetingText">{greeting}</h1>
            
            {/* Dense Responsive Horizonal Grid */}
            <div className="recent-grid">
              {finalWelcomeCards.map((card) => (
                <div
                  key={card.id}
                  className="recent-card"
                  onClick={() => {
                    if (onSelectItem) {
                      onSelectItem(card);
                    } else {
                      onShowPlaylistDetail(card.type || "SYSTEM", card.title, card.songs, card.description || `Mix especial de ${card.title}`);
                    }
                  }}
                  title={`Ver ${card.title}`}
                >
                  <img src={card.art} alt={card.title} className="recent-card-art" />
                  <div className="recent-card-text">
                    <span className="recent-track-title" style={{ fontSize: '14px', fontWeight: '700' }}>{card.title}</span>
                  </div>
                  <button
                    className="recent-play-btn"
                    title="Reproducir mix"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.songs && card.songs.length > 0) {
                        onPlaySong(card.songs, 0, 0, {
                          id: card.id,
                          type: card.type || 'SYSTEM',
                          name: card.title,
                          description: card.description || `Mix especial de ${card.title}`,
                          songs: card.songs,
                          art: card.art,
                          color: card.color,
                          playlistId: card.playlistId,
                          artistName: card.artistName
                        });
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Played Songs Section */}
          {recentlyPlayed && recentlyPlayed.length > 0 && (
            <div className="music-section" style={{ marginTop: '24px' }}>
              <div className="section-header-row">
                <h2 className="section-title">Canciones escuchadas recientemente</h2>
              </div>
              <div className="cards-grid" style={{ marginTop: '12px' }}>
                {recentlyPlayed.map((song) => (
                  <div
                    key={`rp-song-${song.id}`}
                    className="music-card"
                    onClick={() => {
                      onPlaySong([song], 0, 0, {
                        id: `mix-${song.artist}`,
                        type: 'SYSTEM',
                        name: `Mix de ${song.artist}`,
                        songs: [song],
                        art: song.art
                      });
                    }}
                    title={`Reproducir ${song.title}`}
                  >
                    <div className="card-art-container">
                      <img src={song.art} alt={song.title} className="card-art" style={{ borderRadius: '6px' }} />
                      <button
                        className="card-play-btn"
                        title={`Reproducir ${song.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlaySong([song], 0, 0, {
                            id: `mix-${song.artist}`,
                            type: 'SYSTEM',
                            name: `Mix de ${song.artist}`,
                            songs: [song],
                            art: song.art
                          });
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    </div>
                    <div className="card-title" style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                    <div className="card-desc" style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Radio Stations Section (Papa Roach, Alesso, etc. circular badges) */}
          {activeFilter !== 'Podcasts' && (
            <div className="music-section">
              <div className="section-header-row">
                <h2 className="section-title">Estaciones recomendadas</h2>
                <span className="mostrar-todo-link">Mostrar todo</span>
              </div>
              <p className="section-subtitle-text">
                Música sin interrupciones basada en tus canciones y tus artistas favoritos.
              </p>
              
              <div className="cards-grid">
                {recommendedRadios.map((radio) => (
                  <div
                    key={radio.id}
                    className="radio-card"
                    onClick={() => onShowPlaylistDetail("SYSTEM", `Radio de ${radio.artist}`, radio.songs, `Radio basada en las mejores pistas de ${radio.artist}`)}
                    title={`Ver Radio de ${radio.artist}`}
                  >
                    <div className="radio-art-container">
                      <img src={radio.art} alt={radio.artist} className="radio-art-img" />
                      <div className="radio-badge">Radio</div>
                    </div>
                    <button
                      className="radio-play-btn"
                      title="Reproducir radio"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (radio.songs.length > 0) {
                          onPlaySong(radio.songs, 0, 0, {
                            id: radio.id,
                            type: 'RADIO',
                            name: `Radio de ${radio.artist}`,
                            songs: radio.songs,
                            description: `Radio basada en las mejores pistas de ${radio.artist}`,
                            art: radio.art
                          });
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                    <div className="card-title" style={{ fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{radio.artist}</div>
                    <div className="card-desc" style={{ fontSize: '11px', textAlign: 'center', marginTop: '4px' }}>{radio.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creado Para Ti Section (Descubrimiento Semanal + Daily Mixes 1-6) */}
          <div className="music-section">
            <div className="section-header-row">
              <h2 className="section-title">Creado para ti</h2>
              <span className="mostrar-todo-link">Mostrar todo</span>
            </div>
            
            <div className="cards-grid">
              {/* Descubrimiento Semanal Card */}
              <div
                className="music-card"
                onClick={() => onShowPlaylistDetail("SYSTEM", "Descubrimiento Semanal", seedSongs, "Tu mixtape semanal fresca de gemas musicales y éxitos comerciales.")}
                title="Ver Descubrimiento Semanal"
              >
                <div className="card-art-container">
                  <div className="discovery-weekly-art">
                    <div className="discovery-weekly-title">Descubrimiento<br />Semanal</div>
                    <div className="discovery-weekly-bottom">Synthwave</div>
                  </div>
                  <button
                    className="card-play-btn"
                    title="Reproducir Descubrimiento Semanal"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (seedSongs.length > 0) {
                        onPlaySong(seedSongs, 0, 0, {
                          id: 'wc-discovery',
                          type: 'SYSTEM',
                          name: 'Descubrimiento Semanal',
                          songs: seedSongs,
                          description: 'Tu mixtape semanal fresca de gemas musicales y éxitos comerciales.'
                        });
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                <div className="card-title" style={{ fontSize: '14px', fontWeight: '700' }}>Descubrimiento Semanal</div>
                <div className="card-desc" style={{ fontSize: '11px' }}>Tu dosis fresca de pop hits comerciales y recomendadas de la semana.</div>
              </div>

              {/* Daily Mixes 1 to 6 */}
              {dailyMixes.map((mix) => (
                <div
                  key={mix.id}
                  className="music-card"
                  onClick={() => onShowPlaylistDetail("SYSTEM", mix.name, mix.songs, mix.desc)}
                  title={`Ver ${mix.name}`}
                >
                  <div className="card-art-container">
                    <div className="daily-mix-badge-art" style={{ background: mix.color }}>
                      <div className="daily-mix-label-bar">
                        <span className="daily-mix-label-text">{mix.name}</span>
                        <svg className="daily-mix-label-play-tiny" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <button
                      className="card-play-btn"
                      title={`Reproducir ${mix.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (mix.songs.length > 0) {
                          onPlaySong(mix.songs, 0, 0, {
                            id: mix.id,
                            type: 'SYSTEM',
                            name: mix.name,
                            songs: mix.songs,
                            description: mix.desc,
                            color: mix.color
                          });
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="card-title" style={{ fontSize: '14px', fontWeight: '700' }}>{mix.name}</div>
                  <div className="card-desc" style={{ fontSize: '11px' }}>{mix.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Podcast Fallback Section */}
      {activeFilter === 'Podcasts' && (
        <div className="music-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8"/>
          </svg>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Escucha tus podcasts favoritos</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
            Explora millones de episodios, entrevistas exclusivas e historias envolventes directamente en tu feed.
          </p>
        </div>
      )}
    </section>
  );
}
