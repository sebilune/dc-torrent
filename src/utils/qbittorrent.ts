import axios from "axios";
import { config } from "@/utils/config";

const qbApi = axios.create({
  baseURL: config.qbittorrent_url,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  withCredentials: true,
});

export interface Torrent {
  hash: string;
  name: string;
  progress: number;
  state: string;
}

export async function getAuthenticatedSession(): Promise<{
  cookie: string;
} | null> {
  try {
    const res = await qbApi.post(
      "api/v2/auth/login",
      new URLSearchParams({
        username: config.qbittorrent_username,
        password: config.qbittorrent_password,
      })
    );
    const setCookie = res.headers["set-cookie"]?.[0]?.split(";")[0];
    return setCookie ? { cookie: setCookie } : null;
  } catch {
    console.error("❌ Failed to login to qBittorrent");
    return null;
  }
}

export async function addTorrent(magnetUrl: string) {
  const session = await getAuthenticatedSession();
  if (!session) return false;

  try {
    await qbApi.post(
      "api/v2/torrents/add",
      new URLSearchParams({ urls: magnetUrl }),
      {
        headers: { Cookie: session.cookie },
      }
    );
    return true;
  } catch {
    return false;
  }
}

export async function getTorrents(): Promise<Torrent[]> {
  const session = await getAuthenticatedSession();
  if (!session) return [];

  try {
    const res = await qbApi.get("api/v2/torrents/info", {
      headers: { Cookie: session.cookie },
    });
    return res.data as Torrent[];
  } catch {
    return [];
  }
}

export async function removeTorrent(hash: string): Promise<boolean> {
  const session = await getAuthenticatedSession();
  if (!session) return false;

  try {
    await qbApi.post(
      "api/v2/torrents/delete",
      new URLSearchParams({
        hashes: hash,
        deleteFiles: "false",
      }),
      {
        headers: { Cookie: session.cookie },
      }
    );
    return true;
  } catch {
    return false;
  }
}
