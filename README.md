<p align="center">
  <img src="https://github.com/user-attachments/assets/f46673a1-e664-414d-af2a-bed328d6b394" />
</p>

<div align="center">
  <h1>Saleor Apps Docker</h1>
</div>

<div align="center">
  <p>Unofficial fork of the <b>@saleor/apps</b> repository that adds support for self-hosting apps using docker.</p>
</div>

## Status

Some of the apps might be dockerized but not yet tested, if you use them and they work, feel free to mark them as tested in PR.

| App                                                | Dockerized | Tested          |
|----------------------------------------------------|------------|-----------------|
| [avatax](./apps/avatax)                            | ❌          | ❌               | 
| [cms](./apps/cms-v2)                               | ❌          | ❌               | 
| [data-importer](./apps/data-importer)              | ❌          | ❌               | 
| [emails-and-messages](./apps/emails-and-messages/) | ❌          | ❌               | 
| [klaviyo](./apps/klaviyo)                          | ❌          | ❌               | 
| [products-feed](./apps/products-feed)              | ❌          | ❌               | 
| [search](./apps/search)                            | ✅          | ⚠️ Being tested | 
| [smtp](./apps/smtp)                                | ❌          | ❌               | 

## Docker Images

Docker images are built automatically at midnight each day. This repository should always be less than 24 hours behind [@saleor/apps](https://github.com/saleor/apps) repository.
Packages are published to the GitHub container registry and available in this repository in the [packages section](https://github.com/pitkes22?tab=packages&repo_name=saleor-apps-docker).

Example:
```shell
docker pull ghcr.io/pitkes22/search:1.22.6
```

## Configuration

Each of the application's Dockerfile exposes its configuration using environment variables. Most of the apps share the common configuration like `APL`, `APP_DEBUG`, `NODE_ENV`, `SECRET_KEY`, `ALLOWED_DOMAIN_PATTERN`, `REST_APL_ENDPOINT`, `REST_APL_TOKEN`, `NEXT_PUBLIC_VERCEL_ENV`, `APP_IFRAME_BASE_URL`, `APP_API_BASE_URL`, `VERCEL_URL`, `PORT`, `SENTRY_AUTH_TOKEN`, `SENTRY_PROJECT`, `SENTRY_ORG`, `NEXT_PUBLIC_SENTRY_DSN`, `UPSTASH_URL`, `UPSTASH_TOKEN`. Some of the apps have additional environment variables 
that can be used to configure them. Check the app's README file to find available configuration options.
