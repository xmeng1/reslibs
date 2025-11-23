# Third Party Integrations

### Requirement: Baidu Netdisk Integration
The system SHALL integrate with Baidu Netdisk for source file access.

#### Scenario: Authentication Setup
- **WHEN** configuring Baidu Netdisk access
- **THEN** administrators provide `BDUSS` and `STOKEN` in environment variables

#### Scenario: File Operations
- **WHEN** accessing Baidu Netdisk
- **THEN** the system uses `BaiduPCS-Go` compiled binary for file listing and downloads

### Requirement: AI Content Generation Integration
The system SHALL integrate with AI services for content generation.

#### Scenario: AI Provider Selection
- **WHEN** configuring AI services
- **THEN** the system prioritizes Google Gemini Pro 1.5 for high free quotas and long context windows

#### Scenario: API Configuration
- **WHEN** setting up AI integration
- **THEN** the system uses `GEMINI_API_KEY` environment variable for authentication

#### Scenario: Content Generation Request
- **WHEN** generating content
- **THEN** the system sends file metadata to AI service and receives structured JSON response with title, description, and tags

### Requirement: File Hosting Integration
The system SHALL integrate with multiple monetized file hosting services.

#### Scenario: Rapidgator Integration
- **WHEN** uploading to Rapidgator
- **THEN** the system uses FTP upload with configured host, username, and password

#### Scenario: Chengtong Integration
- **WHEN** using Chengtong hosting
- **THEN** the system integrates through developer API or WebDAV interface

#### Scenario: Feimaoyun Integration
- **WHEN** uploading to Feimaoyun
- **THEN** the system uses provided API interface for file uploads and link generation

### Requirement: Image Hosting Integration
The system SHALL integrate with object storage for image hosting.

#### Scenario: Cloud Storage Selection
- **WHEN** choosing image hosting
- **THEN** the system uses Cloudflare R2 for S3-compatible API with no egress fees

#### Scenario: Image Upload Workflow
- **WHEN** storing preview images
- **THEN** the system uploads images to R2 and generates public URLs for website display

### Requirement: External Service Configuration
The system SHALL securely manage external service credentials.

#### Scenario: Environment Variable Management
- **WHEN** configuring external services
- **THEN** all API keys and credentials are stored in environment variables, not in code

#### Scenario: Service Health Monitoring
- **WHEN** using external APIs
- **THEN** the system implements retry logic and error handling for service interruptions