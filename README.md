# IdeaCraft

A modern web application for capturing, organizing, and managing your creative ideas with a beautiful, intuitive interface.

## 🚀 Features

### Current Features (Complete CRUD System)
- **User Authentication System**
  - Local authentication with email/password
  - Google OAuth 2.0 integration
  - GitHub OAuth integration
  - Secure session management with Passport.js

- **User Profile Management**
  - Customizable profile with avatar upload
  - Bio and role customization
  - Dynamic background color themes
  - Image processing with Sharp

- **Complete Ideas Management System**
  - **Full CRUD Operations**: Create, Read, Update, Delete ideas
  - **Dual View Modes**: Quick preview modal + detailed page view
  - **Smart Interaction**: Click card for preview, click icon for full page
  - **Public/Private Sharing**: Unique share links for public ideas
  - **Real-time Statistics**: Dynamic counters with trend indicators
  - **Permission Control**: Users can only edit/delete their own ideas

- **Advanced Search & Discovery**
  - **Hybrid Search Strategy**: Frontend search for personal ideas, backend search for public ideas
  - **Secure Backend Search**: LIKE injection protection with input validation and sanitization
  - **Cross-field Search**: Search across titles, content, and author names
  - **Search State Management**: URL-based search with shareable results
  - **Performance Optimized**: Result limits and efficient MySQL queries
  - **Progressive Enhancement**: Loading states, keyboard shortcuts, and visual feedback

- **Modern Interactive UI/UX**
  - **Responsive Design**: Custom CSS with mobile-first approach
  - **Preview Modal System**: Quick idea preview without leaving the list
  - **Keyboard Shortcuts**: Esc, Ctrl+Enter, Ctrl+E for efficient navigation
  - **Loading States**: Visual feedback for all operations
  - **Interactive Elements**: Hover effects, animations, and transitions
  - **Smart Navigation**: Contextual back links and breadcrumbs

### Future Enhancements
- Tag system integration with filtering
- Email notifications for shared ideas
- Idea collaboration features
- Export functionality (PDF, JSON)
- Advanced analytics and reporting
- API rate limiting and caching

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with Express.js v5.1.0
- **Database**: MySQL with Sequelize ORM
- **Authentication**: Passport.js (Local, Google OAuth, GitHub OAuth)
- **Session Storage**: Express Session with Redis support
- **Security**: bcryptjs for password hashing
- **File Upload**: Multer with Sharp for image processing
- **Logging**: Winston with Morgan for HTTP logging

### Frontend
- **Template Engine**: Handlebars (HBS)
- **Styling**: Custom CSS with modern design
- **Icons**: Font Awesome
- **Interactive Elements**: Vanilla JavaScript

### Development Tools
- **Linting**: ESLint with neostandard
- **Hot Reload**: Nodemon
- **Database Migrations**: Sequelize CLI
- **Environment**: dotenv for configuration

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Redis (optional, for session storage)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ideaCraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_NAME=idea_craft
   
   # Session Secret
   SESSION_SECRET=your_session_secret_key
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   
   # GitHub OAuth (optional)
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
   
   # Server Configuration
   PORT=3000
   ```

4. **Database setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE idea_craft;"
   
   # Run migrations
   npx sequelize-cli db:migrate
   
   # Optional: Seed sample data
   npx sequelize-cli db:seed:all
   ```

## 🚀 Usage

### Development
```bash
npm run dev
```
Server will start at `http://localhost:3000` with hot reload enabled.

### Production
```bash
npm start
```

