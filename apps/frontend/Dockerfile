# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm@latest

# Accept build args for environment variables
ARG NODE_ENV=production
ARG VITE_API_URL=http://localhost
ARG VITE_IDP_API_URL=http://localhost:3000
ARG VITE_BROKER_API_URL=http://localhost:3001
ARG VITE_HUB_API_URL=http://localhost:3002
ARG VITE_POLICY_API_URL=http://localhost:3003
ARG VITE_CONTRACT_API_URL=http://localhost:3004
ARG VITE_COMPLIANCE_API_URL=http://localhost:3005
ARG VITE_LEDGER_API_URL=http://localhost:3006
ARG VITE_CLEARING_API_URL=http://localhost:3007
ARG VITE_APPSTORE_API_URL=http://localhost:3008
ARG VITE_CONNECTOR_API_URL=http://localhost:3009

# Set environment variables for build
ENV NODE_ENV=$NODE_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_IDP_API_URL=$VITE_IDP_API_URL
ENV VITE_BROKER_API_URL=$VITE_BROKER_API_URL
ENV VITE_HUB_API_URL=$VITE_HUB_API_URL
ENV VITE_POLICY_API_URL=$VITE_POLICY_API_URL
ENV VITE_CONTRACT_API_URL=$VITE_CONTRACT_API_URL
ENV VITE_COMPLIANCE_API_URL=$VITE_COMPLIANCE_API_URL
ENV VITE_LEDGER_API_URL=$VITE_LEDGER_API_URL
ENV VITE_CLEARING_API_URL=$VITE_CLEARING_API_URL
ENV VITE_APPSTORE_API_URL=$VITE_APPSTORE_API_URL
ENV VITE_CONNECTOR_API_URL=$VITE_CONNECTOR_API_URL

# Set working directory
WORKDIR /app

# Copy root package.json and pnpm files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy frontend package.json
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy frontend source code
COPY apps/frontend ./apps/frontend

# Build frontend with environment variables
RUN cd apps/frontend && pnpm run build

# Stage 2: Runtime (serve static files)
FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/apps/frontend/dist ./dist

# Expose port
EXPOSE 5174

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5174 || exit 1

# Start serving the built files
CMD ["serve", "-s", "dist", "-l", "5174"]
