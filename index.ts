import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { config } from "./config.js";
import { handleMovieCommand } from "./commands/movie.js";
import { handleStatusCommand } from "./commands/status.js";
import { handleRemoveCommand } from "./commands/remove.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName("movie")
    .setDescription("Search and download a movie torrent")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Movie name").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check status of active torrents"),
  new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a torrent by name")
    .addStringOption((opt) =>
      opt.setName("name").setDescription("Torrent name").setRequired(true)
    ),
];

(async () => {
  const rest = new REST({ version: "10" }).setToken(config.bot_token);
  await rest.put(Routes.applicationCommands(config.client_id), {
    body: commands,
  });
  console.log("✅ Commands registered.");
})();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction as ChatInputCommandInteraction;

  if (command.commandName === "movie") await handleMovieCommand(command);
  if (command.commandName === "status") await handleStatusCommand(command);
  if (command.commandName === "remove") await handleRemoveCommand(command);
});

client.login(config.bot_token);
