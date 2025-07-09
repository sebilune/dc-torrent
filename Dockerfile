FROM oven/bun:alpine

# Runtime dependencies
RUN apk add --no-cache curl unzip libstdc++ tzdata

# Download qBittorrent-nox static binary
ENV QBT_VERSION=5.1.2
RUN curl -L "https://github.com/userdocs/qbittorrent-nox-static/releases/download/release-${QBT_VERSION}_v2.0.11/x86_64-qbittorrent-nox" \
    -o /usr/local/bin/qbittorrent-nox && \
    chmod +x /usr/local/bin/qbittorrent-nox

WORKDIR /app

# Install Bun dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy application source
COPY . .

# Setup qBittorrent config
RUN mkdir -p /root/.config/qBittorrent
COPY qBittorrent.conf /root/.config/qBittorrent/qBittorrent.conf

# Start qBittorrent-nox and the bot
CMD ["sh", "-c", "qbittorrent-nox & exec bun run src/index.ts"]
