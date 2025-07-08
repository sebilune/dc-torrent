FROM debian:bookworm-slim

# Dependencies
RUN apt-get update && \
    apt-get install -y curl ca-certificates git unzip qbittorrent-nox && \
    rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/root/.bun"
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

WORKDIR /app

# Copy package and lock files
COPY package.json bun.lock ./

# Bun dependencies
RUN bun install

# Copy source code
COPY . .

# Copy qBittorrent.conf to its expected location
RUN mkdir -p /root/.config/qBittorrent && \
    cp qBittorrent.conf /root/.config/qBittorrent/qBittorrent.conf

# Run qBittorrent-nox in the background, then start bot
CMD ["sh", "-c", "qbittorrent-nox & exec bun run src/index.ts"]
