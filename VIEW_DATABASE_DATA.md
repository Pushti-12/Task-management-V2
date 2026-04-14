# 📊 How to View Your Database Data

## Option 1: Using Command Line (Recommended for Quick Checks)

### PostgreSQL Users (SQL Queries)

```bash
# View all users
docker exec postgres psql -U postgres -d task_management -c "SELECT id, email FROM users;"

# View specific user
docker exec postgres psql -U postgres -d task_management -c "SELECT * FROM users WHERE email='test@example.com';"

# View user count
docker exec postgres psql -U postgres -d task_management -c "SELECT COUNT(*) as total_users FROM users;"

# View users with timestamps
docker exec postgres psql -U postgres -d task_management -c "SELECT id, email, \"createdAt\" FROM users ORDER BY \"createdAt\" DESC;"
```

### MongoDB Tasks (JavaScript Queries)

```bash
# View all tasks
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find().pretty()"

# View tasks for specific user (userId: 1)
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find({userId: 1}).pretty()"

# View task count
docker exec mongo mongosh --quiet task_management --eval "db.tasks.countDocuments()"

# View tasks by status
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find({status: 'pending'}).pretty()"
```

## Option 2: Interactive Access

### PostgreSQL Interactive Shell

```bash
# Enter PostgreSQL interactive shell
docker exec -it postgres psql -U postgres -d task_management

# Once inside, run SQL commands:
# SELECT * FROM users;
# SELECT COUNT(*) FROM users;
# \d users (show table structure)
# \q (quit)
```

### MongoDB Interactive Shell

```bash
# Enter MongoDB interactive shell
docker exec -it mongo mongosh task_management

# Once inside, run MongoDB commands:
# db.tasks.find().pretty()
# db.tasks.countDocuments()
# db.tasks.find({_id: ObjectId("...")})
# exit (quit)
```

## Option 3: Visual Database Clients

### DBeaver (PostgreSQL + MongoDB)
- Download: https://dbeaver.io
- Create new connection to localhost:5432 (PostgreSQL)
- Create new connection to localhost:27017 (MongoDB)

### MongoDB Compass
- Download: https://www.mongodb.com/products/compass
- Connection string: `mongodb://localhost:27017`

### pgAdmin (PostgreSQL only)
```bash
docker run -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4
# Visit: http://localhost:5050
```

## Data Structure

### PostgreSQL - users table
- `id` (INTEGER): Auto-incrementing primary key
- `email` (VARCHAR): Unique email address
- `password` (VARCHAR): Hashed password (bcrypt)
- `createdAt` (TIMESTAMP): When user registered
- `updatedAt` (TIMESTAMP): Last update time

### MongoDB - tasks collection
- `_id` (ObjectId): Auto-generated unique ID
- `title` (String): Task title
- `description` (String): Task description
- `dueDate` (Date): Due date for task
- `status` (String): "pending" or "completed"
- `userId` (Number): Reference to PostgreSQL user ID
- `createdAt` (Date): When task was created
- `updatedAt` (Date): Last update time
- `__v` (Number): Version field (from Mongoose)

## Quick Reference Commands

```bash
# See everything
docker exec postgres psql -U postgres -d task_management -c "SELECT * FROM users;"
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find().pretty()"

# Count records
docker exec postgres psql -U postgres -d task_management -c "SELECT COUNT(*) FROM users;"
docker exec mongo mongosh --quiet task_management --eval "db.tasks.countDocuments()"

# Create test data (via API)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123"}'

# Then view via database
docker exec postgres psql -U postgres -d task_management -c "SELECT * FROM users WHERE email='newuser@example.com';"
```

## Troubleshooting

- **"database does not exist"**: Make sure containers are running: `docker ps`
- **Connection refused**: Check PostgreSQL is listening on port 5432
- **Authentication failed**: Verify credentials in docker-compose.yml
- **No data appears**: Ensure you've registered users and created tasks via the API