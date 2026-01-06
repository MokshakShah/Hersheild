# Authentication System Setup

## Overview
This application now includes a complete authentication system with MongoDB Atlas integration, JWT tokens, and secure password handling.

## Features
- **User Registration**: Sign up with name, phone number (unique), and password
- **User Login**: Login with phone number and password
- **JWT Authentication**: Tokens valid for 3 months
- **Password Security**: Passwords are hashed using bcrypt
- **Protected Routes**: Middleware protects all routes except login/signup
- **Profile Management**: View profile and change password
- **Automatic Logout**: Logout functionality with cookie clearing

## Database Schema
```typescript
interface User {
  name: string;           // Required, max 50 characters
  phoneNumber: string;    // Required, unique, 10 digits
  password: string;       // Required, min 6 characters, hashed
  createdAt: Date;        // Auto-generated
  updatedAt: Date;        // Auto-updated
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password

### Request/Response Examples

#### Signup
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "phoneNumber": "1234567890",
  "password": "securepassword123"
}
```

#### Login
```json
POST /api/auth/login
{
  "phoneNumber": "1234567890",
  "password": "securepassword123"
}
```

#### Change Password
```json
POST /api/auth/change-password
{
  "currentPassword": "oldpassword",
  "newPassword": "newsecurepassword123"
}
```

## Environment Variables
Create a `.env.local` file in your project root:

```env
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
```

## Security Features
1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
2. **JWT Tokens**: Secure tokens with 3-month expiration
3. **HTTP-Only Cookies**: Tokens stored in secure, HTTP-only cookies
4. **Input Validation**: Zod schema validation for all inputs
5. **Phone Number Uniqueness**: Phone numbers must be unique across all users
6. **Route Protection**: Middleware protects all routes except public ones

## Usage

### Frontend Components
- **Login Page**: `/login` - Phone number and password login
- **Signup Page**: `/signup` - Name, phone number, and password registration
- **Profile Page**: `/profile` - View profile and change password
- **Protected Routes**: All other routes require authentication

### Authentication Context
The app uses React Context for global authentication state:

```typescript
const { user, loading, login, signup, logout } = useAuth()
```

### Middleware
The middleware automatically:
- Redirects unauthenticated users to `/login`
- Protects all routes except `/login` and `/signup`
- Validates JWT tokens on each request

## Database Connection
The app connects to MongoDB Atlas using the provided connection string. The connection is cached and reused for optimal performance.

## Error Handling
- Comprehensive error messages for validation failures
- User-friendly error notifications using toast messages
- Graceful fallbacks for network errors

## Testing the System
1. Start the development server: `npm run dev`
2. Navigate to `/signup` to create a new account
3. Use the created credentials to login at `/login`
4. Access protected routes like `/profile`
5. Test password change functionality
6. Test logout functionality

## Notes
- Phone numbers are stored as strings and validated for 10-digit format
- Names are limited to 50 characters maximum
- Passwords must be at least 6 characters long
- JWT tokens are automatically refreshed on each request
- All authentication state is managed through React Context
