# Task Management API

Assignment 3 extension of the existing Task Management backend. The project keeps the original architecture and adds:

- Real-time task reminders using an in-memory scheduler
- User-managed categories and tags
- Task filtering by category and tags
- Simulated completion webhooks with retry and exponential backoff
- Updated API documentation for the new resources

## Tech Stack

- Node.js
- Express.js
- PostgreSQL with Sequelize for users
- MongoDB with Mongoose for tasks, categories, and tags
- JWT auth with `jsonwebtoken`
- Password hashing with `bcryptjs`
- Validation with `joi`

## What Changed For Assignment 3

- Tasks now support optional `dueDate`, `category`, `tags`, and `completedAt`
- Categories are dynamically created per user through REST endpoints
- Tags are free-form and managed through REST endpoints
- A reminder is scheduled whenever a pending task has a `dueDate`
- When a task becomes `completed`, the API POSTs a payload to a configurable analytics webhook
- Webhook delivery retries up to 3 times with exponential backoff
- Reminder activity and webhook events are logged to `logs/notifications.log`

## Design Choices

- Dynamic categories: categories are user-created instead of hard-coded so the API stays flexible for different workflows.
- Separate category and tag collections: this makes CRUD endpoints simple and lets tasks reference normalized records instead of duplicated text.
- In-memory reminder scheduling: this matches the assignment allowance for a lightweight scheduler and keeps the solution easy to run locally.
- Reminder update/cancellation: reminders are rescheduled whenever a task's due date changes and cancelled when a task is completed or deleted.
- Webhook retries: completion webhooks retry 3 times with 1s, 2s, and 4s backoff delays before logging a final failure.

## Prerequisites

- Node.js 18 or newer
- Docker and Docker Compose

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL and MongoDB

```bash
docker-compose up -d
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and set values as needed:

```env
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=task_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
MONGO_URI=mongodb://localhost:27017/task_management
ANALYTICS_WEBHOOK_URL=https://webhook.site/your-id
REMINDER_WEBHOOK_URL=https://webhook.site/your-id
```

Notes:

- `ANALYTICS_WEBHOOK_URL` is used when a task becomes completed.
- `REMINDER_WEBHOOK_URL` is optional and is called when a reminder fires.
- If either webhook URL is empty, the event is still logged locally.

### 4. Run the API

```bash
npm start
```

The API will run at `http://localhost:3000`.

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Tasks

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Filtering:

- `GET /api/tasks?categoryId=<categoryId>`
- `GET /api/tasks?tagIds=<tagId1>,<tagId2>`
- `GET /api/tasks?categoryId=<categoryId>&tagIds=<tagId1>,<tagId2>`

### Categories

- `POST /api/categories`
- `GET /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Tags

- `POST /api/tags`
- `GET /api/tags`
- `PUT /api/tags/:id`
- `DELETE /api/tags/:id`

Detailed request/response examples live in `API_DOCUMENTATION.md` and `openapi.yaml`.

## Reminder Flow

1. Create or update a task with a future `dueDate`.
2. The app schedules a reminder for 1 hour before the due date.
3. If the task is updated, the old reminder is cancelled and a new one is scheduled.
4. If the task is completed or deleted before the reminder time, the reminder is cancelled.
5. When triggered, the reminder is logged and may be POSTed to `REMINDER_WEBHOOK_URL`.

## Completion Webhook Flow

1. A task status changes from `pending` to `completed`.
2. The API sends a POST request to `ANALYTICS_WEBHOOK_URL`.
3. On failure, it retries up to 3 times with exponential backoff.
4. Delivery attempts and failures are logged to `logs/notifications.log`.

## Suggested Demo Steps

For the assignment video, you can show:

1. Register and log in.
2. Create categories and tags.
3. Create a task with category, tags, and a near-term due date.
4. Filter tasks by category and tags.
5. Mark a task as completed and show the webhook payload arriving at your webhook URL.
6. Show `logs/notifications.log` for reminder and webhook traces.

## Verification

The updated files passed `node --check` syntax validation for the server, controllers, and new services.
