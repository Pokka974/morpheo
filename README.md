# 🌙 MorpheoAI

A dream interpretation platform that combines AI-powered analysis with beautiful visualizations. Built as an Nx monorepo with a Node.js backend API and React Native mobile application.

## 🏗️ Architecture

This monorepo contains two main applications:

```
morpheo/
├── apps/
│   ├── api/              # Node.js/Express backend
│   └── mobile/           # React Native/Expo mobile app
├── libs/                 # Shared libraries (future)
└── docs/                 # Documentation
```

### 🔧 Backend API (`apps/api`)
- **Node.js** with **TypeScript** and **Express.js**
- **OpenAI GPT** for dream interpretation
- **DALL-E** for dream visualization
- **Prisma** ORM with database migrations
- **Clerk** for authentication
- **Swagger** API documentation
- **Winston** logging with file rotation

### 📱 Mobile App (`apps/mobile`)
- **React Native** with **Expo** framework
- **Expo Router** for file-based navigation
- **TypeScript** for type safety
- **Tamagui** UI component library
- **NativeWind** (TailwindCSS for React Native)
- **Zustand** for state management
- **Clerk** for authentication

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **yarn**
- **Expo CLI**: `yarn global add @expo/cli`
- **iOS Simulator** (macOS) or **Android Studio** for mobile development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd morpheo
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp apps/mobile/.env.example apps/mobile/.env
   ```
   
   Configure the following variables:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `CLERK_SECRET_KEY` - Clerk backend secret
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk frontend public key
   - `DATABASE_URL` - Database connection string

## 💻 Development

### Nx Commands

```bash
# Start both API and mobile in development
yarn dev

# Start individual applications
yarn api          # Start backend API
yarn mobile       # Start mobile app

# Build applications
yarn build:api    # Build backend
yarn build:mobile # Build mobile app

# Run tests
yarn nx test api          # Test backend
yarn nx test mobile       # Test mobile app

# Lint code
yarn nx lint api          # Lint backend
yarn nx lint mobile       # Lint mobile app

# Database operations
yarn prisma       # Open Prisma Studio
yarn db:migrate   # Run database migrations
yarn db:generate  # Generate Prisma client
```

### Backend Development (`apps/api`)

```bash
# Start development server
yarn nx serve api

# View API documentation
# Visit http://localhost:3000/api-docs

# Database management
yarn nx run api:prisma        # Open Prisma Studio
yarn nx run api:db:migrate    # Run migrations
```

### Mobile Development (`apps/mobile`)

```bash
# Start Expo development server
yarn nx serve mobile

# Run on specific platforms
yarn nx run-ios mobile      # iOS simulator
yarn nx run-android mobile  # Android emulator

# Build for production
yarn nx build mobile
```

## 🌟 Features

### 🧠 AI-Powered Dream Analysis
- **Natural Language Processing** with OpenAI GPT models
- **Contextual interpretation** based on dream content and emotions
- **Personalized insights** and symbolic analysis

### 🎨 Dream Visualization
- **AI-generated images** using DALL-E
- **Custom prompt engineering** for dream-like aesthetics
- **High-quality visual representations** of dream content

### 📱 Cross-Platform Mobile App
- **Beautiful UI** with Tamagui components
- **File-based routing** with Expo Router
- **Offline support** and local caching
- **Photo library integration** for saving dream images

### 🔐 Authentication & User Management
- **Secure authentication** with Clerk
- **OAuth support** (Google, Apple, etc.)
- **User profile management**
- **Protected routes and API endpoints**

### 📊 Dream History & Analytics
- **Personal dream journal** with search functionality
- **Dream categorization** and tagging
- **Export capabilities** for dream data

## 📁 Project Structure

```
apps/
├── api/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth & validation
│   │   └── utils/           # Utilities
│   ├── prisma/             # Database schema
│   └── types/              # TypeScript types
└── mobile/
    ├── app/                # Expo Router pages
    ├── components/         # Reusable components
    ├── store/              # Zustand stores
    ├── api/                # API client
    └── utils/              # Mobile utilities
```

## 🔧 Technology Stack

| Category | Backend | Mobile |
|----------|---------|---------|
| **Runtime** | Node.js | React Native |
| **Language** | TypeScript | TypeScript |
| **Framework** | Express.js | Expo |
| **Database** | Prisma ORM | - |
| **Auth** | Clerk | Clerk |
| **UI** | Swagger | Tamagui + NativeWind |
| **State** | - | Zustand |
| **Navigation** | Express Router | Expo Router |
| **Testing** | Jest | Jest + Expo |
| **Linting** | ESLint | ESLint + Expo |

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/webhook` - Clerk webhook

### Dreams
- `GET /api/dreams` - Get user dreams
- `POST /api/dreams` - Create dream interpretation
- `GET /api/dreams/:id` - Get specific dream
- `DELETE /api/dreams/:id` - Delete dream

### AI Services
- `POST /api/chatgpt` - Direct ChatGPT interaction
- `POST /api/dalle` - Generate dream images

## 📱 Mobile App Screens

- **Authentication** - Sign in/up with OAuth
- **Dream Logging** - Input dream descriptions
- **Dream History** - Browse past dreams with search
- **Dream Detail** - View interpretation and images
- **AI Results** - Real-time dream analysis
- **Profile** - User settings and preferences
- **Community** - Share and discover dreams

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
yarn nx build api

# Deploy to your preferred platform
# (Vercel, Railway, Heroku, etc.)
```

### Mobile App Deployment
```bash
# Build for app stores
yarn nx build mobile

# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation for API changes
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT and DALL-E APIs
- **Expo** for React Native development platform
- **Clerk** for authentication services
- **Nx** for monorepo tooling
- **Prisma** for database management

---

<div align="center">
  <p>Built with ❤️ by Julien de Fondaumière</p>
  <p>🌙 Sweet dreams are made of AI 🌙</p>
</div>