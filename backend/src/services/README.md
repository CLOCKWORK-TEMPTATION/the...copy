# Services Module Documentation

## Overview
The Services module contains the core business logic of the application. Services encapsulate specific functionalities, orchestrate interactions with the database, external APIs, and other parts of the application, and ensure that business rules are consistently applied.

## Files and Their Functions

### analysis.service.ts
- **Purpose**: Encapsulates the business logic for data analysis
- **Key Functions**:
  - `runFullPipeline`: Orchestrates the complete analysis pipeline
  - `runStation1`: Performs the first station analysis using the Gemini service
  - `extractCharacters`: Extracts character information from analysis text
  - `extractRelationships`: Extracts relationship information from analysis text
- **Dependencies**:
  - `GeminiService` for AI-powered analysis
  - `logger` utility for logging
  - Type definitions from the types module
- **Key Features**:
  - Complete analysis pipeline orchestration
  - Integration with AI service for text analysis
  - Character and relationship extraction
  - Performance tracking with execution time
  - Comprehensive error handling
- **Analysis Pipeline**:
  - Station 1: Text analysis with character and relationship extraction
  - Stations 2-7: Mock implementations (to be implemented)

### analysis.service.test.ts
- **Purpose**: Contains unit and integration tests for analysis.service.ts
- **Key Test Cases**:
  - Pipeline execution with valid input
  - Character extraction from analysis text
  - Relationship extraction from analysis text
  - Error handling scenarios
  - Mocking of external dependencies
- **Testing Framework**: Vitest
- **Test Coverage**:
  - Happy path scenarios
  - Edge cases and error conditions
  - Mocking of external dependencies

### auth.service.ts
- **Purpose**: Houses the core business logic for user authentication and authorization
- **Key Functions**:
  - `signup`: Handles user registration
  - `login`: Handles user authentication
  - `getUserById`: Retrieves user information by ID
  - `verifyToken`: Verifies JWT tokens
  - `generateToken`: Generates JWT tokens
- **Dependencies**:
  - `bcrypt` for password hashing
  - `jsonwebtoken` for JWT operations
  - Database module for user data operations
- **Key Features**:
  - User registration with password hashing
  - User authentication with password verification
  - JWT token generation and verification
  - Secure user information handling
  - Comprehensive error handling
- **Security Considerations**:
  - Secure password hashing
  - Proper token handling
  - Secure user information handling

### auth.service.test.ts
- **Purpose**: Contains tests for auth.service.ts
- **Key Test Cases**:
  - User registration with valid data
  - User login with valid credentials
  - Error handling for invalid credentials
  - Token verification
  - User retrieval by ID
- **Testing Framework**: Vitest
- **Test Coverage**:
  - Happy path scenarios
  - Edge cases and error conditions
  - Security-related tests
  - Mocking of external dependencies

## Notes
- Services should be designed to be independent of the request/response cycle, focusing solely on business operations
- They often depend on other services or data access modules to perform their tasks
- Extensive testing of services is crucial as they contain the most critical business logic
- The analysis service implements a multi-stage pipeline for comprehensive text analysis
- The authentication service implements secure password handling and token management
- Both services follow security best practices for handling sensitive information

## Relationships with Other Modules
- The analysis service interacts with the Gemini service for AI-powered analysis
- The authentication service interacts with the database module for user data operations
- Both services are used by controllers to perform business operations
- The services module provides the core business logic for the application
- The services are used by the application to perform complex operations and maintain business rules