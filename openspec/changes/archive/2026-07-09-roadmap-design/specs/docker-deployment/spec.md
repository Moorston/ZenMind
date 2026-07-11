## ADDED Requirements

### Requirement: Multi-stage Docker build for server
The system SHALL provide a Dockerfile that builds the NestJS server in a multi-stage process (build + runtime).

#### Scenario: Docker image builds successfully
- **WHEN** `docker build -t zenmind-server ./server` is executed
- **THEN** it SHALL produce a working image under 200MB

#### Scenario: Container starts and serves API
- **WHEN** `docker run -p 3000:3000 zenmind-server` is executed
- **THEN** the API SHALL be accessible at http://localhost:3000/api/health

### Requirement: docker-compose orchestrates server + redis
The system SHALL provide a `docker-compose.yml` that starts server, redis, and nginx services.

#### Scenario: docker-compose up starts all services
- **WHEN** `docker-compose up -d` is executed
- **THEN** all three services (server, redis, nginx) SHALL start successfully

#### Scenario: Server connects to Redis
- **WHEN** the server starts with redis service available
- **THEN** it SHALL connect to Redis at `redis://redis:6379`

### Requirement: Health check endpoint
The system SHALL provide a `GET /api/health` endpoint that returns server status.

#### Scenario: Health check returns OK
- **WHEN** `/api/health` is requested
- **THEN** it SHALL return `{ status: 'success', data: '<ISO timestamp>' }`

#### Scenario: Docker HEALTHCHECK uses health endpoint
- **WHEN** the container is running
- **THEN** Docker SHALL poll `/api/health` every 30 seconds to verify liveness

### Requirement: Environment variables documented
The system SHALL document all required environment variables in a `.env.example` file.

#### Scenario: .env.example exists with all variables
- **WHEN** a developer clones the repo
- **THEN** `.env.example` SHALL list all required variables with comments explaining each
