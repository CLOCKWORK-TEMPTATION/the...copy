# Database Module Documentation

## Overview
The Database module is responsible for all database-related operations, including establishing and managing the database connection, defining the database schema, and providing utility functions for database interactions. It uses the Drizzle ORM with PostgreSQL as the database backend.

## Files and Their Functions

### index.ts
- **Purpose**: Handles database initialization and exports the database client
- **Key Functions**:
  - Configures the Neon database connection
  - Sets up the Drizzle ORM client
  - Exports the database connection pool and Drizzle client
- **Dependencies**:
  - `@neondatabase/serverless` for database connection
  - `drizzle-orm/neon-serverless` for ORM functionality
  - `ws` for WebSocket support
  - Local schema definitions
- **Key Features**:
  - Serverless database connection setup
  - WebSocket configuration for Neon
  - Environment variable validation
  - Drizzle client initialization with schema
- **Security Considerations**:
  - Proper error handling for missing database URL
  - Secure connection string handling

### index.test.ts
- **Purpose**: Contains tests for the database connection and core setup
- **Key Test Cases**:
  - Database URL validation
  - Connection pool initialization
  - WebSocket configuration
  - Drizzle client setup
  - Error handling for missing database URL
- **Testing Framework**: Vitest
- **Test Coverage**:
  - Happy path scenarios
  - Edge cases and error conditions
  - Configuration validation
  - Mocking of external dependencies

### schema.ts
- **Purpose**: Defines the database schema using Drizzle ORM
- **Key Tables**:
  - `sessions`: Stores session data for Express sessions
  - `users`: Stores user authentication information
  - `projects`: Stores project information for the Directors Studio
  - `scenes`: Stores scene information for the Directors Studio
  - `characters`: Stores character information for the Directors Studio
  - `shots`: Stores shot information for the Directors Studio
- **Key Features**:
  - UUID primary keys for all tables
  - Relationships between tables
  - Default values and constraints
  - Indexes for performance optimization
  - TypeScript type definitions for each table
- **Schema Structure**:
  - Each table has appropriate columns with data types
  - Relationships between tables are defined
  - Default values and constraints are specified
  - Indexes are created for performance optimization

## Notes
- This module centralizes database configuration and schema definition, making it easier to manage and scale the database layer
- Proper testing of database connections and schema integrity is crucial for application stability
- The schema definition is vital for database migrations and ensuring data consistency
- The module uses serverless database connections suitable for cloud deployment
- TypeScript types are generated from the schema for type-safe database operations

## Relationships with Other Modules
- The database module is used by various services to perform CRUD operations
- The schema definitions are used by the Drizzle ORM to generate type-safe database operations
- The database connection is used by the application to interact with the database
- The schema definitions are used by database migrations to maintain database structure
- The database module provides the foundation for data persistence in the application