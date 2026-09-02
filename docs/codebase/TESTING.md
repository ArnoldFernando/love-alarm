# Testing

## Backend

- PHPUnit 11 is configured in `backend/phpunit.xml`.
- Feature coverage exists for authentication, profiles, discovery, crush/match flows, proximity, admin routes, and selected security controls.
- Backend CI provisions PostGIS and Redis, migrates the database, runs PHPUnit with coverage text, and checks Pint formatting.

## Web

- Web has TypeScript checking, linting, and production build CI.
- [TODO] No committed unit, integration, or browser test configuration/file was found for `app/web`.

## Mobile

- Mobile defines `jest` as its test command and CI invokes it with `--passWithNoTests`.
- Type checking is configured.
- [TODO] No committed mobile test files or explicit Jest configuration was found.

## Gaps

- Security tests assert that an XSS payload is returned unescaped, documenting dependence on clients to escape it rather than proving an end-to-end XSS defense.
- The existing security test expects login rate limiting, but the `auth` limiter is defined without being attached to public auth routes in `routes/api.php`.
- [ASK USER] Should browser/E2E tests and mobile interaction tests be required before production releases?

## Evidence

- `backend/phpunit.xml`, `backend/tests/Feature/SecurityTest.php`, `backend/tests/Feature/ProximityTest.php`
- `.github/workflows/backend.yml`, `.github/workflows/web.yml`, `.github/workflows/mobile.yml`
- `app/web/package.json`, `apps/mobile/package.json`
