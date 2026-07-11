## ADDED Requirements

### Requirement: Users can create posts
The system SHALL allow authenticated users to create posts with content and optional course reference.

#### Scenario: Create a reflection post
- **WHEN** a user sends `POST /api/community/posts` with `{ content, type: 'reflection' }`
- **THEN** it SHALL create a post with the user's ID and return it

#### Scenario: Create a checkin post linked to course
- **WHEN** a user sends `POST /api/community/posts` with `{ content, type: 'checkin', courseId }`
- **THEN** it SHALL create a post linked to the specified course

### Requirement: Users can comment on posts
The system SHALL allow authenticated users to add comments to posts.

#### Scenario: Add a comment
- **WHEN** a user sends `POST /api/community/posts/:id/comments` with `{ content }`
- **THEN** it SHALL create a comment and increment the post's commentsCount

#### Scenario: List comments for a post
- **WHEN** `GET /api/community/posts/:id/comments` is called
- **THEN** it SHALL return comments ordered by createdAt ascending

### Requirement: Users can like/unlike posts
The system SHALL allow authenticated users to toggle likes on posts.

#### Scenario: Like a post
- **WHEN** a user sends `POST /api/community/posts/:id/like`
- **THEN** it SHALL create a like record and increment the post's likesCount

#### Scenario: Unlike a post
- **WHEN** a user sends `DELETE /api/community/posts/:id/like`
- **THEN** it SHALL delete the like record and decrement the post's likesCount

### Requirement: Users can follow/unfollow other users
The system SHALL allow authenticated users to follow and unfollow other users.

#### Scenario: Follow a user
- **WHEN** a user sends `POST /api/community/users/:id/follow`
- **THEN** it SHALL create a follow relationship

#### Scenario: Get followers list
- **WHEN** `GET /api/community/users/:id/followers` is called
- **THEN** it SHALL return the list of users following the specified user

### Requirement: Community feed with filtering
The system SHALL provide a feed endpoint that returns posts with optional filtering.

#### Scenario: Get global feed
- **WHEN** `GET /api/community/posts` is called
- **THEN** it SHALL return posts ordered by createdAt descending with pagination

#### Scenario: Get feed filtered by type
- **WHEN** `GET /api/community/posts?type=checkin` is called
- **THEN** it SHALL return only checkin-type posts
