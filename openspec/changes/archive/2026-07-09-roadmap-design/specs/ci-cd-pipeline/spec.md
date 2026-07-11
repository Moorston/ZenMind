## ADDED Requirements

### Requirement: GitHub Actions CI pipeline runs on push/PR
The system SHALL have a CI workflow that runs tests on every push and pull request to main/develop branches.

#### Scenario: Push to main triggers CI
- **WHEN** code is pushed to the `main` branch
- **THEN** GitHub Actions SHALL run: install deps, run server tests, run type checks

#### Scenario: PR blocks merge on test failure
- **WHEN** a PR has failing tests
- **THEN** the CI workflow SHALL fail and block the merge

### Requirement: CD pipeline deploys on main merge
The system SHALL have a CD workflow that builds and deploys the server when code is merged to main.

#### Scenario: Main merge triggers deploy
- **WHEN** a PR is merged to `main`
- **THEN** GitHub Actions SHALL: build Docker image, push to registry, deploy to server via SSH

#### Scenario: Deploy uses secrets for credentials
- **WHEN** the deploy step runs
- **THEN** it SHALL use GitHub Secrets for Docker registry, SSH key, and server host

### Requirement: Test results reported in PR
The system SHALL display test results as a PR check.

#### Scenario: All tests pass
- **WHEN** all 41+ tests pass
- **THEN** the PR check SHALL show green with test count

#### Scenario: Test fails
- **WHEN** any test fails
- **THEN** the PR check SHALL show red with failure details
