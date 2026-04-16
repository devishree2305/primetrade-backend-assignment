# API Documentation

Base URL
`http://127.0.0.1:8000/api/v1`

Authentication
Use Bearer token for protected routes.
Header:
`Authorization: Bearer <access_token>`

Swagger
`http://127.0.0.1:8000/docs`

## 1. Register User
**POST** `/auth/register`

Description
Creates a new user with default role `user`.

Request body:
```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "secret123"
}
```

Success response: `201 Created`
```json
{
  "id": 1,
  "name": "Rahul",
  "email": "rahul@example.com",
  "role": "user",
  "is_active": true,
  "created_at": "2026-04-15T20:30:00"
}
```

Possible errors:
- `400 Bad Request` if email already exists
- `422 Unprocessable Entity` if body is invalid

## 2. Login User
**POST** `/auth/login`

Description
Authenticates a user and returns a JWT access token.

Request body:
```json
{
  "email": "rahul@example.com",
  "password": "secret123"
}
```

Success response: `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "Rahul",
    "email": "rahul@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2026-04-15T20:30:00"
  },
  "access_token": "<jwt_token>",
  "token_type": "bearer"
}
```

Possible errors:
- `401 Unauthorized` for invalid credentials
- `422 Unprocessable Entity` if body is invalid

## 3. Create Admin Request
**POST** `/admin/requests`

Authorization
Required: logged-in user token

Description
Creates a request for the current user to become an admin.

Request body:
No body required.

Success response: `201 Created`
```json
{
  "message": "Admin role request submitted successfully"
}
```

Possible errors:
- `400 Bad Request` if user is already admin
- `400 Bad Request` if a pending request already exists
- `401 Unauthorized` if token is missing or invalid

## 4. List Admin Requests
**GET** `/admin/requests`

Authorization
Required: admin token

Description
Returns admin-role requests. Supports optional status filter.

Optional query params:
- `status=pending`
- `status=approved`
- `status=rejected`

Example:
`GET /admin/requests?status=pending`

Success response: `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 2,
    "status": "pending",
    "requested_at": "2026-04-15T20:35:00",
    "reviewed_by": null,
    "reviewed_at": null
  }
]
```

Possible errors:
- `401 Unauthorized` if token is missing or invalid
- `403 Forbidden` if current user is not admin

## 5. Approve Or Reject Admin Request
**POST** `/admin/approve/{request_id}`

Authorization
Required: admin token

Description
Approves or rejects an admin request. If approved, the user's role is updated to `admin`.

Path param:
- `request_id`: admin request id

Request body:
```json
{
  "action": "approved"
}
```

To reject:
```json
{
  "action": "rejected"
}
```

Success response: `200 OK`
```json
{
  "id": 1,
  "user_id": 2,
  "status": "approved",
  "requested_at": "2026-04-15T20:35:00",
  "reviewed_by": 10,
  "reviewed_at": "2026-04-15T20:40:00"
}
```

Possible errors:
- `404 Not Found` if request does not exist
- `400 Bad Request` if request is already reviewed
- `401 Unauthorized` if token is missing or invalid
- `403 Forbidden` if current user is not admin

## 6. Get Tasks
**GET** `/tasks`

Authorization
Required: logged-in user token

Description
- Admin gets all tasks
- Normal user gets only their own tasks

Success response: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Complete backend module",
    "description": "Finish API integration",
    "status": "pending",
    "user_id": 1,
    "created_at": "2026-04-15T20:45:00",
    "updated_at": "2026-04-15T20:45:00"
  }
]
```

Possible errors:
- `401 Unauthorized` if token is missing or invalid

## 7. Create Task
**POST** `/tasks`

Authorization
Required: admin token

Description
Creates a task and assigns it to a user.

Request body:
```json
{
  "title": "Complete backend module",
  "description": "Finish API integration",
  "status": "pending",
  "user_id": 1
}
```

Success response: `201 Created`
```json
{
  "id": 1,
  "title": "Complete backend module",
  "description": "Finish API integration",
  "status": "pending",
  "user_id": 1,
  "created_at": "2026-04-15T20:45:00",
  "updated_at": "2026-04-15T20:45:00"
}
```

Possible errors:
- `404 Not Found` if assigned user does not exist
- `401 Unauthorized` if token is missing or invalid
- `403 Forbidden` if current user is not admin

## 8. Update Task
**PUT** `/tasks/{task_id}`

Authorization
Required: admin token

Description
Updates task fields. Any provided field will be updated.

Path param:
- `task_id`: task id

Request body example:
```json
{
  "title": "Complete backend module v2",
  "description": "Updated description",
  "status": "completed"
}
```

Another valid example:
```json
{
  "user_id": 2
}
```

Success response: `200 OK`
```json
{
  "id": 1,
  "title": "Complete backend module v2",
  "description": "Updated description",
  "status": "completed",
  "user_id": 1,
  "created_at": "2026-04-15T20:45:00",
  "updated_at": "2026-04-15T20:50:00"
}
```

Possible errors:
- `404 Not Found` if task does not exist
- `404 Not Found` if new `user_id` does not exist
- `401 Unauthorized` if token is missing or invalid
- `403 Forbidden` if current user is not admin

## 9. Delete Task
**DELETE** `/tasks/{task_id}`

Authorization
Required: admin token

Description
Deletes a task.

Path param:
- `task_id`: task id

Success response: `204 No Content`

Possible errors:
- `404 Not Found` if task does not exist
- `401 Unauthorized` if token is missing or invalid
- `403 Forbidden` if current user is not admin

## Frontend Integration Notes
- Save the JWT from `/auth/login` and send it in the `Authorization` header.
- After admin approval, the user should log in again to get a new token containing role `admin`.
- `GET /tasks` is role-aware. Frontend can call the same endpoint for both admin and user dashboards.
- For `DELETE /tasks/{task_id}`, expect an empty response body.
- Use Swagger at `/docs` to quickly inspect schemas during frontend integration.

## Final API List
1. `POST /api/v1/auth/register`
2. `POST /api/v1/auth/login`
3. `POST /api/v1/admin/requests`
4. `GET /api/v1/admin/requests`
5. `POST /api/v1/admin/approve/{request_id}`
6. `GET /api/v1/tasks`
7. `POST /api/v1/tasks`
8. `PUT /api/v1/tasks/{task_id}`
9. `DELETE /api/v1/tasks/{task_id}`
