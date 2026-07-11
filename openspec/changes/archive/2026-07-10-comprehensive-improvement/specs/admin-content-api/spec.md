## ADDED Requirements

### Requirement: Authenticated admin creates a course
The system SHALL allow authenticated users with `role = 'admin'` or `role = 'editor'` to create a new meditation course.

#### Scenario: Admin creates a course successfully
- **WHEN** an admin user sends a POST request to `/api/courses` with valid course data (title, description, category, level, duration, coverUrl, audioUrl)
- **THEN** the system SHALL create the course and return `{ status: 'success', data: { id, ...courseData } }` with HTTP 201

#### Scenario: Non-admin user tries to create a course
- **WHEN** a regular user sends a POST request to `/api/courses`
- **THEN** the system SHALL return HTTP 403 Forbidden

#### Scenario: Unauthenticated request to create a course
- **WHEN** a request without a valid Authorization header sends a POST to `/api/courses`
- **THEN** the system SHALL return HTTP 401 Unauthorized

#### Scenario: Create course with invalid data
- **WHEN** an admin sends POST `/api/courses` with missing required fields (e.g., no title)
- **THEN** the system SHALL return `{ status: 'error', message: '...', errors: [...] }` with HTTP 400

### Requirement: Authenticated admin updates a course
The system SHALL allow admin/editor users to update an existing course.

#### Scenario: Admin updates course title and duration
- **WHEN** an admin sends PUT `/api/courses/:id` with `{ title, duration }`
- **THEN** the system SHALL update the course and return the updated course data

#### Scenario: Update non-existent course
- **WHEN** an admin sends PUT `/api/courses/non-existent-id`
- **THEN** the system SHALL return `{ status: 'error', message: 'Course not found' }`

### Requirement: Authenticated admin deletes a course
The system SHALL allow admin/editor users to delete a course.

#### Scenario: Admin deletes a course
- **WHEN** an admin sends DELETE `/api/courses/:id`
- **THEN** the system SHALL delete the course and cascade-delete related series_courses rows

#### Scenario: Delete a course with existing user progress
- **WHEN** an admin deletes a course that users have progress records on
- **THEN** the system SHALL also delete the related progress records (ON DELETE CASCADE)

### Requirement: Authenticated admin manages series
The system SHALL allow admin/editor users to create, update, delete series, and manage course associations.

#### Scenario: Admin creates a series
- **WHEN** an admin sends POST `/api/series` with valid series data
- **THEN** the system SHALL create the series and return it with HTTP 201

#### Scenario: Admin updates a series
- **WHEN** an admin sends PUT `/api/series/:id` with updated fields
- **THEN** the system SHALL update and return the series

#### Scenario: Admin deletes a series
- **WHEN** an admin sends DELETE `/api/series/:id`
- **THEN** the system SHALL delete the series and cascade-disassociate its courses

#### Scenario: Admin links courses to a series
- **WHEN** an admin sends POST `/api/series/:id/courses` with `{ courseIds: ['...'] }`
- **THEN** the system SHALL create series_courses entries for each courseId

### Requirement: Authenticated admin manages instructors
The system SHALL allow admin/editor users to create, update, and delete instructors.

#### Scenario: Admin creates an instructor
- **WHEN** an admin sends POST `/api/instructors` with name, avatarUrl, bio, voiceType
- **THEN** the system SHALL create the instructor and return it

#### Scenario: Admin updates an instructor
- **WHEN** an admin sends PUT `/api/instructors/:id`
- **THEN** the system SHALL update and return the instructor

#### Scenario: Admin deletes an instructor
- **WHEN** an admin sends DELETE `/api/instructors/:id`
- **THEN** the system SHALL set `instructor_id = NULL` on associated courses and delete the instructor

### Requirement: AdminGuard enforces role check
The system SHALL use an AdminGuard that checks the authenticated user's role against allowed roles.

#### Scenario: Admin with role 'admin' passes check
- **WHEN** a user with `role = 'admin'` and a valid token accesses an admin endpoint
- **THEN** the system SHALL allow access

#### Scenario: Editor user passes check
- **WHEN** a user with `role = 'editor'` and a valid token accesses an admin endpoint
- **THEN** the system SHALL allow access

#### Scenario: Regular user fails check
- **WHEN** a user with `role = 'user'` and a valid token accesses an admin endpoint
- **THEN** the system SHALL return HTTP 403 Forbidden