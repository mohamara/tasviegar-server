# 🟪 Settler - Social Fintech Platform

## 📋 Project Overview

Settler is a comprehensive social fintech platform designed for debt management and settlements in Iran. The platform enables users to track debts, manage group expenses, and facilitate secure settlements with legal documentation support.

## 🏗️ Architecture

### Microservices Design
- **Backend API** (NestJS + TypeScript)
- **Admin Panel** (Vue.js 3 + TypeScript)
- **Design Studio** (React + TypeScript)
- **Mobile App** (React Native - Future)

### Technology Stack
- **Backend**: NestJS, TypeScript, PostgreSQL, Redis, JWT
- **Frontend**: Vue.js 3, React, TypeScript, TailwindCSS
- **Infrastructure**: Docker, Docker Compose
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis for sessions and caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (if running locally)
- Redis (optional)

### Development Setup

1. **Clone and Install:**
```bash
git clone <repository-url>
cd tasviegar-server
npm install
```

2. **Environment Setup:**
```bash
# Copy environment files
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

3. **Start with Docker (Recommended):**
```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

4. **Start Locally:**
```bash
# Start backend
npm run start:dev

# Start admin panel (in separate terminal)
cd tasviegar-admin
npm run dev

# Start design studio (in separate terminal)
cd mock-design-studio
npm run dev
```

## 📚 API Documentation

- **Swagger UI**: http://localhost:3000/api/docs
- **API Base URL**: http://localhost:3000/api/v1

### Key Endpoints
- **Authentication**: `/api/v1/auth/*`
- **Users**: `/api/v1/users/*`
- **Profile**: `/api/v1/users/profile/me`

## 🔐 Authentication Flow

1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. **Verify SMS**: `POST /api/v1/auth/verify-sms`
4. **Refresh Token**: `POST /api/v1/auth/refresh`
5. **Logout**: `POST /api/v1/auth/logout`

## 🏛️ Project Structure

```
tasviegar-server/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── config/         # Configuration files
│   │   ├── app.module.ts   # Root module
│   │   └── main.ts         # Entry point
│   ├── README.md           # Backend documentation
│   └── tsconfig.json       # TypeScript config
├── tasviegar-admin/        # Vue.js Admin Panel
├── mock-design-studio/     # React Design Studio
├── database/              # Database migrations & schema
├── definition/            # System architecture docs
├── docker-compose.yml     # Development environment
├── Dockerfile.dev         # Development Dockerfile
└── package.json           # Root package.json
```

## 🛠️ Development

### Available Scripts
```bash
# Backend
npm run start:dev          # Development server
npm run build              # Build for production
npm run test               # Run tests
npm run lint               # Lint code
npm run format             # Format code

# Docker
npm run docker:up          # Start all services
npm run docker:down        # Stop all services
npm run docker:logs        # View logs
npm run docker:build       # Build containers
npm run docker:clean       # Clean up volumes

# Database
npm run migration:generate # Generate migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert migration
```

### Code Quality
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **TypeScript**: Type safety

## 🇮🇷 Iranian Localization

### Features
- ✅ Persian date support (Jalali calendar)
- ✅ Iranian mobile number validation
- ✅ Iranian national ID validation
- ✅ SMS integration with Iranian providers
- ✅ Persian error messages and UI

### Validation Rules
- **Mobile**: `+98 9XX XXX XXXX` format
- **National ID**: 10-digit validation with checksum
- **Postal Code**: 10-digit format

## 🔧 Configuration

### Environment Variables
```env
# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=settler

# SMS Service
SMS_PROVIDER=farapayamak
SMS_API_KEY=your-api-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure monitoring
- [ ] Set up backup strategy
- [ ] Configure CDN for static assets

### Docker Production
```bash
# Build production image
docker build -t settler-backend .

# Run with environment variables
docker run -p 3000:3000 --env-file .env settler-backend
```

## 📊 Features

### Backend API
- ✅ JWT Authentication with refresh tokens
- ✅ SMS verification (Iranian providers)
- ✅ Rate limiting and security
- ✅ Input validation and error handling
- ✅ Persian date support
- ✅ Swagger documentation
- ✅ TypeORM with PostgreSQL
- ✅ Password hashing with bcrypt

### User Management
- ✅ Complete user profiles
- ✅ Preferences and settings
- ✅ Role-based access control
- ✅ Soft deletes for audit trails
- ✅ Search and pagination

### Security
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Audit logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests for new features
5. Update documentation
6. Submit a pull request

### Code Standards
- Use TypeScript strictly
- Follow NestJS conventions
- Add comprehensive tests
- Use conventional commits
- Update API documentation

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the Iranian fintech ecosystem**
