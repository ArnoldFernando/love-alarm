# Project-Wide Copilot Instructions

## Project Architecture

Love Alarm is a full-stack application with separate web and mobile clients sharing a Laravel API backend.

### Applications

* `app/web/` — Next.js 14.2 + React 18 + TypeScript + Tailwind CSS
* `apps/mobile/` — Expo SDK 50 + React Native 0.73 + TypeScript + NativeWind
* `backend/` — Laravel 12 + PHP 8.3 REST API
* `packages/` — shared TypeScript types and validation
* `docker/` — local development infrastructure
* `docs/` — project and codebase documentation

### Infrastructure

* PostgreSQL 15 — primary relational database
* PostGIS — geographic/proximity data
* Redis 7 — caching, queues, and location state
* Laravel Reverb — realtime communication
* Firebase Cloud Messaging — mobile notifications

### Architecture Flow

```text
Next.js Web ────────┐
                    ├──> Laravel REST API ──> PostgreSQL/PostGIS
React Native Mobile ┘             │
                                  ├──> Redis
                                  ├──> Reverb
                                  └──> FCM
```

Laravel is the authoritative source of truth for:

* Business logic
* Authentication
* Authorization
* Data validation
* Database operations
* Resource ownership
* Security-sensitive operations

Frontend applications must communicate with Laravel through the API and must never directly access PostgreSQL or Redis.

### Critical Directory Rules

When modifying code, use the correct application directory:

* Web changes → `app/web/`
* Mobile changes → `apps/mobile/`
* API/backend changes → `backend/`
* Shared types/validation → `packages/`

Do not create replacement application directories such as `apps/web/` when the existing web application is located at `app/web/`.

### Version Compatibility

The current project versions are authoritative:

* Next.js 14.2
* React 18
* Expo SDK 50
* React Native 0.73
* Laravel 12
* PHP 8.3
* PostgreSQL 15
* Redis 7

Do not automatically apply patterns or APIs that require newer framework versions without first verifying compatibility with the installed dependencies.


## General Rules

* Inspect the existing project structure before making changes.
* Reuse existing components, services, utilities, hooks, models, and APIs whenever possible.
* Do not create duplicate functionality when an existing implementation can be reused.
* Do not make unnecessary architectural changes.
* Keep changes focused on the requested feature or bug.
* Preserve existing functionality unless the requested change requires modifying it.
* Follow the project's existing naming conventions and coding style.
* Prefer clean, readable, maintainable code over unnecessarily clever solutions.
* Use TypeScript for frontend code whenever possible.
* Use proper typing instead of `any` unless there is a justified reason.

## Business Logic

Laravel is the source of truth for business rules.

* Business rules should primarily live in Laravel.
* Do not duplicate important business logic between Next.js and React Native.
* Frontends should consume Laravel APIs rather than directly accessing the database.
* Validation required for security or data integrity must be enforced on the Laravel backend.
* Frontend validation may be added for better UX but must not replace backend validation.

## API Communication

* Next.js and React Native communicate with Laravel through documented APIs.
* Follow the existing API response format.
* Reuse existing API services/client utilities.
* Handle loading, success, empty, and error states.
* Do not hardcode API URLs when an environment/configuration system already exists.
* Do not expose secrets or private credentials in frontend code.
* Handle authentication consistently across web and mobile.

## Security

* Never expose API keys, passwords, tokens, database credentials, or secrets in source code.
* Use environment variables for sensitive configuration.
* Never trust client-side validation alone.
* Validate and authorize requests on the Laravel backend.
* Follow Laravel authentication and authorization mechanisms already used by the project.
* Do not disable security protections merely to make a feature work.

## Database

* Database changes must be implemented through Laravel migrations.
* Do not modify production database structure manually when a migration should be used.
* Respect existing relationships, constraints, indexes, and foreign keys.
* Avoid unnecessary schema changes.
* Consider existing data before changing or removing columns.

## Error Handling

When fixing an error:

1. Identify the root cause.
2. Inspect the relevant frontend, backend, API, and database code.
3. Fix the underlying problem rather than hiding the error.
4. Avoid adding unnecessary try/catch blocks.
5. Preserve useful error information for debugging.
6. Verify that the fix does not introduce regressions.

## Testing

When implementing significant functionality:

* Test Laravel API behavior.
* Test frontend behavior where appropriate.
* Test mobile behavior where appropriate.
* Include validation and error cases.
* Consider authentication and authorization.
* Consider offline/network failure scenarios for mobile features.

## Code Changes

Before modifying code:

1. Inspect relevant existing files.
2. Understand how the current implementation works.
3. Identify dependencies and related components.
4. Make the smallest appropriate change.
5. Check for related errors after the change.

Do not rewrite large sections of the project unless necessary.

## Git

* Make focused changes.
* Do not modify unrelated files.
* Do not remove working functionality without justification.
* Use clear commit messages.
* Never commit secrets, `.env` files, credentials, API keys, or private certificates.

## Important Principle

Prefer:

Existing architecture + small focused change + reusable code

over:

Large rewrite + duplicated logic + unnecessary dependencies.
