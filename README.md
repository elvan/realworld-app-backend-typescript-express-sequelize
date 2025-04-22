# ![RealWorld Example App](https://raw.githubusercontent.com/gothinkster/realworld/master/media/realworld.png)

> ### Express/TypeScript/Sequelize codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

[![RealWorld Backend](https://img.shields.io/badge/realworld-backend-%23783578.svg)](http://realworld.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express-4.18-green)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.33-orange)](https://sequelize.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)

### [Demo](https://demo.realworld.io/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)


This codebase was created to demonstrate a fully fledged fullstack application built with **Express.js, TypeScript, and Sequelize** including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the **Express.js** community styleguides & best practices.

For more information on how this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.


# How it works

This is a backend implementation of the RealWorld spec using:

- **TypeScript** for type safety and enhanced developer experience
- **Express.js** as the web framework for handling HTTP requests
- **Sequelize ORM** for database operations and model management
- **MySQL** as the database engine
- **JWT** for secure authentication

The application follows a structured architecture:

- Models define database entities and relationships
- Controllers handle request processing and response formatting
- Middleware provides cross-cutting concerns like authentication and validation
- Routes define API endpoints and connect them to controllers

### Project Structure

```
└── src
    ├── controllers         # Request handlers
    ├── middleware          # Express middlewares
    ├── models              # Sequelize models
    ├── routes              # API routes
    ├── app.ts              # Express app setup
    └── index.ts            # Application entry point
```

# Getting started

## Prerequisites

- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/realworld-app-backend-typescript-express-sequelize.git
cd realworld-app-backend-typescript-express-sequelize

# Install dependencies
npm install

# Copy environment variables file
cp .env.example .env

# Edit the .env file with your database credentials and other configurations

# Create the database
mysql -u root -p -e "CREATE DATABASE realworld_app_backend_typescript_express_sequelize;"

# Run migrations
npm run db:migrate
```

## Running the application

```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm run build
npm start
```

The server will start at http://localhost:8000.

## API Documentation

Swagger documentation is available at: http://localhost:8000/api/docs

## Testing

```bash
npm run test
```

# API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login

### User and Profile
- `GET /api/user` - Get current user
- `PUT /api/user` - Update user
- `GET /api/profiles/:username` - Get profile
- `POST /api/profiles/:username/follow` - Follow user
- `DELETE /api/profiles/:username/follow` - Unfollow user

### Articles
- `GET /api/articles` - List articles
- `GET /api/articles/feed` - Feed articles
- `GET /api/articles/:slug` - Get article
- `POST /api/articles` - Create article
- `PUT /api/articles/:slug` - Update article
- `DELETE /api/articles/:slug` - Delete article
- `POST /api/articles/:slug/favorite` - Favorite article
- `DELETE /api/articles/:slug/favorite` - Unfavorite article

### Comments
- `GET /api/articles/:slug/comments` - Get comments
- `POST /api/articles/:slug/comments` - Add comment
- `DELETE /api/articles/:slug/comments/:id` - Delete comment

### Tags
- `GET /api/tags` - Get tags

# License

MIT
