/**
 * Security Utilities for XSS Protection
 * Provides functions to sanitize user input and HTML content
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes script tags, javascript: URLs, and other dangerous patterns
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return "";

  return html
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove javascript: URLs
    .replace(/javascript:/gi, "")
    // Remove on* event handlers (onclick, onload, etc.)
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\w+/gi, "")
    // Remove eval() calls
    .replace(/eval\(/gi, "")
    // Remove document.cookie
    .replace(/document\.cookie/gi, "")
    // Remove document.location
    .replace(/document\.location/gi, "")
    // Remove base64 data URIs
    .replace(/data:text\/html/gi, "")
    // Remove meta refresh tags
    .replace(/<meta[^>]*http-equiv="refresh"[^>]*>/gi, "");
};

/**
 * Sanitizes a string for use in HTML attributes
 */
export const sanitizeAttribute = (str: string): string => {
  if (!str) return "";
  return str.replace(/["'<>&]/g, (match) => {
    const entities: { [key: string]: string } = {
      '"': "&quot;",
      "'": "&#x27;",
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
    };
    return entities[match] || match;
  });
};

/**
 * Sanitizes a string for use in URL parameters
 */
export const sanitizeUrlParam = (str: string): string => {
  if (!str) return "";
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
};

/**
 * Checks if a URL is safe (http/https only)
 */
export const isSafeUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitizes user input for blog content
 * This should be used before saving to database
 */
export const sanitizeBlogContent = (content: string): string => {
  if (!content) return "";

  // Allow basic HTML tags for formatting
  const allowedTags = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "blockquote",
    "code",
    "pre",
  ];

  // First do general sanitization
  let sanitized = sanitizeHtml(content);

  // Then remove any tags not in the allowed list
  sanitized = sanitized.replace(/<\/?(\w+)[^>]*>/g, (match, tagName) => {
    return allowedTags.includes(tagName.toLowerCase()) ? match : "";
  });

  // Remove any remaining script tags that might have slipped through
  sanitized = sanitizeHtml(sanitized);

  return sanitized;
};

/**
 * Creates a safe JSON-LD script tag
 * Used for SEO structured data
 */
export const createSafeJsonLd = (data: Record<string, unknown>): string => {
  const sanitized = JSON.stringify(data);
  return `<script type="application/ld+json">${sanitized}</script>`;
};
