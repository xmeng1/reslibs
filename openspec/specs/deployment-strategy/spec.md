# Deployment Strategy

### Requirement: Infrastructure Setup
The system SHALL run on a standardized Linux infrastructure with container orchestration.

#### Scenario: Base Infrastructure
- **WHEN** setting up the deployment environment
- **THEN** the system uses: Linux VPS with 1Panel management panel, PostgreSQL database via 1Panel, Docker & Docker Compose for containerization, domain `unity.reslibs.com`

#### Scenario: Service Architecture
- **WHEN** defining application services
- **THEN** the system deploys: `web` service (Next.js frontend & backend), `bot` service (Python automation worker)

### Requirement: Multi-Environment Deployment
The system SHALL support separate production and testing environments.

#### Scenario: Production Environment
- **WHEN** deploying to production
- **THEN** the system runs at `https://unity.reslibs.com` via 1Panel reverse proxy to localhost:3000 Docker container, with `NODE_ENV=production`

#### Scenario: Testing Environment
- **WHEN** deploying for testing
- **THEN** the system runs at `http://unity.reslibs.com:3001` with direct port exposure and SQLite database

### Requirement: Container Configuration
The system SHALL use properly configured Docker containers for all services.

#### Scenario: Web Service Container
- **WHEN** deploying the web application
- **THEN** the container builds from project root, restarts automatically, exposes port 3000, uses environment file, mounts persistent volume for uploads

#### Scenario: Bot Service Container
- **WHEN** deploying automation worker
- **THEN** the container builds from dedicated Dockerfile.bot, restarts unless stopped, uses environment file, mounts volumes for downloads and uploads, does not expose ports externally

### Requirement: Volume Management
The system SHALL properly manage persistent data storage.

#### Scenario: Upload Persistence
- **WHEN** storing user uploads
- **THEN** the system mounts `./public/uploads:/app/public/uploads` for persistent image storage

#### Scenario: Temporary File Handling
- **WHEN** processing downloads
- **THEN** the bot container mounts `./temp_downloads:/app/temp` for temporary file storage

#### Scenario: Configuration Persistence
- **WHEN** accessing external services
- **THEN** the system mounts `~/.config/rclone:/root/.config/rclone` for Rclone configuration persistence

### Requirement: Environment Configuration
The system SHALL use environment-specific configurations.

#### Scenario: Environment Variable Management
- **WHEN** configuring services
- **THEN** both containers share the same `.env` file containing database URLs, API keys, and service credentials

#### Scenario: Network Configuration
- **WHEN** setting up service networking
- **THEN** containers share the same Docker network for internal communication

### Requirement: Deployment Automation
The system SHALL support automated deployment processes.

#### Scenario: Docker Compose Deployment
- **WHEN** deploying the application
- **THEN** administrators can run `docker compose up -d` to start all services

#### Scenario: Service Updates
- **WHEN** updating the application
- **THEN** the system supports rolling updates without significant downtime