import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getTorrents, type Torrent } from "../utils/qbittorrent.js";

const MAX_DISPLAY = 10;

export async function handleStatusCommand(command: ChatInputCommandInteraction) {
  await command.deferReply();
  const torrents = await getTorrents();

  if (!torrents.length) {
    await command.editReply({ embeds: [new EmbedBuilder().setDescription("🐇 Torrent queue is empty!").setColor("Green")] });
    return;
  }

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

  const embed = new EmbedBuilder().setColor("Blurple");

  torrents.slice(0, MAX_DISPLAY).forEach((torrent: Torrent, i) => {
    const progress = `${(torrent.progress * 100).toFixed(2)}%`;
    const friendlyStatus = stateMap[torrent.state] || torrent.state;
    embed.addFields({ name: `${i + 1}️⃣ ${torrent.name}`, value: `**${friendlyStatus}** – Progress: ${progress}` });
  });

  if (torrents.length > MAX_DISPLAY) {
    embed.addFields({ name: "⏬ More Torrents", value: `...and ${torrents.length - MAX_DISPLAY} more` });
  }

  await command.editReply({ embeds: [embed] });
}
