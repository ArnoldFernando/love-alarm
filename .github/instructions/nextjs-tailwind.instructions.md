---

description: "Next.js 14 + React 18 + Tailwind CSS development standards for the Love Alarm web application."
applyTo: "app/web/**/*.{tsx,ts,jsx,js,css}"
---

# Next.js Web Development Instructions

These instructions apply to the Love Alarm web application located in `app/web`.

## Project Context

* Next.js 14.2
* React 18
* TypeScript
* Tailwind CSS
* Axios
* TanStack Query
* Zustand
* React Hook Form
* Zod
* Radix UI

The web application is an API client. It communicates with the Laravel backend and must not directly access the database.

## Architecture

The web application follows:

```text
Next.js Web
    ↓
Laravel REST API
    ↓
PostgreSQL / PostGIS
```

Laravel is the authoritative source for:

* Business rules
* Authentication
* Authorization
* Data validation
* Database operations
* Ownership checks
* Security-sensitive operations

Do not duplicate critical backend business logic in Next.js.

## Routing

* Use the existing Next.js App Router structure.
* Respect the existing route organization.
* Do not introduce a different routing architecture without a clear requirement.
* Preserve existing layouts, loading states, error boundaries, and route conventions.

## Server and Client Components

* Prefer Server Components where they provide a clear benefit.
* Use Client Components when browser APIs, React state, event handlers, or client-side libraries require them.
* Do not force components to be client-side unnecessarily.
* Follow the project's existing component architecture.

## API Communication

Use the existing Axios API client and service layer.

* Do not create duplicate Axios clients unnecessarily.
* Do not hardcode API URLs.
* Use the project's environment/configuration system.
* Follow the existing Laravel `/api/v1` API structure.
* Handle loading, success, empty, validation, authentication, authorization, and server-error states.
* Do not access PostgreSQL or Redis directly from the web application.

## Data Fetching

Use the project's existing TanStack Query patterns for server state where appropriate.

* Reuse existing query hooks and API services.
* Use appropriate query keys.
* Invalidate or update cached data after mutations.
* Avoid unnecessary duplicate requests.
* Handle loading and error states explicitly.
* Avoid fetching data that the current screen does not need.

## State Management

Use Zustand for client/application state where the project already uses it.

Use TanStack Query for server state.

Do not move server state into Zustand without a clear reason.

Avoid duplicating the same source of truth across multiple state systems.

## Authentication

Authentication is ultimately enforced by Laravel.

* Never rely on client-side checks as the security boundary.
* Protect sensitive UI routes for appropriate user experience.
* Handle expired and invalid authentication consistently.
* Never expose passwords, API keys, secrets, or private credentials.
* Never log authentication tokens.
* Avoid persisting sensitive authentication data in insecure browser storage where a safer architecture is available.

The frontend must never assume that hiding a UI element provides authorization.

## Authorization

The Laravel API is the authoritative authorization layer.

Client-side role checks may be used to improve UX, but every protected operation must still be authorized by Laravel.

Never assume a user can access a resource simply because its ID is present in the URL or client state.

## Forms and Validation

Use:

* React Hook Form for form state
* Zod for client-side validation where appropriate
* Laravel validation as the authoritative validation layer

Client-side validation improves UX but must never replace backend validation.

Do not trust values received from the browser.

## TypeScript

* Use TypeScript throughout the web application.
* Avoid `any`.
* Prefer explicit interfaces/types for API responses and component props.
* Reuse types from `packages/shared-types` where appropriate.
* Keep frontend types consistent with the Laravel API contract.
* Use type guards when handling uncertain external data.

## Components

* Reuse existing components before creating new ones.
* Keep components focused and maintainable.
* Separate presentation from complex data/business logic when appropriate.
* Avoid unnecessarily large components.
* Follow existing naming and folder conventions.

## Styling

Use Tailwind CSS following the project's existing design system.

* Reuse existing UI components and utility classes.
* Maintain responsive layouts.
* Use semantic HTML.
* Preserve accessibility.
* Avoid arbitrary styling duplication.
* Do not introduce another styling framework without approval.

## Security

Treat all browser input as untrusted.

* Validate user input.
* Do not expose secrets.
* Do not log tokens or sensitive personal information.
* Do not log precise GPS coordinates.
* Do not expose internal API/database details unnecessarily.
* Do not bypass authentication or authorization checks.
* Avoid unsafe HTML rendering and XSS vulnerabilities.
* Follow the project's security instructions in `security-and-owasp.instructions.md`.

## Performance

* Use `next/image` where appropriate for images.
* Avoid unnecessary client-side JavaScript.
* Avoid unnecessary API requests.
* Prevent unnecessary re-renders.
* Use pagination/infinite loading for large datasets where supported by the API.
* Avoid loading large datasets when only a subset is required.
* Monitor bundle size when adding dependencies.

Do not introduce newer Next.js features unless they are compatible with the project's installed Next.js version.

## Error Handling

Handle errors explicitly.

Distinguish between:

* Network errors
* Authentication errors
* Authorization errors
* Validation errors
* Not-found responses
* Server errors
* Empty states

Do not hide errors simply to make the UI appear successful.

## Testing

For significant changes, consider:

* Component tests
* API/service tests
* Type checking
* Linting
* Build verification
* Relevant manual browser testing

When fixing a bug, add or update a regression test when practical.

## Version Compatibility

The project currently uses:

* Next.js 14.2
* React 18

Do not automatically apply documentation or patterns intended specifically for newer Next.js or React versions.

Before introducing a version-specific API, verify that it is supported by the project's installed dependencies.

## Implementation Process

Before changing code:

1. Read the relevant existing component, hook, service, and API usage.
2. Check `docs/codebase/ARCHITECTURE.md` and `docs/codebase/CONCERNS.md` when relevant.
3. Reuse existing patterns.
4. Make the smallest appropriate change.
5. Verify the affected functionality.
6. Review the final diff for regressions and unnecessary changes.
