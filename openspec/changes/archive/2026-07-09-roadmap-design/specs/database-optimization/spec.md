## ADDED Requirements

### Requirement: Database indexes for frequently queried columns
The system SHALL add indexes to columns that are frequently used in WHERE clauses.

#### Scenario: push_tokens has enabled+reminder_time index
- **WHEN** the push scheduler queries for due reminders
- **THEN** it SHALL use `idx_push_tokens_enabled_time` composite index instead of full table scan

#### Scenario: courses has category index
- **WHEN** courses are filtered by category
- **THEN** it SHALL use `idx_courses_category` index

#### Scenario: users has token index
- **WHEN** the auth guard validates a token
- **THEN** it SHALL use `idx_users_token` index for fast lookup

### Requirement: Push scheduler uses caching instead of full scan
The system SHALL optimize the push scheduler to use in-memory caching with periodic refresh instead of querying the database every minute.

#### Scenario: Cache refreshes every 5 minutes
- **WHEN** 5 minutes have passed since last cache refresh
- **THEN** the scheduler SHALL query the database and rebuild the in-memory reminder cache

#### Scenario: Scheduler uses cache for minute checks
- **WHEN** the cron job fires every minute
- **THEN** it SHALL look up the current time in the cache instead of querying the database

### Requirement: Drizzle schema defines indexes declaratively
The system SHALL define database indexes in the Drizzle schema files using `index()` declarations.

#### Scenario: Index appears in migration
- **WHEN** `drizzle-kit generate` is run after adding an index
- **THEN** the migration SQL SHALL include `CREATE INDEX` statement
