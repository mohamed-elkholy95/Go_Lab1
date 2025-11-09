/**
 * Video URL parser for YouTube, Vimeo, and other providers
 */

export interface VideoInfo {
  provider: 'youtube' | 'vimeo' | 'dailymotion' | 'other';
  videoId: string;
  url: string;
  embedUrl: string;
  thumbnailUrl?: string;
}

/**
 * Parse YouTube URL and extract video ID
 */
function parseYouTube(url: string): VideoInfo | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        provider: 'youtube',
        videoId,
        url,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    }
  }

  return null;
}

/**
 * Parse Vimeo URL and extract video ID
 */
function parseVimeo(url: string): VideoInfo | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        provider: 'vimeo',
        videoId,
        url,
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
      };
    }
  }

  return null;
}

/**
 * Parse Dailymotion URL and extract video ID
 */
function parseDailymotion(url: string): VideoInfo | null {
  const patterns = [
    /dailymotion\.com\/video\/([^_\n?#]+)/,
    /dai\.ly\/([^_\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        provider: 'dailymotion',
        videoId,
        url,
        embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
      };
    }
  }

  return null;
}

/**
 * Parse video URL from any supported provider
 */
export function parseVideoUrl(url: string): VideoInfo | null {
  try {
    // Try parsing as YouTube
    const youtube = parseYouTube(url);
    if (youtube) return youtube;

    // Try parsing as Vimeo
    const vimeo = parseVimeo(url);
    if (vimeo) return vimeo;

    // Try parsing as Dailymotion
    const dailymotion = parseDailymotion(url);
    if (dailymotion) return dailymotion;

    return null;
  } catch (error) {
    console.error('Failed to parse video URL:', error);
    return null;
  }
}

/**
 * Generate embed HTML for a video
 */
export function generateEmbedHtml(
  embedUrl: string,
  width: number = 640,
  height: number = 360,
  title: string = 'Video'
): string {
  return `<iframe
    src="${embedUrl}"
    width="${width}"
    height="${height}"
    title="${title}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>`;
}
