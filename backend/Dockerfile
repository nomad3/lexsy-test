# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy common package first
COPY common ./common
WORKDIR /app/common
RUN npm install && npm run build

# Copy backend package files
WORKDIR /app/backend
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/knexfile.ts ./

# Build TypeScript (this will compile both src and knexfile.ts)
RUN npm run build

# Compile knexfile.ts separately to ensure it's in dist
RUN npx tsc knexfile.ts --outDir dist --module commonjs --esModuleInterop

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/dist/knexfile.js ./knexfile.js
COPY --from=builder /app/common /app/common

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]
