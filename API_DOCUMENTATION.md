# REST API Documentation
## Student Management System

### 1. Overview

The Student Management System provides REST APIs using Node.js and Express.js. The APIs manage authentication, students, courses, instructors, file uploads, and dashboard statistics.

Authentication is enforced through middleware, and role-based authorization controls access to protected operations.

### 2. Authentication APIs

Base path: `/api/auth` (assuming the router is mounted at this prefix).

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Authenticate a user | Public |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password/:token` | Reset password using token | Public |
| GET | `/profile` | Retrieve user profile | Authenticated |
| PATCH | `/profile` | Update user profile | Authenticated |
| PATCH | `/change-password` | Change account password | Authenticated |
| POST | `/logout` | Log out the current user | Authenticated |
| PATCH | `/users/:id/role` | Update a user's role | Admin |

### 3. Student Management APIs

Base path: `/api/students`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Retrieve students | Admin, Staff, Viewer |
| GET | `/:id` | Retrieve student details | Admin, Staff, Viewer |
| POST | `/` | Create student | Admin, Staff |
| PATCH | `/:id` | Update student | Admin, Staff |
| DELETE | `/:id` | Delete student | Admin |

### 4. Course Management APIs

Base path: `/api/courses`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Retrieve courses | Admin, Staff, Viewer |
| GET | `/:id` | Retrieve course details | Admin, Staff, Viewer |
| POST | `/` | Create a course | Admin |
| PATCH | `/:id` | Update a course | Admin |
| DELETE | `/:id` | Delete a course | Admin |

Courses are associated with instructors using an ObjectId reference.

### 5. Instructor Management APIs

Base path: `/api/instructors`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Retrieve instructors | Admin, Staff, Viewer |
| POST | `/` | Create instructor | Admin |
| PATCH | `/:id` | Update instructor | Admin |
| DELETE | `/:id` | Delete instructor | Admin |

### 6. File Management APIs

Base path: `/api/files` (assuming the router is mounted at this prefix).

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/:id/photo` | Upload or replace student photo | Admin, Staff |
| GET | `/:id/photo` | View student photo | Authenticated |
| POST | `/:id/documents` | Upload supporting document | Admin, Staff |
| GET | `/:id/documents/:documentId` | Download private document | Admin, Staff |
| DELETE | `/:id/photo` | Delete student photo | Admin, Staff |
| DELETE | `/:id/documents/:documentId` | Delete supporting document | Admin, Staff |

**File upload details:**

- Profile photo upload uses the multipart field name `photo`.
- Supporting document upload uses the multipart field name `document`.
- Upload middleware processes files and validates uploaded files before the controller executes.
- Private document downloads require authentication and Admin or Staff authorization.

### 7. Dashboard API

Base path: `/api/dashboard` (assuming the router is mounted at this prefix).

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Retrieve dashboard statistics | Admin, Staff, Viewer |

The dashboard endpoint uses authentication and role-based authorization.

### 8. Role-Based Access Control

The application supports three roles: Admin, Staff, and Viewer.

| Operation | Admin | Staff | Viewer |
|---|---|---|---|
| View students | Yes | Yes | Yes |
| Create students | Yes | Yes | No |
| Update students | Yes | Yes | No |
| Delete students | Yes | No | No |
| View courses | Yes | Yes | Yes |
| Create courses | Yes | No | No |
| Update courses | Yes | No | No |
| Delete courses | Yes | No | No |
| View instructors | Yes | Yes | Yes |
| Manage instructors | Yes | No | No |
| Upload student files | Yes | Yes | No |
| View student photos | Yes | Yes | Yes |
| Download private documents | Yes | Yes | No |
| Delete student files | Yes | Yes | No |
| View dashboard | Yes | Yes | Yes |
| Update user roles | Yes | No | No |

### 9. Authentication and Middleware

The API uses the following middleware:

- `protect`: Verifies user authentication.
- `authorize`: Checks user roles and permissions.
- `authLimiter`: Limits authentication requests.
- `passwordResetLimiter`: Limits password-reset requests.
- `upload`: Processes multipart file uploads.
- `validateUploadedFile`: Validates uploaded files.

### 10. HTTP Methods

| Method | Purpose |
|---|---|
| GET | Retrieve resources |
| POST | Create resources or perform actions |
| PATCH | Partially update resources |
| DELETE | Remove resources |

### 11. Error Handling

The APIs should handle:

- Invalid input data.
- Missing required fields.
- Invalid resource IDs.
- Authentication failures.
- Insufficient permissions.
- Duplicate records.
- Missing resources.
- File validation failures.
- Database and server errors.

Exact response structures and HTTP status codes should be taken from the corresponding controller implementations.

### 12. API Testing

Postman or an equivalent API testing tool can be used to test the endpoints.

Recommended test cases:

1. User registration and login.
2. Profile retrieval and updates.
3. Password change and reset.
4. Student CRUD operations.
5. Course CRUD operations.
6. Instructor CRUD operations.
7. File upload, download, and deletion.
8. Dashboard statistics retrieval.
9. Role-based authorization.
10. Invalid requests and error handling.

### 13. Security Measures

The route configuration includes:

- Authentication middleware.
- Role-based authorization.
- Authentication rate limiting.
- Password-reset rate limiting.
- Protected student, course, and instructor routes.
- Protected file upload and download routes.
- File validation middleware.

### 14. API Prefix Configuration

The endpoint paths above assume the routers are mounted using these prefixes:

- `/api/auth`
- `/api/students`
- `/api/courses`
- `/api/instructors`
- `/api/files`
- `/api/dashboard`

The actual prefixes depend on the Express application configuration.

### 15. Known API Limitations

- Enrollment routes were not provided and are not documented.
- Exact request body fields and response examples require controller implementation details.
- Email notification endpoints were not present in the provided route files.

### 16. Conclusion

The REST API architecture separates authentication, student management, course management, instructor management, file handling, and dashboard operations. Middleware-based authentication and role-based authorization provide controlled access to application resources.