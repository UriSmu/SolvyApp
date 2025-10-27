# SolvyApp Backend - Magic Link Authentication

Backend API for SolvyApp that implements password reset using magic links with SMTP email delivery and Supabase token persistence.

## Features

- 🔐 Secure magic link generation with SHA256 hashing
- 📧 SMTP email delivery using nodemailer
- 🗄️ Token persistence in Supabase
- ⏱️ Configurable token expiration
- 🚫 Anti-enumeration protection
- 🔑 JWT session management
- ✅ One-time use tokens

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase project
- SMTP server credentials (or use Mailtrap for development)

### Installation

```bash
cd backend
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp ../.env.example .env
```

2. Update the `.env` file with your credentials:
```bash
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# SMTP (Mailtrap for development)
SMTP_URL=smtp://your-username:your-password@smtp.mailtrap.io:587

# Email
EMAIL_FROM=noreply@solvyapp.com

# Magic Link
MAGIC_LINK_BASE_URL=http://localhost:19000
MAGIC_LINK_EXPIRATION=60

# Secrets
MAGIC_LINK_SECRET=generate-a-random-secret-here
JWT_SECRET=generate-another-random-secret-here
JWT_EXPIRATION=7d
```

### Database Setup

Run the migration in Supabase SQL Editor:

```bash
# Open the migration file
cat src/migrations/001_create_magic_link_tokens.sql

# Then copy and paste into Supabase Dashboard > SQL Editor
```

Or use Supabase CLI:
```bash
supabase db push
```

### Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`.

### Testing

Run tests with coverage:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## API Endpoints

### POST /api/auth/magic-link

Request a magic link for password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a magic link has been sent."
}
```

### GET /api/auth/magic-link/verify

Verify a magic link token.

**Query Parameters:**
- `token` (required): The magic link token

**Success Response:**
```json
{
  "success": true,
  "redirectUrl": "/",
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T14:12:59.601Z"
}
```

## Project Structure

```
backend/
├── src/
│   ├── emails/
│   │   └── magicLink.html       # Email template
│   ├── migrations/
│   │   └── 001_create_magic_link_tokens.sql
│   ├── routes/
│   │   └── authRoutes.js        # API routes
│   ├── services/
│   │   └── magicLinkService.js  # Magic link business logic
│   ├── utils/
│   │   └── sessionUtils.js      # Session/JWT utilities
│   └── index.js                  # Express app entry point
├── tests/
│   └── auth/
│       └── magicLink.test.js    # Integration tests
├── package.json
├── jest.config.js
└── README.md
```

## Security

- Tokens are hashed with SHA256 before storage
- Each token has a unique JWT ID (jti)
- Tokens expire after configured time (default: 60 minutes)
- Tokens are single-use only (marked as used after verification)
- Anti-enumeration: same response for existing and non-existing emails
- HttpOnly cookies for web sessions
- CORS protection

## Development

### Using Mailtrap for Email Testing

1. Sign up at https://mailtrap.io/
2. Create a new inbox
3. Copy SMTP credentials
4. Update `.env` with Mailtrap SMTP URL

### Environment Variables

See `.env.example` for all available configuration options.

### Debugging

Enable debug logging:
```bash
NODE_ENV=development npm run dev
```

Check logs in the console for detailed information about:
- Email sending
- Token generation
- User lookup
- Token verification

## Production Deployment

1. Set production environment variables
2. Use a production SMTP provider (SendGrid, AWS SES, etc.)
3. Enable HTTPS
4. Set `NODE_ENV=production`
5. Configure CORS for your frontend domain
6. Use strong secrets for `JWT_SECRET` and `MAGIC_LINK_SECRET`
7. Set up monitoring and logging

## Troubleshooting

### Emails not being sent

- Check SMTP credentials
- Verify `EMAIL_FROM` is set correctly
- Check spam folder
- For Mailtrap, check the web interface

### Token verification fails

- Check token hasn't expired
- Verify token hasn't been used already
- Check database connection to Supabase
- Ensure RLS policies allow service role access

### Database errors

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Run the migration SQL script
- Check RLS policies in Supabase Dashboard

## License

MIT

## Support

For detailed documentation, see `/docs/forgot-password.md`
