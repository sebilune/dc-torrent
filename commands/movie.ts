// Import necessary Discord.js types and classes
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";

// Import utility functions for searching movies and selecting torrents
import { searchMovies, getBestTorrent } from "../utils/yts";

// Import qBittorrent helper for adding torrents
import { addTorrent } from "../utils/qbittorrent";

/*
 * Handle the /movie command.
 *
 * This command allows a user to search for a movie via YTS,
 * select the desired movie from a dropdown, and queue its best-quality
 * torrent (preferably 1080p) in qBittorrent.
 */
export async function handleMovieCommand(command: ChatInputCommandInteraction) {
  console.log("📥 Received /movie command");

  // Get the 'query' string option provided by the user (required)
  const query = command.options.getString("query", true);
  console.log(`🔍 User query: ${query}`);

  // Acknowledge the command to prevent timeout while fetching movie data
  await command.deferReply();
  console.log("⏳ Command deferred, fetching movie data...");

  // Search for movies matching the query via YTS API
  const movies = await searchMovies(query);
  console.log(`🎬 Found ${movies.length} movies for query: "${query}"`);

  // If no movies are found, inform the user and exit
  if (!movies.length) {
    console.log("❌ No movies found, replying to user...");
    await command.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ No movies found.")
          .setColor("Red"),
      ],
    });
    return;
  }

  console.log("✅ Movies found, building select menu...");
  // Build a select menu with the list of found movies
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("movie_select")
    .setPlaceholder("🎬 Select the movie you want:")
    .addOptions(
      movies.map((movie, i) => ({
        label: movie.title_long.slice(0, 100),
        value: i.toString(),
        description: `${movie.year} | ${movie.rating || "N/A"} ⭐`,
      }))
    );

  console.log("📤 Sending select menu to user...");
  // Send the select menu to the user
  await command.editReply({
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
    ],
  });

  console.log("🕵️ Setting up collector for user interaction...");
  // Set up a collector to handle the user's selection from the dropdown
  const collector = command.channel?.createMessageComponentCollector({
    componentType: 3, // Select menu component type
    time: 60000, // Collector timeout (60 seconds)
  });

  collector?.on(
    "collect",
    async (menuInteraction: StringSelectMenuInteraction) => {
      console.log("📩 User made a selection from the dropdown...");
      const index = parseInt(menuInteraction.values[0] ?? "0", 10);
      const selectedMovie = movies[index];
      console.log(
        `🎥 Selected movie: ${selectedMovie?.title || "Invalid selection"}`
      );

      // Validate selected movie
      if (!selectedMovie) {
        console.log("⚠️ Invalid movie selection, notifying user...");
        await menuInteraction.reply({
          content: "⚠️ Invalid movie selection.",
          ephemeral: true,
        });
        return;
      }

      console.log(`🔍 Fetching best torrent for movie: ${selectedMovie.title}`);
      // Get the best available torrent for the selected movie
      const torrent = getBestTorrent(selectedMovie);
      if (!torrent) {
        console.log("⚠️ No valid torrent found, notifying user...");
        await menuInteraction.reply({
          content: "⚠️ No valid torrent found.",
          ephemeral: true,
        });
        return;
      }

      console.log(
        `📤 Attempting to add torrent to qBittorrent: ${torrent.url}`
      );
      // Attempt to add the torrent to qBittorrent
      const added = await addTorrent(torrent.url);
      if (added) {
        console.log(
          `✅ Torrent added successfully: ${selectedMovie.title} (${torrent.quality})`
        );
        const embed = new EmbedBuilder()
          .setTitle("📥 Download Queued")
          .setDescription(
            `**${selectedMovie.title} (${torrent.quality})** has been added to qBittorrent.`
          )
          .setColor("Green");
        await menuInteraction.reply({ embeds: [embed] });
      } else {
        console.log("❌ Failed to add torrent, notifying user...");
        await menuInteraction.reply({
          content: "❌ Failed to add torrent.",
          ephemeral: true,
        });
      }

      console.log("🛑 Stopping collector after interaction...");
      // Stop the collector after a successful or failed interaction
      collector.stop();
    }
  );

  collector?.on("end", (collected, reason) => {
    console.log(
      `⏲️ Collector ended. Reason: ${reason}. Collected interactions: ${collected.size}`
    );
  });
}
