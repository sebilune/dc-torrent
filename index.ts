import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  type Interaction,
} from "discord.js";
import * as fs from "fs/promises";

const configRaw = await fs.readFile("config.json", "utf-8");
const config = JSON.parse(configRaw);

const BOT_TOKEN = config.bot_token;
const QBITTORRENT_URL = config.qbittorrent_url;
const QBITTORRENT_USER = config.qbittorrent_username;
const QBITTORRENT_PASS = config.qbittorrent_password;
const CLIENT_ID = config.client_id;

const MAX_DISPLAY = 10;

// Manage qBittorrent session
async function getAuthenticatedSession(): Promise<{ cookie: string } | null> {
  const loginRes = await fetch(`${QBITTORRENT_URL}api/v2/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: QBITTORRENT_USER,
      password: QBITTORRENT_PASS,
    }),
  });

  const setCookie = loginRes.headers.get("set-cookie");
  if (
    loginRes.status !== 200 ||
    (await loginRes.text()) !== "Ok." ||
    !setCookie
  ) {
    console.error("❌ Failed to login to qBittorrent");
    return null;
  }

  const cookie = setCookie.split(";")[0]; // Only keep the session cookie
  if (!cookie) {
    console.error("❌ No session cookie found.");
    return null;
  }
  return { cookie };
}

// Search movies on YTS
async function searchMovies(query: string) {
  const res = await fetch(
    `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(
      query
    )}`
  );
  if (res.status !== 200) return [];
  const data = (await res.json()) as { data: { movies: any[] } };
  return data.data.movies || [];
}

// Select best torrent
function getBestTorrent(movie: any) {
  const torrents = movie.torrents || [];
  torrents.sort((a: any, b: any) => {
    const qa = parseInt(a.quality.replace("p", "")) || 0;
    const qb = parseInt(b.quality.replace("p", "")) || 0;
    return qb - qa;
  });
  return torrents.find((t: any) => t.quality === "1080p") || torrents[0];
}

// Queue torrent in qBittorrent
async function queueTorrent(magnetUrl: string) {
  const session = await getAuthenticatedSession();
  if (!session) return;

  const res = await fetch(`${QBITTORRENT_URL}api/v2/torrents/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: session.cookie,
    },
    body: new URLSearchParams({ urls: magnetUrl }),
  });

  if (res.status === 200) {
    console.log(`✅ Queued torrent: ${magnetUrl}`);
  } else {
    console.error(`❌ Failed to add torrent: ${magnetUrl}`);
  }
}

// Get torrent statuses
async function getTorrentStatuses(): Promise<any[]> {
  const session = await getAuthenticatedSession();
  if (!session) return [];

  const res = await fetch(`${QBITTORRENT_URL}api/v2/torrents/info`, {
    headers: { Cookie: session.cookie },
  });

  if (res.status !== 200) {
    console.error(`❌ Failed to get torrent statuses: ${res.status}`);
    return [];
  }

  return (await res.json()) as any[];
}

// Setup Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Register slash commands
const commands = [
  new SlashCommandBuilder()
    .setName("movie")
    .setDescription("Search and download a movie torrent")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Movie name").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check status of active torrents"),
  new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a torrent by name")
    .addStringOption((opt) =>
      opt.setName("name").setDescription("Torrent name").setRequired(true)
    ),
];

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("✅ Commands registered.");
  } catch (err) {
    console.error(err);
  }
})();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "movie") {
    const query = interaction.options.getString("query", true);
    await interaction.deferReply();

    const movies = await searchMovies(query);
    if (!movies.length) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ No movies found.")
            .setColor("Red"),
        ],
      });
      return;
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId("movie_select")
      .setPlaceholder("🎬 Select the movie you want:")
      .addOptions(
        movies.map((movie: any, i: number) => ({
          label: movie.title_long.slice(0, 100),
          value: i.toString(),
          description: `${movie.year} | ${movie.rating || "N/A"} ⭐`,
        }))
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      select
    );
    await interaction.editReply({
      content: "Select a movie:",
      components: [row],
    });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: 3,
      time: 60000,
    });

    collector?.on(
      "collect",
      async (menuInteraction: StringSelectMenuInteraction) => {
        if (menuInteraction.customId === "movie_select") {
          const index = parseInt(menuInteraction.values[0] ?? "0", 10);
          const selectedMovie = movies[index];
          const torrent = getBestTorrent(selectedMovie);

          if (!torrent) {
            await menuInteraction.reply({
              content: "⚠️ No valid torrent found for this movie.",
              ephemeral: true,
            });
            return;
          }

          await queueTorrent(torrent.url);

          const embed = new EmbedBuilder()
            .setTitle("📥 Download Queued")
            .setDescription(
              `**${selectedMovie.title} (${torrent.quality})** has been added to qBittorrent.`
            )
            .setColor("Green");

          await menuInteraction.reply({ embeds: [embed] });
          collector.stop();
        }
      }
    );
  }

  if (interaction.commandName === "status") {
    await interaction.deferReply();
    const torrents = await getTorrentStatuses();

    if (Array.isArray(torrents) && !torrents.length) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription("🐇 Torrent queue is empty!")
            .setColor("Green"),
        ],
      });
      return;
    }

    const embed = new EmbedBuilder().setColor("Blurple");
    const stateMap: Record<string, string> = {
      downloading: "Downloading",
      stalledDL: "Stalled",
      checkingDL: "Checking",
      pausedDL: "Paused",
      queuedDL: "Queued",
      uploading: "Seeding",
      pausedUP: "Paused (Seeding)",
      checkingUP: "Checking",
    };

    torrents.slice(0, MAX_DISPLAY).forEach((torrent: any, i: number) => {
      const progress = `${(torrent.progress * 100).toFixed(2)}%`;
      const friendlyStatus = stateMap[torrent.state] || torrent.state;
      embed.addFields({
        name: `${i + 1}️⃣ ${torrent.name}`,
        value: `**${friendlyStatus}** – Progress: ${progress}`,
      });
    });

    if (torrents.length > MAX_DISPLAY) {
      embed.addFields({
        name: "⏬ More Torrents",
        value: `...and ${torrents.length - MAX_DISPLAY} more`,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  }

  if (interaction.commandName === "remove") {
    const name = interaction.options.getString("name", true);
    await interaction.deferReply();

    const torrents = await getTorrentStatuses();
    const matched = torrents.find((t: any) =>
      t.name.toLowerCase().includes(name.toLowerCase())
    );

    if (!matched) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`❌ No torrent found matching **${name}**.`)
            .setColor("Red"),
        ],
      });
      return;
    }

    const session = await getAuthenticatedSession();
    if (!session) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to authenticate with qBittorrent.")
            .setColor("Red"),
        ],
      });
      return;
    }

    const res = await fetch(`${QBITTORRENT_URL}api/v2/torrents/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: session.cookie,
      },
      body: new URLSearchParams({
        hashes: matched.hash,
        deleteFiles: "false",
      }),
    });

    if (res.status === 200) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("✅ Download Removed")
            .setDescription(
              `**${matched.name}** has been removed from qBittorrent.`
            )
            .setColor("Green"),
        ],
      });
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to remove torrent.")
            .setColor("Red"),
        ],
      });
    }
  }
});

client.login(BOT_TOKEN);
