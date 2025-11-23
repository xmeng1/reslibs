# Project Context

## Purpose
ResLibs Unity Platform is an automated Unity Asset resource sharing platform that aggregates and distributes content from Baidu Netdisk to monetized file hosting services. The platform provides a clean resource discovery interface for users and simplified publishing workflow for administrators, generating revenue through premium file hosting commissions and website advertising.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js Server Actions, PostgreSQL, Prisma ORM, Clerk/NextAuth
- **Automation**: Python 3.11+, Google Gemini API, BaiduPCS-Go
- **Deployment**: Docker, Docker Compose, 1Panel, Vercel
- **Infrastructure**: Linux VPS, Cloudflare R2

## Project Conventions

### Code Style
- Use TypeScript strict mode with proper type definitions
- Follow Prettier configuration for consistent formatting
- Use kebab-case for file names and PascalCase for components
- Implement ESLint rules for code quality
- Use conventional commits for version control

### Architecture Patterns
- **Microservices**: Separate web frontend and automation bot services
- **API-first**: RESTful APIs with proper HTTP status codes
- **Database**: Relational design with proper indexing
- **File Storage**: Object storage for images, local temp for processing
- **Error Handling**: Comprehensive error logging and retry mechanisms

### Testing Strategy
- Unit tests for business logic (Jest)
- Integration tests for API endpoints
- E2E tests for critical user workflows
- Performance testing for file processing operations
- Load testing for high-traffic scenarios

### Git Workflow
- **Main branch**: Production-ready code
- **Feature branches**: `feature/description` naming convention
- **Conventional commits**: `type(scope): description` format
- **Pull requests**: Required for all changes with peer review
- **Automated CI**: Linting, testing, and deployment on merge

## Domain Context
- **Unity Assets**: 3D models, textures, scripts, tools for Unity game engine
- **File Hosting**: Monetized platforms like Rapidgator, Chengtong, Feimaoyun
- **SEO Optimization**: Content generation for search engine visibility
- **Resource Processing**: Download, extract, enhance, and distribute workflow
- **User Experience**: Clean, resource-focused interface similar to koudaizy.com

## Important Constraints
- **Cost Efficiency**: Use free tiers for APIs where possible (Gemini free tier)
- **Performance**: Handle large file downloads and uploads efficiently
- **Reliability**: Automated retry mechanisms for external service failures
- **Security**: Proper API key management and file validation
- **Scalability**: Container-based deployment for easy scaling
- **Legal Compliance**: Respect terms of service for integrated platforms

## External Dependencies
- **Baidu Netdisk**: Source file storage using BaiduPCS-Go
- **Google Gemini API**: AI-powered content generation (gemini-1.5-flash/pro)
- **File Hosting APIs**: Rapidgator (FTP), Chengtong (API/WebDAV), Feimaoyun (API)
- **Cloudflare R2**: Image storage with S3-compatible API
- **1Panel**: Server management and reverse proxy configuration
- **Vercel**: Web application hosting and CI/CD
