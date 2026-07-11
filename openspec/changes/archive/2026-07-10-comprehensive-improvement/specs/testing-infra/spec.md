## ADDED Requirements

### Requirement: Vitest is configured for backend testing
The system SHALL use vitest for testing with a proper configuration file.

#### Scenario: vitest.config.ts exists
- **WHEN** the test framework is set up
- **THEN** `server/vitest.config.ts` SHALL exist with `@/` path alias resolution and proper test environment

#### Scenario: vitest runs successfully
- **WHEN** `pnpm --filter server test` is executed
- **THEN** vitest SHALL discover and run test files matching `**/*.test.ts`

### Requirement: Auth module has unit tests
The system SHALL have unit tests for the auth service covering registration, login, and code verification.

#### Scenario: Auth register happy path
- **WHEN** `AuthService.register()` is called with valid email, password, nickname, and verification code
- **THEN** the test SHALL verify that a new user is created, password is bcrypt-hashed, and token is returned

#### Scenario: Auth register with duplicate email
- **WHEN** `AuthService.register()` is called with an email that already exists
- **THEN** the test SHALL verify that `null` is returned

#### Scenario: Auth login correct password
- **WHEN** `AuthService.login()` is called with correct email and password
- **THEN** the test SHALL verify that a token and user info are returned

#### Scenario: Auth login wrong password
- **WHEN** `AuthService.login()` is called with correct email but wrong password
- **THEN** the test SHALL verify that `null` is returned

### Requirement: Courses module has unit tests
The system SHALL have unit tests for the courses service.

#### Scenario: Courses findAll with pagination
- **WHEN** `CoursesService.findAll()` is called with page 1 and pageSize 10
- **THEN** the test SHALL verify the response contains `data`, `total`, `page`, and `pageSize` fields

#### Scenario: Courses findById with instructor data
- **WHEN** `CoursesService.findById()` is called with a valid course ID
- **THEN** the test SHALL verify the response includes the instructor object

### Requirement: Progress module has unit tests
The system SHALL have unit tests for the progress service.

#### Scenario: Progress upsert creates new record
- **WHEN** `ProgressService.updateProgress()` is called for a user+course pair that doesn't exist yet
- **THEN** the test SHALL verify a new progress record is created

#### Scenario: Progress upsert updates existing record
- **WHEN** `ProgressService.updateProgress()` is called for an existing user+course pair
- **THEN** the test SHALL verify the position and updatedAt fields are updated

### Requirement: API E2E tests exist for core endpoints
The system SHALL have end-to-end tests that test the actual HTTP endpoints.

#### Scenario: GET /api/courses returns 200
- **WHEN** a request is sent to GET /api/courses
- **THEN** the E2E test SHALL verify a 200 response with `{ status: 'success', data: [...] }` format

#### Scenario: Auth register flow works end-to-end
- **WHEN** a full auth flow is executed (send code → register → login)
- **THEN** the E2E test SHALL verify each step returns success