export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  duration: number; // in minutes
  releaseDate: string;
  director: string;
  cast: string[];
  genre: string[];
  rating: string; // PG, PG-13, R, etc.
  imdbRating: number;
  trailerUrl?: string;
}