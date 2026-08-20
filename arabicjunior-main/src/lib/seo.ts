import type { Metadata } from "next";
import { fetchSettings } from "./contentApi";

export interface SeoMetaRecord {
  pageKey: string;
  label: string;
  path: string;
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string[];
  noIndex: boolean;
}

/**
 * Merges the metadata an admin has saved for a page over the copy the page
 * ships with.
 *
 * The page keeps its own metadata as the fallback on purpose: if the API is
 * unreachable, or a field is left blank in the admin screen, the page still
 * renders the title and description it had before any of this existed. Search
 * engines never see an empty tag because of a failed request.
 *
 * `canonicalUrl` sets the address search engines treat as the page's home. It
 * does not move the route the site actually serves — that still comes from the
 * file layout.
 */
export async function buildPageMetadata(
  pageKey: string,
  fallback: Metadata
): Promise<Metadata> {
  const seo = await fetchSettings<SeoMetaRecord>(`/seo-meta/${pageKey}`);
  if (!seo) return fallback;

  const title = seo.title?.trim() || (fallback.title as string) || "";
  const description = seo.description?.trim() || fallback.description || "";
  const canonical =
    seo.canonicalUrl?.trim() ||
    (fallback.alternates?.canonical as string | undefined);

  const merged: Metadata = {
    ...fallback,
    title,
    description,
  };

  if (canonical) {
    merged.alternates = { ...fallback.alternates, canonical };
  }

  if (seo.keywords?.length) {
    merged.keywords = seo.keywords;
  }

  if (seo.noIndex) {
    merged.robots = { index: false, follow: false };
  }

  // Keep the social cards in step with the page title unless the page set its
  // own — a shared link showing different words than the tab is just confusing.
  if (fallback.openGraph) {
    merged.openGraph = {
      ...fallback.openGraph,
      title: seo.title?.trim() || fallback.openGraph.title || title,
      description:
        seo.description?.trim() || fallback.openGraph.description || description,
      ...(canonical ? { url: canonical } : {}),
    };
  }

  if (fallback.twitter) {
    merged.twitter = {
      ...fallback.twitter,
      title: seo.title?.trim() || fallback.twitter.title || title,
      description:
        seo.description?.trim() || fallback.twitter.description || description,
    };
  }

  return merged;
}
