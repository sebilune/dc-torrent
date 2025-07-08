#!/bin/bash

echo "https://github.com/sebilune/dc-torrent"
echo

# Prompt for movies directory
read -e -p "Enter the full path to your local movies directory: " USER_MOVIES_PATH

# Prompt for required environment variables
read -p "Enter Discord Bot Token: " BOT_TOKEN
read -p "Enter Discord Client ID: " CLIENT_ID
read -p "Enter Discord Role ID (optional): " ROLE_ID

# Set default qBittorrent values
QBITTORRENT_URL="http://localhost:8080"
QBITTORRENT_USERNAME="admin"
QBITTORRENT_PASSWORD="adminadmin"

echo
echo "Building Docker image..."
docker build --network=host -t dc-torrent .

echo
echo "Starting Docker container..."

docker run -d \
  --dns=8.8.8.8 \
  -v "$USER_MOVIES_PATH:/movies" \
  -e BOT_TOKEN="$BOT_TOKEN" \
  -e CLIENT_ID=$CLIENT_ID \
  -e ROLE_ID=$ROLE_ID \
  -e QBITTORRENT_URL="$QBITTORRENT_URL" \
  -e QBITTORRENT_USERNAME=$QBITTORRENT_USERNAME \
  -e QBITTORRENT_PASSWORD=$QBITTORRENT_PASSWORD \
  -p 8080:8080 \
  -p 16000:16000 \
  -p 16000:16000/udp \
  --name dc-torrent \
  dc-torrent

echo
echo "Container started in detached mode."
echo "To view logs:   docker logs -f dc-torrent"
echo "To stop:        docker stop dc-torrent"
echo "To delete:      docker rm dc-torrent"
echo
echo "Note: You do not need to run this script again to start the bot. If the container still exists, simply run:"
echo "docker start dc-torrent"
