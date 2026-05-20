export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Support both req.query (Vercel Node helper) and manual parsing of req.url
  let query = req.query ? req.query.q : null;
  if (!query && req.url) {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    query = urlObj.searchParams.get('q');
  }

  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(ytUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`YouTube responded with status ${response.status}`);
    }

    const html = await response.text();
    // Extract video ID using regex from ytInitialData JSON inside the HTML
    const matches = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
    if (matches && matches.length > 0) {
      const ids = matches.map(m => {
        const subMatch = m.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        return subMatch ? subMatch[1] : null;
      }).filter(Boolean);
      
      const uniqueIds = Array.from(new Set(ids));
      
      if (uniqueIds.length > 0) {
        return res.status(200).json({ 
          videoId: uniqueIds[0], 
          videoIds: uniqueIds.slice(0, 5) 
        });
      }
    }

    return res.status(404).json({ error: 'No video found for this query' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
