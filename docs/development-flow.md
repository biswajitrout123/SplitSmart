# Development Flow

## Authentication Flow

### Register User

POST /api/auth/register

Request Flow:

Client
↓
POST /api/auth/register
↓
app.js
↓
auth.route.js
↓
auth.controller.js
↓
user.model.js
↓
MongoDB

Responsibilities:

- Validate name, email and password
- Check if email already exists
- Hash password using bcrypt
- Create user in MongoDB
- Return user information without password

---

### Login User

POST /api/auth/login

Request Flow:

Client
↓
POST /api/auth/login
↓
app.js
↓
auth.route.js
↓
auth.controller.js
↓
MongoDB
↓
bcrypt password comparison
↓
JWT generation
↓
HTTP-only cookie

Responsibilities:

- Validate email and password
- Find user by email
- Compare password using bcrypt
- Generate JWT
- Store JWT in HTTP-only cookie
- Return authenticated user

---

### Get Current User

GET /api/auth/me

Request Flow:

Client
↓
GET /api/auth/me
↓
auth.route.js
↓
authMiddleware
↓
Read token from cookie
↓
Verify JWT
↓
Find user in MongoDB
↓
req.user
↓
getMe controller
↓
Return current user

Authentication:

- JWT stored in HTTP-only cookie
- JWT verified using JWT_SECRET
- Authenticated user attached to req.user
- Protected routes use authMiddleware

---

## Authentication Testing

Tested using Postman:

- Register User → 201 Created
- Login User → 200 OK
- Get Current User → 200 OK
- Duplicate email → 400 Bad Request
- Invalid authentication → 401 Unauthorized

### Logout User

POST /api/auth/logout

Flow:

Request
→ logoutUser controller
→ Clear token cookie
→ Return success response

After logout:

GET /api/auth/me
→ 401 Not authenticated



## Authentication & Group Creation

### Authentication Flow

1. User registers using `POST /api/auth/register`
2. User logs in using `POST /api/auth/login`
3. Server generates a JWT
4. JWT is stored in an HTTP-only cookie
5. Protected routes use `authMiddleware`
6. Middleware verifies the JWT
7. Middleware finds the user from MongoDB
8. User is attached to `req.user`

### Group Creation Flow

Endpoint:

POST /api/groups

Authentication:

Required

Request body:

{
    "name": "Goa Trip",
    "description": "Trip with college friends"
}

Flow:

1. Request reaches `/api/groups`
2. `authMiddleware` checks the JWT cookie
3. Middleware verifies the token
4. Middleware finds the logged-in user
5. User is attached to `req.user`
6. `createGroup` validates the group name
7. Group is created in MongoDB
8. Logged-in user becomes the group creator
9. Logged-in user is automatically added to members
10. API returns `201 Created`

Security Test:

When the user is logged out, `POST /api/groups` returns:

401 Unauthorized

{
    "success": false,
    "message": "Not authenticated"
}