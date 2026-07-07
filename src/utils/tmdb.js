const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function searchMovieByTitle(title) {
  if (!API_KEY || !title) return null;
  const q = encodeURIComponent(title);
  const url = `${BASE}/search/movie?api_key=${API_KEY}&query=${q}&include_adult=false`;
  const data = await safeFetch(url);
  return data?.results?.[0] || null;
}

export async function getMovieCredits(tmdbId) {
  if (!API_KEY || !tmdbId) return null;
  const url = `${BASE}/movie/${tmdbId}/credits?api_key=${API_KEY}`;
  return await safeFetch(url);
}

export function tmdbImage(path, size = 'w185') {
  if (!path) return null;
  return `${IMAGE_BASE}${size}${path}`;
}

export function hasApiKey() {
  return Boolean(API_KEY);
}

export default { searchMovieByTitle, getMovieCredits, tmdbImage, hasApiKey };
