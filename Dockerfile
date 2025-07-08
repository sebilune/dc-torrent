FROM debian:bookworm-slim

# Dependencies
RUN apt-get update && \
    apt-get install -y curl ca-certificates git unzip && \
    rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/root/.bun"
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

# Workdir
WORKDIR /app

# Copy package and lock files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Run the bot
CMD ["bun", "run", "src/index.ts"]
