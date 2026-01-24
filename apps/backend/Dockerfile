# Multi-stage build for Node.js backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY ../../package*.json ./

# Copy backend package file
COPY package*.json ./

# Copy workspace packages
COPY ../../packages ../packages

# Install all dependencies (including workspaces)
RUN cd .. && npm ci

# Copy backend source
COPY . ./

# Build backend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]
