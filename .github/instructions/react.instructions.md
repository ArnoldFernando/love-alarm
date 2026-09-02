---

applyTo: "apps/mobile/**/*.{js,jsx,ts,tsx}"
description: "React and React Native development standards for the mobile application."
---------------------------------------------------------------------------------------

# React / React Native Development Instructions

## General

* Use TypeScript for all new React and React Native code.
* Prefer functional components and React hooks.
* Follow the existing project architecture before introducing new patterns.
* Reuse existing components, hooks, utilities, services, and types.
* Avoid unnecessary dependencies.
* Do not rewrite working components unless required.
* Keep components focused and maintainable.

## React Native / Expo

* Follow Expo and React Native best practices.
* Use Expo APIs when they provide the required functionality.
* Respect Android and iOS platform differences.
* Use `Platform.select()` or platform-specific files when behavior genuinely differs.
* Handle permissions explicitly and gracefully.
* Do not assume device capabilities are always available.
* Handle offline, slow-network, timeout, and API failure scenarios.
* Avoid blocking the JavaScript thread with expensive operations.

## Component Design

* Keep UI components focused on presentation.
* Move reusable business or data logic into hooks/services.
* Avoid large components containing API calls, business logic, navigation, and UI all together.
* Prefer composition over deeply nested conditional logic.
* Use clear and descriptive component names.

## Hooks

* Follow React hook rules.
* Never conditionally call hooks.
* Keep custom hooks focused on one responsibility.
* Clean up subscriptions, listeners, timers, and event handlers.
* Avoid unnecessary `useEffect` usage.
* Do not use `useEffect` to derive values that can be calculated directly.
* Add correct dependencies to effects.

## State Management

* Keep local UI state local when possible.
* Use the project's existing state-management solution.
* Do not introduce a new state-management library without justification.
* Avoid duplicating server state in multiple places.
* Clearly distinguish between:

  * UI state
  * local device state
  * server state
  * authentication state

## API Integration

* React Native must communicate with the Laravel backend through the application's API layer.
* Do not access the database directly from the mobile application.
* Reuse the existing API client/service.
* Do not hardcode API URLs.
* Use environment/configuration values for API endpoints.
* Handle:

  * loading
  * success
  * empty states
  * validation errors
  * authentication errors
  * network errors
  * server errors
  * timeouts

## Authentication

* Never hardcode credentials or tokens.
* Never log authentication tokens.
* Use the application's established secure authentication/storage mechanism.
* Do not store sensitive authentication data in insecure plain-text storage when a secure storage mechanism is available.
* Handle expired sessions consistently.
* Redirect users appropriately when authentication expires.

## Navigation

* Follow the project's existing navigation structure.
* Do not create duplicate routes.
* Verify route names before navigating.
* Handle authenticated and unauthenticated navigation states.
* Avoid navigation logic being duplicated across multiple components.

## Forms

* Validate user input before submission for good UX.
* Backend validation remains authoritative.
* Display useful validation errors.
* Prevent duplicate submissions.
* Disable or otherwise protect submit actions while requests are processing.

## Lists

* Use `FlatList` or `SectionList` for large lists.
* Avoid rendering large collections using `ScrollView.map()`.
* Provide stable keys.
* Avoid unnecessary re-renders.
* Use pagination or virtualization when appropriate.

## Performance

* Avoid unnecessary re-renders.
* Do not prematurely use `useMemo` or `useCallback`.
* Profile performance before optimizing complex components.
* Optimize large lists.
* Avoid expensive calculations during render.
* Clean up timers, subscriptions, listeners, and animations.

## Accessibility

* Provide accessible labels for interactive elements.
* Ensure buttons and touch targets are usable.
* Do not communicate important information through color alone.
* Support appropriate text scaling where possible.
* Ensure interactive elements have meaningful accessibility roles.

## Error Handling

When fixing a React Native error:

1. Identify the actual root cause.
2. Check the complete error and stack trace.
3. Inspect related components, hooks, services, and API responses.
4. Fix the underlying problem.
5. Do not hide errors with empty catch blocks.
6. Verify that the fix works on the relevant platform.

## Code Quality

* Prefer simple readable code.
* Avoid deeply nested conditional expressions.
* Avoid `any` unless there is a justified reason.
* Keep TypeScript types close to the domain they describe.
* Remove unused imports and variables.
* Follow existing formatting and linting rules.

## Important Rule

Do not move business logic from Laravel into React Native merely because it is easier to implement on the client.

Laravel is the source of truth for server-side business rules.
