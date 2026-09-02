---

applyTo: "**"
description: "Security and OWASP guidelines for the Love Alarm application."
--------------------------------------------------------------------------------------------------------------------

# Security and OWASP Instructions

## Core Security Principles

* Treat all client input as untrusted.
* Never trust client-side validation for security.
* Enforce security rules on the Laravel backend.
* Follow the principle of least privilege.
* Fail securely.
* Do not expose sensitive implementation details.
* Prefer secure defaults.
* Never disable security controls simply to make functionality work.

## Secrets and Credentials

NEVER:

* Hardcode passwords.
* Hardcode API keys.
* Hardcode database credentials.
* Hardcode JWT secrets.
* Hardcode Laravel application keys.
* Commit `.env` files containing secrets.
* Log passwords, access tokens, refresh tokens, API keys, or session identifiers.
* Expose backend secrets to frontend applications.

For Next.js:

* Treat `NEXT_PUBLIC_*` variables as public.
* Never put secrets in `NEXT_PUBLIC_*` environment variables.
* Server-only secrets must remain on the server.

For React Native:

* Never assume application-bundled values are secret.
* Do not embed private API keys or backend credentials in the mobile application.

## Authentication

* Use the project's established authentication mechanism.
* Never implement authentication using insecure custom mechanisms when the framework already provides a secure solution.
* Protect authenticated API endpoints with appropriate middleware.
* Handle expired sessions correctly.
* Do not expose authentication tokens in logs.
* Never place credentials directly in URLs.
* Use secure storage mechanisms appropriate to the platform.

## Authorization

Authentication determines who a user is.

Authorization determines what the user is allowed to do.

Always enforce authorization on the Laravel backend.

Before accessing or modifying a resource:

1. Authenticate the user.
2. Verify the user has permission.
3. Verify resource ownership where applicable.
4. Perform the operation only after authorization succeeds.

Never rely on:

* hidden frontend buttons
* disabled UI elements
* route hiding
* client-side role checks
* IDs supplied by the client

to enforce authorization.

## IDOR Prevention

Protect against Insecure Direct Object References.

Never assume that because a user supplies:

`/api/users/15`

they are allowed to access user 15.

Always verify ownership or permission.

Use Laravel Policies, Gates, middleware, or explicit authorization checks.

## Input Validation

Validate every user-controlled input on the Laravel backend.

Examples include:

* request parameters
* query parameters
* JSON payloads
* uploaded files
* filenames
* IDs
* search terms
* sort parameters
* filter parameters
* pagination values

Prefer Laravel Form Requests for structured validation.

Do not use raw request data without validation for sensitive operations.

Prefer:

`$request->validated()`

over:

`$request->all()`

## SQL Injection

Use Laravel Eloquent and parameterized queries.

Avoid constructing SQL queries by concatenating user input.

Never do:

`"SELECT * FROM users WHERE name = '" . $name . "'"`

Use:

* Eloquent
* Query Builder bindings
* parameterized queries

Raw SQL requires careful parameter binding.

## XSS

Never render untrusted HTML directly.

For React/Next.js:

* Avoid `dangerouslySetInnerHTML`.
* If HTML rendering is genuinely required, sanitize the content first.
* Treat user-generated content as untrusted.

For Laravel:

* Escape output when rendering HTML.
* Do not return unsanitized HTML unless explicitly required and safely handled.

## CSRF

Use the appropriate CSRF protections for browser-based authentication.

Do not disable CSRF protection simply to solve an API request problem.

Understand whether the application uses:

* session/cookie authentication
* token authentication
* Laravel Sanctum
* another authentication mechanism

and apply the appropriate protections.

## CORS

Do not configure CORS as:

`Access-Control-Allow-Origin: *`

when credentials or authenticated requests are involved.

Allow only trusted origins.

Do not solve CORS errors by weakening backend security.

## API Security

All sensitive API endpoints must:

* authenticate the request when required
* authorize the requested operation
* validate input
* return appropriate HTTP status codes
* avoid exposing sensitive data
* use rate limiting where appropriate

Do not expose internal database fields unnecessarily.

Do not return:

* passwords
* password hashes
* private tokens
* secret keys
* internal security information

through API responses.

## Mass Assignment

Laravel models must protect against mass assignment vulnerabilities.

Do not blindly accept arbitrary request fields.

Use:

* `$fillable`
* `$guarded`
* validated request data
* explicit field assignment

For sensitive operations, explicitly specify which attributes can be modified.

## Laravel Authorization

Prefer Laravel's established authorization mechanisms:

* Policies
* Gates
* Middleware
* Form Requests

Do not create scattered role checks throughout controllers when a reusable authorization policy is appropriate.

## File Upload Security

Treat uploaded files as untrusted.

