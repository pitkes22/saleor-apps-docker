FROM node:18-alpine AS alpine

# Setup pnpm on the alpine base
FROM alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm install turbo --global

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
COPY ../.. .

RUN turbo prune --scope=search --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY ../../.gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY ../../turbo.json turbo.json

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN turbo run build --filter=search

# Use alpine as the thinnest image

FROM alpine AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/search/next.config.js .
COPY --from=installer /app/apps/search/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/search/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/search/.next/static ./apps/search/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/search/public ./apps/search/public

# Set workdir to the app name
WORKDIR /app/apps/search

# Pass environment variables
ARG APL
ARG APP_DEBUG
ARG NODE_ENV
ARG SECRET_KEY
ARG ALLOWED_DOMAIN_PATTERN
ARG REST_APL_ENDPOINT
ARG REST_APL_TOKEN
ARG NEXT_PUBLIC_VERCEL_ENV
ARG APP_IFRAME_BASE_URL
ARG APP_API_BASE_URL
ARG VERCEL_URL
ARG PORT
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_PROJECT
ARG SENTRY_ORG
ARG NEXT_PUBLIC_SENTRY_DSN

ENV APL=${APL}
ENV APP_DEBUG=${APP_DEBUG}
ENV NODE_ENV=${NODE_ENV}
ENV SECRET_KEY=${SECRET_KEY}
ENV ALLOWED_DOMAIN_PATTERN=${ALLOWED_DOMAIN_PATTERN}
ENV REST_APL_ENDPOINT=${REST_APL_ENDPOINT}
ENV REST_APL_TOKEN=${REST_APL_TOKEN}
ENV NEXT_PUBLIC_VERCEL_ENV=${NEXT_PUBLIC_VERCEL_ENV}
ENV APP_IFRAME_BASE_URL=${APP_IFRAME_BASE_URL}
ENV APP_API_BASE_URL=${APP_API_BASE_URL}
ENV VERCEL_URL=${VERCEL_URL}
ENV PORT=${PORT}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV SENTRY_PROJECT=${SENTRY_PROJECT}
ENV SENTRY_ORG=${SENTRY_ORG}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}

CMD node server.js

