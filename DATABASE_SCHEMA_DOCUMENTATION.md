# Database Schema Documentation
## Student Management System

### 1. Database Overview

The Student Management System uses MongoDB as its database and Mongoose as its Object Data Modeling (ODM) library.

The application contains the following four provided data models:

1. Student
2. Course
3. Instructor
4. User

Each model defines its fields, validation rules, relationships, and timestamps.

### 2. Student Collection

**Model:** `Student`

| Field | Data Type | Description |
|---|---|---|
| fullName | String | Student's full name |
| email | String | Unique student email |
| mobile | String | 10-digit Indian mobile number |
| gender | String | Gender selection |
| course | String | Selected course name |
| address | String | Student address |
| courseId | ObjectId | Reference to Course |
| profilePhoto | Object | Student profile photo details |
| documents | Array | Supporting document details |
| createdAt | Date | Record creation time |
| updatedAt | Date | Last update time |

**Validation rules:**
- Full name is required, minimum 2 and maximum 100 characters.
- Email is required, unique, and validated.
- Mobile number must contain 10 digits and start with 6–9.
- Gender must be one of the allowed values.
- Course must match one of the predefined course names.
- Address is required, between 5 and 500 characters.
- Profile photos have a maximum size of 5 MB.
- Supporting documents have a maximum size of 10 MB each.

**Indexes:**
- Unique email index.
- `{ createdAt: -1, _id: 1 }`
- `{ fullName: 1 }`
- `{ course: 1 }`
- `{ courseId: 1 }`
- `{ gender: 1 }`

### 3. Course Collection

**Model:** `Course`

| Field | Data Type | Description |
|---|---|---|
| courseName | String | Course name |
| courseCode | String | Unique course code |
| description | String | Course description |
| duration | String | Course duration |
| fee | Number | Course fee |
| status | String | Active or Inactive |
| instructor | ObjectId | Reference to Instructor |
| createdAt | Date | Record creation time |
| updatedAt | Date | Last update time |

**Validation rules:**
- Course name is required.
- Course code is required and unique.
- Course code is stored in uppercase.
- Duration is required.
- Fee must be a non-negative number.
- Status must be Active or Inactive.
- Instructor reference is required.

### 4. Instructor Collection

**Model:** `Instructor`

| Field | Data Type | Description |
|---|---|---|
| fullName | String | Instructor's full name |
| email | String | Unique instructor email |
| specialization | String | Area of specialization |
| createdAt | Date | Record creation time |
| updatedAt | Date | Last update time |

**Validation rules:**
- Full name is required.
- Email is required and unique.
- Email is converted to lowercase.
- Specialization is required.

### 5. User Collection

**Model:** `User`

| Field | Data Type | Description |
|---|---|---|
| username | String | Unique username |
| email | String | Unique email |
| password | String | Hashed password |
| role | String | User access role |
| tokenVersion | Number | Token version control |
| refreshTokenHash | String | Hashed refresh token |
| refreshTokenExpires | Date | Refresh token expiry |
| resetPasswordTokenHash | String | Hashed password reset token |
| resetPasswordExpires | Date | Password reset expiry |
| createdAt | Date | Account creation time |
| updatedAt | Date | Last update time |

**Validation rules:**
- Username must contain 3–30 characters.
- Username allows letters, numbers, and underscores.
- Email must be valid and unique.
- Password must contain at least 8 characters.
- Password field is excluded from normal query results.
- Roles are restricted to `admin`, `staff`, and `viewer`.
- Default role is `viewer`.

**Security considerations:**
- Passwords should be hashed before storage.
- Refresh tokens and password reset tokens are stored as hashes.
- Sensitive token fields are excluded from normal query results.

### 6. Database Relationships

The application uses MongoDB ObjectId references to associate related records.

**Course and Instructor:**

A course references an instructor through the `instructor` field.

**Student and Course:**

A student can reference a course through the `courseId` field. This reference is optional and defaults to null.

**Relationship overview:**

```text
Instructor
    |
    | ObjectId reference
    |
    v
Course
    |
    | ObjectId reference
    |
    v
Student

User
    |
    | Authentication and roles
    |
    v
Application Access
```

### 7. Database Configuration

The application uses a MongoDB connection string configured through environment variables.

```env
MONGODB_URI=your_mongodb_connection_string
```

The database connection is managed using Mongoose.

### 8. Timestamp Management

The schemas use Mongoose timestamps.

- `createdAt` records when a document was created.
- `updatedAt` records when a document was last updated.

### 9. Data Integrity and Security

The database implementation includes:

- Required field validation.
- Unique constraints for important fields.
- String length restrictions.
- Enum validation.
- ObjectId references.
- Database indexes.
- Strict schema validation.
- Sensitive field selection restrictions.

### 10. Additional Model Documentation

The Enrollment model was not included in the provided schema files. Its structure and relationships must be documented separately if an Enrollment model is implemented.

### 11. Conclusion

The database schema provides structured storage for students, courses, instructors, and application users. Mongoose validation, references, timestamps, and indexes support data consistency and efficient database operations.