Validate:

* file type
* MIME type
* file size
* extension
* filename

Do not trust the extension alone.

Do not allow uploaded files to execute as server-side code.

Store uploaded files using safe storage mechanisms.

Avoid exposing sensitive uploaded files publicly unless intended.

## Path Traversal

Never directly concatenate user input into filesystem paths.

Validate filenames and paths.

Prevent access to:

* `../`
* system files
* application configuration
* `.env`
* private storage

## Rate Limiting

Use rate limiting for sensitive endpoints where appropriate.

Especially consider:

* login
* registration
* password reset
* OTP
* verification
* messaging
* search
* resource creation
* expensive operations

Do not rely solely on frontend restrictions.

## Error Handling

Do not expose:

* stack traces
* SQL queries
* database credentials
* filesystem paths
* environment variables
* internal service information

to users in production.

Return safe error messages while logging useful diagnostic information server-side.

Never silently swallow security-related exceptions.

## Logging

Logs must never contain:

* passwords
* authentication tokens
* refresh tokens
* API secrets
* session identifiers
* private keys
* sensitive personal information unless necessary

Use logs to investigate security events without creating a second source of sensitive-data leakage.

## Dependencies

Before adding a dependency:

1. Determine whether the functionality already exists.
2. Verify the package is actively maintained.
3. Check for known security vulnerabilities.
4. Avoid unnecessary packages.
5. Keep dependencies updated.

Do not install packages merely to solve a small problem that can be safely solved with existing project functionality.

## React / Next.js Security

* Never expose server secrets to client components.
* Never expose private environment variables to browser code.
* Validate data received from APIs.
* Avoid unsafe HTML rendering.
* Protect authenticated routes appropriately.
* Do not rely on frontend route protection alone.
* Backend authorization remains mandatory.

Server-side code must remain server-side.

Do not import server-only functionality into client components.

## React Native Security

* Never store sensitive credentials in plain application state longer than necessary.
* Use secure platform storage for sensitive authentication information.
* Do not log tokens or credentials.
* Do not embed private backend credentials in the application.
* Validate deep links and external input.
* Handle permissions carefully.
* Do not assume the mobile application is a trusted environment.

The mobile client can be reverse-engineered. Anything shipped to the client should be considered potentially discoverable.

## Authentication Tokens

When using access/refresh tokens:

* Never log tokens.
* Store them using the application's approved secure mechanism.
* Handle expiration.
* Revoke or rotate tokens according to the authentication architecture.
* Never put tokens in URLs.
* Avoid exposing tokens unnecessarily to UI components.

## Sensitive Data

Minimize collection and storage of sensitive information.

Only collect data required by the application.

Do not expose sensitive fields through:

* API resources
* debug output
* logs
* error messages
* frontend state
* analytics events

## Database Security

* Use least-privilege database credentials.
* Never expose database credentials to frontend applications.
* Use migrations for schema changes.
* Protect sensitive database fields.
* Use foreign keys and constraints where appropriate.
* Use transactions for security-sensitive multi-step operations.

## Environment Configuration

Development configuration may contain debugging options.

Production must:

* disable unnecessary debugging
* protect environment variables
* use secure application configuration
* use HTTPS
* use secure cookies where applicable
* restrict allowed origins
* use appropriate logging

Never commit real production secrets.

## Secure API Responses

Return only the fields required by the client.

Use Laravel API Resources where appropriate.

Avoid returning complete Eloquent models when doing so exposes fields that clients do not need.

## Business Logic Security

Important business rules must be enforced by Laravel.

Examples:

* user ownership
* friendship permissions
* alarm permissions
* account restrictions
* role permissions
* transaction rules
* notification permissions
* resource limits

Do not implement security-critical business rules exclusively in:

* Next.js
* React Native
* JavaScript
* UI components

The client is untrusted.

## Security Review Before Completing a Feature

Before considering a security-sensitive feature complete, verify:

* [ ] Authentication is enforced where required.
* [ ] Authorization is enforced.
* [ ] Input is validated.
* [ ] IDs cannot be used to access unauthorized resources.
* [ ] Sensitive data is not exposed.
* [ ] Secrets are not hardcoded.
* [ ] API responses contain only required data.
* [ ] Rate limiting is considered.
* [ ] Errors do not expose internal details.
* [ ] Logs do not contain secrets.
* [ ] File uploads are validated.
* [ ] Database queries are parameterized.
* [ ] Frontend validation is not being used as security.
* [ ] Mobile secrets are not embedded in the application.

## Critical Rule

The frontend is NOT trusted.

Next.js and React Native are clients.

Laravel is responsible for enforcing:

* authentication
* authorization
* validation
* business rules
* data integrity
* security controls

Never weaken backend security to make the frontend implementation easier.
