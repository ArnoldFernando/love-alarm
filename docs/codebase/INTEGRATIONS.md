# Integrations and configuration

## Data and platform services

| Integration | Use |
|---|---|
| PostgreSQL/PostGIS | Primary relational data and geographic `proximity_events.location` |
| Redis | Cache, sessions, queues, rate limits, temporary location/cooldown keys |
| Laravel Reverb | Realtime message and notification broadcasts |
| Firebase Cloud Messaging | Push notification integration through `kreait/laravel-firebase` |
| Amazon S3 | Configured default file disk in `.env.example` |
| SMTP/Mailpit | Email/password-reset delivery configuration |
| Google/Apple OAuth | Socialite client configuration is present |

## Environment configuration

- `backend/.env.example` declares application, frontend URL, PostgreSQL, Redis, mail, S3, FCM, Reverb, social-auth, Sanctum, and proximity settings.
- Web supports only `NEXT_PUBLIC_API_URL`; the Next config duplicates its localhost default.
- Mobile uses `EXPO_PUBLIC_API_URL` when configured. For local Expo development it derives the Metro host and connects to the API on port 8011.
- Docker Compose hardcodes local development PostgreSQL credentials, exposes PostgreSQL and Redis to the host, and starts PHP-FPM/Nginx, queue worker, and Reverb.

## Observability

[TODO] No application monitoring, tracing, or error-reporting integration was found. Laravel logging is configured locally; a tracked `backend/storage/logs/laravel.log` exists.

## Evidence

- `backend/.env.example`
- `backend/config/database.php`, `backend/config/filesystems.php`, `backend/config/sanctum.php`
- `app/web/next.config.js`, `app/web/src/lib/api.ts`
- `apps/mobile/app.json`, `apps/mobile/src/services/api.ts`
- `docker/docker-compose.yml`
