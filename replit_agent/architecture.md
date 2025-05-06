# Architecture Overview

## 1. Overview

CAMIU Cosmetics is a full-stack e-commerce application that allows users to browse products, add items to cart, complete purchases, and manage orders. The application also includes an admin dashboard for product and order management.

The system follows a client-server architecture with:
- A React-based frontend for the user interface
- A Node.js/Express backend providing RESTful API services
- PostgreSQL database for data persistence using Drizzle ORM
- Authentication via Passport.js with session-based auth

## 2. System Architecture

### 2.1 High-Level Architecture

The application follows a layered architecture:

```
┌─────────────────┐
│    Client UI    │ React with TailwindCSS and shadcn/ui
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    API Layer    │ Express.js REST API endpoints
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Business Logic │ Server-side controllers and services
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Access    │ Drizzle ORM
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database     │ PostgreSQL
└─────────────────┘
```

### 2.2 Development & Production Environment

The application supports both development and production environments:
- Development: Vite's development server with HMR support
- Production: Optimized builds with server-side rendering support

## 3. Key Components

### 3.1 Frontend Architecture

The frontend is built using:
- **React**: Core UI library
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **React Query**: Data fetching and state management
- **React Hook Form**: Form management with zod validation
- **Wouter**: Lightweight routing library

The frontend follows a component-based architecture with:
- `/client/src/components`: Reusable UI components
- `/client/src/pages`: Page components corresponding to routes
- `/client/src/hooks`: Custom React hooks for shared logic
- `/client/src/lib`: Utility functions and type definitions

### 3.2 Backend Architecture

The backend is built with:
- **Node.js**: JavaScript runtime
- **Express**: Web framework for handling HTTP requests
- **Passport.js**: Authentication middleware
- **Drizzle ORM**: Type-safe database access layer

Key backend components:
- `server/index.ts`: Entry point for the Express application
- `server/routes.ts`: API route definitions
- `server/auth.ts`: Authentication configuration
- `server/storage.ts`: Data access layer
- `server/db.ts`: Database connection and configuration

### 3.3 Database Schema

The database schema is defined in `shared/schema.ts` using Drizzle ORM. Key entities include:

- **Users**: Customer accounts and admin users
- **Products**: E-commerce products with images, pricing, etc.
- **Categories**: Product categorization
- **Orders & Order Items**: Customer orders and their line items
- **Cart Items**: Shopping cart contents for users
- **Reviews**: Product reviews and ratings

### 3.4 Authentication

The application uses Passport.js with a local strategy for username/password authentication:
- Sessions stored in PostgreSQL using `connect-pg-simple`
- Passwords hashed using scrypt with salt
- Role-based authorization (regular users vs admins)

## 4. Data Flow

### 4.1 Client-Server Communication

1. The React client communicates with the Express server via RESTful API calls
2. Requests are authenticated using session cookies
3. Data is exchanged in JSON format
4. React Query manages client-side data fetching, caching, and state

### 4.2 Request Flow

Typical request flow:
1. User interacts with React UI component
2. Component triggers API call via React Query or mutation
3. Express route handler receives the request
4. Authentication/authorization middleware validates the request
5. Business logic processes the request
6. Data access layer interacts with PostgreSQL via Drizzle ORM
7. Response is sent back to the client
8. React UI updates based on the response

## 5. External Dependencies

The application integrates with several external services:

### 5.1 Payment Processing
- Stripe for payment processing (`@stripe/react-stripe-js` and `@stripe/stripe-js`)

### 5.2 UI Components
- Radix UI primitives for accessible components
- Recharts for data visualization in the admin dashboard
- Lucide React for icons

### 5.3 Development Tools
- Vite for development and build tooling
- Replit-specific plugins for development in Replit environment

## 6. Deployment Strategy

### 6.1 Docker-based Deployment

The application is containerized using Docker with:
- `Dockerfile` for the application container
- `docker-compose.yml` for orchestrating the app and database containers
- `.env.docker` for container-specific environment variables

This approach ensures consistency across environments and simplifies deployment.

### 6.2 Deployment Process

1. Build process:
   - Client UI is built with Vite
   - Server code is compiled with esbuild
   - Combined into a single deployable package

2. Database initialization:
   - Automatically runs migrations on startup using Drizzle Kit

3. Container configuration:
   - Node.js Alpine for minimal footprint
   - PostgreSQL for data persistence
   - Volume mounting for database durability

### 6.3 Environment Configuration

Environment-specific configuration is managed through:
- Environment variables for sensitive information
- Docker-specific environment files
- Node environment-aware configuration

## 7. Development Workflow

The project supports a modern development workflow with:
- Hot Module Replacement for frontend development
- TypeScript for type safety across client and server
- Shared types between frontend and backend
- ESBuild for fast server compilation