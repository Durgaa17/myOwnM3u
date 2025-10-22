# myOwnM3u
testing IPTV links

#usage of proxy worker

https://your-worker.your-subdomain.workers.dev/proxy?url=streamingLink.m3u

##Example

https://smoke.roti.dpdns.org/proxy?url=https://raw.githubusercontent.com/Durgaa17/myOwnM3u/refs/heads/main/movie.m3u

# M3U Playlist Proxy Worker

`proxy_worker.js` is a Cloudflare Worker that proxies M3U playlists (e.g., IPTV or video streams) from URLs like GitHub raw links. It caches playlists and streams for fast, low-latency playback and supports HLS (`.m3u8`) and standard M3U playlists for use in players like VLC or browser-based players with HLS.js.

## Features
- Proxies M3U playlists via `?url=<m3u-url>` with CORS headers.
- Rewrites stream URLs to `/proxy?url=stream_link` for caching and low-latency delivery.
- Caches playlists (5 min) and streams (1 hr) using Cloudflare’s edge network.
- Root path (`/`) returns `"working as intended"`.
- Works with IPTV players (e.g., VLC) and browser players.

## Setup
1. **Get the Script**:
   - Download `proxy_worker.js` from this repository.
2. **Create Worker**:
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
   - Go to **Workers & Pages** > **Create Worker**.
   - Name it (e.g., `m3u-proxy`).
3. **Deploy**:
   - Paste `proxy_worker.js` into the Worker editor.
   - Click **Save and Deploy**.
   - Your Worker runs at `https://smoke.roti.dpdns.org`.

## Usage
- **Root Path**: Visit `https://smoke.roti.dpdns.org/` to see `"working as intended"`.
- **Proxy M3U**: Use `?url=` with your M3U URL:


