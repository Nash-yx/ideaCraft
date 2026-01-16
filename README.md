# IdeaCraft

A web application for capturing and organizing creative ideas with AI-powered project planning.

## Features

- **Idea Management** - Create, edit, delete, and organize your ideas
- **Tag Management** - Categorize and filter ideas using custom tags
- **User Profile Management** - Customize profile with avatar, bio, and background
- **Explore Ideas** - Discover and browse ideas from other users
- **Authentication** - Local login + Google & GitHub OAuth
- **Public Sharing** - Share ideas with unique links
- **Favorites** - Bookmark ideas from other users
- **AI Project Planner** - Break down ideas into user stories and tasks using Gemini AI

## Screenshots

### Dashboard
![Dashboard](screenshots/image.png)

### Idea Management
![Idea Management](screenshots/idea-management.png)

### AI Project Planner
![AI Kanban Board](screenshots/ai-kanban.png)

### User Profile
![User Profile](screenshots/profile.png)

### Explore Page
![Explore Ideas](screenshots/explore.png)

> **Note**: Add screenshots to the `screenshots/` directory to display them here.

## Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: MySQL 8+
- **ORM**: Sequelize
- **Authentication**: Passport.js (Local, Google OAuth, GitHub OAuth)
- **Session**: Express Session
- **Logging**: Winston + Morgan

### Frontend
- **Template Engine**: Handlebars
- **Styling**: CSS
- **Scripting**: JavaScript

### AI Integration
- **AI Model**: Google Gemini API

### DevOps
- **Containerization**: Docker

## Quick Start

### Prerequisites

- Node.js 22+
- MySQL 8+
- Docker
- Git

### Installation

**1. Clone the repository**

```bash
git clone <repository-url>
cd ideaCraft
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Copy `.env.example` and create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` file and configure required environment variables (see **Environment Variables** section below).

**4. Set up database**

Create database and run migrations:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE idea_craft;"

# Run migrations
npx sequelize-cli db:migrate
```

**5. Start the application**

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

Server runs at `http://localhost:3000`

---

### Running with Docker

**1. Build Docker image**

```bash
docker build -t ideacraft:latest .
```

**2. Run container**

```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  --name ideacraft \
  ideacraft:latest
```

**Notes:**
- Container runs on port 3000
- `.env` file must be configured before running
- `uploads/` directory is mounted as a volume for data persistence
- Database host should be set to `host.docker.internal` in `.env` when running in Docker:
  ```env
  DATABASE_URL=mysql://your_username:your_password@host.docker.internal:3306/idea_craft
  ```

**Useful Docker commands:**

```bash
docker ps                    # View running containers
docker logs ideacraft        # View container logs
docker logs -f ideacraft     # Follow logs in real-time
docker stop ideacraft        # Stop container
docker rm ideacraft          # Remove container
docker exec -it ideacraft sh # Access container shell
```

---

### Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Application Settings
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=mysql://your_username:your_password@127.0.0.1:3306/idea_craft

# Session (Required)
SESSION_SECRET=your_session_secret_key

# File Upload
UPLOAD_PATH=uploads
MAX_FILE_SIZE=10485760  # 10MB

# Logging
LOG_LEVEL=debug

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# AI Features (Optional)
GEMINI_API_KEY=
```

## Commands

```bash
npm run dev       # Start with hot reload
npm start         # Production mode
npm run lint      # Check code style
npm run lint:fix  # Fix code style
```

### Database

```bash
npx sequelize-cli db:migrate        # Run migrations
npx sequelize-cli db:migrate:undo   # Rollback
npx sequelize-cli db:seed:all       # Seed data
```

## Project Structure

```
ideaCraft/
├── app.js              # Application entry point
├── controllers/        # Request handlers
├── services/           # Business logic layer
├── models/             # Sequelize models
├── routes/             # Express routes
├── middleware/         # Auth, CSRF, error handling, rate limiting
├── views/              # Handlebars templates
│   ├── layouts/        # Template layouts
│   └── partials/       # Reusable components
├── public/             # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── img/            # Images
├── config/             # Configuration files
│   ├── config.js       # Database configuration
│   └── passport.js     # Authentication strategies
├── migrations/         # Database migrations
├── seeders/            # Database seeders
├── utils/              # Helper functions
├── logs/               # Application logs
├── uploads/            # User-uploaded files (avatars, etc.)
└── Dockerfile          # Docker configuration
```

## License

ISC
