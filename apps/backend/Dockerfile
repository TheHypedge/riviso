# Multi-stage build for Node.js backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy all workspace package files
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/ai-core/package*.json ./packages/ai-core/
COPY packages/ui-components/package*.json ./packages/ui-components/

# Copy backend package file
COPY apps/backend/package*.json ./apps/backend/

# Install all dependencies
RUN npm ci

# Copy workspace source code
COPY packages ./packages

# Build workspace packages
RUN npm run build:packages

# Copy backend source
COPY apps/backend ./apps/backend

# Build backend
WORKDIR /app/apps/backend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/packages ./packages

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]
