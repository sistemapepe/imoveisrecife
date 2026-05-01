
/**
 * Utility to optimize Supabase Storage images and generate responsive srcSets.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Checks if a URL is a Supabase Storage public URL.
 */
export const isSupabaseUrl = (url: string): boolean => {
  return typeof url === 'string' && url.includes('supabase.co/storage/v1/object/public/');
};

/**
 * Returns an optimized version of the image URL using Supabase Storage transformation parameters.
 */
export const getOptimizedImageUrl = (url: string, options: ImageOptimizationOptions = {}): string => {
  if (!url || !isSupabaseUrl(url)) return url;

  // Default to webp for better compression if no format is specified
  const { 
    width, 
    height, 
    quality = 80, 
    format = 'webp', 
    resize = 'cover' 
  } = options;

  try {
    const urlObj = new URL(url);
    
    if (width) urlObj.searchParams.set('width', width.toString());
    if (height) urlObj.searchParams.set('height', height.toString());
    if (quality) urlObj.searchParams.set('quality', quality.toString());
    if (format && format !== 'origin') urlObj.searchParams.set('format', format);
    if (resize) urlObj.searchParams.set('resize', resize);

    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

/**
 * Generates a srcSet string for responsive images.
 */
export const getImageSrcSet = (url: string, widths: number[] = [400, 800, 1200]): string | undefined => {
  if (!url || !isSupabaseUrl(url)) return undefined;

  return widths
    .map(w => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
};

/**
 * Common image sizes for the application.
 */
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 400, quality: 75 },
  CARD: { width: 600, quality: 80 },
  HERO: { width: 1200, quality: 85 },
  FULL: { width: 1920, quality: 85 },
};
