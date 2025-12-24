# Controllers Module Documentation

## Overview

The Controllers module contains the application's controllers, which handle incoming HTTP requests, process them by interacting with corresponding services, and send appropriate HTTP responses back to the client. Each controller groups related routes and their respective handler functions.

## Files and Their Functions

### analysis.controller.ts

- **Purpose**: Manages API endpoints related to data analysis
- **Key Functions**:
  - `runSevenStationsPipeline`: Handles requests to analyze text through the seven-station pipeline
  - `getStationDetails`: Provides information about the analysis stations
- **Dependencies**:
  - `express` for request/response handling
  - `logger` utility for logging
  - `StationsOrchestrator` (mocked in tests) for pipeline execution
- **Key Features**:
  - Input validation for text analysis requests
  - Error handling for pipeline execution
  - Performance tracking with execution time
  - Text-only output format for analysis results
- **Security Considerations**:
  - Input validation to prevent injection attacks
  - Proper error handling to avoid information leakage

### analysis.controller.test.ts

- **Purpose**: Contains unit and integration tests for analysis.controller.ts
- **Key Test Cases**:
  - Pipeline execution with valid text
  - Error handling for invalid text inputs
  - Response format validation
  - Station information retrieval
  - Error handling scenarios
- **Testing Framework**: Vitest
- **Test Coverage**:
  - Happy path scenarios
  - Edge cases and error conditions
  - Response validation
  - Mocking of external dependencies

### auth.controller.ts

- **Purpose**: Handles all API endpoints related to user authentication and authorization
- **Key Functions**:
  - `signup`: Handles user registration
  - `login`: Handles user authentication
  - `logout`: Handles user logout
  - `getCurrentUser`: Retrieves current user information
- **Dependencies**:
  - `express` for request/response handling
  - `authService` for business logic
  - `logger` utility for logging
  - `zod` for input validation
- **Key Features**:
  - Input validation using Zod schemas
  - Secure session management with httpOnly cookies
  - Error handling for authentication operations
  - User information retrieval
- **Security Considerations**:
  - Input validation to prevent injection attacks
  - Secure session management
  - Proper error handling to avoid information leakage

### auth.controller.test.ts

- **Purpose**: Contains tests for auth.controller.ts
- **Key Test Cases**:
  - User registration with valid data
  - User login with valid credentials
  - Error handling for invalid inputs
  - Session management verification
  - User information retrieval
- **Testing Framework**: Vitest
- **Test Coverage**:
  - Happy path scenarios
  - Edge cases and error conditions
  - Security-related tests
  - Mocking of external dependencies

## Notes

- Controllers should be lean, focusing primarily on request handling, input validation, and delegating business logic to services
- Error handling should be consistent across all controllers, often leveraging a centralized error-handling middleware
- Each controller is typically associated with a specific resource or domain area of the application
- The analysis controller implements a text-only output format as required by the system's design principles
- The authentication controller implements secure session management with httpOnly cookies
- Input validation is implemented using Zod schemas for both controllers

## Relationships with Other Modules

- Controllers interact with corresponding services to perform business logic
- The analysis controller relies on the StationsOrchestrator for pipeline execution
- The authentication controller relies on the authService for business logic
- Both controllers use the logger utility for logging
- The analysis controller implements a specific pipeline execution flow as defined by the system's design principles
