## ADDED Requirements

### Requirement: Application fetches courses from backend API first
The system SHALL prioritize backend API data over local hardcoded data when displaying course lists.

#### Scenario: Backend initialized with data
- **WHEN** the useCoursesStore is initialized and has course data
- **THEN** the system SHALL return courses mapped from backend API data via `toMeditationCourse()`

#### Scenario: Backend not yet initialized
- **WHEN** the useCoursesStore has not completed initialization
- **THEN** the system SHALL return local hardcoded `meditationCourses` as fallback AND trigger async initialization

#### Scenario: Backend returns empty data
- **WHEN** the store is initialized but courses array is empty
- **THEN** the system SHALL return local hardcoded data

### Requirement: Repository layer abstracts data access logic
The system SHALL provide a `repositories/` directory with dedicated repositories for courses, series, and instructors.

#### Scenario: CourseRepository.getAll()
- **WHEN** any page calls `CourseRepository.getAll()`
- **THEN** the repository SHALL check store state and return data per the backend-first-fallback strategy

#### Scenario: SeriesRepository.getRecommended()
- **WHEN** any page calls `SeriesRepository.getRecommended()`
- **THEN** the repository SHALL return recommended series from backend or fallback

#### Scenario: InstructorRepository.getAll()
- **WHEN** any page calls `InstructorRepository.getAll()`
- **THEN** the repository SHALL return instructors from backend or fallback

### Requirement: Pages no longer import meditationCourses directly
The system SHALL remove direct imports of `meditationCourses` from page-level components.

#### Scenario: Home page loads courses
- **WHEN** the home page renders
- **THEN** it SHALL call repository methods instead of importing `meditationCourses` directly from store

#### Scenario: Discover page filters courses
- **WHEN** the discover page filters by category or searches
- **THEN** it SHALL filter data obtained from the repository, not the hardcoded array

### Requirement: White noise data remains frontend-only
The system SHALL keep the 4 white noise sources as frontend static data.

#### Scenario: White noise grid renders
- **WHEN** the white noise grid displays
- **THEN** it SHALL use the locally defined `whiteNoises` array