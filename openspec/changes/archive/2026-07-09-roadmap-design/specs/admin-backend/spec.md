## ADDED Requirements

### Requirement: Admin statistics endpoint
The system SHALL provide `GET /api/admin/stats` returning aggregated platform statistics.

#### Scenario: Get platform stats
- **WHEN** an admin user requests `/api/admin/stats`
- **THEN** it SHALL return `{ totalUsers, totalCourses, totalSessions, activeUsersToday }`

### Requirement: Admin user management
The system SHALL provide endpoints for admins to list users and update user roles.

#### Scenario: List users with pagination
- **WHEN** an admin requests `GET /api/admin/users?page=1&pageSize=20`
- **THEN** it SHALL return paginated user list with id, email, nickname, role, createdAt

#### Scenario: Update user role
- **WHEN** an admin sends `PUT /api/admin/users/:id/role` with `{ role: 'editor' }`
- **THEN** it SHALL update the user's role and return success

#### Scenario: Non-admin cannot access admin endpoints
- **WHEN** a regular user attempts to access `/api/admin/*`
- **THEN** the system SHALL return HTTP 403 Forbidden

### Requirement: Admin content management
The system SHALL provide admin-only endpoints for creating, updating, and deleting courses, series, and instructors.

#### Scenario: Admin creates a course
- **WHEN** an admin sends `POST /api/admin/courses` with valid course data
- **THEN** it SHALL create the course and return it with HTTP 201

#### Scenario: Admin deletes a course
- **WHEN** an admin sends `DELETE /api/admin/courses/:id`
- **THEN** it SHALL delete the course and cascade-delete related records

### Requirement: Admin push broadcast
The system SHALL provide an endpoint for admins to send broadcast push notifications.

#### Scenario: Admin sends broadcast
- **WHEN** an admin sends `POST /api/admin/push/broadcast` with `{ title, body }`
- **THEN** it SHALL queue notifications to all enabled push token users
