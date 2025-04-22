# RealWorld API Backend - Express, TypeScript, Sequelize

## Overview

This project is a RealWorld-compatible backend implementation using:

- TypeScript
- Express.js
- Sequelize ORM
- MySQL Database

It implements the [RealWorld API Spec](https://github.com/gothinkster/realworld/tree/main/api) to create a Medium.com clone with features like authentication, article creation, commenting, favoriting, and following.

## Features

- JWT Authentication
- RESTful API endpoints
- User profiles
- Article CRUD operations
- Commenting system
- Article favoriting
- User following
- Article tagging
- Swagger API documentation

## Prerequisites

- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

## Getting Started

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/realworld-app-backend-typescript-express-sequelize.git
cd realworld-app-backend-typescript-express-sequelize
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials and other configurations.

4. Set up the database

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE realworld_app_backend_typescript_express_sequelize;"

# Run migrations
npm run db:migrate
```

### Running the Application

#### Development mode

```bash
npm run dev
```

The server will start at http://localhost:8000 with auto-reload on file changes.

#### Production mode

```bash
npm run build
npm start
```

### API Documentation

Swagger documentation is available at:

```
http://localhost:8000/api/docs
```

## Project Structure

```
└── src
    ├── controllers         # Request handlers
    ├── middleware          # Express middlewares
    ├── models              # Sequelize models
    ├── routes              # API routes
    ├── app.ts              # Express app setup
    └── index.ts            # Application entry point
```

## Testing

```bash
npm run test
```

## API Endpoints

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

## License

MIT
