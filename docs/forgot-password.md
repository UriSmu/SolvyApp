# Magic Link Password Reset - Documentation

## Overview

This document describes the implementation of the "Forgot Password" flow using magic links in SolvyApp. The implementation uses SMTP for email delivery and Supabase for token persistence.

## Architecture

### Components

1. **Backend API** (Node.js/Express)
   - Magic link generation and verification
   - SMTP email sending via nodemailer
   - Token persistence in Supabase
   - Session management with JWT

2. **Database** (Supabase)
   - `magic_link_tokens` table for storing hashed tokens
   - Row Level Security (RLS) policies

3. **Frontend** (React Native)
   - Password reset request form
   - Magic link verification page

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# SMTP Configuration (choose one option)

# Option 1: SMTP URL connection string
SMTP_URL=smtp://username:password@smtp.mailtrap.io:587

# Option 2: Individual SMTP settings
# SMTP_HOST=smtp.mailtrap.io
# SMTP_PORT=587
# SMTP_USER=your-username
# SMTP_PASS=your-password
# SMTP_SECURE=false

# Email Configuration
EMAIL_FROM=noreply@solvyapp.com

# Magic Link Configuration
MAGIC_LINK_BASE_URL=http://localhost:19000
MAGIC_LINK_EXPIRATION=60
MAGIC_LINK_SECRET=your-secret-key-for-hmac-here-change-in-production

# Session/JWT Configuration
JWT_SECRET=your-jwt-secret-here-change-in-production
JWT_EXPIRATION=7d
```

### Environment Variable Details

- **PORT**: Port for the backend server (default: 3000)
- **SUPABASE_URL**: Your Supabase project URL
- **SUPABASE_SERVICE_KEY**: Service role key (found in Supabase Dashboard > Settings > API)
- **SMTP_URL**: SMTP connection string OR use individual SMTP settings below
- **SMTP_HOST**: SMTP server hostname
- **SMTP_PORT**: SMTP server port (587 for TLS, 465 for SSL)
- **SMTP_USER**: SMTP authentication username
- **SMTP_PASS**: SMTP authentication password
- **SMTP_SECURE**: Use SSL/TLS (true/false)
- **EMAIL_FROM**: Sender email address
- **MAGIC_LINK_BASE_URL**: Base URL for magic links (your app's deep link or web URL)
- **MAGIC_LINK_EXPIRATION**: Token expiration time in minutes (default: 60)
- **MAGIC_LINK_SECRET**: Secret key for HMAC signing
- **JWT_SECRET**: Secret for JWT token signing
- **JWT_EXPIRATION**: JWT token expiration (e.g., "7d", "24h")

## Database Setup

### Running the Migration

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `backend/src/migrations/001_create_magic_link_tokens.sql`
5. Execute the query

Alternatively, you can use the Supabase CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Database Schema

The `magic_link_tokens` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to auth.users(id) |
| token_hash | text | SHA256 hash of the magic link token |
| jti | text | JWT ID for additional security |
| expires_at | timestamptz | Token expiration timestamp |
| used_at | timestamptz | Timestamp when token was used (null if unused) |
| created_at | timestamptz | Token creation timestamp |

Indexes:
- `idx_magic_link_tokens_token_hash` on `token_hash`
- `idx_magic_link_tokens_jti` on `jti`
- `idx_magic_link_tokens_user_id` on `user_id`
- `idx_magic_link_tokens_expires_at` on `expires_at`

## Backend Setup

### Installation

```bash
cd backend
npm install
```

### Running Locally

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will start on `http://localhost:3000` (or the port specified in `.env`).

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Testing with Mailtrap

For local development, we recommend using [Mailtrap](https://mailtrap.io/) to test email sending without sending real emails.

### Setup Mailtrap

1. Sign up at https://mailtrap.io/
2. Create a new inbox
3. Copy the SMTP credentials
4. Update your `.env` file:

```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
SMTP_SECURE=false
```

Or use the SMTP URL format:
```bash
SMTP_URL=smtp://your-username:your-password@smtp.mailtrap.io:587
```

## API Endpoints

### POST /api/auth/magic-link

Request a magic link for password reset.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a magic link has been sent."
}
```

**Notes:**
- Always returns 200 OK to prevent email enumeration
- Returns same message whether email exists or not
- Email is sent only if the user exists in Supabase Auth

### GET /api/auth/magic-link/verify

Verify a magic link token and create a session.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/auth/magic-link/verify?token=abc123..."
```

**Success Response (200):**
```json
{
  "success": true,
  "redirectUrl": "/",
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

## Frontend Integration

### Requesting a Magic Link

```javascript
async function requestMagicLink(email) {
  const response = await fetch('http://localhost:3000/api/auth/magic-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  return data;
}
```

### Verifying a Magic Link

```javascript
async function verifyMagicLink(token) {
  const response = await fetch(`http://localhost:3000/api/auth/magic-link/verify?token=${token}`);
  const data = await response.json();
  
  if (data.success) {
    // Store token and redirect
    await AsyncStorage.setItem('auth_token', data.token);
    // Navigate to home screen
  }
  
  return data;
}
```

## Security Considerations

### Token Security

1. **Hashing**: Tokens are hashed using SHA256 before storage
2. **One-time use**: Tokens are marked as used after verification
3. **Expiration**: Configurable expiration time (default: 60 minutes)
4. **Unique JTI**: Each token has a unique JWT ID

### Anti-Enumeration

The API always returns the same success message whether the email exists or not, preventing attackers from discovering valid email addresses.

### HTTPS in Production

Always use HTTPS in production:
- Set `NODE_ENV=production`
- Use secure cookies
- Configure proper CORS origins

## Troubleshooting

### Emails Not Received

1. **Check spam folder**: Magic link emails might be filtered as spam
2. **Verify SMTP credentials**: Ensure SMTP settings are correct
3. **Check Mailtrap inbox**: If using Mailtrap, check the web interface
4. **Review backend logs**: Look for email sending errors in the console

### Token Verification Fails

1. **Check token expiration**: Tokens expire after configured time
2. **Verify token hasn't been used**: Tokens are single-use only
3. **Check database**: Ensure the token exists in `magic_link_tokens` table
4. **Review backend logs**: Check for specific error messages

### Database Connection Issues

1. **Verify Supabase credentials**: Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
2. **Check RLS policies**: Ensure service role has access to the table
3. **Run migrations**: Make sure the `magic_link_tokens` table exists

## Production Deployment

### Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong secrets for `MAGIC_LINK_SECRET` and `JWT_SECRET`
- [ ] Configure production SMTP provider (SendGrid, AWS SES, etc.)
- [ ] Set proper `MAGIC_LINK_BASE_URL` (your production domain)
- [ ] Enable HTTPS
- [ ] Configure CORS to allow only your frontend domain
- [ ] Set up monitoring and logging
- [ ] Review and test RLS policies in Supabase

### Recommended SMTP Providers

- **SendGrid**: https://sendgrid.com/
- **AWS SES**: https://aws.amazon.com/ses/
- **Mailgun**: https://www.mailgun.com/
- **Postmark**: https://postmarkapp.com/

## Support

For issues or questions:
1. Check backend logs for errors
2. Verify environment variables are set correctly
3. Test SMTP connection separately
4. Review Supabase Dashboard for user and token data
