import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build the correct image URL for book cover images.
 * If the provided path is already absolute (starts with http:// or https://)
 * it will be returned as is. Otherwise, it will be prefixed with the API base
 * URL from `NEXT_PUBLIC_API_BASE_URL`.
 * If no image is provided, a placeholder path is returned.
 */
export function getCoverImageUrl(
  coverImage?: string | null,
  placeholder = 'https://placehold.co/600x900?text=No+Image',
): string {
  if (!coverImage) return placeholder;
  if (/^https?:\/\//i.test(coverImage)) {
    return coverImage;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return `${base}${coverImage}`;
}
