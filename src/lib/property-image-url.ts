import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useProperties } from "@/contexts/PropertyContext";

const BUCKET = "property-images";
const SIGN_TTL_SECONDS = 3600; // 1h
const REFRESH_BEFORE_MS = 5 * 60 * 1000; // refresh 5min before expiry

/**
 * Extracts the storage path (relative to the bucket) from a full public URL.
 * Returns null if the URL is not from the property-images bucket.
 */
export function getStoragePath(url: string): string | null {
  if (!url) return null;
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) {
    // already a relative path?
    if (!url.startsWith("http")) return url;
    return null;
  }
  return url.substring(idx + marker.length);
}

/**
 * Always returns the public URL for a given stored image, regardless of
 * the current access mode. Used by sitemap/OG image where crawlers cannot
 * authenticate.
 */
export function getPublicUrl(url: string): string {
  if (!url) return url;
  const path = getStoragePath(url);
  if (!path || url.startsWith("http")) return url;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

const cache = new Map<string, { url: string; expiresAt: number }>();

async function signMany(paths: string[]): Promise<Record<string, string>> {
  const now = Date.now();
  const need = paths.filter((p) => {
    const c = cache.get(p);
    return !c || c.expiresAt - REFRESH_BEFORE_MS < now;
  });
  if (need.length > 0) {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(need, SIGN_TTL_SECONDS);
    if (data) {
      for (const row of data) {
        if (row.signedUrl && row.path) {
          cache.set(row.path, {
            url: row.signedUrl,
            expiresAt: now + SIGN_TTL_SECONDS * 1000,
          });
        }
      }
    }
  }
  const out: Record<string, string> = {};
  for (const p of paths) {
    const c = cache.get(p);
    if (c) out[p] = c.url;
  }
  return out;
}

/**
 * Resolves a list of stored image URLs according to the current access mode.
 * In 'public' mode returns them as-is. In 'signed' mode generates signed URLs.
 */
export function useResolvedImages(urls: string[]): string[] {
  const { settings } = useProperties();
  const mode = settings.imagesAccessMode ?? "public";
  const [resolved, setResolved] = useState<string[]>(urls);

  useEffect(() => {
    if (mode !== "signed" || urls.length === 0) {
      setResolved(urls);
      return;
    }
    const paths = urls.map(getStoragePath).filter(Boolean) as string[];
    if (paths.length === 0) {
      setResolved(urls);
      return;
    }
    let cancelled = false;
    signMany(paths).then((map) => {
      if (cancelled) return;
      setResolved(
        urls.map((u) => {
          const p = getStoragePath(u);
          return (p && map[p]) || u;
        })
      );
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, urls.join("|")]);

  return resolved;
}

export function useResolvedImage(url: string): string {
  const [first] = useResolvedImages(url ? [url] : []);
  return first ?? url;
}
