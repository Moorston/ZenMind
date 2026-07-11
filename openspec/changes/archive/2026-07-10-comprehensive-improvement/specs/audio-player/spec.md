## MODIFIED Requirements

### Requirement: Audio player uses single InnerAudioContext instance
The system SHALL maintain exactly one `InnerAudioContext` instance throughout the component lifecycle.

#### Scenario: Player initializes on mount
- **WHEN** the player component mounts with a courseId param
- **THEN** the system SHALL create a single `InnerAudioContext` and start playing the course

#### Scenario: User pauses and resumes
- **WHEN** the user taps the pause button then taps play
- **THEN** the system SHALL pause/resume the existing audio instance without creating a new one

#### Scenario: Player unmounts
- **WHEN** the user navigates away from the player
- **THEN** the system SHALL save the current playback position to the backend API and destroy the audio instance

### Requirement: Player saves progress with real user ID
The system SHALL use the authenticated user's ID (from `useAuthStore`) for progress tracking, not the hardcoded string `'local'`.

#### Scenario: Authenticated user completes a course
- **WHEN** a course finishes playing
- **THEN** the system SHALL call `CourseAPI.completeCourse()` with the user's actual ID from `useAuthStore`

#### Scenario: Authenticated user pauses mid-playback
- **WHEN** the user pauses or navigates away
- **THEN** the system SHALL call `CourseAPI.updateProgress()` with the user's actual ID and current position

#### Scenario: Unauthenticated user plays
- **WHEN** no user is logged in
- **THEN** the system SHALL skip API calls for progress (no userId available)

### Requirement: Player displays current time indicator
The system SHALL show the current playback position in `M:SS / M:SS` format below the progress slider.

#### Scenario: Course is playing
- **WHEN** a course is playing and the currentTime updates
- **THEN** the system SHALL display formatted currentTime and duration below the seek slider