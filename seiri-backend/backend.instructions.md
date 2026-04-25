---
title: "Seiri Backend — Developer Instructions"
description: "Backend-specific developer instructions and conventions for Seiri."
---

Seiri Backend — Developer Instructions (Backend-specific)

Overview
- Backend is built with NestJS (v11), TypeScript, and TypeORM (Postgres). It exposes auth, user, file, and file-system-item APIs and includes health checks and Swagger documentation.

Repository conventions
- Modules are feature-scoped under `src/` (e.g., `auth/`, `user/`, `file/`). Follow existing patterns when adding modules.
- Entities live next to their module: `*.entity.ts`. DTOs live as `*.dto.ts` and controllers as `*.controller.ts`.
- Services contain business logic and are unit-testable (use dependency injection and small methods).

Adding a new feature module
1. Create module directory under `src/your-feature/`.
2. Add `your-feature.module.ts`, `your-feature.controller.ts`, `your-feature.service.ts`.
3. Define entity in `your-feature.entity.ts` and DTOs in `your-feature.dto.ts`.
4. Register the module in `src/app.module.ts`.
5. Add migrations if you change DB schema: `npm run migrations:gen -- YourMigrationName` and then `npm run migrations:run`.

Authentication
- JWT auth via `@nestjs/jwt` and Passport strategies in `auth/jwt.strategy.ts`.
- Use `current-user.decorator.ts` to obtain the authenticated user in controllers.
- Keep `JWT_SECRET` and token expiry in environment configuration.

Database & migrations
- Data source: `src/database/data-source.ts` — used by TypeORM CLI and migration scripts.
- Generate migration: `npm run migrations:gen`.
- Apply migrations: `npm run migrations:run`.
- Revert last migration: `npm run migrations:revert`.

Configuration & environment
- Centralized config via `@nestjs/config` and helpers in `core/app.config.ts`.
- Use environment variables for secrets and DB settings; do not commit `.env` to source control.

Validation & error handling
- Global validation pipe is configured in `core/validation.pipe.ts`.
- Global exception filter and mapping interceptor live in `core/global-exception.filter.ts` and `core/mapper.interceptor.ts`.

Logging & monitoring
- Winston is used with rotating file transport (`core/winston.config.ts`).
- Health endpoints live in `core/health.controller.ts` using `@nestjs/terminus`.

Swagger & API docs
- Swagger bootstrap is in `core/swagger.config.ts`. Use `npm run start:dev` and visit `/api` (or configured path) to open docs.

Testing
- Unit tests use Jest. Place unit tests next to the implementation as `*.spec.ts` and run `npm run test`.
- For integration/e2e tests, use `npm run test:e2e`. Ensure a test database is configured or use test containers.

Code-style and linting
- Run `npm run format` then `npm run lint` before committing changes.
- Follow existing TypeScript and NestJS idioms (no inline any, prefer typed DTOs, avoid large controllers).

Debugging locally
- Start in debug/watch: `npm run start:debug` or `npm run start:dev` and attach your IDE debugger to the Node inspector if needed.

CI / Deployment notes
- Build artifacts produced by `npm run build` are placed in `dist/` — deploy `dist/` with the same env vars used locally.
- Ensure database migrations run as part of deploy or CI before starting the new release.

Common file locations to inspect when making backend changes
- `src/main.ts` — app bootstrap, global middlewares
- `src/app.module.ts` — module registration
- `src/core/*` — global configuration, pipes, interceptors, logging, swagger
- `src/database/data-source.ts` — TypeORM connection used by migrations
- `src/auth/*` — authentication logic and strategies

Troubleshooting tips
- If TypeORM cannot connect: check `DB_*` env vars and that Postgres is reachable.
- If migrations don't run: ensure `src/database/data-source.ts` exports a valid `DataSource` and `npm run migrations:run` uses the same path.
- If DTO validation fails unexpectedly: check the `ValidationPipe` config in `core/validation.pipe.ts`.
