# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Nx monorepo containing two main components of the MorpheoAI dream interpretation platform:

1. **apps/api**: Node.js/TypeScript backend API (formerly deep-dreamer-api)
2. **apps/mobile**: React Native mobile application built with Expo (formerly morpheoai)

## Repository Structure

```
morpheo/
├── apps/
│   ├── api/              # Backend API service
│   │   ├── src/
│   │   │   ├── controllers/  # Route handlers
│   │   │   ├── services/     # Business logic
│   │   │   ├── routes/       # Express routes
│   │   │   ├── middlewares/  # Authentication & validation
│   │   │   └── utils/        # Utilities (logging, rate limiting)
│   │   ├── prisma/          # Database schema and migrations
│   │   ├── types/           # TypeScript type definitions
│   │   └── project.json     # Nx project configuration
│   └── mobile/              # Mobile app
│       ├── app/             # Expo Router app directory
│       ├── components/      # Reusable UI components
│       ├── store/           # Zustand state management
│       ├── api/             # API layer
│       ├── CLAUDE.md        # Mobile-specific documentation
│       └── project.json     # Nx project configuration
├── libs/                    # Shared libraries (future use)
├── nx.json                  # Nx workspace configuration
├── package.json             # Root package.json with all dependencies
└── tsconfig.base.json       # Base TypeScript configuration
```

## Nx Workspace Commands

### Global Commands
```bash
# Show all projects
nx show projects

# Show project dependency graph
nx graph

# Run affected tests/builds based on changes
nx affected:test
nx affected:build

# Cache management
nx reset  # Clear Nx cache
```

## Backend API (apps/api)

### Core Technologies
- **Node.js with TypeScript**: Server runtime and type safety
- **Express.js**: Web framework
- **Prisma**: Database ORM and migrations
- **Clerk**: Authentication and user management
- **OpenAI**: ChatGPT and DALL-E integration
- **Winston**: Logging with file rotation
- **Swagger**: API documentation
- **ESLint**: Code linting

### Development Commands

```bash
# Backend API commands
nx serve api       # Start development server with nodemon
nx build api       # Compile TypeScript to JavaScript
nx lint api        # Run ESLint
nx test api        # Run Jest tests
nx run api:prisma  # Open Prisma Studio for database management
nx run api:db:migrate     # Run Prisma migrations
nx run api:db:studio      # Open Prisma Studio

# Mobile app commands  
nx serve mobile    # Start Expo development server
nx start mobile    # Alternative way to start Expo
nx run-ios mobile  # Run on iOS simulator
nx run-android mobile # Run on Android emulator
nx test mobile     # Run Jest tests
nx lint mobile     # Run Expo lint

# Workspace-level convenience commands
npm run api        # Shortcut for nx serve api
npm run mobile     # Shortcut for nx serve mobile
npm run build:api  # Shortcut for nx build api
npm run prisma     # Shortcut for nx run api:prisma
```

### API Architecture

#### Authentication & Authorization
- Uses Clerk SDK for authentication
- JWT token validation via `@clerk/express` middleware
- Protected routes require valid bearer tokens
- Rate limiting implemented for API protection

#### Core Services
- **ChatGPT Service**: Dream interpretation using OpenAI GPT models
- **DALL-E Service**: Dream visualization image generation
- **Dream Service**: Dream management and storage
- **Logger Service**: Centralized logging with Winston

#### Database Layer
- Prisma ORM with PostgreSQL/SQLite
- Database migrations in `prisma/migrations/`
- Schema defined in `prisma/schema.prisma`
- Use `npm run prisma` to manage database

#### API Documentation
- Swagger UI available at `/api-docs` endpoint
- API specifications defined in `swaggerOptions.ts`
- All endpoints documented with request/response schemas

### Key API Endpoints

- `POST /api/dreams` - Create dream interpretation
- `GET /api/dreams` - Get user's dreams
- `POST /api/dalle` - Generate dream images
- `POST /api/chatgpt` - Direct ChatGPT interactions
- `POST /api/webhook` - Clerk webhook handling

### Environment Configuration

Backend requires these environment variables:
- `OPENAI_API_KEY` - OpenAI API access
- `CLERK_SECRET_KEY` - Clerk authentication
- `DATABASE_URL` - Database connection string
- `PORT` - Server port (default: 3000)

### Development Workflow

1. **Backend Development**:
   - Work in `deep-dreamer-api/` directory
   - Use `npm start` for hot reload development
   - Run `npm run lint` before commits
   - Use Prisma Studio for database inspection

2. **Database Changes**:
   - Modify `prisma/schema.prisma`
   - Run `npx prisma migrate dev` to create migrations
   - Use `npx prisma generate` to update client

3. **API Testing**:
   - Access Swagger documentation at `/api-docs`
   - Test endpoints with valid Clerk authentication tokens
   - Check logs in `logs/` directory for debugging

### Error Handling & Logging

- Centralized error handling in Express middleware
- Winston logger with rotating file streams
- Structured logging with timestamps and levels
- Access logs and error logs separated

### Security Features

- Helmet.js for security headers
- CORS configuration for cross-origin requests
- Rate limiting per IP address
- Input validation with Zod schemas
- JWT token verification for protected routes

## Integration Points

The mobile app communicates with the backend API through:
- RESTful API endpoints with JSON payloads
- Bearer token authentication using Clerk tokens
- Image uploads and dream data synchronization
- Real-time error handling and user feedback

## Nx Monorepo Benefits

### Unified Development
- **Single repository**: All code in one place with shared tooling
- **Dependency management**: Unified package.json prevents version conflicts
- **Build optimization**: Nx caching and smart rebuilds
- **Code sharing**: Easy to extract shared libraries when needed

### Developer Experience
- **Consistent commands**: Same Nx patterns for both API and mobile
- **Project graph**: Visual dependency tracking with `nx graph`
- **Affected builds**: Only rebuild what changed with `nx affected`
- **IDE integration**: Better workspace navigation and refactoring

### Workspace Commands
```bash
# Work with both projects
nx run-many --target=build --projects=api,mobile
nx run-many --target=test --projects=api,mobile
nx run-many --target=lint --projects=api,mobile

# Run commands based on git changes
nx affected:build    # Only build affected projects
nx affected:test     # Only test affected projects
nx affected:lint     # Only lint affected projects
```

### Future Extensibility
- **Shared libraries**: Create `libs/` for shared TypeScript types, utilities
- **Build optimization**: Nx can optimize builds across the entire workspace
- **Plugin ecosystem**: Rich ecosystem of Nx plugins for various technologies
- **CI/CD integration**: Better pipeline optimization with affected builds