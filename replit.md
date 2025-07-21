# Mood Map Application

## Overview

This is a full-stack web application that visualizes geographic mood data on an interactive map. The application aggregates mood scores from various data sources (weather, health, safety, hygiene, and social sentiment) and displays them as colored polygons on a Google Maps interface. Users can filter data by categories and view detailed information about specific areas.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Maps**: Google Maps JavaScript API via @react-google-maps/api

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon Database (serverless PostgreSQL)
- **Build System**: ESBuild for production builds

## Key Components

### Database Schema
The application uses two main tables:
- `mood_data`: Stores mood scores for geographic areas with coordinates, category scores, and contributor data
- `data_sources`: Tracks external data source status and sync information

### Core Services
- **MoodAggregator**: Orchestrates data collection and score calculation
- **WeatherService**: Integrates with OpenWeather API for weather-based mood factors
- **SentimentService**: Analyzes social media sentiment (Twitter/Reddit APIs)
- **Storage Layer**: Abstracts database operations with both memory and database implementations

### UI Components
- **MapView**: Google Maps integration with polygon overlays for mood visualization
- **Sidebar**: Category filtering controls and data source status
- **DetailPanel**: Area-specific mood breakdown and contributing factors

## Data Flow

1. **Data Collection**: Services fetch data from external APIs (weather, social media)
2. **Score Calculation**: MoodAggregator combines category scores into overall mood ratings
3. **Storage**: Processed data is stored in PostgreSQL with geographic coordinates
4. **Filtering**: Frontend applies category filters to calculate filtered scores
5. **Visualization**: Map displays color-coded polygons based on mood scores
6. **Interaction**: Users can click areas for detailed breakdowns

## External Dependencies

### Required APIs
- **Google Maps API**: For map display and polygon rendering
- **OpenWeather API**: Weather data for mood calculation
- **Twitter/X API**: Social sentiment analysis (optional)
- **Reddit API**: Social sentiment analysis (optional)

### Database
- **Neon Database**: Serverless PostgreSQL for production
- **Drizzle ORM**: Type-safe database operations and migrations

### Development Tools
- **Replit Integration**: Development environment with error overlay and cartographer
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code quality and formatting

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: ESBuild bundles server to `dist/index.js`
- Database: Drizzle handles schema migrations

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API key
- `OPENWEATHER_API_KEY`: Weather service API key
- `TWITTER_API_KEY`: Social media integration (optional)
- `REDDIT_API_KEY`: Social media integration (optional)

### Production Configuration
- Express serves static files from `dist/public`
- Database migrations run via `drizzle-kit push`
- Environment-specific API key configuration
- Graceful fallbacks for missing API keys

The application is designed to work with or without external API keys, using mock data when services are unavailable. This ensures the core functionality remains accessible during development and provides resilience in production.