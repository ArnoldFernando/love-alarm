# Architecture

## Overview

The repository is a three-client/service architecture: a Next.js administrative web UI and an Expo mobile app independently call a Laravel `/api/v1` REST API. Laravel is the system of record for authentication, domain rules, authorization, PostgreSQL/PostGIS persistence, Redis location/cache state, queues, Reverb broadcasts, and FCM delivery.

## Web to API to database flow

1. A client component uses the shared Axios instance in `app/web/src/lib/api.ts`.
2. Its request interceptor reads a bearer token from the persisted Zustand store; it calls the Laravel API URL from `NEXT_PUBLIC_API_URL`, falling back to local port 8011.
3. Laravel applies `auth:sanctum` and `active` to protected endpoints; admin routes additionally use `role`.
4. Controllers call services, which use Eloquent/query builder models and return API Resources.
5. Laravel persists data in PostgreSQL/PostGIS and uses Redis for queue/cache/location data where applicable.

The Next middleware deliberately does not authenticate server-side because the token is held in browser storage; its admin protection is therefore only client-side UX, while Laravel remains the authorization boundary.

## Mobile to API to database flow

1. Expo Router screens call Axios from `apps/mobile/src/services/api.ts`.
2. Axios uses `EXPO_PUBLIC_API_URL` when configured; otherwise it derives a local HTTP address from Expo host metadata and adds the SecureStore-held bearer token.
3. Laravel performs the same route middleware, Form Request validation, service logic, and persistence path as web calls.
4. Location tracking posts coordinate updates/checks; Laravel stores a Redis location with a TTL and also creates PostGIS `proximity_events`.
5. Proximity checks create alarms/notifications and broadcast chat events through Reverb; queued work is served by the Compose queue container.

## Authentication and authorization

- Login verifies a hashed password and issues a Sanctum personal access token with `['*']` abilities and a configured expiration.
- Protected API routes require Sanctum plus an active account; admin/moderator paths have role middleware.
- Services frequently constrain records to the authenticated owner (messages, conversations, alarms, devices, crushes, profile photos). `UserPolicy` and `ProfilePolicy` exist, but services/controllers predominantly use explicit ownership queries rather than calling policies.

## State and API communication

- Both clients use Zustand for authentication state and TanStack Query for server state.
- Web persists its Zustand auth state in browser storage. Mobile writes token and user JSON to Expo SecureStore.
- React Hook Form with shared Zod schemas validates selected client forms; Laravel Form Requests provide authoritative backend validation.

## Evidence

- `app/web/src/lib/api.ts`, `app/web/src/stores/auth.ts`, `app/web/src/middleware.ts`
- `apps/mobile/src/services/api.ts`, `apps/mobile/src/stores/auth.ts`, `apps/mobile/src/services/locationTracking.ts`
- `backend/routes/api.php`, `backend/app/Services/AuthService.php`
- `backend/app/Services/ProximityService.php`, `backend/bootstrap/app.php`
