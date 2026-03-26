# Content Microservice

## Overview

This is a **Content Management Microservice** developed as part of a university business internship.
It is responsible for managing all content-related operations in an e-commerce web platform,
including product catalogs, banners, media management (images, videos, and audio files), and
associated metadata.

## Purpose

Built for a distributed microservices architecture, this service handles:

- **Product Management**: Product creation, updates, deletion, and categorization
- **Media Management**: Batch and individual upload handling with AWS S3 integration for persistent
  storage
- **Banner Management**: Dynamic banner content for the e-commerce frontend
- **Video & Media Metadata**: Management of video tags and media classifications
- **User Content Permissions**: Integrates with the authentication microservice to enforce role-based access control, ensuring endpoints are only accessible to authorized users with appropriate permissions

## Technology Stack

### Core Framework & Runtime

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for REST API endpoints
- **TypeScript** - Strongly-typed JavaScript for improved code reliability and maintainability

### Database Layer

- **MariaDB** - Relational database for structured product and banner data
- **Sequelize ORM** - Object-Relational Mapping for MariaDB interactions
- **MongoDB (Mongoose)** - NoSQL database for flexible schema data (logs, sessions, user settings,
  MFA)
- **Redis** - In-memory cache for session and performance optimization

### Authentication & Authorization

- **JWT (JSON Web Tokens)** - Stateless authentication mechanism
- **OpenFGA** - Fine-grained authorization and access control
- **Argon2** - Secure password hashing algorithm
- **Node-vault** - Secrets management and environment variable handling

### Cloud & Media Storage

- **AWS S3 Client** - Cloud storage integration for media files and presigned URL generation

### Utilities & Tools

- **Axios** - HTTP client for external service communication
- **Socket.io** - Real-time bidirectional communication
- **Moment.js** - Date and time manipulation
- **UUID** - Unique identifier generation
- **Slugify** - URL-friendly string conversion
- **MailerSend** - Email delivery service
- **Handlebars** - Template engine for dynamic content
- **Log4js** - Logging framework
- **Morgan** - HTTP request logger middleware
- **CORS** - Cross-Origin Resource Sharing middleware
- **Express Validator** - Input validation and sanitization

### Development & Testing

- **Nodemon** - Automatic server restart on file changes
- **Jest** - Unit and integration testing framework
- **Sequelize CLI** - Database migration and management tools
- **ts-node** - TypeScript execution and REPL
- **TypeScript Compiler** - Type checking and transpilation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MariaDB instance
- MongoDB instance
- AWS S3 access credentials

### Installation

```bash
npm install
```

### Development

Start the development server with auto-reload:

```bash
npm start
```

### Production

Run in production mode:

```bash
npm run prod
```

### TypeScript Watch Mode

Compile TypeScript and copy resources on file changes:

```bash
npm run tsw
```

## Project Structure

```
src/
├── config/         - Application configuration, database, middleware setup
├── controllers/    - Request handlers for business logic
├── models/         - Database models (MariaDB & MongoDB)
├── routes/         - API route definitions
├── services/       - Business logic services
├── middleware/     - Custom middleware (authentication, authorization)
├── utils/          - Helper functions and utilities
├── viewmodels/     - Request/response data transfer objects
├── types/          - TypeScript type definitions
├── constants/      - Application constants and error definitions
└── resources/      - Static resources (HTML, JSON templates)
```

## API Endpoints

- `GET /media/link` - Get presigned S3 upload URL for single media file
- `POST /media/links` - Get presigned S3 upload URLs for batch media files
- `GET /video` - List all videos with pagination
- `GET /video/:id` - Retrieve specific video
- `POST /video` - Create new video entry
- `PUT /video` - Update video
- `DELETE /video` - Delete video
- `PUT /video/activate/:id` - Activate video
- `PUT /video/deactivate/:id` - Deactivate video
- `GET /video/active` - Get currently active video

## License

UNLICENSED - Private project for internship purposes
