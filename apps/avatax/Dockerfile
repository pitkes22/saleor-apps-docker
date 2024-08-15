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
RUN turbo prune --scope=app-avatax --docker

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

RUN turbo run build --filter=app-avatax

# Use alpine as the thinnest image
FROM alpine AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy necessary files to the final image
COPY --from=installer /app/apps/avatax/next.config.js .
COPY --from=installer /app/apps/avatax/package.json .

# Set working directory to the app directory
WORKDIR /app/apps/avatax

# Pass environment variables
ARG ALLOWED_DOMAIN_PATTERN
ARG APL
ARG APP_API_BASE_URL
ARG APP_DEBUG
ARG APP_IFRAME_BASE_URL
ARG NODE_ENV
ARG PORT
ARG REST_APL_ENDPOINT
ARG REST_APL_TOKEN
ARG SECRET_KEY
ARG OTEL_ENABLED
ARG OTEL_SERVICE_NAME
ARG APP_LOG_LEVEL
ARG AVATAX_CLIENT_TIMEOUT
ARG ANALYZE_BUNDLE
ARG ENABLE_MIGRATION_CONSOLE_LOGGER
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN
ARG NEXT_PUBLIC_SENTRY_DSN
ARG FILE_APL_PATH
ARG UPSTASH_URL
ARG UPSTASH_TOKEN

ENV ALLOWED_DOMAIN_PATTERN=${ALLOWED_DOMAIN_PATTERN}
ENV APL=${APL}
ENV APP_API_BASE_URL=${APP_API_BASE_URL}
ENV APP_DEBUG=${APP_DEBUG}
ENV APP_IFRAME_BASE_URL=${APP_IFRAME_BASE_URL}
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV REST_APL_ENDPOINT=${REST_APL_ENDPOINT}
ENV REST_APL_TOKEN=${REST_APL_TOKEN}
ENV SECRET_KEY=${SECRET_KEY}
ENV OTEL_ENABLED=${OTEL_ENABLED}
ENV OTEL_SERVICE_NAME=${OTEL_SERVICE_NAME}
ENV APP_LOG_LEVEL=${APP_LOG_LEVEL}
ENV AVATAX_CLIENT_TIMEOUT=${AVATAX_CLIENT_TIMEOUT}
ENV ANALYZE_BUNDLE=${ANALYZE_BUNDLE}
ENV ENABLE_MIGRATION_CONSOLE_LOGGER=${ENABLE_MIGRATION_CONSOLE_LOGGER}
ENV SENTRY_ORG=${SENTRY_ORG}
ENV SENTRY_PROJECT=${SENTRY_PROJECT}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ENV FILE_APL_PATH=${FILE_APL_PATH}
ENV UPSTASH_URL=${UPSTASH_URL}
ENV UPSTASH_TOKEN=${UPSTASH_TOKEN}

CMD node server.js

