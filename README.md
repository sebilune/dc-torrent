# 📥 Discord Movie Torrent Bot

![License](https://img.shields.io/github/license/sebilune/dc-torrent)
![Code Size (bytes)](https://img.shields.io/github/languages/code-size/sebilune/dc-torrent)
![Repo Size](https://img.shields.io/github/repo-size/sebilune/dc-torrent)
![Last Commit](https://img.shields.io/github/last-commit/sebilune/dc-torrent)

Dockerized **Discord bot** that lets you search, download, and manage movie torrents to your media directory directly from Discord slash commands. It was founded for the purpose to allow me and my friends to quickly add our entertainment needs to my plex server remotely.

## Index

- [Features](#features)
- [Available Commands](#available-commands)
- [Quick Start](#quick-start)
- [Manual Installation](#manual-installation)
- [License](#license)

## Features

- Slash command support
- Search and download movies from YTS
- Queue movie torrents into qBittorrent
- Check current queue status
- Remove movie torrents from queue
- WebUI for further management
- Optional role-based access control

## Available Commands

| Command   | Description                                  |
| --------- | -------------------------------------------- |
| `/movie`  | Search and download any movie                |
| `/status` | Check the current status of active downloads |
| `/remove` | Remove a movie from the download queue       |

## Quick Start

If you're on Linux, you can use the provided [setup.sh](./setup.sh) script to get started quickly. Ensure you have [Docker](https://docs.docker.com/desktop/setup/install/linux/) installed.

**1. Clone the repository:**

```bash
git clone https://github.com/sebilune/dc-torrent.git
cd dc-torrent
```

**2. Run the setup script:**

```bash
bash setup.sh
```

This script will prompt you for your Discord bot credentials, config, and movies directory, then it will automatically build the Docker image, and start the container in detached mode. You can view logs with:

```bash
docker logs -f dc-torrent
```

Or stop the bot with:

```bash
docker stop dc-torrent
```

You only need to run the setup script once. To start the bot again later, just run:

```bash
docker start dc-torrent
```

## Manual Installation

Ensure you have [Git](https://git-scm.com/downloads) and [Docker](https://www.docker.com/) installed on your system.

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

- Edit [docker-compose.yml](./docker-compose.yml) to set your environment variables:
  - `BOT_TOKEN`: Your Discord bot token
  - `CLIENT_ID`: Your bot’s client ID
  - `ROLE_ID` Only allow users with this server role to run commands (optional, leave empty to allow all users)
- In the `volumes` section of the compose file, bind your movies directory to the container.

**4. Start the container:**

```bash
docker compose -f docker-compose.yml up
```

The bot and qBittorrent-nox will start automatically inside the container. The qBittorrent Web UI will be available at `http://localhost:8080` by default with the user `admin` and password `adminadmin`.

If you want to run the container in the background (detatch), add `-d` to the command:

```bash
docker compose -f docker-compose.yml up -d
```

To view the logs of the detatched container:

```bash
docker compose -f docker-compose.yml logs -f
```

To stop and remove the container:

```bash
docker compose -f docker-compose.yml down
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
