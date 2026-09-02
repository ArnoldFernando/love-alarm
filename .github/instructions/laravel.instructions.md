---

applyTo: "backend/**/*.php"
description: "Laravel backend and API development standards."
--------------------------------------------------------------------------

# Laravel Development Instructions

## Architecture

Laravel is the central backend and source of truth for business logic.

The frontend applications must communicate with Laravel through APIs.

Architecture:

Next.js ──┐
├── Laravel API ── Database
React Native ─┘

* Keep business logic on the backend.
* Do not duplicate important business rules in the frontend.
* Follow the existing project architecture.
* Reuse existing services, models, requests, resources, policies, and helpers.

## Controllers

Controllers should remain thin.

Controllers should primarily:

1. Receive the request.
2. Validate input.
3. Authorize the operation.
4. Call the appropriate application/service logic.
5. Return the appropriate response.

Do not place large business processes directly inside controllers.

## Validation

* Use Form Request classes for complex or reusable validation.
* Never rely exclusively on frontend validation.
* Validate all user-controlled input.
* Use appropriate Laravel validation rules.
* Provide useful validation messages where necessary.

## Authorization

* Authentication is not authorization.
* Protect authenticated endpoints with appropriate middleware.
* Use Policies/Gates for resource authorization.
* Always verify resource ownership or permissions.
* Never trust IDs supplied by the client.
* Prevent IDOR vulnerabilities.

Example:

A user requesting `/api/users/15` must not automatically be allowed to access user 15 merely because they are authenticated.

## API Design

* Follow the project's existing API versioning strategy.
* Use consistent HTTP status codes.
* Return predictable JSON structures.
* Use API Resources where appropriate.
* Do not expose internal database structures unnecessarily.
* Do not return sensitive model attributes.

Typical responses should clearly distinguish:

* success
* validation failure
* authentication failure
* authorization failure
* not found
* conflict
* server error

## Eloquent

* Use Eloquent relationships instead of manually duplicating relationship queries.
* Define relationships in models.
* Avoid N+1 queries.
* Use eager loading where appropriate.
* Select only required columns when appropriate.
* Use query scopes for reusable query conditions.
* Avoid raw SQL unless it provides a clear benefit.

## Database

* All schema changes must use migrations.
* Never manually modify production schema when a migration is appropriate.
* Define foreign keys and indexes appropriately.
* Consider existing data before changing columns.
* Use database transactions for multi-step operations that must succeed or fail together.
* Avoid destructive migrations unless explicitly required.

## Mass Assignment

* Explicitly define allowed model attributes.
* Never blindly trust request data.
* Use validated request data rather than `$request->all()` for sensitive operations.

Prefer:

`$request->validated()`

over:

`$request->all()`

## Authentication

* Use the project's established Laravel authentication mechanism.
* Protect API endpoints appropriately.
* Never log passwords, tokens, or secrets.
* Handle authentication failures consistently.
* Regenerate/revoke credentials according to the authentication system's requirements.

## Business Logic

Business rules belong in Laravel.

Examples:

* permissions
* user ownership
* transaction rules
* alarm matching logic
* friendship rules
* notification rules
* subscription rules
* rate limits
* data integrity rules

The frontend may provide UX validation, but Laravel must enforce the actual rule.

## Transactions

Use database transactions when multiple related database operations must be atomic.

Example scenarios:

* creating an order and its items
* transferring ownership
* creating related records
* updating multiple balances
* accepting a relationship that modifies multiple tables

## Queues and Jobs

Use queued jobs for work that does not need to block an HTTP request.

Examples:

* sending notifications
* sending emails
* processing large files
* external API calls
* expensive background processing

Do not queue simple operations unnecessarily.

## Redis / Cache

* Use the existing Redis configuration.
* Cache only data where caching provides a clear benefit.
* Define appropriate expiration times.
* Invalidate cached data when underlying data changes.
* Never cache sensitive information without considering security implications.

## Error Handling

* Do not expose stack traces in production.
* Log detailed errors server-side.
* Return safe and useful API error responses.
* Do not silently swallow exceptions.
* Use Laravel's exception handling mechanisms.

## Security

* Validate all input.
* Authorize every protected operation.
* Prevent mass assignment.
* Prevent SQL injection.
* Protect sensitive endpoints with rate limiting when appropriate.
* Never expose `.env` values through API responses.
* Never hardcode secrets.

## Testing

For important backend functionality, test:

* successful requests
* validation failures
* unauthorized requests
* forbidden requests
* missing resources
* edge cases
* database relationships
* business rules

Prefer feature tests for API behavior and unit tests for isolated business logic.

## Code Quality

* Follow Laravel conventions.
* Use meaningful names.
* Avoid overly large classes and methods.
* Avoid duplicated business logic.
* Reuse existing abstractions.
* Do not introduce unnecessary packages.

## Important Rule

The Laravel API is the authoritative layer.

Never rely on the Next.js or React Native client to enforce security, permissions, ownership, or critical business rules.
