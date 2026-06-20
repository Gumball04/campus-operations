# Database - Starter

This project uses PostgreSQL in production and development.

Connection (default in `application.properties`):

```
spring.datasource.url=jdbc:postgresql://localhost:5433/palantir
spring.datasource.username=postgres
spring.datasource.password=123
```

Migrations

- No migration tool included yet (Flyway/Liquibase recommended for production)

Schema Notes

- `courses` table maps to `Course` entity
- `rooms` table maps to `Room` entity
- `schedules` table maps to `Schedule` entity

Indexes and constraints should be added via migrations for production.
