import axios from "axios";

export interface Movie {
  title: string;
  title_long: string;
  year: number;
  rating: number;
  torrents: TorrentInfo[];
}

export interface TorrentInfo {
  quality: string;
  url: string;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  try {
    const res = await axios.get(`https://yts.mx/api/v2/list_movies.json`, {
      params: { query_term: query },
    });
    return res.data.data.movies || [];
  } catch {
    return [];
  }
}

export function getBestTorrent(movie: Movie): TorrentInfo | undefined {
  const torrents = movie.torrents ?? [];
  torrents.sort(
    (a, b) =>
      parseInt(b.quality.replace("p", "")) -
      parseInt(a.quality.replace("p", ""))
  );
  return torrents.find((t) => t.quality === "1080p") || torrents[0];
}
