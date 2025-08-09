# 🏗️ System Architecture - Settler App

## Overview
Settler is designed with a **microservices-oriented architecture** that prioritizes scalability, maintainability, and security. The system follows **clean architecture principles** with clear separation of concerns.

## 🎯 Architecture Principles

### 1. **Clean Architecture**
- **Entities**: Core business logic (Debt, User, Group, Settlement)
- **Use Cases**: Application business rules
- **Interface Adapters**: Controllers, Gateways, Presenters
- **Frameworks & Drivers**: Database, Web, UI, External services

### 2. **Microservices Design**
- **User Service**: Authentication, profile management
- **Debt Service**: Debt CRUD, status management
- **Settlement Service**: Payment processing, legal documents
- **Group Service**: Group management, shared expenses
- **Notification Service**: Push notifications, emails
- **Document Service**: PDF generation, digital signatures

### 3. **Technology Stack**

#### Backend Stack
```typescript
// Core Framework
NestJS + TypeScript
Express.js
Swagger/OpenAPI

// Database
PostgreSQL (Primary)
Redis (Cache & Sessions)
Prisma ORM

// Authentication
JWT + Refresh Tokens
Passport.js
2FA (TOTP)

// File Storage
AWS S3 / Supabase Storage
Multer for uploads

// Payment Integration
Stripe/PayPal API
Banking APIs (Future)
```

#### Frontend Stack
```typescript
// Mobile App
React Native + Expo
TypeScript
React Navigation
React Query (State Management)
AsyncStorage
Push Notifications (Expo)

// Web Admin Panel
Next.js 14
TypeScript
TailwindCSS
Zustand (State Management)
React Hook Form
```

#### Infrastructure
```yaml
# Containerization
Docker + Docker Compose

# CI/CD
GitHub Actions
Automated Testing
Code Quality (ESLint, Prettier)

# Deployment
Railway/Supabase (MVP)
AWS/GCP (Production)
Nginx (Load Balancer)
```

## 🗄️ Database Architecture

### Primary Database: PostgreSQL
```sql
-- Core Tables
users, debts, groups, settlements
group_members, debt_splits
notifications, audit_logs

-- Indexes for Performance
user_email_idx, debt_status_idx
group_member_idx, settlement_date_idx
```

### Cache Layer: Redis
```
-- Session Storage
user:session:{user_id}

-- Temporary Data
debt:draft:{user_id}
group:invite:{token}

-- Rate Limiting
api:limit:{user_id}:{endpoint}
```

## 🔄 API Architecture

### RESTful API Design
```
BASE_URL: https://api.settler.app/v1

Authentication:
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

Users:
GET    /users/profile
PUT    /users/profile
GET    /users/search

Debts:
GET    /debts
POST   /debts
GET    /debts/:id
PUT    /debts/:id
DELETE /debts/:id
POST   /debts/:id/settle

Groups:
GET    /groups
POST   /groups
GET    /groups/:id
PUT    /groups/:id
POST   /groups/:id/members
DELETE /groups/:id/members/:userId

Settlements:
GET    /settlements
POST   /settlements
GET    /settlements/:id/receipt
```

### WebSocket Events
```typescript
// Real-time notifications
debt.created
debt.updated
settlement.requested
settlement.completed
group.expense.added
```

## 🔐 Security Architecture

### Authentication Flow
```
1. User Registration/Login
2. JWT Access Token (15min) + Refresh Token (7days)
3. 2FA Verification (Optional)
4. Session Management in Redis
```

### Authorization Levels
```typescript
enum UserRole {
  USER = 'user',
  PREMIUM = 'premium', 
  ADMIN = 'admin'
}

enum DebtPermission {
  VIEW = 'view',
  EDIT = 'edit',
  SETTLE = 'settle'
}
```

### Data Protection
```
- End-to-end encryption for sensitive data
- GDPR compliance
- Audit logs for all operations
- Rate limiting on all endpoints
- Input validation and sanitization
```

## 📱 Mobile Architecture

### React Native Structure
```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/          # API calls and business logic
├── store/             # State management
├── utils/             # Helper functions
├── types/             # TypeScript type definitions
└── constants/         # App constants
```

### State Management
```typescript
// React Query for server state
useQuery(['debts'], fetchDebts)
useMutation(createDebt)

// Zustand for client state
interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  notifications: Notification[]
}
```

## 🌐 Web Architecture

### Next.js Structure
```
src/
├── app/               # App Router (Next.js 14)
├── components/        # Reusable components
├── lib/              # Utility libraries
├── hooks/            # Custom React hooks
├── types/            # TypeScript definitions
└── styles/           # Global styles
```

## 🚀 Deployment Architecture

### Development Environment
```yaml
services:
  backend:
    build: ./backend
    ports: ["3000:3000"]
    depends_on: [postgres, redis]
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: settler_dev
  
  redis:
    image: redis:7-alpine
```

### Production Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN (Static)  │
│    (Nginx)      │    │   Assets        │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Frontend      │
│   (Rate Limit)  │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   Backend API   │────│   Database      │
│   (NestJS)      │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Cache Layer   │
│   (Redis)       │
└─────────────────┘
```

## 📊 Monitoring & Analytics

### Application Monitoring
```
- Health checks for all services
- Error tracking (Sentry)
- Performance monitoring
- API response time tracking
- Database query optimization
```

### Business Analytics
```
- User engagement metrics
- Debt creation/settlement rates
- Group activity tracking
- Revenue analytics (settlements)
- User retention analysis
```

## 🔮 Future Scalability

### Horizontal Scaling
```
- Microservices can be scaled independently
- Database sharding by user_id
- CDN for static assets
- Message queues for async processing
```

### Advanced Features
```
- AI/ML for debt risk assessment
- Blockchain integration for legal documents
- Multi-currency support
- Integration with banking APIs
- Advanced analytics dashboard
```

---

## 🤖 AI Implementation Prompt

```
You are tasked with implementing the Settler app system architecture. Use the following guidelines:

1. **Backend Setup**:
   - Create NestJS project with TypeScript
   - Set up PostgreSQL with Prisma ORM
   - Implement JWT authentication with 2FA
   - Create modular structure for each service
   - Add comprehensive error handling
   - Implement rate limiting and security middleware

2. **Database Design**:
   - Create optimized schema with proper indexes
   - Add foreign key constraints
   - Implement soft deletes for audit trails
   - Add created_at/updated_at timestamps
   - Create migration files

3. **API Development**:
   - Follow RESTful conventions
   - Add comprehensive validation
   - Implement proper HTTP status codes
   - Add Swagger documentation
   - Create integration tests

4. **Security Implementation**:
   - Hash passwords with bcrypt
   - Implement CORS properly
   - Add helmet for security headers
   - Create audit logging system
   - Implement data encryption for sensitive fields

5. **Code Quality**:
   - Use TypeScript strictly
   - Follow clean architecture principles
   - Add comprehensive tests (unit + integration)
   - Implement proper logging
   - Use design patterns appropriately

Generate production-ready code that follows these specifications exactly.
``` 