## ADDED Requirements

### Requirement: WebSocket gateway for room-based communication
The system SHALL provide a NestJS WebSocket Gateway that manages room-based real-time communication.

#### Scenario: Client joins a room
- **WHEN** a client emits `joinRoom` with `{ roomId, userId }`
- **THEN** the gateway SHALL add the client to the room and broadcast `userJoined` to other participants

#### Scenario: Client leaves a room
- **WHEN** a client emits `leaveRoom` with `{ roomId, userId }`
- **THEN** the gateway SHALL remove the client and broadcast `userLeft` to remaining participants

### Requirement: Playback state synchronization
The system SHALL synchronize playback state (currentTime, isPlaying) across all participants in a room.

#### Scenario: Host plays/pauses
- **WHEN** the host emits `playbackSync` with `{ roomId, currentTime, isPlaying }`
- **THEN** all other participants SHALL receive `playbackUpdate` with the same state

#### Scenario: Playback sync includes timestamp
- **WHEN** playback state is broadcast
- **THEN** it SHALL include a `timestamp` field for latency compensation

### Requirement: Room management API
The system SHALL provide REST endpoints for creating, listing, and managing meditation rooms.

#### Scenario: Create a room
- **WHEN** `POST /api/rooms` is called with `{ name, courseId, maxParticipants }`
- **THEN** it SHALL create a room with status='waiting' and the caller as host

#### Scenario: List active rooms
- **WHEN** `GET /api/rooms` is called
- **THEN** it SHALL return rooms with status='waiting' or 'playing', including participant count

### Requirement: Room data model
The system SHALL store room and participant data in the database.

#### Scenario: Room record created
- **WHEN** a room is created via API
- **THEN** a record SHALL be inserted into the `rooms` table with hostId, courseId, status, maxParticipants

#### Scenario: Participant record created on join
- **WHEN** a user joins a room
- **THEN** a record SHALL be inserted into `room_participants` with roomId, userId, role
