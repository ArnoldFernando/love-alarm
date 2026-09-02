# Concerns

## Confirmed functional problems

1. `ProximityController::clear` calls a nonexistent `ProximityService::clearLocation`; the controller also contains a misplaced `clearLocation` method that references unimported `User`, `Redis`, and `self::REDIS_PREFIX`. Calling `/proximity/clear` will fail.
2. The mobile and web Axios API modules use the localhost port 8011 default while Docker publishes Laravel through Nginx on port 8000. The mobile implementation also ignores its declared public environment setting.
3. `ProfileService::uploadPhoto` writes to the `public` disk, while deletion selects the configured default disk (S3 by default), so deployed photo deletion can target a different disk/path.

## Security risks

1. The web bearer token is persisted to browser local storage through Zustand, making it accessible to any successful XSS.
2. Mobile login logs the full login response, including the issued token. Other mobile screens log full profile/discover/alarm responses and exact GPS coordinates; production logs can expose sensitive personal and location data.
3. The web app’s middleware does not enforce authentication and all browser authorization state is client-readable. The API correctly enforces roles, but the dashboard can flash/probe pages before API rejection.
4. Login, registration, password-reset, and device endpoints lack explicit route throttling. `RouteServiceProvider` defines an `auth` limiter but the routes do not attach `throttle:auth`.
5. Local Compose publicly exposes unauthenticated Redis and PostgreSQL and uses development credentials. This is unsafe if reused outside isolated local development.
6. Tracked `backend/storage/framework/sessions`, cache/views, public photos, and Laravel logs risk exposing session or personal data in repository history.

## Performance and scalability risks

1. Proximity updates write a PostGIS event each location interval. Foreground tracking can send two HTTP calls every three seconds; the radar screen also watches every three seconds and posts/scans every eight seconds.
2. `radarScan` and `cleanupExpiredLocations` use Redis `KEYS`, an O(N) blocking operation. Radar also loads each candidate user individually, producing N+1 database lookups.
3. The database proximity fallback scans recent events by IDs and computes distance before deduplicating users; event volume will grow rapidly without retention scheduling verified in deployment.
4. Discover uses unindexed wildcard `ILIKE` queries for school/course and eagerly loads profiles, interests, and photos for each page.
5. Several high-churn paths are authentication/location-related: `apps/mobile/src/app/_layout.tsx`, `apps/mobile/src/stores/auth.ts`, `backend/routes/api.php`, and `backend/app/Services/ProximityService.php`.

## Evidence

- `backend/app/Http/Controllers/Api/V1/ProximityController.php`
- `backend/app/Services/ProximityService.php`, `backend/app/Services/ProfileService.php`
- `app/web/src/stores/auth.ts`, `app/web/src/middleware.ts`
- `apps/mobile/src/app/(auth)/login.tsx`, `apps/mobile/src/app/(tabs)/radar.tsx`
- `backend/routes/api.php`, `backend/app/Providers/RouteServiceProvider.php`
- `docker/docker-compose.yml`, `.gitignore`