### Linting
```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Database Operations
```bash
# Run pending migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run seeders
npx sequelize-cli db:seed:all
```

## 📁 Project Structure

```
ideaCraft/
├── app.js                     # Application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── CLAUDE.md                 # AI assistant instructions
├── spec.md                   # Project specifications
│
├── config/
│   ├── config.json           # Database configuration
│   └── passport.js           # Authentication strategies
│
├── models/                   # Sequelize models
│   ├── index.js              # Model loader
│   ├── user.js               # User model
│   ├── idea.js               # Idea model
│   ├── tag.js                # Tag model
│   └── ideatag.js            # Junction table for ideas-tags
│
├── controllers/              # Business logic controllers
│   ├── user-controller.js    # User authentication & profile
│   └── idea-controller.js    # Ideas CRUD operations
│
├── services/                 # Business logic services
│   ├── user-services.js      # User-related operations
│   └── idea-services.js      # Ideas and tags management
│
├── routes/
│   └── index.js              # Main routing
│
├── middleware/               # Custom middleware
│   ├── auth.js               # Authentication middleware
│   ├── error-handler.js      # Error handling
│   └── multer.js             # File upload configuration
│
├── views/                    # Handlebars templates
│   ├── layouts/
│   │   ├── main.hbs          # Main layout
│   │   └── auth.hbs          # Authentication layout
│   ├── partials/
│   │   ├── sidebar.hbs       # Navigation sidebar
│   │   ├── messages.hbs      # Flash messages
│   │   ├── idea-card.hbs     # Reusable idea card component
│   │   ├── idea-form.hbs     # Unified idea creation/editing form
│   │   ├── backend-search-bar.hbs # Backend search component
│   │   └── background-shapes.hbs # Background elements
│   ├── home.hbs              # Main dashboard
│   ├── explore.hbs           # Public ideas discovery page
│   ├── idea-create.hbs       # Idea creation page
│   ├── idea-edit.hbs         # Idea editing page
│   ├── idea-detail.hbs       # Idea detail view
│   ├── profile.hbs           # User profile page
│   ├── login.hbs             # Login page
│   ├── signup.hbs            # Registration page
│   └── error.hbs             # Error page
│
├── public/                   # Static assets
│   ├── css/                  # Custom stylesheets
│   ├── js/                   # Client-side JavaScript
│   └── img/                  # Images and icons
│
├── uploads/                  # User uploaded files
│   └── avatars/              # User avatar images
│
├── migrations/               # Database migrations
├── seeders/                  # Database seeders
├── logs/                     # Application logs
└── utils/                    # Utility functions
    ├── logger.js             # Winston logger configuration
    └── handlebars-helpers.js # Custom Handlebars helpers
```

## 🗄 Database Schema

### Users Table
- `id` - Primary key
- `name` - User's display name
- `email` - User's email (unique)
- `password` - Hashed password
- `googleId` - Google OAuth ID (nullable)
- `githubId` - GitHub OAuth ID (nullable)
- `avatar` - Profile picture path
- `role` - User role
- `bio` - User biography
- `backgroundColor` - Custom background theme
- `created_at`, `updated_at` - Timestamps

### Ideas Table
- `id` - Primary key
- `title` - Idea title
- `content` - Idea description/content
- `userId` - Foreign key to Users
- `isPublic` - Public/private flag
- `shareLink` - Unique sharing link
- `created_at`, `updated_at` - Timestamps

### Tags Table
- `id` - Primary key
- `name` - Tag name (unique)
- `created_at`, `updated_at` - Timestamps

### IdeaTags Junction Table
- `IdeaId` - Foreign key to Ideas
- `tagId` - Foreign key to Tags
- Composite primary key

## 🔐 Authentication Flow

1. **Local Authentication**: Users can register/login with email and password
2. **OAuth Integration**: 
   - Google OAuth with profile and email scopes
   - GitHub OAuth with user:email scope
   - Automatic account linking for existing users
3. **Session Management**: Secure sessions with Passport.js serialization
4. **Profile Creation**: Automatic profile setup for OAuth users

## 🎨 UI Features

- **Modern Dashboard**: Clean, card-based layout for ideas
- **Responsive Design**: Mobile-first approach with custom CSS
- **Interactive Elements**: Hover effects, animations, and transitions
- **Theme Support**: Customizable background colors and gradients
- **Search Interface**: Real-time search with filter options
- **Statistics Cards**: Visual representation of user data

## 🔄 Development Status

### ✅ Completed (Full CRUD System + Search & Discovery)
- **Authentication & User Management**
  - User authentication system (local + OAuth)
  - Profile management with avatar upload
  - Session management and security

- **Complete Ideas Management System**
  - Full CRUD backend operations with permission control
  - Dual-mode controller (AJAX + page rendering)
  - Public/private sharing with unique share links
  - Real-time statistics with automatic updates
  - Smart error handling and user feedback

- **Advanced Search & Discovery System**
  - Secure backend search with LIKE injection protection
  - Hybrid search strategy (frontend + backend)
  - Cross-field search (titles, content, authors)
  - Search state management and URL persistence
  - Performance-optimized queries with result limits
  - Progressive enhancement with loading states

- **Advanced Frontend Experience**
  - Modern dual-view system (Modal preview + Detail page)
  - Interactive CRUD operations with AJAX
  - Keyboard shortcuts and accessibility features
  - Responsive design with mobile optimization
  - Loading states and optimistic UI updates
  - File upload functionality and image processing

### 🚀 Future Development
- Tag system integration with filtering
- Email notification system
- Collaboration features
- Advanced analytics dashboard
- Export functionality
- Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- Test suite not yet implemented
- Tag system not yet integrated
- Performance optimization for large datasets pending
- Share link functionality not yet implemented

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**IdeaCraft** - Where creativity meets organization 💡