# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application called "MorpheoAI" built with Expo. It's a dream interpretation app that allows users to log their dreams and get AI-generated interpretations and images using ChatGPT and DALL-E APIs.

## Core Technologies

- **React Native with Expo**: Cross-platform mobile development
- **Expo Router**: File-based navigation system
- **Clerk**: Authentication and user management
- **Zustand**: State management
- **Tamagui**: UI component library
- **TailwindCSS with NativeWind**: Styling framework
- **TypeScript**: Type safety

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Testing and quality
npm run test
npm run lint

# Reset project (moves starter code to app-example)
npm run reset-project
```

## Project Structure

```
app/
├── (auth)/                 # Authentication routes
├── (protected)/            # Protected routes (requires sign-in)
│   ├── (tabs)/            # Main tab navigation
│   │   ├── dreamhistory/  # Dream history tab
│   │   ├── logdream/      # Log dream tab
│   │   ├── profile/       # User profile tab
│   │   └── community/     # Community tab
│   ├── dream/[id].tsx     # Dream detail view
│   └── result/            # Dream result view
├── components/            # Reusable UI components
├── store/                 # Zustand state management
└── utils/                 # Utility functions

api/                       # API layer
├── dreamApi.ts           # Dream-related API calls
└── dallEApi.ts          # DALL-E image generation

constants/                # App constants
assets/                   # Images, fonts, and static assets
```

## Key Architecture Patterns

### Authentication Flow
- Uses Clerk for authentication with OAuth support
- Protected routes automatically redirect to `/auth` when unauthenticated
- Authentication state managed via Clerk's `SignedIn`/`SignedOut` components

### Navigation Structure
- File-based routing with Expo Router
- Layout files (`_layout.tsx`) define navigation structure
- Tab navigation for main app sections
- Stack navigation for detailed views

### State Management
- Zustand stores for different domains:
  - `authStore`: Authentication mode (login/register)
  - `dreamListStore`: Dream list management
  - `dreamResultStore`: Dream analysis results
  - `dreamDetailStore`: Individual dream details
  - `tabBarStore`: Tab bar visibility
  - `userStore`: User profile data

### API Layer
- Centralized API functions in `/api` directory
- Uses Expo Constants for environment-specific API URLs
- Bearer token authentication for protected endpoints
- Error handling with proper error messages

### Styling System
- TailwindCSS with NativeWind for React Native
- Tamagui for UI components
- Custom color palette with dream-themed colors (lavender, peach, etc.)
- Responsive design with mobile-first approach

## Key Features

1. **Dream Logging**: Users can input dream descriptions
2. **AI Analysis**: ChatGPT generates dream interpretations
3. **Image Generation**: DALL-E creates dream visualizations
4. **Dream History**: Users can view and manage past dreams
5. **Media Integration**: Photo library access for saving dream images

## Environment Configuration

- API URL configured in `app.json` extra field
- Clerk publishable key required as environment variable
- Separate configurations for development and production

## Testing

- Jest with `jest-expo` preset
- Test command: `npm run test`
- Watch mode available for development

## Platform-Specific Notes

### iOS
- Uses iCloud storage
- Requires photo library permissions
- Bundle identifier: `com.pokka974.morpheoaimobile`

### Android
- Requires storage and media permissions
- Adaptive icon configuration
- Package name: `com.pokka974.morpheoaimobile`

## Development Tips

- Use `@/*` import alias for cleaner imports
- Components follow React Native/Expo patterns
- State updates should go through Zustand actions
- API calls should include proper error handling
- Always check authentication state before API calls