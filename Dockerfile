FROM oven/bun:alpine AS builder

WORKDIR /app

# Install bot dependencies
COPY package.json bun.lock ./
RUN bun install --production

# Copy app source
COPY . .

# Download qBittorrent-nox static binary
RUN apk add --no-cache curl
ENV QBT_VERSION=5.1.2
RUN curl -L "https://github.com/userdocs/qbittorrent-nox-static/releases/download/release-${QBT_VERSION}_v2.0.11/x86_64-qbittorrent-nox" \
    -o /usr/local/bin/qbittorrent-nox && \
    chmod +x /usr/local/bin/qbittorrent-nox

# Final image
FROM oven/bun:alpine AS runtime

WORKDIR /app

# Copy from builder
COPY --from=builder /app /app
COPY --from=builder /usr/local/bin/qbittorrent-nox /usr/local/bin/qbittorrent-nox

# Setup qBittorrent config
RUN mkdir -p /root/.config/qBittorrent
COPY qBittorrent.conf /root/.config/qBittorrent/qBittorrent.conf

# Start qBittorrent-nox and bot
CMD ["sh", "-c", "qbittorrent-nox & exec bun run src/index.ts"]
