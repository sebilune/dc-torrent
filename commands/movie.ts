import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { searchMovies, getBestTorrent } from "../utils/yts.js";
import { addTorrent } from "../utils/qbittorrent.js";

export async function handleMovieCommand(command: ChatInputCommandInteraction) {
  const query = command.options.getString("query", true);
  await command.deferReply();

  const movies = await searchMovies(query);
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

  await command.editReply({
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
    ],
  });

  const collector = command.channel?.createMessageComponentCollector({
    componentType: 3,
    time: 60000,
  });

  collector?.on(
    "collect",
    async (menuInteraction: StringSelectMenuInteraction) => {
      const index = parseInt(menuInteraction.values[0] ?? "0", 10);
      const selectedMovie = movies[index];

      if (!selectedMovie) {
        await menuInteraction.reply({
          content: "⚠️ Invalid movie selection.",
          ephemeral: true,
        });
        return;
      }

      const torrent = getBestTorrent(selectedMovie);
      if (!torrent) {
        await menuInteraction.reply({
          content: "⚠️ No valid torrent found.",
          ephemeral: true,
        });
        return;
      }

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

      collector.stop();
    }
  );
}
