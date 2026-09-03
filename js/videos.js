/* ====================================================================
   SANTHOSH — YOUTUBE VIDEO CONFIG
   Runs on video.html (and anywhere else a [data-yt-key] wrap is used).

   HOW TO REPLACE A VIDEO
   -----------------------
   Just paste your real YouTube link into the matching "youtubeUrl" value
   below. Any normal YouTube URL format works:
     - https://www.youtube.com/watch?v=XXXXXXXXXXX
     - https://youtu.be/XXXXXXXXXXX
     - https://www.youtube.com/shorts/XXXXXXXXXXX
   You never need to touch the HTML or CSS to swap a video — this file
   is the only thing you edit.

   Structure:
   1. Video Config
   2. YouTube ID Parser
   3. Click-to-Load Embed Renderer
   ==================================================================== */

/* ==================== 1. VIDEO CONFIG ==================== */
// Each "key" must match the data-yt-key="..." attribute on a
// <div class="yt-embed-wrap"> in the HTML. Order doesn't matter here —
// matching is done by key, not position, so re-ordering cards in the
// HTML later never mixes up which video plays where.
const videos = {

  "grading-1": {
    title: "Cinematic Orchestra Grade",
    youtubeUrl: "https://youtu.be/4uk9Um-lm-g"
  },
  "grading-2": {
    title: "Moody Indoor Grade",
    youtubeUrl: "https://youtu.be/hxKhlDt9AuU"
  },
  "grading-3": {
    title: "Moody Indoor Grade",
    youtubeUrl: "https://youtu.be/CEb4WWxTMKM"
  },
  "reel-1": {
    title: "Event Recap Reel",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  },
  "reel-2": {
    title: "Product Teaser Reel",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  },
  "commercial-1": {
    title: "Local Roots Cafe — Launch Film",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  },
  "motion-1": {
    title: "Animated Title Card",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  },
  "motion-2": {
    title: "Logo Sting",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  },
  "motion-3": {
    title: "Lower Third Set",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  },
  "anim-1": {
    title: "Behind the Scenes — Modeling Timelapse",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  },
  "anim-2": {
    title: "Wireframe Turntable",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  },
  "anim-3": {
    title: "Clay Render Pass",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  },
  "fan-1": {
    title: "Fan Edit 1",
    youtubeUrl: "https://youtu.be/I6KtBmiHQd8"
  },
  "fan-2": {
    title: "Fan Edit 2",
    youtubeUrl: "PASTE_YOUTUBE_URL_HERE"
  }

};


/* ==================== 2. YOUTUBE ID PARSER ==================== */
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}


/* ==================== 3. CLICK-TO-LOAD EMBED RENDERER ==================== */
// Renders a thumbnail + play-button facade first (fast, no YouTube script
// loaded yet) and only injects the real iframe once the visitor clicks —
// keeps the page light even with several videos on it.
function initYouTubeEmbeds() {
  const wraps = document.querySelectorAll('[data-yt-key]');

  wraps.forEach((wrap) => {
    const key = wrap.dataset.ytKey;
    const video = videos[key];

    if (!video || !video.youtubeUrl || video.youtubeUrl.includes('PASTE_YOUTUBE_URL')) {
      wrap.innerHTML = '';
      wrap.classList.add('yt-embed-empty');
      const notice = document.createElement('p');
      notice.className = 'yt-embed-notice';
      notice.textContent = 'UPLOAD SOON';
      wrap.appendChild(notice);
      return;
    }

    const videoId = getYouTubeId(video.youtubeUrl);
    if (!videoId) {
      wrap.innerHTML = '';
      const notice = document.createElement('p');
      notice.className = 'yt-embed-notice';
      notice.textContent = 'That YouTube link for "' + key + '" doesn\'t look valid.';
      wrap.appendChild(notice);
      return;
    }

    const thumb = document.createElement('img');
    thumb.className = 'yt-embed-thumb';
    thumb.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    thumb.alt = video.title || 'Video thumbnail';
    thumb.loading = 'lazy';

    const playBtn = document.createElement('button');
    playBtn.className = 'yt-embed-play';
    playBtn.type = 'button';
    playBtn.setAttribute('aria-label', 'Play video: ' + (video.title || key));
    playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

    wrap.appendChild(thumb);
    wrap.appendChild(playBtn);

    function loadEmbed() {
      wrap.classList.add('is-playing');
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = video.title || 'YouTube video player';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      wrap.appendChild(iframe);
      wrap.removeEventListener('click', loadEmbed);
    }

    wrap.addEventListener('click', loadEmbed);
  });
}

document.addEventListener('DOMContentLoaded', initYouTubeEmbeds);
