// Import necessary Discord.js classes and types
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

// Import configuration (API tokens, client ID) from local config file
import { config } from "./config.js";

// Import individual command handler functions
import { handleMovieCommand } from "./commands/movie.js";
import { handleStatusCommand } from "./commands/status.js";
import { handleRemoveCommand } from "./commands/remove.js";

// Create a new Discord client instance with the Guilds intent (enables slash commands)
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Define slash commands to be registered with Discord
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

// Register slash commands with the Discord API using REST
(async () => {
  const rest = new REST({ version: "10" }).setToken(config.bot_token);
  try {
    await rest.put(Routes.applicationCommands(config.client_id), {
      body: commands,
    });
    console.log("✅ Commands registered.");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
  }
})();

// Log event handler: fires once when the bot is successfully connected
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

// Main interaction handler: listens for slash commands and routes them to appropriate handlers
client.on("interactionCreate", async (interaction) => {
  // Ignore non-slash command interactions
  if (!interaction.isChatInputCommand()) return;

  // Cast interaction to ChatInputCommandInteraction type for better type safety
  const command = interaction as ChatInputCommandInteraction;

  // Dispatch to the correct command handler based on the command name
  if (command.commandName === "movie") await handleMovieCommand(command);
  if (command.commandName === "status") await handleStatusCommand(command);
  if (command.commandName === "remove") await handleRemoveCommand(command);
});

// Log the bot in using the configured bot token
client.login(config.bot_token);
