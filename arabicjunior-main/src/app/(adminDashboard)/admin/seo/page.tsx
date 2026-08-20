"use client";

import React, { useState, useEffect, useCallback } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { revalidateContent } from "@/lib/revalidateContent";
import { toast } from "sonner";
import { Globe, Loader2, Save, Search } from "lucide-react";

type SeoRecord = {
  _id: string;
  pageKey: string;
  label: string;
  path: string;
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string[];
  noIndex: boolean;
};

/** Google truncates around these lengths, so they are guides rather than limits. */
const TITLE_TARGET = 60;
const DESCRIPTION_TARGET = 160;

export default function SeoAdminPage() {
  const { token } = useAuthAdmin();

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [pages, setPages] = useState<SeoRecord[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/seo-meta`);
      const result = await res.json();
      if (res.ok && Array.isArray(result?.data)) setPages(result.data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load the SEO settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (
    pageKey: string,
    field: keyof SeoRecord,
    value: string | boolean
  ) =>
    setPages((prev) =>
      prev.map((p) => (p.pageKey === pageKey ? { ...p, [field]: value } : p))
    );

  const save = async (page: SeoRecord) => {
    if (!token) {
      toast.error("You are signed out. Please sign in again.");
      return;
    }

    setSavingKey(page.pageKey);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/seo-meta/${page.pageKey}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: page.title,
            description: page.description,
            canonicalUrl: page.canonicalUrl,
            keywords: page.keywords,
            noIndex: page.noIndex,
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        toast.success(`${page.label} updated`);
        await revalidateContent(token);
      } else {
        toast.error(result.message || "Could not save");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not save");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200";

  const counterClass = (length: number, target: number) =>
    length === 0
      ? "text-neutral-400"
      : length > target
      ? "text-amber-600"
      : "text-neutral-500";

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      <header className="flex items-center gap-3">
        <Search className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-xl font-bold text-neutral-900">SEO Settings</h1>
          <p className="text-sm text-neutral-500">
            Meta title, description and canonical URL for every page.
          </p>
        </div>
      </header>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>About the page URL:</strong> this sets the canonical address
        search engines treat as the page&rsquo;s home. It does not move the page
        — the address visitors actually browse to is set by the site&rsquo;s
        routing and changing it needs a developer plus a redirect.
      </div>

      <div className="space-y-3">
        {pages.map((page) => {
          const isOpen = openKey === page.pageKey;
          return (
            <div
              key={page.pageKey}
              className="rounded-xl border border-neutral-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : page.pageKey)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-neutral-900">
                    {page.label}
                  </div>
                  <div className="truncate text-xs font-mono text-neutral-500">
                    {page.path}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  {page.noIndex && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-600">
                      noindex
                    </span>
                  )}
                  <span className={counterClass(page.title.length, TITLE_TARGET)}>
                    title {page.title.length}
                  </span>
                  <span
                    className={counterClass(
                      page.description.length,
                      DESCRIPTION_TARGET
                    )}
                  >
                    desc {page.description.length}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-neutral-100 px-5 py-5">
                  <label className="block">
                    <span className="mb-1 flex items-center justify-between text-sm font-medium">
                      Meta title
                      <span
                        className={`text-xs ${counterClass(
                          page.title.length,
                          TITLE_TARGET
                        )}`}
                      >
                        {page.title.length} / ~{TITLE_TARGET}
                      </span>
                    </span>
                    <input
                      className={inputClass}
                      value={page.title}
                      onChange={(e) =>
                        setField(page.pageKey, "title", e.target.value)
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 flex items-center justify-between text-sm font-medium">
                      Meta description
                      <span
                        className={`text-xs ${counterClass(
                          page.description.length,
                          DESCRIPTION_TARGET
                        )}`}
                      >
                        {page.description.length} / ~{DESCRIPTION_TARGET}
                      </span>
                    </span>
                    <textarea
                      className={`${inputClass} min-h-[88px]`}
                      value={page.description}
                      onChange={(e) =>
                        setField(page.pageKey, "description", e.target.value)
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">
                      Page URL (canonical)
                    </span>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 shrink-0 text-neutral-400" />
                      <input
                        className={inputClass}
                        value={page.canonicalUrl}
                        onChange={(e) =>
                          setField(page.pageKey, "canonicalUrl", e.target.value)
                        }
                        placeholder="https://arabicjuniors.com/example"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">
                      Keywords{" "}
                      <span className="font-normal text-neutral-400">
                        (comma separated)
                      </span>
                    </span>
                    <input
                      className={inputClass}
                      value={page.keywords.join(", ")}
                      onChange={(e) =>
                        setPages((prev) =>
                          prev.map((p) =>
                            p.pageKey === page.pageKey
                              ? {
                                  ...p,
                                  keywords: e.target.value
                                    .split(",")
                                    .map((k) => k.trim())
                                    .filter(Boolean),
                                }
                              : p
                          )
                        )
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={page.noIndex}
                      onChange={(e) =>
                        setField(page.pageKey, "noIndex", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    Hide this page from search engines
                  </label>

                  <button
                    type="button"
                    onClick={() => save(page)}
                    disabled={savingKey === page.pageKey}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    {savingKey === page.pageKey ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {savingKey === page.pageKey ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
