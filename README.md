# SolvyApp

A React Native mobile application for connecting service providers (Solvers) with clients, with magic link password reset functionality.

## Project Structure

```
SolvyApp/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── emails/       # Email templates
│   │   ├── migrations/   # Database migrations
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── tests/            # Backend tests
│   └── README.md         # Backend documentation
├── source/               # React Native app source
│   ├── Home/             # Client screens
│   ├── Solver/           # Solver screens
│   ├── Login/            # Authentication screens
│   ├── Layout/           # Shared layout components
│   └── context/          # React Context providers
├── assets/               # Images and resources
├── docs/                 # Documentation
│   └── forgot-password.md
├── App.js                # Main app component
└── package.json          # Frontend dependencies
```

## Features

- 👤 Dual user types: Clients and Service Providers (Solvers)
- 🔐 Magic link password reset
- 📧 SMTP email delivery
- 🗺️ Maps and location services
- ⭐ Rating and review system
- 📱 Cross-platform (iOS, Android, Web)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- Supabase account
- SMTP server (or Mailtrap for development)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Scan the QR code with Expo Go app (Android) or Camera app (iOS)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp ../.env.example .env
# Edit .env with your credentials
```

4. Run database migrations in Supabase SQL Editor:
```bash
# Copy contents of backend/src/migrations/001_create_magic_link_tokens.sql
# Paste into Supabase Dashboard > SQL Editor
```

5. Start the backend server:
```bash
npm run dev
```

For detailed backend setup, see [backend/README.md](backend/README.md)

### Magic Link Password Reset Setup

See comprehensive documentation in [docs/forgot-password.md](docs/forgot-password.md)

## Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
# Backend API URL (for magic link endpoints)
BACKEND_URL=http://localhost:3000

# Backend-specific variables (see .env.example for full list)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SMTP_URL=smtp://username:password@smtp.server.com:587
EMAIL_FROM=noreply@solvyapp.com
MAGIC_LINK_BASE_URL=http://localhost:19000
MAGIC_LINK_EXPIRATION=60
JWT_SECRET=your-secret-here
```

## Testing

### Frontend

Currently, no automated tests are configured for the frontend.

### Backend

Run backend tests:
```bash
cd backend
npm test
```

## Magic Link Password Reset

The app implements a secure password reset flow using magic links:

1. User enters email address
2. Backend generates secure token and sends email via SMTP
3. User clicks link in email
4. App verifies token and creates session
5. User is logged in

Key features:
- SHA256 token hashing
- One-time use tokens
- Configurable expiration (default: 60 minutes)
- Anti-enumeration protection
- Email delivery via SMTP (nodemailer)

## API Endpoints

### POST /api/auth/magic-link
Request a magic link for password reset.

### GET /api/auth/magic-link/verify
Verify a magic link token and create a session.

### GET /health
Health check endpoint.

See [backend/README.md](backend/README.md) for detailed API documentation.

## Screens

### Login Flow
- `Login/IniciarComoCliente.js` - Client login choice
- `Login/IniciarComoSolver.js` - Solver login choice
- `Login/IniciarSesion.js` - Client login form
- `Login/IniciarSesionSolv.js` - Solver login form
- `Login/OlvideMiContrasenia.js` - Forgot password (magic link request)
- `Login/MagicLinkVerify.js` - Magic link verification
- `Login/Registrarse.js` - Client registration
- `Login/RegistrarseSolv.js` - Solver registration

### Client Screens
- `Home/` - Client home and service browsing
- `Home/Mapa.js` - Map view for finding solvers
- `Home/Perfil.js` - Client profile

### Solver Screens
- `Solver/` - Solver home and job management
- `Solver/MisServicios.js` - Solver's service listings
- `Solver/Perfil.js` - Solver profile

## Database Schema

### magic_link_tokens
Stores password reset tokens (Supabase):

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User reference |
| token_hash | text | SHA256 hash of token |
| jti | text | JWT ID (unique) |
| expires_at | timestamptz | Expiration time |
| used_at | timestamptz | Usage timestamp |
| created_at | timestamptz | Creation time |

## Development

### Running Locally

1. Start backend server:
```bash
cd backend && npm run dev
```

2. In a new terminal, start Expo:
```bash
npm start
```

3. Use Expo Go app to scan QR code

### Debugging

- Backend logs: Check console output from `npm run dev`
- Frontend logs: Check Expo console
- Email delivery: Use Mailtrap for testing

## Production Deployment

### Backend

1. Deploy to a Node.js hosting service (Heroku, Railway, Render, etc.)
2. Set production environment variables
3. Use production SMTP provider (SendGrid, AWS SES)
4. Enable HTTPS
5. Configure CORS for your app's domain

### Frontend

1. Build for production:
```bash
expo build:android
expo build:ios
```

2. Submit to app stores

## Security

- Tokens are hashed before storage
- One-time use tokens
- Configurable expiration
- Anti-enumeration protection
- HTTPS in production
- HttpOnly cookies for sessions
- RLS (Row Level Security) in Supabase

## Troubleshooting

### Magic link emails not received
- Check spam folder
- Verify SMTP credentials in `.env`
- Check backend logs for errors
- For Mailtrap, check web interface

### Backend connection errors
- Ensure backend is running on correct port
- Update `BACKEND_URL` in frontend .env
- Check CORS configuration
- Verify firewall settings

### Token verification fails
- Check token hasn't expired (60 min default)
- Verify token hasn't been used
- Check database connection
- Review backend logs

## Documentation

- [Backend Documentation](backend/README.md)
- [Magic Link Setup Guide](docs/forgot-password.md)

## License

MIT

## Contributors

- SolvyApp Development Team
