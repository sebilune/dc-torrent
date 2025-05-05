# 📥 dc-torrent

A **Discord bot** that lets you search, queue, and manage torrents via qBittorrent directly from Discord slash commands. It was founded for the purpose to allow me and my friends to quickly add our entertainment needs to my plex server remotely.

It integrates with:

- **YTS API** – search for torrents
- **qBittorrent-nox** – queue and manage torrents
- **Bun** – fast runtime for JavaScript/TypeScript

---

## Index

- [📥 dc-torrent](#-dc-torrent)
  - [Index](#index)
  - [Features](#features)
  - [Requirements](#requirements)
    - [qBittorrent-nox](#qbittorrent-nox)
      - [Ubuntu/Debian](#ubuntudebian)
    - [Bun](#bun)
  - [Installation \& Setup](#installation--setup)
  - [Available Commands](#available-commands)
  - [🔐 Optional: Role-Based Access](#-optional-role-based-access)
  - [License](#license)

---

## Features

- ✅ Slash command support
- ✅ Search and download movies from YTS
- ✅ Queue torrents into qBittorrent
- ✅ Check current torrent status
- ✅ Remove torrents from the queue
- ✅ Optional role-based access control

---

## Requirements

You’ll need the following installed on your Linux machine:

### qBittorrent-nox

qBittorrent’s headless version that runs in the background.

#### Ubuntu/Debian

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

[Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

Install via the official script:

```bash
curl -fsSL https://bun.sh/install | bash
```

Or install with Homebrew:

```bash
brew install oven-sh/bun/bun
```

---

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

The configuration file can be found in the source directory (dc-torrent), open `config.json` in your preffered text editor and fill in the following:

- `bot_token`: Your Discord bot token
- `client_id`: Your bot’s client ID
- `qbittorrent_url`: Usually `http://localhost:8080/`
- `qbittorrent_username` and `qbittorrent_password`: Your Web UI login. Defaults are included.
- `role_id` (optional): Only allow users with this server role to run commands

You can create and configure your bot token in the [Discord Developer Portal](https://discord.com/developers/applications).

⚠ **Important:** Make sure your bot has all three **Privileged Gateway Intents** enabled.  
You can turn these on in the [Discord Developer Portal](https://discord.com/developers/applications) under **Bot → Privileged Gateway Intents**.

- `Presence Intent`: Required for your bot to receive Presence Update events.
- `Server Members Intent`: Required for your bot to receive events listed under GUILD_MEMBERS.
- `Message Content Intent`: Required for your bot to receive message content in most messages.

**4. Run the bot:**

```bash
bun run index.ts
```

On startup, it will register slash commands and begin listening for interactions.

---

## Available Commands

| Command   | Description                                  |
| --------- | -------------------------------------------- |
| `/movie`  | Search and download a movie from the YTS API |
| `/status` | Check the current status of active torrents  |
| `/remove` | Remove a torrent by name from qBittorrent    |

---

## 🔐 Optional: Role-Based Access

If you set a `role_id` in `config.json`, only users with that role will be able to use the bot’s commands.

Leave it empty or remove the field to allow everyone access.

---

## License

MIT License  
© [sebilune](https://github.com/sebilune)
