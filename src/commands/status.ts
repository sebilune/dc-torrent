import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { getTorrents, type Torrent } from "@/utils/qbittorrent";

// Define the maximum number of torrents to display in a single response
const MAX_DISPLAY = 10;

/*
 * /status
 *
 * Retrieves the current list of torrents from qBittorrent,
 * builds a formatted embed message summarizing their status,
 * progress, queue position, and replies to the user.
 */
export async function handleStatusCommand(
  command: ChatInputCommandInteraction
) {
  console.log("[INFO]: Received /status command");

  // Acknowledge the command to prevent timeout while processing
  await command.deferReply();
  console.log("[INFO]: Command deferred, fetching torrent list...");

  // Fetch the list of current torrents
  const torrents = await getTorrents();
  console.log(`[INFO]: Retrieved ${torrents.length} torrents from qBittorrent`);

  // If no torrents are active, send a simple "empty queue" message
  if (!torrents.length) {
    console.log("[WARN]: Torrent queue is empty, notifying user...");
    await command.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription("🐇 Torrent queue is empty!")
          .setColor("Green"),
      ],
    });
    return;
  }

  console.log("[INFO]: Building torrent status embed...");
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
    console.log(
      `[INFO]: Adding torrent to embed: ${torrent.name} - Status: ${friendlyStatus}, Progress: ${progress}`
    );
    embed.addFields({
      name: `${i + 1}️⃣ ${torrent.name}`,
      value: `**${friendlyStatus}** - Progress: ${progress}`,
    });
  });

  // If there are more torrents than we display, add a summary line
  if (torrents.length > MAX_DISPLAY) {
    console.log(
      `[INFO]: More torrents exist than displayed. Adding summary for ${
        torrents.length - MAX_DISPLAY
      } additional torrents.`
    );
    embed.addFields({
      name: "⏬ More Torrents",
      value: `...and ${torrents.length - MAX_DISPLAY} more`,
    });
  }

  console.log("[INFO]: Sending torrent status embed to user...");
  // Send the final embed reply back to the user
  await command.editReply({ embeds: [embed] });
  console.log("[INFO]: Torrent status embed sent successfully.");
}
