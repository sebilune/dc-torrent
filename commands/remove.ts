import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getTorrents, removeTorrent } from "../utils/qbittorrent.js";

export async function handleRemoveCommand(
  command: ChatInputCommandInteraction
) {
  const name = command.options.getString("name", true);
  await command.deferReply();

  const torrents = await getTorrents();
  const matched = torrents.find((t) =>
    t.name.toLowerCase().includes(name.toLowerCase())
  );

  if (!matched) {
    await command.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`❌ No torrent found matching **${name}**.`)
          .setColor("Red"),
      ],
    });
    return;
  }

  const success = await removeTorrent(matched.hash);
  if (success) {
    await command.editReply({
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
    await command.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Failed to remove torrent.")
          .setColor("Red"),
      ],
    });
  }
}
