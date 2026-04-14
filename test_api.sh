# Testing Script for Task Management API

# 1. Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Login to get JWT token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r .token)

echo "Token: $TOKEN"

# 3. Get user profile
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Create a task
TASK_ID=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"My Task","description":"Task description","dueDate":"2026-04-20","status":"pending"}' | jq -r ._id)

echo "Task ID: $TASK_ID"

# 5. Get all tasks
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# 6. Get single task
curl -X GET http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"

# 7. Update task
curl -X PUT http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"completed"}'

# 8. Delete task
curl -X DELETE http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"

# Test error cases
# Invalid token
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer invalid"

# No token
curl -X GET http://localhost:3000/api/tasks

# Invalid registration
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"invalid","password":"short"}'
