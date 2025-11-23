# Technology Stack

### Requirement: Frontend Technology Stack
The system SHALL use modern web technologies for the user interface.

#### Scenario: Framework Selection
- **WHEN** developing the frontend
- **THEN** the system uses Next.js 14+ with App Router, TypeScript, Tailwind CSS, Shadcn/UI, and Lucide React icons

#### Scenario: Development Environment
- **WHEN** setting up the frontend project
- **THEN** developers have access to TypeScript type checking, hot reloading, and component-based development

### Requirement: Backend Technology Stack
The system SHALL provide a robust API and data management layer.

#### Scenario: Backend Framework
- **WHEN** implementing server-side logic
- **THEN** the system uses Next.js Server Actions for lightweight operations or NestJS for complex business logic

#### Scenario: Database Configuration
- **WHEN** storing application data
- **THEN** the system uses PostgreSQL (Supabase/Neon) for production, SQLite for testing, with Prisma ORM for data access

#### Scenario: Authentication System
- **WHEN** managing user access
- **THEN** the system implements authentication using Clerk or NextAuth

### Requirement: Automation Bot Technology Stack
The system SHALL use Python for automation tasks with AI integration.

#### Scenario: Python Runtime
- **WHEN** executing automation scripts
- **THEN** the system runs on Python 3.11+ with appropriate package management

#### Scenario: AI Service Integration
- **WHEN** generating content automatically
- **THEN** the system integrates Google Gemini API using the `gemini-1.5-flash` or `gemini-1.5-pro` model with the `google-generativeai` Python SDK

#### Scenario: Cost-Effective AI Usage
- **WHEN** configuring AI services
- **THEN** the system uses Gemini's free tier (1500 daily requests) with pay-as-you-go disabled for automated script reliability

### Requirement: Deployment Technology Stack
The system SHALL be deployed using modern cloud infrastructure.

#### Scenario: Web Application Deployment
- **WHEN** deploying the frontend/backend
- **THEN** the system uses Vercel for hosting and continuous deployment

#### Scenario: Worker Server Deployment
- **WHEN** running automation scripts
- **THEN** the system operates on a local high-performance PC or high-bandwidth VPS for large file processing