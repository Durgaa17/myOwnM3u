//https://your-worker.your-subdomain.workers.dev/?url=https://raw.githubusercontent.com/Durgaa17/myOwnM3u/refs/heads/main/movie.m3u
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const targetUrl = url.searchParams.get('url');
  const cache = caches.default;

  // Root path: Return "working as intended"
  if (pathname === '/' && !targetUrl) {
    return new Response('working as intended', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Proxy for streams: /proxy?url=stream_link
  if (pathname === '/proxy' && targetUrl) {
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (!response) {
      try {
        // Fetch the stream with streaming enabled
        response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; M3U Proxy)'
          }
        });

        if (!response.ok) {
          return new Response('Failed to fetch stream.', { status: response.status });
        }

        // Clone and cache the response (for cacheable content like .ts segments)
        const clonedResponse = response.clone();
        const headers = new Headers(clonedResponse.headers);
        headers.set('Cache-Control', 'public, max-age=3600'); // Cache streams for 1 hour
        const cacheResponse = new Response(clonedResponse.body, { headers });

        // Asynchronously cache
        event.waitUntil(cache.put(cacheKey, cacheResponse));

        // Return the original response for streaming
        const streamHeaders = new Headers(response.headers);
        streamHeaders.set('Access-Control-Allow-Origin', '*');
        return new Response(response.body, {
          status: response.status,
          headers: streamHeaders
        });
      } catch (error) {
        return new Response('Error proxying stream: ' + error.message, { status: 500 });
      }
    }

    // If cached, return with CORS
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, { headers });
  }

  // M3U Playlist proxy: ?url=github_raw_link
  if (targetUrl && (pathname === '/' || pathname === '')) {
    if (!targetUrl.startsWith('https://raw.githubusercontent.com/')) {
      return new Response('Invalid URL: Must be a GitHub raw link.', { status: 400 });
    }

    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (!response) {
      try {
        // Fetch M3U from GitHub
        const fetchResponse = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; M3U Proxy)'
          }
        });

        if (!fetchResponse.ok) {
          return new Response('Failed to fetch playlist from GitHub.', { status: fetchResponse.status });
        }

        let body = await fetchResponse.text();

        // Rewrite stream URLs to proxy through Worker
        body = body.replace(
          /(http[^\s]+)/g,
          (match) => `${url.origin}/proxy?url=${encodeURIComponent(match)}`
        );

        // Create response with rewritten body
        response = new Response(body, fetchResponse);

        // Add Cache-Control for M3U (5 minutes)
        response.headers.set('Cache-Control', 'public, max-age=300');

        // Asynchronously cache
        event.waitUntil(cache.put(cacheKey, response.clone()));
      } catch (error) {
        return new Response('Error proxying playlist: ' + error.message, { status: 500 });
      }
    }

    // Add CORS and MIME type
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/vnd.apple.mpegurl');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, { headers });
  }

  // Fallback for invalid requests
  return new Response('Invalid request. Use ?url= for playlist or /proxy?url= for streams.', { status: 400 });
}
