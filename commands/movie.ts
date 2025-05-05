// Import necessary Discord.js types and classes
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";

// Import utility functions for searching movies and selecting torrents
import { searchMovies, getBestTorrent } from "../utils/yts.js";

// Import qBittorrent helper for adding torrents
import { addTorrent } from "../utils/qbittorrent.js";

/*
 * Handle the /movie command.
 *
 * This command allows a user to search for a movie via YTS,
 * select the desired movie from a dropdown, and queue its best-quality
 * torrent (preferably 1080p) in qBittorrent.
 */
export async function handleMovieCommand(command: ChatInputCommandInteraction) {
  // Get the 'query' string option provided by the user (required)
  const query = command.options.getString("query", true);

  // Acknowledge the command to prevent timeout while fetching movie data
  await command.deferReply();

  // Search for movies matching the query via YTS API
  const movies = await searchMovies(query);

  // If no movies are found, inform the user and exit
  if (!movies.length) {
    await command.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ No movies found.")
          .setColor("Red"),
      ],
    });
    return;
  }

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

  // Send the select menu to the user
  await command.editReply({
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
    ],
  });

  // Set up a collector to handle the user's selection from the dropdown
  const collector = command.channel?.createMessageComponentCollector({
    componentType: 3, // Select menu component type
    time: 60000, // Collector timeout (60 seconds)
  });

  collector?.on(
    "collect",
    async (menuInteraction: StringSelectMenuInteraction) => {
      const index = parseInt(menuInteraction.values[0] ?? "0", 10);
      const selectedMovie = movies[index];

      // Validate selected movie
      if (!selectedMovie) {
        await menuInteraction.reply({
          content: "⚠️ Invalid movie selection.",
          ephemeral: true,
        });
        return;
      }

      // Get the best available torrent for the selected movie
      const torrent = getBestTorrent(selectedMovie);
      if (!torrent) {
        await menuInteraction.reply({
          content: "⚠️ No valid torrent found.",
          ephemeral: true,
        });
        return;
      }

      // Attempt to add the torrent to qBittorrent
      const added = await addTorrent(torrent.url);
      if (added) {
        const embed = new EmbedBuilder()
          .setTitle("📥 Download Queued")
          .setDescription(
            `**${selectedMovie.title} (${torrent.quality})** has been added to qBittorrent.`
          )
          .setColor("Green");
        await menuInteraction.reply({ embeds: [embed] });
      } else {
        await menuInteraction.reply({
          content: "❌ Failed to add torrent.",
          ephemeral: true,
        });
      }

      // Stop the collector after a successful or failed interaction
      collector.stop();
    }
  );
}
