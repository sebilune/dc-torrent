import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";

import { searchMovies, getBestTorrent } from "@/utils/yts";

import { addTorrent } from "@/utils/qbittorrent";

// Track active collectors and last select menu message per channel+user
const activeMovieCollectors = new Map<
  string,
  { collector: any; messageId: string }
>();

/*
 * /movie
 *
 * Allows a user to search for a movie via YTS,
 * select the desired movie from a dropdown, and queue its best-quality
 * torrent (preferably 1080p) in qBittorrent.
 */
export async function handleMovieCommand(command: ChatInputCommandInteraction) {
  console.log("[INFO]: Received /movie command");

  // Get the 'query' string option provided by the user (required)
  const query = command.options.getString("query", true);
  console.log(`[INFO]: User query: ${query}`);

  // Acknowledge the command to prevent timeout while fetching movie data
  await command.deferReply();
  console.log("[INFO]: Command deferred, fetching movie data...");

  // Search for movies matching the query via YTS API
  const movies = await searchMovies(query);
  console.log(`[INFO]: Found ${movies.length} movies for query: "${query}"`);

  // If no movies are found, inform the user and exit
  if (!movies.length) {
    console.log("[WARN]: No movies found, replying to user...");
    await command.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ No movies found.")
          .setColor("Red"),
      ],
    });
    return;
  }

  console.log("[INFO]: Movies found, building select menu...");
  // Build a select menu with the list of found movies
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("movie_select")
    .setPlaceholder("Select the movie you want:")
    .addOptions(
      movies.map((movie, i) => ({
        label: movie.title_long.slice(0, 100),
        value: i.toString(),
        description: `${movie.year} | ${movie.rating || "N/A"} ⭐`,
      }))
    );

  // Send the select menu to the user and save the message ID
  const replyMsg = await command.editReply({
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
    ],
  });

  const channelId = command.channelId;
  const userId = command.user.id;
  const collectorKey = `${channelId}:${userId}`;

  // If there's an active collector for this user/channel, disable its select menu
  const prev = activeMovieCollectors.get(collectorKey);
  if (prev && command.channel) {
    try {
      const prevMsg = await command.channel.messages.fetch(prev.messageId);
      await prevMsg.edit({ components: [] });
    } catch (e) {
      // Ignore if message can't be fetched/edited
    }
    prev.collector?.stop();
  }

  // Set up a collector to handle the user's selection from the dropdown
  const collector = command.channel?.createMessageComponentCollector({
    componentType: 3, // Select menu component type
    time: 60000, // Collector timeout (60s)
    filter: (i) => i.user.id === userId,
  });

  // Save this collector and message
  activeMovieCollectors.set(collectorKey, {
    collector,
    messageId: replyMsg.id,
  });

  collector?.on(
    "collect",
    async (menuInteraction: StringSelectMenuInteraction) => {
      console.log("[INFO]: User made a selection from the dropdown...");
      const index = parseInt(menuInteraction.values[0] ?? "0", 10);
      const selectedMovie = movies[index];
      console.log(
        `[INFO]: Selected movie: ${selectedMovie?.title || "Invalid selection"}`
      );

      // Validate selected movie
      if (!selectedMovie) {
        try {
          await menuInteraction.reply({
            content: "Invalid movie selection.",
            flags: 64, // ephemeral
          });
        } catch (err: any) {
          if (err.code !== 10062) throw err;
        }
        return;
      }

      console.log(
        `[INFO]: Fetching best torrent for movie: ${selectedMovie.title}`
      );
      // Get the best available torrent for the selected movie
      const torrent = getBestTorrent(selectedMovie);
      if (!torrent) {
        try {
          await menuInteraction.reply({
            content: "No valid torrent found.",
            flags: 64, // ephemeral
          });
        } catch (err: any) {
          if (err.code !== 10062) throw err;
        }
        return;
      }

      console.log(
        `[INFO]: Attempting to add torrent to qBittorrent: ${torrent.url}`
      );
      // Attempt to add the torrent to qBittorrent
      const added = await addTorrent(torrent.url);
      if (added) {
        const embed = new EmbedBuilder()
          .setTitle("Download Queued")
          .setDescription(
            `**${selectedMovie.title} (${torrent.quality})** has been added to qBittorrent.`
          )
          .setColor("Green");
        try {
          await menuInteraction.reply({ embeds: [embed] });
        } catch (err: any) {
          if (err.code !== 10062) throw err;
        }
      } else {
        try {
          await menuInteraction.reply({
            content: "Failed to add torrent.",
            flags: 64, // ephemeral
          });
        } catch (err: any) {
          if (err.code !== 10062) throw err;
        }
      }

      console.log("[INFO]: Stopping collector after interaction...");
      // Stop the collector after a successful or failed interaction
      collector.stop();
    }
  );

  collector?.on("end", async (collected, reason) => {
    // Remove the select menu when collector ends
    try {
      const msg = await command.channel?.messages.fetch(replyMsg.id);
      await msg?.edit({ components: [] });
    } catch (e) {}
    activeMovieCollectors.delete(collectorKey);
    console.log(
      `[INFO]: Collector ended. Reason: ${reason}. Collected interactions: ${collected.size}`
    );
  });
}
