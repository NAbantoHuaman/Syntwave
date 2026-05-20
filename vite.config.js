import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'youtube-search-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/search-youtube')) {
            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const query = urlObj.searchParams.get('q');
            if (!query) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Query parameter q is required' }));
              return;
            }
            try {
              const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
              const response = await fetch(ytUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept-Language': 'en-US,en;q=0.9'
                }
              });
              const html = await response.text();
              // Extract video ID using regex. In YouTube HTML search results, the video IDs are present inside "videoId":"xxxxxxxxxxx" in ytInitialData JSON
              const matches = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
              if (matches && matches.length > 0) {
                // Extract clean IDs
                const ids = matches.map(m => {
                  const subMatch = m.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
                  return subMatch ? subMatch[1] : null;
                }).filter(Boolean);
                
                // Deduplicate
                const uniqueIds = Array.from(new Set(ids));
                
                if (uniqueIds.length > 0) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify({ videoId: uniqueIds[0], videoIds: uniqueIds.slice(0, 5) }));
                  return;
                }
              }
              
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No video found for this query' }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }
          next();
        });
      }
    }
  ],
})
