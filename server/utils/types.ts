export interface UnsplashURLs {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
}

export interface UnsplashPhoto {
  id: string;
  description: string | null;
  urls: UnsplashURLs;
  width: number;
  height: number;
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export interface SearchPhotosRequest {
  query: string;
  page?: number;
  per_page?: number;
  order_by?: "relevant" | "latest";
  color?: string;
  orientation?: "landscape" | "portrait" | "squarish";
}
