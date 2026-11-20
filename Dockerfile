# Multi-stage Dockerfile for Haq AI (Production Cloud Run)
# Strictly uses non-root user and minimal standalone bundle

# Stage 1: Dependencies
FROM node:26-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set dummy env vars for build-time validation
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_FIREBASE_API_KEY="build-time-placeholder"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="build-time-placeholder"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="build-time-placeholder"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="build-time-placeholder"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="build-time-placeholder"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="build-time-placeholder"

RUN npm run build

# Stage 3: Production Runner
FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Non-root user for least-privilege security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
