# Task Management API Documentation

Base URL: `http://localhost:3000`

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Authentication

### POST `/api/auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response `201`:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### POST `/api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response `200`:

```json
{
  "token": "<JWT_TOKEN>"
}
```

### GET `/api/auth/profile`

Response `200`:

```json
{
  "id": 1,
  "email": "user@example.com"
}
```

## Categories

Dynamic categories are created per user.

### POST `/api/categories`

Request:

```json
{
  "name": "Work"
}
```

Response `201`:

```json
{
  "_id": "6800e0ef4b6d9c0012345671",
  "name": "Work",
  "userId": 1,
  "createdAt": "2026-04-14T10:00:00.000Z",
  "updatedAt": "2026-04-14T10:00:00.000Z"
}
```

### GET `/api/categories`

Response `200`:

```json
[
  {
    "_id": "6800e0ef4b6d9c0012345671",
    "name": "Work",
    "userId": 1
  }
]
```

### PUT `/api/categories/:id`

Request:

```json
{
  "name": "Client Work"
}
```

### DELETE `/api/categories/:id`

Response `200`:

```json
{
  "message": "Category deleted"
}
```

When a category is deleted, matching tasks have their `category` cleared.

## Tags

Tags are user-managed, free-form text values.

### POST `/api/tags`

Request:

```json
{
  "name": "High Priority"
}
```

Response `201`:

```json
{
  "_id": "6800e0ef4b6d9c0012345672",
  "name": "High Priority",
  "userId": 1,
  "createdAt": "2026-04-14T10:01:00.000Z",
  "updatedAt": "2026-04-14T10:01:00.000Z"
}
```

### GET `/api/tags`

### PUT `/api/tags/:id`

### DELETE `/api/tags/:id`

Response `200`:

```json
{
  "message": "Tag deleted"
}
```

When a tag is deleted, it is removed from all matching tasks.

## Tasks

Tasks now support category and tag references plus reminder/webhook behavior.

### POST `/api/tasks`

Request:

```json
{
  "title": "Prepare sprint notes",
  "description": "Summarize blockers and updates",
  "dueDate": "2026-04-14T18:00:00.000Z",
  "status": "pending",
  "categoryId": "6800e0ef4b6d9c0012345671",
  "tagIds": ["6800e0ef4b6d9c0012345672"]
}
```

Response `201`:

```json
{
  "_id": "6800e19a4b6d9c0012345679",
  "title": "Prepare sprint notes",
  "description": "Summarize blockers and updates",
  "dueDate": "2026-04-14T18:00:00.000Z",
  "status": "pending",
  "userId": 1,
  "category": {
    "_id": "6800e0ef4b6d9c0012345671",
    "name": "Work"
  },
  "tags": [
    {
      "_id": "6800e0ef4b6d9c0012345672",
      "name": "High Priority"
    }
  ],
  "completedAt": null,
  "createdAt": "2026-04-14T10:05:00.000Z",
  "updatedAt": "2026-04-14T10:05:00.000Z"
}
```

Notes:

- `dueDate` is optional.
- If `dueDate` exists and status is `pending`, the reminder scheduler tracks it.
- If status is `completed`, `completedAt` is set and the analytics webhook is triggered.

### GET `/api/tasks`

Optional query parameters:

- `categoryId`
- `tagIds` as comma-separated ids

Examples:

- `/api/tasks?categoryId=6800e0ef4b6d9c0012345671`
- `/api/tasks?tagIds=6800e0ef4b6d9c0012345672,6800e0ef4b6d9c0012345673`
- `/api/tasks?categoryId=6800e0ef4b6d9c0012345671&tagIds=6800e0ef4b6d9c0012345672`

### GET `/api/tasks/:id`

Returns a single populated task.

### PUT `/api/tasks/:id`

Request example:

```json
{
  "status": "completed"
}
```

Behavior:

- If the task transitions to `completed`, any scheduled reminder is cancelled.
- The completion webhook is sent with retry logic.
- If `dueDate` changes, the reminder is rescheduled.

### DELETE `/api/tasks/:id`

Response `200`:

```json
{
  "message": "Task deleted"
}
```

Deleting a task also cancels any in-memory reminder for that task.

## Reminder Notification Payload

When a reminder fires, the app logs an event and optionally POSTs:

```json
{
  "event": "task.reminder",
  "taskId": "6800e19a4b6d9c0012345679",
  "title": "Prepare sprint notes",
  "dueDate": "2026-04-14T18:00:00.000Z",
  "userId": 1
}
```

## Completion Webhook Payload

When a task becomes completed, the app POSTs:

```json
{
  "event": "task.completed",
  "taskId": "6800e19a4b6d9c0012345679",
  "title": "Prepare sprint notes",
  "completedAt": "2026-04-14T10:30:00.000Z",
  "userId": 1
}
```

Retry behavior:

- Attempt 1 immediately
- Attempt 2 after 1 second
- Attempt 3 after 2 seconds
- Final failure is logged after the last retry path

## Logging

Notification and webhook activity is written to:

- `logs/notifications.log`

## Common Error Responses

### Validation error

```json
{
  "message": "\"name\" is required"
}
```

### Unauthorized

```json
{
  "message": "Invalid token"
}
```

### Missing resource

```json
{
  "message": "Task not found"
}
```
