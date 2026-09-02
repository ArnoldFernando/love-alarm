# Conventions

## TypeScript and React

- Source is TypeScript with strict compiler settings in web and mobile projects.
- Components and routes are PascalCase/camel-case files where appropriate; Expo and Next route filenames follow framework conventions.
- Imports use the `@/*` alias for each app's `src` directory.
- Client forms use React Hook Form plus shared Zod schemas, though several submission handlers still use `any`.
- Web and mobile use Tailwind styling (NativeWind on mobile).

## Laravel

- PSR-4 `App\` classes are grouped by controllers, Form Requests, Resources, Models, Services, Policies, Events, Jobs, and Support.
- API controllers are generally thin and delegate to a service. Responses use `successResponse`/`errorResponse` and API Resources.
- Form Requests implement validation and authentication checks; direct `Request` use remains in simple owner-scoped operations and settings updates.
- Models use UUIDs, explicit fillable attributes, casts, relationships, and soft deletion where defined.

## Error handling and logging

- Client Axios code rejects failed responses; web logs response/network errors to the browser console.
- Mobile surfaces selected request failures via alerts but also emits debug console logs.
- Laravel services catch notification failures selectively and log them.

## Evidence

- `app/web/tsconfig.json`, `apps/mobile/tsconfig.json`
- `app/web/src/lib/api.ts`, `apps/mobile/src/app/(auth)/login.tsx`
- `backend/app/Http/Controllers/Api/V1/AuthController.php`
- `backend/app/Http/Requests/Api/V1/ProximityRequest.php`
- `backend/app/Models/User.php`
