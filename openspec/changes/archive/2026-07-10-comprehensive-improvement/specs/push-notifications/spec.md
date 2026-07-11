## ADDED Requirements

### Requirement: WeChat mini-program sends template messages
The system SHALL subscribe to and send WeChat template messages for daily meditation reminders.

#### Scenario: User sets a reminder in WeChat
- **WHEN** a user enables the daily reminder and saves the time
- **THEN** the system SHALL call `wx.requestSubscribeMessage()` with a configured template ID

#### Scenario: Backend cron job sends scheduled reminders
- **WHEN** the server clock matches a user's configured reminder time
- **THEN** the system SHALL call the WeChat template message API to deliver the notification

### Requirement: Expo mobile app sends local notifications
The system SHALL use `expo-notifications` to schedule local notifications at the user's configured reminder time.

#### Scenario: User sets a reminder in the mobile app
- **WHEN** a user enables the daily reminder and saves the time
- **THEN** the system SHALL schedule a daily repeating local notification via `scheduleNotificationAsync()`

#### Scenario: User disables the reminder
- **WHEN** a user disables the daily reminder
- **THEN** the system SHALL cancel all scheduled notifications for that user

#### Scenario: Notification permission is denied
- **WHEN** the user has not granted notification permission
- **THEN** the system SHALL prompt for permission and handle denial gracefully

### Requirement: H5 page uses Web Notification API
The system SHALL use the browser's Web Notification API for H5 reminders.

#### Scenario: User sets a reminder in H5
- **WHEN** a user enables the daily reminder
- **THEN** the system SHALL request `Notification.permission` and schedule notification via setTimeout

#### Scenario: Browser doesn't support notifications
- **WHEN** the browser does not support the Notification API
- **THEN** the system SHALL silently accept the settings without throwing errors

### Requirement: push_tokens table stores preferences
The system SHALL store user push notification preferences in a `push_tokens` table.

#### Scenario: Reminder saved
- **WHEN** the user saves reminder settings
- **THEN** the system SHALL upsert the user's push preferences (enabled, time, platform) into `push_tokens`

#### Scenario: Reminder disabled
- **WHEN** the user disables the reminder
- **THEN** the system SHALL mark the user's push preference as disabled