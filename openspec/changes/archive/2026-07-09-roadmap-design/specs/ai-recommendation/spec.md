## ADDED Requirements

### Requirement: Time-based recommendation rules
The system SHALL recommend courses based on the current time of day.

#### Scenario: Morning recommendations
- **WHEN** a user requests recommendations between 5:00-11:59
- **THEN** the system SHALL prioritize 'mindfulness' category courses

#### Scenario: Afternoon recommendations
- **WHEN** a user requests recommendations between 12:00-17:59
- **THEN** the system SHALL prioritize 'breathing' category courses

#### Scenario: Evening recommendations
- **WHEN** a user requests recommendations between 18:00-4:59
- **THEN** the system SHALL prioritize 'sleep' category courses

### Requirement: Preference-based recommendations
The system SHALL recommend courses based on the user's stored preference (sleep/anxiety/focus).

#### Scenario: User has preference set
- **WHEN** a user has preference='sleep' and requests recommendations
- **THEN** the system SHALL return 'sleep' category courses regardless of time

### Requirement: Exclude completed courses
The system SHALL exclude courses the user has already completed from recommendations.

#### Scenario: User completed course A
- **WHEN** recommendations are generated for a user who completed course A
- **THEN** course A SHALL NOT appear in the recommendation list

### Requirement: Similar courses recommendation
The system SHALL recommend courses similar to a given course based on category and level.

#### Scenario: Get similar courses
- **WHEN** `GET /api/recommendations/similar/:courseId` is called
- **THEN** it SHALL return up to 5 courses with the same category, excluding the given course

### Requirement: Trending courses
The system SHALL provide a list of trending courses based on recent play count.

#### Scenario: Get trending courses
- **WHEN** `GET /api/recommendations/trending` is called
- **THEN** it SHALL return the top 10 courses ordered by recent play count
