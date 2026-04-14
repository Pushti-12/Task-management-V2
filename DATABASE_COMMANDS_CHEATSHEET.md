# 📋 Database Commands Cheat Sheet

## PostgreSQL - Quick Commands

### Copy-Paste Ready Commands

```bash
# View all users with their IDs and emails
docker exec postgres psql -U postgres -d task_management -c "SELECT id, email FROM users;"

# View all user details (including passwords)
docker exec postgres psql -U postgres -d task_management -c "SELECT * FROM users;"

# Count total users
docker exec postgres psql -U postgres -d task_management -c "SELECT COUNT(*) as total_users FROM users;"

# View specific user
docker exec postgres psql -U postgres -d task_management -c "SELECT * FROM users WHERE id=1;"

# View users sorted by registration date (newest first)
docker exec postgres psql -U postgres -d task_management -c "SELECT id, email, \"createdAt\" FROM users ORDER BY \"createdAt\" DESC;"

# View table structure
docker exec postgres psql -U postgres -d task_management -c "\d users"
```

## MongoDB - Quick Commands

### Copy-Paste Ready Commands

```bash
# View all tasks with formatting
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find().pretty()"

# Count total tasks
docker exec mongo mongosh --quiet task_management --eval "db.tasks.countDocuments()"

# View tasks for specific user (userId: 1)
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find({userId: 1}).pretty()"

# View only completed tasks
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find({status: 'completed'}).pretty()"

# View only pending tasks
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find({status: 'pending'}).pretty()"

# View task titles only
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find({}, {title: 1, status: 1}).pretty()"

# View latest task
docker exec mongo mongosh --quiet task_management --eval "db.tasks.find().sort({createdAt: -1}).limit(1).pretty()"
```

## Interactive Mode (More Flexibility)

### PostgreSQL Interactive

```bash
# Start interactive PostgreSQL shell
docker exec -it postgres psql -U postgres -d task_management

# Then type SQL commands:
SELECT * FROM users;
SELECT COUNT(*) FROM users;
SELECT * FROM users WHERE email LIKE '%@example.com';
\d users
\dt
\q  # quit
```

### MongoDB Interactive

```bash
# Start interactive MongoDB shell
docker exec -it mongo mongosh task_management

# Then type JavaScript commands:
db.tasks.find().pretty()
db.tasks.find({status: "pending"}).pretty()
db.tasks.countDocuments()
db.tasks.find().sort({createdAt: -1}).pretty()
exit  # quit
```

## View Data Via API

### Get Users via API
You can't directly retrieve all users via API (for security), but you can:

```bash
# Get your own profile (if authenticated)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Tasks via API
```bash
# Get all your tasks
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'

# Get specific task
curl -X GET http://localhost:3000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'
```

## Compare Data Sources

| Operation | API | Database Command | Best For |
|-----------|-----|------------------|----------|
| View own profile | ✅ | ❌ | Regular use |
| View own tasks | ✅ | ❌ | Regular use |
| View all users | ❌ | ✅ | Admin/debugging |
| View all tasks | ❌ | ✅ | Admin/debugging |
| Count records | ❌ | ✅ | Statistics |
| Debug data | ❌ | ✅ | Troubleshooting |

## Common Queries

### Find user by email
```bash
docker exec postgres psql -U postgres -d task_management \
  -c "SELECT * FROM users WHERE email='test@example.com';"
```

### Find tasks due soon
```bash
docker exec mongo mongosh --quiet task_management \
  --eval "db.tasks.find({dueDate: {\$lt: new Date('2026-04-20')}}).pretty()"
```

### Count tasks per user
```bash
docker exec mongo mongosh --quiet task_management \
  --eval "db.tasks.aggregate([{$group: {_id: '$userId', count: {$sum: 1}}}])"
```

### Find user with most tasks
```bash
docker exec mongo mongosh --quiet task_management \
  --eval "db.tasks.aggregate([{$group: {_id: '$userId', count: {$sum: 1}}}, {$sort: {count: -1}}, {$limit: 1}])"
```

## Troubleshooting

### Error: database does not exist
```bash
# Ensure containers are running
docker ps

# Should show: postgres and mongo containers
```

### Error: could not translate host name to address
```bash
# Docker daemon might not be running
# On Mac/Windows: Start Docker Desktop
# On Linux: sudo systemctl start docker
```

### Error: psql: command not found
```bash
# psql isn't installed locally, but it's in the container
# Use: docker exec postgres psql ... (as shown above)
```

## Data Persistence

Your data persists even after:
- Restarting containers: `docker-compose restart`
- Stopping containers: `docker-compose stop`
- Restarting server: `npm restart`

Your data is DELETED only when:
```bash
# Remove containers (but keep volumes)
docker-compose down

# Remove everything including data
docker-compose down -v
```