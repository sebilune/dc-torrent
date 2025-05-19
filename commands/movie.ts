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

  console.log("[INFO]: Sending select menu to user...");
  // Send the select menu to the user
  await command.editReply({
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
    ],
  });

  console.log("[INFO]: Setting up collector for user interaction...");
  // Set up a collector to handle the user's selection from the dropdown
  const collector = command.channel?.createMessageComponentCollector({
    componentType: 3, // Select menu component type
    time: 60000, // Collector timeout (60 seconds)
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
        console.log("[WARN]: Invalid movie selection, notifying user...");
        await menuInteraction.reply({
          content: "Invalid movie selection.",
          ephemeral: true,
        });
        return;
      }

      console.log(
        `[INFO]: Fetching best torrent for movie: ${selectedMovie.title}`
      );
      // Get the best available torrent for the selected movie
      const torrent = getBestTorrent(selectedMovie);
      if (!torrent) {
        console.log("[WARN]: No valid torrent found, notifying user...");
        await menuInteraction.reply({
          content: "No valid torrent found.",
          ephemeral: true,
        });
        return;
      }

      console.log(
        `[INFO]: Attempting to add torrent to qBittorrent: ${torrent.url}`
      );
      // Attempt to add the torrent to qBittorrent
      const added = await addTorrent(torrent.url);
      if (added) {
        console.log(
          `[INFO]: Torrent added successfully: ${selectedMovie.title} (${torrent.quality})`
        );
        const embed = new EmbedBuilder()
          .setTitle("Download Queued")
          .setDescription(
            `**${selectedMovie.title} (${torrent.quality})** has been added to qBittorrent.`
          )
          .setColor("Green");
        await menuInteraction.reply({ embeds: [embed] });
      } else {
        console.log("[ERROR]: Failed to add torrent, notifying user...");
        await menuInteraction.reply({
          content: "Failed to add torrent.",
          ephemeral: true,
        });
      }

      console.log("[INFO]: Stopping collector after interaction...");
      // Stop the collector after a successful or failed interaction
      collector.stop();
    }
  );

  collector?.on("end", (collected, reason) => {
    console.log(
      `[INFO]: Collector ended. Reason: ${reason}. Collected interactions: ${collected.size}`
    );
  });
}
