## ADDED Requirements

### Requirement: Unified ApiResponse format
The system SHALL return all API responses in a unified format: `{ status: 'success'|'error', data?, message?, errors?, meta? }`.

#### Scenario: Successful response with data
- **WHEN** an API endpoint succeeds
- **THEN** it SHALL return `{ status: 'success', data: <result> }` with HTTP 200/201

#### Scenario: Error response with message
- **WHEN** an API endpoint fails with a business error
- **THEN** it SHALL return `{ status: 'error', message: '<description>' }` with appropriate HTTP status code

#### Scenario: Validation error with field details
- **WHEN** input validation fails
- **THEN** it SHALL return `{ status: 'error', errors: [{ field, message }] }` with HTTP 400

### Requirement: Global exception filter converts exceptions to ApiResponse
The system SHALL use a global `ApiExceptionFilter` that catches all exceptions and converts them to the unified ApiResponse format.

#### Scenario: HttpException is caught
- **WHEN** a `NotFoundException` is thrown
- **THEN** the filter SHALL return `{ status: 'error', message: 'Not Found' }` with HTTP 404

#### Scenario: Unknown exception is caught
- **WHEN** an unhandled exception occurs
- **THEN** the filter SHALL return `{ status: 'error', message: 'Internal server error' }` with HTTP 500

### Requirement: Swagger/OpenAPI documentation auto-generated
The system SHALL auto-generate interactive API documentation at `/api/docs` using `@nestjs/swagger`.

#### Scenario: Swagger UI accessible
- **WHEN** a user navigates to `http://localhost:3000/api/docs`
- **THEN** the Swagger UI SHALL display all endpoints with request/response schemas

#### Scenario: Bearer auth token support in Swagger
- **WHEN** a user clicks "Authorize" in Swagger UI
- **THEN** they SHALL be able to enter a Bearer token for authenticated requests
