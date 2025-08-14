# Settler Backend API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for sessions)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Environment Setup:**
Create `.env` file in backend directory:
```env
# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=settler
DB_SYNC=true
DB_LOGGING=true
DB_SSL=false
DB_MIGRATIONS_RUN=false

# SMS Service (Iranian providers)
SMS_PROVIDER=farapayamak
SMS_API_KEY=your-sms-api-key
SMS_USERNAME=your-sms-username
SMS_PASSWORD=your-sms-password
SMS_FROM_NUMBER=your-sender-number

# Redis (for sessions and caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_DEST=./uploads

# Security
CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

3. **Database Setup:**
```bash
# Create database
createdb settler

# Run migrations (if any)
npm run migration:run
```

4. **Start Development Server:**
```bash
npm run start:dev
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **API Base URL**: http://localhost:3000/api/v1

## 🔐 Authentication

The API uses JWT-based authentication with the following flow:

1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. **Verify SMS**: `POST /api/v1/auth/verify-sms`
4. **Refresh Token**: `POST /api/v1/auth/refresh`
5. **Logout**: `POST /api/v1/auth/logout`

### Protected Routes
Use the `Authorization: Bearer <token>` header for protected routes.

## 🏗️ Architecture

### Modules
- **AuthModule**: Authentication, JWT, SMS verification
- **UserModule**: User management, profiles, preferences

### Key Features
- ✅ JWT Authentication with refresh tokens
- ✅ SMS verification (Iranian providers)
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ Persian date support
- ✅ Swagger documentation
- ✅ TypeORM with PostgreSQL
- ✅ Password hashing with bcrypt

### Database Entities
- **User**: Complete user profile with preferences
- **Soft deletes** for audit trails
- **Indexes** for performance
- **JSONB** for flexible data storage

## 🛠️ Development

### Scripts
```bash
npm run start:dev    # Development with hot reload
npm run start        # Production start
npm run test         # Run tests
npm run build        # Build for production
```

### Code Structure
```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.module.ts
│   ├── user.entity.ts
│   ├── user.dto.ts
│   ├── jwt.strategy.ts
│   ├── auth.guard.ts
│   ├── iranian-2fa.service.ts
│   └── iranian-validation.util.ts
├── config/              # Configuration files
│   └── database.config.ts
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## 🔧 Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for JWT signing
- `DB_*`: Database configuration
- `SMS_*`: SMS service configuration
- `REDIS_*`: Redis configuration (optional)

### Security Features
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation
- **Password Hashing**: bcrypt with salt rounds

## 📱 Iranian Localization

### Features
- Persian date support (Jalali calendar)
- Iranian mobile number validation
- Iranian national ID validation
- SMS integration with Iranian providers
- Persian error messages

### Validation Rules
- Mobile: `+98 9XX XXX XXXX` format
- National ID: 10-digit validation with checksum
- Postal Code: 10-digit format

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Set `DB_SYNC=false`
- [ ] Configure proper `JWT_SECRET`
- [ ] Set up SSL certificates
- [ ] Configure production database
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Use conventional commits

## 📄 License

This project is licensed under the ISC License.
