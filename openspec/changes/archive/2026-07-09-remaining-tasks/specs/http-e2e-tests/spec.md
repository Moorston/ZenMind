## ADDED Requirements

### Requirement: HTTP E2E tests use Guard override
The system SHALL use `overrideGuard(AuthGuard).useClass(TestAuthGuard)` to bypass auth in HTTP layer tests.

#### Scenario: Test creates app with overridden guard
- **WHEN** `createHttpTestApp()` is called
- **THEN** the NestJS test app SHALL have AuthGuard overridden with TestAuthGuard