# Seiri - AI Cloud File Manager
A full-stack personal cloud storage system featuring AI-driven organization and Enterprise-grade architecture.
## Tech Stack
- Backend: NestJS 
- Frontend: Angular (Signals, RxJS)
- Database: PostgreSQL + TypeORM
- Cloud & AI: AWS S3, AI API

## Design Principles
- Direct-to-S3 Uploads: Using S3 Pre-signed URLs to offload file traffic from the server to the cloud.
- Hybrid Schema: Relational SQL for structure combined with JSONB for flexible, AI-generated metadata and tags.
- Tree Architecture: Efficient hierarchical folder management using TypeORM Tree Entities.

## Roadmap & Implementation Plan
### 1. Data Layer & Schema Design
- Define Core Entities (FileSystemItem, FileMetadata, User).
- Establish Database Relationships and Tree Structure.

### 2. Backend Foundation (NestJS)
- Core Infrastructure: Logging, Migrations, Global Exceptions Filter, Validation Pipes, ESLint, and Swagger API Documentation.

- DTOs & Interfaces: Defining strict data contracts for all requests and responses.

- Authentication: Secure user registration and JWT-based login.

- API Skeleton: Building Controllers and Services with Mock functions for file uploads, retrieval, and management.

### 3. Frontend Development (Angular)
- Setting up the Angular workspace and core services.

- Implementing the UI for file browsing and upload tracking.

### 4. Cloud Integration (AWS S3)
- Pre-signed URLs: Implementing secure, direct-to-S3 upload and download flows.

- Cloud Security: Configuring S3 CORS policies and IAM permissions.

- Automation: Setting up S3 Lifecycle Rules for efficient storage management.

### 5. Intelligence Layer (AI Integration)
- Background Processing: Integrating AI models for content analysis.

- Polling Mechanism: Implementing a client-side polling system to track AI processing status.

- Typed AI Responses: Mapping AI outputs to structured Interfaces for consistent data storage in JSONB.
