# Structure

## Top-level responsibilities

| Path | Responsibility |
|---|---|
| `app/web` | Next.js admin dashboard and public/auth pages |
| `apps/mobile` | Expo mobile app, native Android project, and Expo Router screens |
| `backend` | Laravel REST API, domain models, services, migrations, queues, and tests |
| `packages/shared-types` | Shared TypeScript domain interfaces |
| `packages/shared-validation` | Shared Zod client validation schemas |
| `docker` | Local PHP-FPM, Nginx, PostgreSQL/PostGIS, Redis, queue, and Reverb services |
| `.github/workflows` | Separate CI workflows for web, mobile, and backend |

## Entry points

- Web App Router source begins at `app/web/src/app/layout.tsx`; route groups separate `(admin)`, `(auth)`, and `(public)`.
- Mobile starts from `apps/mobile/index.js`; Expo Router uses `apps/mobile/src/app/_layout.tsx`.
- Laravel registers HTTP API routes in `backend/routes/api.php`; services are mainly under `backend/app/Services`.

## Code organization

- Laravel uses controller -> service -> Eloquent model/resource layers, with Form Requests for most structured input.
- Both clients use `src/app`, `components`, `stores`, and API/service modules. The web client also has `hooks` and `lib`.
- Packages export source from `src`; their manifests point consumers at uncommitted/unbuilt `dist` output.

## Repository artifacts needing cleanup

Tracked Laravel cache/session/view data, sample uploaded photos, backup PHP files, and a malformed `%ProgramData%` mobile directory are present. These do not belong in source control.

## Evidence

- `app/web/src`
- `apps/mobile/src`
- `backend/app`, `backend/routes`, `backend/database`
- `packages/shared-types`, `packages/shared-validation`
- `.gitignore`
