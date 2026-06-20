# Architecture - Campus Operations AI

Overview

This project is split into two main parts:

- `backend/` - Spring Boot API (Java 21, Maven)
- `frontend/` - Planned React application (scaffold)

Backend

- Package root: `com.amr.campus_operations_ai`
- Modules:
  - `analytics` - provides operational analytics endpoints
  - `course` - course management (controller, service, repository, entity)
  - `room` - room management
  - `schedule` - schedule management
  - `common` - shared utilities (config, exception handling, response wrapper)

Communication

- REST APIs exposed under `/api/*` (see API.md)

Deployment

- The backend runs on port 8080 by default and uses PostgreSQL as its datastore.
