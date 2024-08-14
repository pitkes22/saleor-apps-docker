FROM node:18-alpine AS alpine

# Setup pnpm on the alpine base
FROM alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm add turbo --global

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Prune non-required packages based on the scope
RUN turbo prune --scope=klaviyo --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
WORKDIR /app

# Copy the lockfile and workspace package files
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/out/json/ .

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Build the project
COPY --from=builder /app/out/full/ .

# There needs to be a second pnpm install to fix symlinks to the next binary
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Makes check in the next.config.js happy during build time
ENV APL="placeholder"
RUN turbo run build --filter=klaviyo

# Use alpine as the thinnest image
FROM alpine AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy necessary files to the final image
COPY --from=installer /app/apps/klaviyo/next.config.js .
COPY --from=installer /app/apps/klaviyo/package.json .

# Set working directory to the app directory
WORKDIR /app/apps/klaviyo

# Pass environment variables
ARG APL
ARG APP_DEBUG
ARG NODE_ENV
ARG SECRET_KEY
ARG ALLOWED_DOMAIN_PATTERN
ARG REST_APL_ENDPOINT
ARG REST_APL_TOKEN
ARG NEXT_PUBLIC_VERCEL_ENV
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN
ARG APP_API_BASE_URL
ARG APP_IFRAME_BASE_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG UPSTASH_URL
ARG UPSTASH_TOKEN

ENV APL=${APL}
ENV APP_DEBUG=${APP_DEBUG}
ENV NODE_ENV=${NODE_ENV}
ENV SECRET_KEY=${SECRET_KEY}
ENV ALLOWED_DOMAIN_PATTERN=${ALLOWED_DOMAIN_PATTERN}
ENV REST_APL_ENDPOINT=${REST_APL_ENDPOINT}
ENV REST_APL_TOKEN=${REST_APL_TOKEN}
ENV NEXT_PUBLIC_VERCEL_ENV=${NEXT_PUBLIC_VERCEL_ENV}
ENV SENTRY_ORG=${SENTRY_ORG}
ENV SENTRY_PROJECT=${SENTRY_PROJECT}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV APP_API_BASE_URL=${APP_API_BASE_URL}
ENV APP_IFRAME_BASE_URL=${APP_IFRAME_BASE_URL}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ENV UPSTASH_URL=${UPSTASH_URL}
ENV UPSTASH_TOKEN=${UPSTASH_TOKEN}

CMD node server.js

