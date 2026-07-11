## ADDED Requirements

### Requirement: Users table stores WeChat OpenID
The system SHALL store the WeChat OpenID in the users table to associate WeChat accounts with existing user records.

#### Scenario: OpenID stored on first login
- **WHEN** a user logs in via WeChat for the first time
- **THEN** the system SHALL create a new user record with the returned openid and a generated token

#### Scenario: Existing user logs in via WeChat again
- **WHEN** a user with an existing wechat_openid logs in again
- **THEN** the system SHALL update the token and return the existing user info

### Requirement: Backend provides WeChat login API
The system SHALL provide a `POST /api/auth/wechat-login` endpoint.

#### Scenario: Successful WeChat login
- **WHEN** an authenticated client sends `{ code }` to `/api/auth/wechat-login`
- **THEN** the system SHALL call WeChat's code2session API, find or create the user, and return `{ status: 'success', data: { token, user: { id, nickname } } }`

#### Scenario: Invalid WeChat code
- **WHEN** the code is expired or invalid
- **THEN** the system SHALL return `{ status: 'error', message: 'Invalid WeChat code' }`

#### Scenario: WeChat API not configured
- **WHEN** WECHAT_APPID or WECHAT_SECRET env vars are not set
- **THEN** the system SHALL return a clear error message about configuration

### Requirement: Frontend conditionally shows WeChat login button
The system SHALL display a WeChat login button only when running in a WeChat mini-program environment.

#### Scenario: Running in WeChat environment
- **WHEN** `Taro.getEnv() === Taro.ENV_TYPE.WEAPP`
- **THEN** the auth page SHALL display the "WeChat一键登录" button as the primary option

#### Scenario: Running in H5 environment
- **WHEN** `Taro.getEnv() !== Taro.ENV_TYPE.WEAPP`
- **THEN** the auth page SHALL display the email registration/login form

#### Scenario: WeChat login flow completes
- **WHEN** the user taps the WeChat login button
- **THEN** the system SHALL call `wx.login()`, send the code to the backend, store the returned token in `useAuthStore`, and navigate to the home page