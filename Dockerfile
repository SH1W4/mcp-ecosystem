# Multi-stage build for MCP Ecosystem
FROM node:18-alpine AS node-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Python stage
FROM python:3.11-slim AS python-builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY requirements.txt ./
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python core
COPY core/python/ ./core/python/

# Rust stage (optional, uncomment if needed)
# FROM rust:1.75-slim AS rust-builder
#
# WORKDIR /app
#
# # Copy Rust project
# COPY core/rust/ ./core/rust/
#
# # Build Rust project
# RUN cd core/rust && cargo build --release

# Final stage
FROM node:18-alpine AS runtime

WORKDIR /app

# Install Python in the final image
RUN apk add --no-cache python3 py3-pip

# Copy Node.js built application
COPY --from=node-builder /app/dist ./dist
COPY --from=node-builder /app/node_modules ./node_modules
COPY --from=node-builder /app/package.json ./

# Copy Python dependencies and core
COPY --from=python-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-builder /app/core/python ./core/python

# Copy Rust binary (uncomment if needed)
# COPY --from=rust-builder /app/core/rust/target/release/rules_engine ./core/rust/

# Copy configuration files
COPY config/ ./config/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose ports
EXPOSE 3000 9090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start command
CMD ["node", "dist/index.js"]

