# Build stage
FROM node:20-alpine AS builder

WORKDIR /app/server

# Copy all server files
COPY server/ ./

# Install dependencies (including dev deps for build)
RUN npm install

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built artifacts from builder
COPY --from=builder /app/server/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "dist/main.js"]
