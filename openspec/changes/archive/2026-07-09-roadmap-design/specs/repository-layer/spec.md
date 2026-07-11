## ADDED Requirements

### Requirement: BaseRepository abstract class provides common CRUD operations
The system SHALL provide an abstract `BaseRepository<T>` class that defines standard data access methods (findById, findAll, create, update, delete) using Drizzle ORM.

#### Scenario: Repository instantiation with Drizzle database
- **WHEN** a repository is instantiated
- **THEN** it SHALL receive a `BetterSQLite3Database` instance via dependency injection

#### Scenario: findById returns entity or null
- **WHEN** `findById(id)` is called with a valid ID
- **THEN** it SHALL return the entity object or `null` if not found

#### Scenario: findAll with optional query filters
- **WHEN** `findAll(query)` is called with filter parameters
- **THEN** it SHALL return filtered results; without filters, return all records

### Requirement: CoursesRepository extends BaseRepository
The system SHALL provide a `CoursesRepository` that implements course-specific queries (findByCategory, findBySeries, findByInstructor).

#### Scenario: findByCategory returns matching courses
- **WHEN** `findByCategory('breathing')` is called
- **THEN** it SHALL return all courses with category='breathing'

#### Scenario: findBySeries returns ordered courses
- **WHEN** `findBySeries(seriesId)` is called
- **THEN** it SHALL return courses ordered by `orderInSeries`

### Requirement: Service layer uses Repository instead of direct ORM
The system SHALL refactor all Service classes to use Repository methods instead of direct Drizzle ORM calls.

#### Scenario: CoursesService.create delegates to repository
- **WHEN** `CoursesService.create(data)` is called
- **THEN** it SHALL call `CoursesRepository.create(data)` and return the result

#### Scenario: Service contains only business logic
- **WHEN** a Service method is inspected
- **THEN** it SHALL NOT contain any Drizzle ORM query code (SELECT, INSERT, UPDATE, DELETE)
