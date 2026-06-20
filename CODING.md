# Campus Operations Intelligence Platform - Development Guidelines

## Project Overview

Campus Operations Intelligence Platform is an AI-powered university operations management system inspired by operational intelligence platforms.

The system helps universities:

* Detect classroom scheduling conflicts
* Detect room capacity violations
* Analyze classroom utilization
* Generate AI-powered recommendations
* Provide operational insights through dashboards

This project is being built as a portfolio project for the Palantir Build Now challenge.

---

# Tech Stack

## Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* PostgreSQL
* Lombok
* Maven

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Recharts

## AI

* OpenAI API

---

# Architecture Style

Use Feature-Based Architecture.

DO NOT organize code by layers globally.

Preferred structure:

src/main/java/com/amr/campus_operations_ai

room/
course/
schedule/
analytics/
recommendation/
common/

Each feature contains:

controller/
service/
repository/
entity/
dto/

Example:

room/
├── controller
├── service
├── repository
├── entity
└── dto

---

# Current MVP Scope

Only implement:

1. Room Management
2. Course Management
3. Schedule Management
4. Conflict Detection
5. Capacity Analysis
6. Recommendation Engine

Avoid adding:

* Student management
* Attendance systems
* Notification systems
* Multi-tenancy
* Complex authentication

unless explicitly requested.

---

# Database Entities

## Room

Fields:

* id
* name
* building
* floor
* capacity

---

## Course

Fields:

* id
* name
* code
* studentCount

---

## Schedule

Fields:

* id
* room
* course
* day
* startTime
* endTime

---

## Alert

Fields:

* id
* type
* message
* createdAt

Types:

* CAPACITY
* CONFLICT

---

## Recommendation

Fields:

* id
* currentRoom
* recommendedRoom
* reason

---

# Coding Rules

## General

* Follow SOLID principles.
* Keep code clean and readable.
* Prefer constructor injection.
* Never use field injection.
* Avoid static utility classes unless necessary.
* Use meaningful names.

---

## Controllers

Controllers should:

* Handle HTTP requests only.
* Never contain business logic.
* Delegate all logic to services.

Bad:

Controller performs calculations.

Good:

Controller calls service methods.

---

## Services

Services contain all business logic.

Examples:

* Capacity checking
* Conflict detection
* Recommendation generation

---

## Repositories

Repositories only access data.

Do not place business logic inside repositories.

---

## DTOs

Always use DTOs for requests and responses.

Do not expose JPA entities directly through APIs.

---

# API Design

Use REST conventions.

Examples:

GET /api/rooms

GET /api/rooms/{id}

POST /api/rooms

PUT /api/rooms/{id}

DELETE /api/rooms/{id}

---

# Conflict Detection Logic

A conflict exists when:

Same Room
AND
Same Day
AND
Time ranges overlap

Example:

Course A
10:00 - 11:00

Course B
10:30 - 11:30

Result:

Conflict Detected

---

# Capacity Analysis Logic

If:

course.studentCount > room.capacity

Create capacity alert.

Example:

Room Capacity = 40

Students = 72

Alert:

Room exceeds capacity by 32 students

---

# Recommendation Engine

Goal:

Suggest the best alternative room.

Criteria:

1. Available room
2. Capacity >= student count
3. Prefer closest capacity fit
4. Prefer same building

Example:

Current Room:

Capacity = 40

Students = 72

Available Rooms:

80
120
200

Recommendation:

Capacity 80 room

Reason:

Smallest room that satisfies capacity requirement

---

# Code Quality Requirements

Every new feature must include:

* DTOs
* Service layer
* Repository layer
* Validation
* Error handling

Avoid duplicated code.

Use descriptive method names.

Keep methods small and focused.

---

# Future Features

Planned later:

* AI recommendations using OpenAI
* Analytics dashboard
* Utilization reports
* Predictive room allocation
* University operations dashboard

Do not implement these unless requested.
