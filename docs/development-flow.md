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