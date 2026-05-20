import React, { useState, useEffect, useRef } from 'react';

export default function RightDrawer({
  currentTrack,
  currentTime,
  onSeek,
  analyser,
  isPlaying,
  isDrawerOpen,
  setIsDrawerOpen
}) {
  const [activeTab, setActiveTab] = useState('lyrics'); // 'lyrics' or 'visualizer'
  const canvasRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Sync scroll for active lyrics line
  const activeLineIndex = currentTrack?.lyrics
    ? currentTrack.lyrics.reduce((acc, line, idx) => {
        if (currentTime >= line.time) {
          return idx;
        }
        return acc;
      }, -1)
    : -1;

  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLineIndex]);

  // Audio Visualizer Canvas Rendering
  useEffect(() => {
    if (activeTab !== 'visualizer' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    
    let animationFrameId;
    let simTime = 0;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      const width = canvas.width = canvas.parentElement.clientWidth || 330;
      const height = canvas.height = 260;

      // Dark translucent background with motion trails
      canvasCtx.fillStyle = 'rgba(7, 7, 9, 0.25)';
      canvasCtx.fillRect(0, 0, width, height);

      // Grid Lines overlay for premium retro-futuristic interface
      canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      canvasCtx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(i, 0);
        canvasCtx.lineTo(i, height);
        canvasCtx.stroke();
      }

      const bufferLength = analyser ? analyser.frequencyBinCount : 128;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else if (isPlaying) {
        // Generate a beautiful simulated spectrum!
        simTime += 0.08;
        for (let i = 0; i < bufferLength; i++) {
          const percent = i / bufferLength;
          // Combine multiple sine waves and random noise for realistic peaks
          let val = Math.sin(simTime + percent * 10) * 0.4;
          val += Math.sin(simTime * 2.1 + percent * 25) * 0.25;
          val += Math.cos(simTime * 0.7 - percent * 5) * 0.2;
          val += Math.random() * 0.15; // Noise
          
          // Apply a roll-off for high frequencies (simulate real music)
          const rollOff = Math.pow(1 - percent, 1.2);
          val = Math.max(0, val * rollOff);

          dataArray[i] = Math.floor(val * 220 + 20); // range 20 to 240
        }
      } else {
        // Flatline / quiet static when paused
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 10 + Math.random() * 8;
        }
      }

      // Drawing frequency bars
      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.78;

        // Harmonic visualizer colors: Neon Green/Blue/Magenta
        const percent = i / bufferLength;
        const r = Math.floor(29 + percent * 200);
        const g = Math.floor(185 - percent * 100);
        const b = Math.floor(84 + percent * 170);

        canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // Draw double bars for extra high-fidelity look
        canvasCtx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }

      // Ethereal waveforms in the center
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = 'rgba(29, 185, 84, 0.35)';
      canvasCtx.lineWidth = 2.5;
      let sliceWidth = width / bufferLength;
      let waveX = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255.0;
        const waveY = (v * height * 0.4) + (height * 0.25);

        if (i === 0) {
          canvasCtx.moveTo(waveX, waveY);
        } else {
          canvasCtx.lineTo(waveX, waveY);
        }
        waveX += sliceWidth;
      }
      canvasCtx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeTab, analyser, isPlaying, currentTrack]);

  if (!isDrawerOpen) return null;

  return (
    <aside className="right-drawer" id="rightDrawer">
      <div className="drawer-header">
        <button
          className={`drawer-tab ${activeTab === 'lyrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('lyrics')}
        >
          Letras
        </button>
        <button
          className={`drawer-tab ${activeTab === 'visualizer' ? 'active' : ''}`}
          onClick={() => setActiveTab('visualizer')}
        >
          Visualizador
        </button>
        <button
          className="close-drawer-btn"
          onClick={() => setIsDrawerOpen(false)}
          title="Cerrar Panel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Content panel: Lyrics */}
      {activeTab === 'lyrics' && (
        <div className="drawer-content" ref={lyricsContainerRef}>
          <div className="lyrics-container">
            {currentTrack?.lyrics && currentTrack.lyrics.length > 0 ? (
              currentTrack.lyrics.map((line, idx) => {
                const isActive = idx === activeLineIndex;
                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    className={`lyrics-line ${isActive ? 'active' : ''}`}
                    onClick={() => onSeek(line.time)}
                  >
                    {line.text}
                  </div>
                );
              })
            ) : (
              <div className="lyrics-placeholder">
                {currentTrack
                  ? (currentTrack.lyricsLoaded ? "Letras no disponibles para esta canción." : "Cargando letras...")
                  : "Reproduce una canción para ver las letras."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content panel: Audio Visualizer */}
      {activeTab === 'visualizer' && (
        <div className="drawer-content">
          <div className="visualizer-container">
            {analyser || isPlaying ? (
              <canvas id="audioVisualizerCanvas" ref={canvasRef}></canvas>
            ) : (
              <div className="lyrics-placeholder" style={{ margin: 'auto 0' }}>
                Inicia la reproducción de música para activar el analizador de espectro de audio.
              </div>
            )}
            <div className="visualizer-overlay">
              <h3>{currentTrack ? currentTrack.title : "Nombre del tema"}</h3>
              <p>{currentTrack ? currentTrack.artist : "Artista"}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
