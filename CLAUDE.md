# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Therapist Center — a full-stack web application for managing a therapy day care center (sessions, messaging, schedules) with role-based portals for Admin, Therapist, and Parent users.

- **Backend**: .NET 10, Clean Architecture, CQRS with MediatR
- **Frontend**: Angular 21, standalone components
- **Database**: SQL Server (EF Core Code-First) on local instance `MALSARKHI-PC`, database `TherapistCenterDB`
- **Auth**: JWT + ASP.NET Identity (roles: Admin, Therapist, Parent)

## Build & Run

### Backend (from repo root)

```bash
dotnet build                                                    # Build entire solution
dotnet run --project src/TherapistCenter.API                    # Run API on port 5078
dotnet ef migrations add <Name> --project src/TherapistCenter.Infrastructure --startup-project src/TherapistCenter.API
dotnet ef database update --project src/TherapistCenter.Infrastructure --startup-project src/TherapistCenter.API
```

### Frontend (from `therapist-center-ui/`)

```bash
npm install      # Install dependencies
npm start        # Dev server on port 4200
npm run build    # Production build
npm test         # Run tests
```

## Architecture

### Backend — 4-Layer Clean Architecture

```
TherapistCenter.sln
└── src/
    ├── TherapistCenter.Domain/          # Entities, enums, repository interfaces (no dependencies)
    ├── TherapistCenter.Application/     # CQRS features, DTOs, FluentValidation, MediatR handlers
    ├── TherapistCenter.Infrastructure/  # EF Core DbContext, Identity, repositories, JWT service
    └── TherapistCenter.API/             # Controllers, middleware, Program.cs config
```

**Dependency flow**: API → Infrastructure → Application → Domain

### Key Backend Patterns

- **CQRS**: Features organized as `Features/{Domain}/{Commands|Queries}/` with MediatR handlers
- **Validation**: FluentValidation validators auto-registered via `ValidationBehavior<,>` pipeline
- **Repositories**: `IGenericRepository<T>` base + specific repos, coordinated via `IUnitOfWork`
- **Soft delete**: `BaseEntity.IsDeleted` with EF global query filters
- **Response format**: All endpoints return `ApiResponse<T>` with `Success`, `Message`, `Data`, `Errors`
- **Mapping**: Extension methods in `MappingExtensions.cs` (no AutoMapper)
- **Error handling**: Centralized `ExceptionHandlingMiddleware`

### Frontend — Angular Standalone

```
therapist-center-ui/src/app/
├── landing/      # Public pages (home, programs, contact, etc.)
├── auth/         # Login
├── admin/        # Admin portal (dashboard, students, staff, messages, settings)
├── therapist/    # Therapist portal (sessions, broadcast, messages)
├── parent/       # Parent portal (dashboard, messages, schedule, reports)
├── core/         # Guards, services, interceptors, models
└── shared/       # Reusable components
```

- **Auth flow**: JWT stored in `localStorage` (`auth_token`), added to requests via `authInterceptor`
- **Guards**: `authGuard` (valid token) + `roleGuard` (role-based access)
- **API layer**: `ApiService` wraps HTTP calls, extracts `.data` from `ApiResponse<T>`
- **API base URL**: `http://localhost:5078/api` (hardcoded in `ApiService`)
- **Routing**: Lazy-loaded per portal, role-based redirects after login

### Adding a New Feature (typical workflow)

1. **Domain**: Add/update entity in `Domain/Entities/`
2. **Application**: Create DTOs, Command/Query + Handler + Validator in `Application/Features/`
3. **Infrastructure**: Add repo if needed, update `DbContext`, create migration
4. **API**: Add controller endpoint, inject MediatR, send command/query

## Database Seeding

On startup, `Program.cs` auto-creates roles and seeds a default admin account (`admin@therapistcenter.com`). Migrations run automatically in development.

## Ports

| Service  | Port |
|----------|------|
| API      | 5078 |
| Angular  | 4200 |

CORS is configured to allow `http://localhost:4200`.
