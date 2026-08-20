/**
 * Server-side reader for the public content endpoints that back the marketing
 * pages (testimonials, teachers, jobs, pricing, landing sections).
 *
 * Fetched on the server so the content is in the HTML that search engines and
 * social previews read — these pages were server rendered before the content
 * moved into the database, and losing that would be a real SEO regression.
 *
 * `revalidate` keeps the pages statically generated rather than dynamic:
 * marking them dynamic would put an API call in front of every visit, which on
 * a sleeping free-tier instance is a very slow first paint. The trade is that
 * an edit made in the admin screen takes up to REVALIDATE_SECONDS to appear.
 */
export const REVALIDATE_SECONDS = 600;

export async function fetchContent<T>(
  path: string,
  revalidate: number = REVALIDATE_SECONDS
): Promise<T[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return [];

  try {
    const res = await fetch(`${base}${path}`, { next: { revalidate } });
    if (!res.ok) return [];

    const json = await res.json();
    return Array.isArray(json?.data) ? (json.data as T[]) : [];
  } catch (err) {
    // A build or a regeneration must not fail because the API is briefly
    // unreachable; the section simply sits out that render.
    console.error(`Could not load content from ${path}:`, err);
    return [];
  }
}

/**
 * Same idea as fetchContent, but for the endpoints that return a single
 * settings object rather than a list (the FAQ section, the footer, and so on).
 * Returns null when the API cannot be reached so the caller can fall back to
 * its built-in copy instead of rendering an empty section.
 */
export async function fetchSettings<T>(
  path: string,
  revalidate: number = REVALIDATE_SECONDS
): Promise<T | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base}${path}`, { next: { revalidate } });
    if (!res.ok) return null;

    const json = await res.json();
    return (json?.data as T) ?? null;
  } catch (err) {
    console.error(`Could not load settings from ${path}:`, err);
    return null;
  }
}
