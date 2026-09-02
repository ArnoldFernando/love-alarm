# Stack

## Runtime and frameworks

| Area | Technology |
|---|---|
| Workspace | npm workspaces (`apps/*`, `packages/*`) |
| Web | Next.js 14.2, React 18, TypeScript, Tailwind CSS |
| Mobile | Expo SDK 50, React Native 0.73, Expo Router, TypeScript, NativeWind |
| API | Laravel 12 on PHP 8.3 |
| Data | PostgreSQL 15 with PostGIS, Redis 7 |
| Async/realtime | Laravel queues, Laravel Reverb, Firebase Cloud Messaging |

## Key dependencies

- Web uses Axios, TanStack Query, Zustand, React Hook Form, Zod, Radix UI, and Recharts.
- Mobile uses Axios, TanStack Query, Zustand, React Hook Form, Zod, Expo SecureStore, Location, Task Manager, Notifications, Image Picker, and AV.
- Backend uses Sanctum, Reverb, Socialite, Kreait Firebase, Predis, and Spatie Permission; PHPUnit and Pint are development tools.

## Commands

- Web: `dev`, `build`, `start`, `lint`, and `type-check`.
- Mobile: Expo `start`, `android`, `ios`, `web`, Jest `test`, and `type-check`.
- Backend CI runs migrations, PHPUnit coverage, and Pint. No root-level project scripts are defined.

## Evidence

- `package.json`
- `app/web/package.json`
- `apps/mobile/package.json`
- `backend/composer.json`
- `docker/docker-compose.yml`
