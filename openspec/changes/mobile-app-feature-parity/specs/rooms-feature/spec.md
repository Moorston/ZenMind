## ADDED Requirements

### Requirement: User views available rooms
The system SHALL display a list of active meditation rooms.

#### Scenario: User opens rooms list
- **WHEN** the user navigates to the rooms screen
- **THEN** the system SHALL fetch `GET /api/rooms` and display rooms with `status !== 'ended'`

#### Scenario: Room card shows info
- **WHEN** rooms are displayed
- **THEN** each card SHALL show room name, status badge (waiting/playing), and participant count

#### Scenario: Rooms list is empty
- **WHEN** no active rooms exist
- **THEN** the system SHALL display an empty state with a CTA to create a room

---

### Requirement: User creates a room
The system SHALL allow authenticated users to create a new meditation room.

#### Scenario: User creates a room
- **WHEN** the user taps "Create Room" and provides a room name
- **THEN** the system SHALL POST to `/api/rooms` with `{ name, hostId }` and join the newly created room

#### Scenario: User is not logged in
- **WHEN** an unauthenticated user tries to create a room
- **THEN** the system SHALL redirect to login

---

### Requirement: User joins a room
The system SHALL allow users to join an active room and enter synchronized playback.

#### Scenario: User joins a waiting room
- **WHEN** the user taps "Join" on a room card
- **THEN** the system SHALL navigate to `PlayerScreen` with `roomId` parameter, which activates room mode

#### Scenario: PlayerScreen enters room mode
- **WHEN** `PlayerScreen` receives a `roomId` parameter
- **THEN** the system SHALL connect via `useRoom` hook, emit `joinRoom` event, and display participant count

---

### Requirement: Playback synchronization in room
The system SHALL synchronize playback state across all room participants.

#### Scenario: Host starts playback
- **WHEN** the host starts playing a course
- **THEN** the system SHALL emit `playbackSync` events with `{ roomId, currentTime, isPlaying }` to the server

#### Scenario: Participant receives playback update
- **WHEN** the server relays a `playbackUpdate` event
- **THEN** the participant's player SHALL update `currentTime` and `isPlaying` to match the host

#### Scenario: User leaves room
- **WHEN** the user navigates away from the player or the app goes to background
- **THEN** the system SHALL emit `leaveRoom` before closing the socket connection

---

### Requirement: WebSocket uses socket.io-client
The system SHALL use `socket.io-client` for WebSocket communication on both platforms.

#### Scenario: socket.io-client connects to server
- **WHEN** `useRoom.connect(userId)` is called
- **THEN** the system SHALL create a `socket.io-client` connection to the server's `/ws/rooms` namespace

#### Scenario: socket.io-client handles reconnection
- **WHEN** the connection drops temporarily
- **THEN** socket.io-client's built-in reconnection SHALL attempt to restore the connection

#### Scenario: mini-app migrates from raw WebSocket
- **WHEN** the mini-app `useRoom` hook is updated
- **THEN** it SHALL use `socket.io-client` instead of raw `WebSocket`, maintaining the same API surface (`connect`, `disconnect`, `sendPlaybackSync`)

---

## MODIFIED Requirements

### Requirement: mini-app useRoom hook uses socket.io-client
The mini-app `useRoom` hook SHALL be migrated from raw WebSocket to socket.io-client.

#### Scenario: Hook API remains unchanged
- **WHEN** other components use `useRoom`
- **THEN** the returned API (`participants`, `playbackState`, `connect`, `disconnect`, `sendPlaybackSync`) SHALL remain identical

#### Scenario: Leave message sent before disconnect
- **WHEN** `disconnect()` is called
- **THEN** the system SHALL emit `leaveRoom` BEFORE closing the socket connection (fixing the current bug where leave is attempted after close)
