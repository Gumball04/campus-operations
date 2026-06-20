# API Reference - Starter

This file contains a minimal API reference generated from the backend controllers.

Base URL: `http://localhost:8080`

Endpoints:

- `GET /api/analytics/capacity` - detect room capacity violations
- `GET /api/analytics/conflicts` - detect schedule conflicts

- `GET /api/courses` - list courses
- `GET /api/courses/{id}` - get a course
- `POST /api/courses` - create a course
- `PUT /api/courses/{id}` - update a course
- `DELETE /api/courses/{id}` - delete a course

- `GET /api/rooms` - list rooms
- `GET /api/rooms/{id}` - get room
- `POST /api/rooms` - create room
- `PUT /api/rooms/{id}` - update room
- `DELETE /api/rooms/{id}` - delete room

- `GET /api/schedules` - list schedules
- `GET /api/schedules/{id}` - get schedule
- `POST /api/schedules` - create schedule
- `PUT /api/schedules/{id}` - update schedule
- `DELETE /api/schedules/{id}` - delete schedule

Notes

- All endpoints return an `ApiResponse<T>` wrapper with `success`, `message`, `data`, and `timestamp`.
