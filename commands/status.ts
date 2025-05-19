// Import necessary Discord.js types and classes
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

// Import qBittorrent utility functions and Torrent type definition
import { getTorrents, type Torrent } from "../utils/qbittorrent";

// Define the maximum number of torrents to display in a single response
const MAX_DISPLAY = 10;

/*
 * Handle the /status command.
 *
 * This command retrieves the current list of torrents from qBittorrent,
 * builds a nicely formatted embed message summarizing their status,
 * and replies to the user.
 */
export async function handleStatusCommand(
  command: ChatInputCommandInteraction
) {
  // Acknowledge the command to prevent timeout while processing
  await command.deferReply();

  // Fetch the list of current torrents
  const torrents = await getTorrents();

  // If no torrents are active, send a simple "empty queue" message
  if (!torrents.length) {
    await command.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription("🐇 Torrent queue is empty!")
          .setColor("Green"),
      ],
    });
    return;
  }

  // Map internal qBittorrent states to more user-friendly labels
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

  // Create the embed that will display torrent statuses
  const embed = new EmbedBuilder().setColor("Blurple");

  // Loop over the first MAX_DISPLAY torrents and add their status to the embed
  torrents.slice(0, MAX_DISPLAY).forEach((torrent: Torrent, i) => {
    const progress = `${(torrent.progress * 100).toFixed(2)}%`;
    const friendlyStatus = stateMap[torrent.state] || torrent.state;
    embed.addFields({
      name: `${i + 1}️⃣ ${torrent.name}`,
      value: `**${friendlyStatus}** – Progress: ${progress}`,
    });
  });

  // If there are more torrents than we display, add a summary line
  if (torrents.length > MAX_DISPLAY) {
    embed.addFields({
      name: "⏬ More Torrents",
      value: `...and ${torrents.length - MAX_DISPLAY} more`,
    });
  }

  // Send the final embed reply back to the user
  await command.editReply({ embeds: [embed] });
}
