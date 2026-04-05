# CarePoint Health Backend

NestJS 11 API for AI-powered hospital appointment booking.

## Features

- 🏥 Appointment booking system
- 🤖 AI chatbot integration with Groq
- 👤 User authentication with JWT
- 🗄️ PostgreSQL database with TypeORM
- 📊 Swagger API documentation
- 🔄 Session management with Redis

## Quick Start

```bash
npm install --legacy-peer-deps
npm run start:dev
```

API available at [http://localhost:3001](http://localhost:3001)

## Environment Setup

Create `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/carepoint_db

# Supabase (for production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Redis/Upstash
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key

# App
PORT=3001
NODE_ENV=development
```

## Database Setup

1. **Local PostgreSQL**
   ```bash
   createdb carepoint_db
   npm run migration:run
   npm run start:seeder
   ```

2. **Supabase**
   - Create project at supabase.com
   - Copy connection string to DATABASE_URL
   - Run migrations in Supabase SQL editor

## Project Structure

```
src/
├── modules/                # Feature modules
│   ├── auth/              # Authentication
│   ├── chatbot/           # AI chat processing
│   ├── vet_appointments/  # Appointments
│   ├── vets/              # Doctor profiles
│   └── users/             # User management
├── common/                # Shared code
│   ├── guards/            # Auth guards
│   ├── pipes/             # Validation pipes
│   └── decorators/        # Custom decorators
├── config/                # Configuration
├── core/                  # Core utilities
├── middleware/            # Express middleware
├── seeds/                 # Database seeds
└── uploads/               # File uploads
```

## Key Modules

### Auth Module
- JWT authentication
- Passport strategies
- Role-based access control

### Chatbot Module
- Groq AI integration
- Conversation management
- Appointment intake flow

### Appointments Module
- Booking system
- Slot management
- Calendar integration

## API Documentation

Swagger docs available at `/api` when running locally.

## Database

Uses TypeORM with PostgreSQL:

- **Entities**: Database models
- **Migrations**: Schema changes
- **Seeds**: Initial data

## Caching & Sessions

Redis for:
- Session storage
- API response caching
- Rate limiting

## Deployment

Deploy to Railway with PostgreSQL and Redis add-ons.

## Available Scripts

- `npm run start:dev` - Development server with watch
- `npm run start:debug` - Debug mode
- `npm run build` - Production build
- `npm run test` - Unit tests
- `npm run test:e2e` - E2E tests
- `npm run migration:run` - Run migrations
- `npm run start:seeder` - Seed database