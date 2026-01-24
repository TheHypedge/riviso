# Multi-stage build for Node.js backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm ci --workspace=@riviso/backend

# Copy source code
COPY apps/backend ./apps/backend
COPY packages ./packages

# Build the application
RUN npm run build --workspace=@riviso/backend

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install production dependencies only
RUN npm ci --workspace=@riviso/backend --omit=dev

# Copy built application
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages ./packages

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "apps/backend/dist/main.js"]
