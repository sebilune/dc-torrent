// Import necessary Discord.js types and classes
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

// Import qBittorrent utility functions for retrieving and removing torrents
import { getTorrents, removeTorrent } from "../utils/qbittorrent";

/*
 * Handle the /remove command.
 *
 * This command searches for a torrent by name (partial match),
 * attempts to remove it from qBittorrent,
 * and replies to the user with the result.
 */
export async function handleRemoveCommand(
  command: ChatInputCommandInteraction
) {
  console.log("[INFO]: Received /remove command");

  // Get the 'name' string option provided by the user (required)
  const name = command.options.getString("name", true);
  console.log(`[INFO]: User provided search term: "${name}"`);

  // Acknowledge the command to prevent timeout while processing
  await command.deferReply();
  console.log("[INFO]: Command deferred, fetching torrent list...");

  // Fetch the current list of torrents from qBittorrent
  const torrents = await getTorrents();
  console.log(`[INFO]: Retrieved ${torrents.length} torrents from qBittorrent`);

  // Attempt to find a torrent whose name includes the provided search term (case-insensitive)
  const matched = torrents.find((t) =>
    t.name.toLowerCase().includes(name.toLowerCase())
  );

  // If no matching torrent is found, inform the user and exit
  if (!matched) {
    console.log(`[WARN]: No torrent found matching "${name}"`);
    await command.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`❌ No torrent found matching **${name}**.`)
          .setColor("Red"),
      ],
    });
    return;
  }

  console.log(
    `[INFO]: Found matching torrent: "${matched.name}" (Hash: ${matched.hash})`
  );

  // Attempt to remove the matched torrent by its hash
  console.log(`[INFO]: Attempting to remove torrent: "${matched.name}"`);
  const success = await removeTorrent(matched.hash);

  // Inform the user whether the removal was successful or failed
  if (success) {
    console.log(`[INFO]: Successfully removed torrent: "${matched.name}"`);
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
    console.log(`[ERROR]: Failed to remove torrent: "${matched.name}"`);
    await command.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Failed to remove torrent.")
          .setColor("Red"),
      ],
    });
  }
}
