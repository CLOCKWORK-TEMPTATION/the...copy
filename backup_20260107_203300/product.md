# Product Overview

## Project Purpose
The Copy (النسخة) is a comprehensive drama analysis and screenplay development platform designed for Arabic content creators. It combines AI-powered analysis tools with professional production workflows to streamline the creative process from script to screen.

## Value Proposition
- **AI-Powered Script Analysis**: Automated drama analysis using Google Generative AI and Groq SDK for character development, plot structure, and dialogue evaluation
- **Self-Tape Suite**: Professional audition recording and management system for actors and casting directors
- **Director's Studio**: Complete project management workspace for production teams
- **Card Scanner**: Interactive landing page component with advanced visual effects
- **Real-time Collaboration**: Socket.io-based real-time updates and team collaboration features
- **Arabic-First Design**: RTL support and Arabic language optimization throughout the platform

## Key Features

### Core Capabilities
1. **Script Processing & Analysis**
   - PDF and DOCX screenplay upload and parsing
   - AI-driven character analysis and relationship mapping
   - Scene breakdown and structure analysis
   - Dialogue quality assessment

2. **Actor AI Arabic Suite**
   - Self-tape recording and playback
   - Audition management system
   - Performance analytics
   - Portfolio management

3. **Production Management**
   - Project creation and tracking
   - Team collaboration tools
   - Asset management
   - Progress monitoring

4. **Performance Optimization**
   - Advanced caching with Redis
   - Web Workers for heavy computations (particle physics, performance detection)
   - Lazy loading and code splitting
   - Performance budgets and monitoring

5. **Security & Monitoring**
   - Sentry error tracking and performance monitoring
   - OpenTelemetry distributed tracing
   - Rate limiting and CSRF protection
   - Session management with PostgreSQL

## Target Users

### Primary Users
- **Screenwriters**: Script analysis and development tools
- **Actors**: Self-tape recording and audition management
- **Directors**: Production planning and team coordination
- **Casting Directors**: Audition review and talent management
- **Production Teams**: Collaborative project management

### Use Cases
1. **Script Development**: Writers upload screenplays for AI-powered analysis and feedback
2. **Audition Process**: Actors record self-tapes, directors review and provide feedback
3. **Pre-Production**: Directors break down scripts, plan shoots, and coordinate teams
4. **Talent Discovery**: Casting directors search and evaluate actor portfolios
5. **Project Tracking**: Production teams monitor progress and manage deliverables

## Technology Stack Overview
- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js with TypeScript, Drizzle ORM
- **Database**: Neon PostgreSQL (serverless), MongoDB for specific features
- **AI/ML**: Google Generative AI, Groq SDK, Genkit
- **Real-time**: Socket.io, Redis for caching and pub/sub
- **Monitoring**: Sentry, OpenTelemetry, Prometheus, Grafana
- **Deployment**: Monorepo with pnpm workspaces, Docker support, blue-green deployment strategy
