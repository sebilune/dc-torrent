# 📥 Discord Movie Torrent Bot

![License](https://img.shields.io/github/license/sebilune/dc-torrent)
![Code Size (bytes)](https://img.shields.io/github/languages/code-size/sebilune/dc-torrent)
![Repo Size](https://img.shields.io/github/repo-size/sebilune/dc-torrent)
![Last Commit](https://img.shields.io/github/last-commit/sebilune/dc-torrent)

A **Discord bot** that lets you search, queue, and manage movie torrents via qBittorrent directly from Discord slash commands. It was founded for the purpose to allow me and my friends to quickly add our entertainment needs to my plex server remotely.

Integration:

- **YTS API**: search for torrents
- **qBittorrent-nox**: queue and manage torrents
- **Bun**: fast runtime for JavaScript/TypeScript

## Index

- [Features](#features)
- [Requirements](#requirements)
- [Installation \& Setup](#installation--setup)
- [Available Commands](#available-commands)
- [Role-Based Access](#optional-role-based-access)
- [License](#license)

## Features

- Slash command support
- Search and download movies from YTS
- Queue torrents into qBittorrent
- Check current torrent status
- Remove torrents from queue
- Optional role-based access control

## Requirements

You’ll need the following installed:

- `qbittorent-nox`: qBittorrent’s headless version that runs in the background.
- `bun`: Fast all-in-one JavaScript runtime.

### qBittorent-Nox

Ubuntu/Debian

Install it with:

```bash
sudo apt update
sudo apt install qbittorrent-nox
```

Start it with:

```bash
qbittorrent-nox
```

By default, it exposes a web UI at `http://localhost:8080`. You'll need to configure the web UI login credentials and optionally change the save path (download directory) as by default it's set to `/home/yourusername/Downloads`.

### Bun

Linux

Install via the official script:

```bash
curl -fsSL https://bun.sh/install | bash
```

<p>
<details>
<summary><strong>Errors? Open me</strong></summary>

<p></p>

If after installing through the official script you see errors like:

```bash
bun: command not found
```

you likely need to add Bun’s installation path to your shell’s environment. Bun installs by default to `$HOME/.bun`.

To make sure it’s available in your terminal, you must add some lines to your shell configuration (by default `.bashrc` on Linux).

**1. Open your `.bashrc` file**

```bash
nano ~/.bashrc
```

**2. Add these lines to the bottom:**

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

**3. Save and exit (in nano, press `Ctrl+O` then `Enter`, then `Ctrl+X`).**

**4. Reload your shell:**

```bash
source ~/.bashrc
```

Once done, run:

```bash
bun --version
```

If you see a version number, you’re all set.

</details>
</p>

Or install with [Homebrew](https://docs.brew.sh/Homebrew-on-Linux):

```bash
brew install bun
```

<p>
<details>
<summary><strong>Errors? Open me</strong></summary>

<p></p>

If this is your **first time installing Homebrew** on Linux, after running the install script,  
you need to add the following to your shell configuration so `brew` works properly:

```bash
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

To make sure it’s available in your terminal, you must add some lines to your shell configuration (by default `.bashrc` on Linux).

**1. Open your `.bashrc` file**

```bash
nano ~/.bashrc
```

**2. Add this line to the bottom:**

```bash
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

**3. Save and exit (in nano, press `Ctrl+O` then `Enter`, then `Ctrl+X`).**

**4. Reload your shell:**

```bash
source ~/.bashrc
```

Once done, run:

```bash
brew --version
```

If you see a version number, you’re all set.

</details>
</p>

## Installation & Setup

Follow these steps to get started:

**1. Clone the repository:**

```bash
git clone https://github.com/sebilune/dc-torrent.git
cd dc-torrent
```

**2. Install dependencies**

```bash
bun install
```

**3. Configure the bot**

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` in your preferred text editor and fill in the following:

- `BOT_TOKEN`: Your Discord bot token
- `CLIENT_ID`: Your bot’s client ID
- `QBITTORRENT_URL`: Usually `http://localhost:8080/`
- `QBITTORRENT_USERNAME` and `QBITTORRENT_PASSWORD`: Your Web UI login. Defaults are included.
- `ROLE_ID` (optional): Only allow users with this server role to run commands

You can create and configure your bot token in the [Discord Developer Portal](https://discord.com/developers/applications).

**Important:** Make sure your bot has all three **Privileged Gateway Intents** enabled. You can turn these on in the [Discord Developer Portal](https://discord.com/developers/applications) under **Bot → Privileged Gateway Intents**.

- `Presence Intent`: Required for your bot to receive Presence Update events.
- `Server Members Intent`: Required for your bot to receive events listed under GUILD_MEMBERS.
- `Message Content Intent`: Required for your bot to receive message content in most messages.

**4. Run the bot:**

```bash
bun run index.ts
```

On startup, it will register slash commands and begin listening for interactions.

## Available Commands

| Command   | Description                                  |
| --------- | -------------------------------------------- |
| `/movie`  | Search and download a movie from the YTS API |
| `/status` | Check the current status of active torrents  |
| `/remove` | Remove a torrent by name from qBittorrent    |

## Optional: Role-Based Access

If you set a `ROLE_ID` in your `.env`, only users with that role will be able to use the bot’s commands.

Leave it empty or remove the field to allow everyone access.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
