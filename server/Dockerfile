# Build stage
FROM node:20-alpine AS builder

WORKDIR /app/server

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install

# Copy source code
COPY server/src ./server/src
COPY server/tsconfig.json ./

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app/server

# Install production dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy built artifacts
COPY --from=builder /app/server/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "dist/main.js"]
