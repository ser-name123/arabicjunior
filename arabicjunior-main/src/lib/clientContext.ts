"use client";

/**
 * What the browser can tell us about the person filling in a form.
 *
 * Everything here is ordinary analytics-grade information — the same things a
 * server sees in request headers, plus screen size and timezone. It is captured
 * so the sales team can tell a real enquiry from a bot, know what time it is
 * where the parent lives before calling them, and see which page the enquiry
 * came from.
 *
 * Deliberately NOT collected: canvas/WebGL/audio fingerprints, installed fonts,
 * battery status and the Geolocation API. Those are tracking techniques rather
 * than useful context — the first three exist to identify a device across sites
 * and the last one throws a permission prompt in the middle of a form.
 */

export interface ClientContext {
  userAgent: string;
  browser: string;
  operatingSystem: string;
  deviceType: string;
  /** IANA name, e.g. "Asia/Dubai". */
  timezone: string;
  /** Human readable offset, e.g. "GMT+04:00". */
  gmtOffset: string;
  /** The visitor's own clock at the moment they submitted. */
  localTime: string;
  language: string;
  languages: string;
  screenSize: string;
  viewportSize: string;
  pixelRatio: string;
  colorDepth: string;
  cpuCores: string;
  deviceMemory: string;
  touchSupport: string;
  connectionType: string;
  /** Where they came from — empty when they typed the address in directly. */
  referrer: string;
  /** The page the form was submitted from, query string included. */
  pageUrl: string;
}

/** Ordered longest-match-first: Edge and Opera both also say "Chrome". */
const BROWSERS: Array<[RegExp, string]> = [
  [/Edg[eA]?\/([\d.]+)/, "Edge"],
  [/OPR\/([\d.]+)/, "Opera"],
  [/SamsungBrowser\/([\d.]+)/, "Samsung Internet"],
  [/Firefox\/([\d.]+)/, "Firefox"],
  [/CriOS\/([\d.]+)/, "Chrome (iOS)"],
  [/Chrome\/([\d.]+)/, "Chrome"],
  [/Version\/([\d.]+).*Safari/, "Safari"],
];

const parseBrowser = (ua: string) => {
  for (const [pattern, name] of BROWSERS) {
    const match = ua.match(pattern);
    if (match) return `${name} ${match[1].split(".")[0]}`;
  }
  return "Unknown";
};

const parseOperatingSystem = (ua: string) => {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/Windows/.test(ua)) return "Windows";
  if (/iPhone OS ([\d_]+)/.test(ua))
    return `iOS ${ua.match(/iPhone OS ([\d_]+)/)![1].replace(/_/g, ".")}`;
  if (/iPad.*OS ([\d_]+)/.test(ua))
    return `iPadOS ${ua.match(/OS ([\d_]+)/)![1].replace(/_/g, ".")}`;
  if (/Android ([\d.]+)/.test(ua))
    return `Android ${ua.match(/Android ([\d.]+)/)![1]}`;
  if (/Mac OS X ([\d_]+)/.test(ua))
    return `macOS ${ua.match(/Mac OS X ([\d_]+)/)![1].replace(/_/g, ".")}`;
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
};

const parseDeviceType = (ua: string) => {
  if (/iPad|Tablet|PlayBook|Silk/.test(ua)) return "Tablet";
  if (/Mobi|iPhone|Android.*Mobile|Windows Phone/.test(ua)) return "Mobile";
  if (/Android/.test(ua)) return "Tablet";
  return "Desktop";
};

/** "GMT+04:00" — what the visitor would call their timezone. */
const formatGmtOffset = (date: Date) => {
  // getTimezoneOffset counts the other way round: UTC minus local, in minutes.
  const totalMinutes = -date.getTimezoneOffset();
  const sign = totalMinutes < 0 ? "-" : "+";
  const abs = Math.abs(totalMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `GMT${sign}${hours}:${minutes}`;
};

/**
 * Reads everything in one go. Never throws: a form submission must not fail
 * because a browser withheld one of these values, so each lookup falls back to
 * "Unknown" and the whole thing is wrapped as a last resort.
 */
export const collectClientContext = (): ClientContext => {
  const safe = <T>(read: () => T, fallback: T): T => {
    try {
      const value = read();
      return value === undefined || value === null ? fallback : value;
    } catch {
      return fallback;
    }
  };

  const ua = safe(() => navigator.userAgent, "");
  const now = new Date();
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string };
  };

  return {
    userAgent: ua || "Unknown",
    browser: parseBrowser(ua),
    operatingSystem: parseOperatingSystem(ua),
    deviceType: parseDeviceType(ua),

    timezone: safe(
      () => Intl.DateTimeFormat().resolvedOptions().timeZone,
      "Unknown"
    ),
    gmtOffset: safe(() => formatGmtOffset(now), "Unknown"),
    localTime: safe(() => now.toString(), "Unknown"),

    language: safe(() => navigator.language, "Unknown"),
    languages: safe(() => (navigator.languages || []).join(", "), ""),

    screenSize: safe(() => `${screen.width} x ${screen.height}`, "Unknown"),
    viewportSize: safe(
      () => `${window.innerWidth} x ${window.innerHeight}`,
      "Unknown"
    ),
    pixelRatio: safe(() => String(window.devicePixelRatio), "Unknown"),
    colorDepth: safe(() => `${screen.colorDepth}-bit`, "Unknown"),

    cpuCores: safe(() => String(navigator.hardwareConcurrency), "Unknown"),
    deviceMemory: safe(
      () => (nav.deviceMemory ? `${nav.deviceMemory} GB` : "Unknown"),
      "Unknown"
    ),
    touchSupport: safe(
      () => (navigator.maxTouchPoints > 0 ? "Yes" : "No"),
      "Unknown"
    ),
    connectionType: safe(() => nav.connection?.effectiveType || "Unknown", "Unknown"),

    referrer: safe(() => document.referrer, ""),
    pageUrl: safe(() => window.location.href, ""),
  };
};

export default collectClientContext;
