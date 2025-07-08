import "dotenv/config";

export const config = {
  bot_token: process.env.BOT_TOKEN!,
  client_id: process.env.CLIENT_ID!,
  role_id: process.env.ROLE_ID,
  qbittorrent_url: process.env.QBITTORRENT_URL!,
  qbittorrent_username: process.env.QBITTORRENT_USERNAME!,
  qbittorrent_password: process.env.QBITTORRENT_PASSWORD!,
};
