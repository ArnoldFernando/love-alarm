# Love Alarm - Social Proximity Dating App

A production-ready social proximity platform inspired by the concept of "Love Alarm".
Users can secretly express romantic interest. When two users with a mutual crush come within a configurable proximity range, the app triggers a "Love Alarm" notification.

## Architecture

```
Mobile (React Native + Expo)
    |
    v
Next.js Web (Admin Dashboard)
    |
    v
Laravel 12 REST API
    |
    v
PostgreSQL + PostGIS + Redis + Laravel Reverb + Firebase FCM
```

## Monorepo Structure

```
love-alarm/
├── apps/mobile/          # React Native (Expo) app
├── app/web/              # Next.js 14+ web app (admin + landing)
├── backend/              # Laravel 12 API
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   └── shared-validation/ # Shared Zod schemas
├── docker/               # Docker Compose for local dev
├── docs/                 # Documentation
├── scripts/              # Dev scripts
└── .github/workflows/    # CI/CD
```

## Implemented Phases

### Phase 1: Architecture + Database + Authentication (COMPLETE)
- Monorepo scaffolding
- Docker development environment (PHP 8.3, PostgreSQL 15 + PostGIS, Redis, Nginx)
- Laravel 12 backend with full migration suite
- Domain models, relationships, policies
- Authentication API (register, login, logout, email verify, password reset)
- Sanctum token auth
- Next.js web app with auth pages and admin shell
- React Native mobile app with auth screens and tab navigation
- Shared validation schemas (Zod)
- Shared TypeScript types
- CI workflows for backend, web, mobile

### Phase 2: Profiles + Discovery + Crush/Matching (PLANNED)
### Phase 3: Proximity + Love Alarm (PLANNED)
### Phase 4: Notifications + Chat (PLANNED)
### Phase 5: Admin + Moderation (PLANNED)
### Phase 6: Testing + Security + Deployment (PLANNED)

## Technology Stack

### Mobile
- React Native + Expo + Expo Router
- TypeScript
- NativeWind (Tailwind for RN)
- TanStack Query
- Zustand
- React Hook Form + Zod
- Expo SecureStore, Notifications, Location, Image

### Web
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- Recharts
- React Hook Form + Zod

### Backend
- Laravel 12
- PHP 8.3+
- Laravel Sanctum
- Laravel Reverb (WebSockets)
- PostgreSQL 15 + PostGIS
- Redis
- Firebase Cloud Messaging

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- PHP 8.3+ (if running backend locally)
- Composer (if running backend locally)

### Docker Development

```bash
# Start all services
cd love-alarm/docker
docker-compose up -d

# Install backend dependencies
docker-compose exec app composer install

# Copy environment
cp backend/.env.example backend/.env

# Generate app key
docker-compose exec app php artisan key:generate

# Run migrations and seeders
docker-compose exec app php artisan migrate --seed

# Start queue worker
docker-compose exec app php artisan queue:work

# Start Reverb
docker-compose exec app php artisan reverb:start
```

### Web App

```bash
cd love-alarm/app/web
npm install
npm run dev
```

### Mobile App

```bash
cd love-alarm/apps/mobile
npm install
npx expo start
```

## Default Development Accounts

| Role      | Email                  | Password   |
|-----------|------------------------|------------|
| Admin     | admin@lovealarm.dev    | password   |
| Moderator | moderator@lovealarm.dev| password   |
| User      | user@lovealarm.dev     | password   |

> Change these immediately in production via environment variables.

## API Documentation

See `docs/api.md` for OpenAPI/Swagger documentation.

## Database Documentation

See `docs/database.md` for ERD and schema details.

## License

MIT
