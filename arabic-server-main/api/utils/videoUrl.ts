/**
 * Turn a YouTube or Vimeo link an admin pasted into the pieces the homepage
 * needs: an embeddable URL and a poster image.
 *
 * Parsing goes through the URL constructor rather than a regex over the raw
 * string. A hand-written pattern that has to cope with youtu.be, /shorts/,
 * /embed/, extra query parameters and tracking suffixes ends up with nested
 * quantifiers, which is exactly the ReDoS shape already fixed elsewhere in this
 * codebase. Splitting on the parsed host and path avoids that entirely, and the
 * two id patterns below are anchored and fixed-length.
 */

export type VideoProvider = "youtube" | "vimeo";

export interface ParsedVideo {
  provider: VideoProvider;
  videoId: string;
  /** Goes straight into an <iframe src>. */
  embedUrl: string;
  /** Poster frame; empty for Vimeo, whose thumbnails need an API call. */
  thumbnail: string;
  /** Canonical link, shown as the fallback for anyone who blocks iframes. */
  watchUrl: string;
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^[0-9]{6,12}$/;

export const parseVideoUrl = (raw: unknown): ParsedVideo | null => {
  if (typeof raw !== "string" || !raw.trim()) return null;

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  // Anything else (javascript:, data:) must never reach an iframe src.
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);

  if (YOUTUBE_HOSTS.has(host)) {
    let videoId = "";

    if (host === "youtu.be" || host === "www.youtu.be") {
      videoId = segments[0] ?? "";
    } else if (["embed", "shorts", "v", "live"].includes(segments[0] ?? "")) {
      videoId = segments[1] ?? "";
    } else {
      videoId = url.searchParams.get("v") ?? "";
    }

    if (!YOUTUBE_ID.test(videoId)) return null;

    return {
      provider: "youtube",
      videoId,
      // youtube-nocookie keeps YouTube from setting tracking cookies until the
      // visitor actually presses play, which matters for a site aimed at
      // parents of young children.
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  if (VIMEO_HOSTS.has(host)) {
    // Vimeo paths vary (/123456789, /channels/x/123456789, /video/123456789),
    // so take the first segment that looks like an id.
    const videoId = segments.find((s) => VIMEO_ID.test(s)) ?? "";
    if (!videoId) return null;

    return {
      provider: "vimeo",
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      thumbnail: "",
      watchUrl: `https://vimeo.com/${videoId}`,
    };
  }

  return null;
};
