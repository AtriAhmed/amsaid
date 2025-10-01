import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMediaUrl(path: string | null | undefined) {
  if (!path) return "";

  if (path.startsWith("http")) return path;

  return "/api/media?path=" + encodeURIComponent(path);
}

export function getBookMediaUrl(id: number | null | undefined) {
  if (!id) return "";

  return `/api/books/${id}/media`;
}
