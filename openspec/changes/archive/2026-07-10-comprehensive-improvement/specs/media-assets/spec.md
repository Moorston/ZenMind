## ADDED Requirements

### Requirement: Media files are organized in server/media/
The system SHALL organize all media files in `server/media/` directory with a clear structure.

#### Scenario: Media directory structure exists
- **WHEN** the project is set up for media
- **THEN** `server/media/covers/` SHALL contain 15 course cover images and `server/media/audio/` SHALL contain 15 audio files

### Requirement: seed-media script uploads files to TOS
The system SHALL use the existing `seed-media.ts` script to upload media and update database URLs.

#### Scenario: seed-media runs successfully
- **WHEN** TOS environment variables are configured and `pnpm seed:media` is executed
- **THEN** the script SHALL upload all files from `server/media/` to TOS and update all courses' `cover_url` and `audio_url` in the database

#### Scenario: TOS not configured
- **WHEN** TOS environment variables are missing and `pnpm seed:media` is executed
- **THEN** the script SHALL log a clear error message about missing TOS configuration

#### Scenario: Media upload partially fails
- **WHEN** some files fail to upload (network error, invalid file)
- **THEN** the script SHALL log the failed files and continue with the remaining files, providing a summary at the end

### Requirement: Development environment provides local media
The system SHALL serve media files locally during development when TOS is not configured.

#### Scenario: Dev server serves local media
- **WHEN** the backend starts in development mode
- **THEN** it SHALL serve files from `server/media/` at `/media` path, as already implemented in `main.ts`

### Requirement: Hardcoded fallback URLs are removed after TOS upload
The system SHALL remove the hardcoded Unsplash/SoundHelix URLs after real TOS URLs are in place.

#### Scenario: All courses have TOS URLs
- **WHEN** all 15 courses have their `cover_url` and `audio_url` updated to real TOS URLs
- **THEN** the hardcoded `meditationCourses` array in `meditation.ts` SHALL be cleared or updated to reference TOS URLs