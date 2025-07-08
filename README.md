# 📥 Discord Movie Torrent Bot

![License](https://img.shields.io/github/license/sebilune/dc-torrent)
![Code Size (bytes)](https://img.shields.io/github/languages/code-size/sebilune/dc-torrent)
![Repo Size](https://img.shields.io/github/repo-size/sebilune/dc-torrent)
![Last Commit](https://img.shields.io/github/last-commit/sebilune/dc-torrent)

A **Discord bot** that lets you search, queue, and manage movie torrents via qBittorrent directly from Discord slash commands. It was founded for the purpose to allow me and my friends to quickly add our entertainment needs to my plex server remotely.

Integration:

- **YTS API**: search for torrents
- **qBittorrent-nox WebUI**: queue and manage torrents
- **Bun**: fast runtime for JavaScript/TypeScript
- **Docker**: easy deployment, no manual setup

## Index

- [📥 Discord Movie Torrent Bot](#-discord-movie-torrent-bot)
  - [Index](#index)
  - [Features](#features)
  - [Quick Start](#quick-start)
  - [Available Commands](#available-commands)
  - [Optional: Role-Based Access](#optional-role-based-access)
  - [License](#license)

## Features

- Slash command support
- Search and download movies from YTS
- Queue torrents into qBittorrent
- Check current torrent status
- Remove torrents from queue
- Optional role-based access control

## Quick Start

**1. Clone the repository:**

```bash
git clone https://github.com/sebilune/dc-torrent.git
cd dc-torrent
```

**2. Build the Docker image:**

```bash
docker build --network=host -t dc-torrent .
```

**3. Edit your configuration:**

- Edit `docker-compose.yml` to set your environment variables:
  - `BOT_TOKEN`: Your Discord bot token
  - `CLIENT_ID`: Your bot’s client ID
  - `ROLE_ID` (Optional): Only allow users with this server role to run commands
- In the `volumes` section of the compose file, bind your movies directory to the container.

**4. Start the container:**

```bash
docker compose -f docker-compose.yml up
```

The bot and qBittorrent-nox will start automatically inside the container. The qBittorrent Web UI will be available at `http://localhost:8080` by default with the user `admin` and password `adminadmin`.

## Available Commands

| Command   | Description                                  |
| --------- | -------------------------------------------- |
| `/movie`  | Search and download a movie from the YTS API |
| `/status` | Check the current status of active torrents  |
| `/remove` | Remove a torrent by name from qBittorrent    |

## Optional: Role-Based Access

If you set a `ROLE_ID` in your compose file, only users with that role will be able to use the bot’s commands.

Leave it empty or remove the field to allow everyone access.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
