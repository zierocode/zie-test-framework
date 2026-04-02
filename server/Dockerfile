# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy server directory
COPY server/ ./server/

WORKDIR /app/server

# Install all dependencies (including dev deps for build)
RUN npm ci

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install production dependencies only (omit dev deps)
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/server/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "dist/main.js"]
