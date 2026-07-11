## ADDED Requirements

### Requirement: User views community feed
The system SHALL display a community feed with two tabs: "Discover" (all posts) and "Following" (posts from followed users).

#### Scenario: User opens community feed
- **WHEN** the user navigates to the Community tab
- **THEN** the system SHALL fetch `GET /api/community/posts` and display a scrollable list of posts

#### Scenario: User switches to Following tab
- **WHEN** the user taps the "Following" tab
- **THEN** the system SHALL fetch `GET /api/community/feed/{userId}` and display posts from followed users

#### Scenario: Feed is empty
- **WHEN** no posts exist for the current tab
- **THEN** the system SHALL display an empty state message with a CTA to create a post

#### Scenario: User is not logged in
- **WHEN** an unauthenticated user views the feed
- **THEN** the system SHALL display posts but redirect to login on any write action (like, comment, follow)

---

### Requirement: User creates a post
The system SHALL allow authenticated users to create posts with a type and content.

#### Scenario: User creates a reflection post
- **WHEN** the user types content (max 500 chars), selects type "reflection", and taps "Publish"
- **THEN** the system SHALL POST to `/api/community/posts` with `{ userId, content, type: 'reflection' }` and navigate back on success

#### Scenario: User tries to publish empty content
- **WHEN** the content is empty
- **THEN** the publish button SHALL be disabled

#### Scenario: Post creation fails
- **WHEN** the API returns an error
- **THEN** the system SHALL display an error toast and keep the content intact

---

### Requirement: User views post detail with comments
The system SHALL display a post's full content and its comment list.

#### Scenario: User opens a post
- **WHEN** the user taps a post card
- **THEN** the system SHALL fetch `GET /api/community/posts/{postId}` and `GET /api/community/posts/{postId}/comments` in parallel

#### Scenario: User adds a comment
- **WHEN** the user types a comment and taps send
- **THEN** the system SHALL POST to `/api/community/posts/{postId}/comments` with `{ userId, content }`, clear the input, and refresh the comment list

#### Scenario: Comment shows author info
- **WHEN** comments are displayed
- **THEN** each comment SHALL show the author's nickname (from the API response)

---

### Requirement: User likes a post
The system SHALL allow authenticated users to like/unlike posts.

#### Scenario: User likes a post from the feed
- **WHEN** the user taps the heart icon on a post card
- **THEN** the system SHALL POST to `/api/community/posts/{postId}/like` and refresh the feed

#### Scenario: User likes a post from detail page
- **WHEN** the user taps the heart icon on the detail page
- **THEN** the system SHALL POST to `/api/community/posts/{postId}/like` and update the like count

---

### Requirement: User views another user's profile
The system SHALL display a user's profile with their posts and follow/unfollow capability.

#### Scenario: User opens a profile
- **WHEN** the user taps an author name/avatar
- **THEN** the system SHALL fetch `GET /api/community/users/{userId}` and `GET /api/community/users/{userId}/posts`

#### Scenario: Profile shows follow state from API
- **WHEN** the profile data includes `isFollowing: true`
- **THEN** the follow button SHALL show "Following" state

#### Scenario: User follows another user
- **WHEN** the user taps "Follow"
- **THEN** the system SHALL POST to `/api/community/users/{userId}/follow` with `{ followerId }` and optimistically update the UI

#### Scenario: User unfollows another user
- **WHEN** the user taps "Following" (to unfollow)
- **THEN** the system SHALL DELETE `/api/community/users/{userId}/follow?followerId={id}` and optimistically update the UI

---

## MODIFIED Requirements (mini-app bug fixes)

### Requirement: Follow state reflects actual relationship
The system SHALL display the correct follow state based on server data.

#### Scenario: mini-app loads user profile of already-followed user
- **WHEN** the user opens the profile of someone they already follow
- **THEN** the follow button SHALL show "Following" (not "Follow") based on API response

### Requirement: User profile posts navigate to detail
The system SHALL allow tapping posts on a user profile to view the post detail.

#### Scenario: User taps a post on profile page
- **WHEN** the user taps a post card on the user profile page
- **THEN** the system SHALL navigate to the post detail page

### Requirement: Comments display author information
The system SHALL show the author's nickname on each comment.

#### Scenario: Comment list shows author names
- **WHEN** comments are displayed on a post detail page
- **THEN** each comment SHALL display the author's nickname alongside the content
