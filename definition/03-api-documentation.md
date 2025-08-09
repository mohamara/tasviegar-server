# 🌐 API Documentation - Settler App

## Overview
The Settler API follows **RESTful principles** with **JSON** data exchange. All endpoints require **JWT authentication** except for registration and login.

## 🔑 Authentication

### Base URL
```
Production: https://api.settler.app/v1
Development: http://localhost:3000/api/v1
```

### Authentication Flow
```typescript
// 1. Register/Login to get tokens
POST /auth/login
Response: {
  accessToken: string,    // Valid for 15 minutes
  refreshToken: string,   // Valid for 7 days
  user: UserProfile
}

// 2. Use access token in headers
Authorization: Bearer <access_token>

// 3. Refresh when expired
POST /auth/refresh
Body: { refreshToken: string }
```

---

## 📋 API Endpoints

### 🔐 Authentication Endpoints

#### **POST /auth/register**
Register new user account.

**Request Body:**
```typescript
{
  email: string;           // Valid email format
  password: string;        // Min 8 chars, 1 uppercase, 1 number
  firstName: string;       // Min 2 chars
  lastName: string;        // Min 2 chars
  phone?: string;          // Optional, valid phone format
  currency?: string;       // ISO 4217 code, default: USD
}
```

**Response (201):**
```typescript
{
  message: "Registration successful",
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: "active";
    isEmailVerified: false;
  },
  accessToken: string;
  refreshToken: string;
}
```

**Errors:**
- `400` - Validation errors
- `409` - Email already exists

---

#### **POST /auth/login**
Authenticate user and get tokens.

**Request Body:**
```typescript
{
  email: string;
  password: string;
  twoFactorCode?: string;  // Required if 2FA enabled
}
```

**Response (200):**
```typescript
{
  message: "Login successful",
  user: UserProfile,
  accessToken: string;
  refreshToken: string;
}
```

**Errors:**
- `400` - Invalid credentials
- `401` - 2FA code required/invalid
- `423` - Account suspended

---

#### **POST /auth/refresh**
Refresh access token using refresh token.

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response (200):**
```typescript
{
  accessToken: string;
  refreshToken: string;  // New refresh token
}
```

---

#### **POST /auth/logout**
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  message: "Logout successful"
}
```

---

### 👤 User Management

#### **GET /users/profile**
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  currency: string;
  language: string;
  timezone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  role: "user" | "premium" | "admin";
  createdAt: string;
  lastLoginAt: string;
}
```

---

#### **PUT /users/profile**
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  firstName?: string;
  lastName?: string;
  phone?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  avatarUrl?: string;
}
```

**Response (200):**
```typescript
{
  message: "Profile updated successfully",
  user: UserProfile
}
```

---

#### **GET /users/search**
Search users by email or name (for adding debts).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
```
?q=search_term&limit=10&offset=0
```

**Response (200):**
```typescript
{
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  }>,
  total: number;
  limit: number;
  offset: number;
}
```

---

### 💰 Debt Management

#### **GET /debts**
Get user's debts with filtering and pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
```
?status=pending&role=creditor&groupId=uuid&limit=20&offset=0&sortBy=createdAt&order=desc
```

**Response (200):**
```typescript
{
  debts: Array<{
    id: string;
    amount: number;
    currency: string;
    description: string;
    category?: string;
    status: "pending" | "acknowledged" | "disputed" | "settled" | "cancelled";
    dueDate?: string;
    userRole: "creditor" | "debtor";
    otherParty: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    group?: {
      id: string;
      name: string;
    };
    proofUrl?: string;
    createdAt: string;
    updatedAt: string;
  }>,
  summary: {
    totalOwedToMe: number;
    totalIOwe: number;
    netBalance: number;
    currency: string;
  },
  pagination: {
    total: number;
    limit: number;
    offset: number;
  }
}
```

---

#### **POST /debts**
Create new debt.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  debtorId: string;        // User ID who owes money
  amount: number;          // Positive decimal
  currency: string;        // ISO 4217 code
  description: string;     // Min 5 chars
  category?: string;       // food, rent, utilities, personal, etc.
  dueDate?: string;        // ISO date string
  groupId?: string;        // Optional group association
  proofUrl?: string;       // Receipt/contract URL
  notes?: string;
}
```

**Response (201):**
```typescript
{
  message: "Debt created successfully",
  debt: DebtDetail
}
```

**Errors:**
- `400` - Validation errors
- `404` - Debtor not found
- `409` - Cannot create debt with yourself

---

#### **GET /debts/:id**
Get specific debt details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  id: string;
  amount: number;
  currency: string;
  description: string;
  category?: string;
  status: string;
  dueDate?: string;
  userRole: "creditor" | "debtor";
  creditor: UserProfile;
  debtor: UserProfile;
  group?: GroupSummary;
  proofUrl?: string;
  notes?: string;
  settlements: Array<SettlementSummary>;
  createdAt: string;
  updatedAt: string;
}
```

---

#### **PUT /debts/:id**
Update debt (only creditor can update).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  description?: string;
  category?: string;
  dueDate?: string;
  notes?: string;
}
```

**Response (200):**
```typescript
{
  message: "Debt updated successfully",
  debt: DebtDetail
}
```

**Errors:**
- `403` - Not authorized (only creditor can update)
- `404` - Debt not found
- `409` - Cannot update settled debt

---

#### **DELETE /debts/:id**
Cancel/delete debt (only creditor, only if pending).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  message: "Debt cancelled successfully"
}
```

---

#### **POST /debts/:id/acknowledge**
Debtor acknowledges the debt.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  message: "Debt acknowledged successfully",
  debt: DebtDetail
}
```

---

#### **POST /debts/:id/dispute**
Debtor disputes the debt.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  reason: string;  // Dispute reason
}
```

**Response (200):**
```typescript
{
  message: "Debt disputed successfully",
  debt: DebtDetail
}
```

---

### 💳 Settlement Management

#### **GET /settlements**
Get user's settlements.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
```
?status=pending&limit=20&offset=0
```

**Response (200):**
```typescript
{
  settlements: Array<{
    id: string;
    debt: DebtSummary;
    amount: number;
    currency: string;
    settlementMethod?: string;
    status: "pending" | "confirmed" | "failed" | "disputed";
    confirmedByCreditor: boolean;
    confirmedByDebtor: boolean;
    receiptUrl?: string;
    settledAt: string;
  }>,
  pagination: PaginationInfo
}
```

---

#### **POST /settlements**
Create settlement request.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  debtId: string;
  amount: number;              // Can be partial
  settlementMethod?: string;   // cash, bank_transfer, etc.
  paymentProofUrl?: string;    // Proof of payment
}
```

**Response (201):**
```typescript
{
  message: "Settlement created successfully",
  settlement: SettlementDetail
}
```

---

#### **POST /settlements/:id/confirm**
Confirm settlement (by other party).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  confirmationCode?: string;  // If required
}
```

**Response (200):**
```typescript
{
  message: "Settlement confirmed successfully",
  settlement: SettlementDetail
}
```

---

#### **GET /settlements/:id/receipt**
Generate legal receipt PDF.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
Content-Type: application/pdf
// PDF file download
```

---

### 👥 Group Management

#### **GET /groups**
Get user's groups.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
```
?status=active&limit=20&offset=0
```

**Response (200):**
```typescript
{
  groups: Array<{
    id: string;
    name: string;
    description?: string;
    groupType: string;
    avatarUrl?: string;
    color?: string;
    memberCount: number;
    userRole: string;
    totalExpenses: number;
    pendingAmount: number;
    currency: string;
    createdAt: string;
  }>,
  pagination: PaginationInfo
}
```

---

#### **POST /groups**
Create new group.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  name: string;            // Min 3 chars
  description?: string;
  groupType: "household" | "trip" | "project" | "business";
  currency?: string;       // Default: user's currency
  autoSettle?: boolean;    // Default: false
  requireApproval?: boolean; // Default: true
  avatarUrl?: string;
  color?: string;          // Hex color
}
```

**Response (201):**
```typescript
{
  message: "Group created successfully",
  group: GroupDetail
}
```

---

#### **GET /groups/:id**
Get group details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  id: string;
  name: string;
  description?: string;
  groupType: string;
  currency: string;
  autoSettle: boolean;
  requireApproval: boolean;
  avatarUrl?: string;
  color?: string;
  status: string;
  userRole: string;
  members: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
    groupBalance: number;
    joinedAt: string;
  }>,
  expenses: Array<DebtSummary>,
  summary: {
    totalExpenses: number;
    settledAmount: number;
    pendingAmount: number;
    lastExpenseDate?: string;
  },
  createdAt: string;
}
```

---

#### **PUT /groups/:id**
Update group (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  autoSettle?: boolean;
  requireApproval?: boolean;
  avatarUrl?: string;
  color?: string;
}
```

---

#### **POST /groups/:id/members**
Invite member to group.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  email?: string;      // Invite by email
  userId?: string;     // Invite existing user
  role?: string;       // Default: member
}
```

**Response (200):**
```typescript
{
  message: "Member invited successfully",
  inviteToken?: string;  // If email invitation
}
```

---

#### **DELETE /groups/:id/members/:userId**
Remove member from group (admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  message: "Member removed successfully"
}
```

---

#### **POST /groups/:id/leave**
Leave group.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  message: "Left group successfully"
}
```

---

#### **POST /groups/join/:token**
Join group via invitation token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  message: "Joined group successfully",
  group: GroupSummary
}
```

---

### 🔔 Notification Management

#### **GET /notifications**
Get user notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
```
?isRead=false&limit=50&offset=0
```

**Response (200):**
```typescript
{
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    data: object;
    isRead: boolean;
    createdAt: string;
  }>,
  unreadCount: number;
  pagination: PaginationInfo
}
```

---

#### **PUT /notifications/:id/read**
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  message: "Notification marked as read"
}
```

---

#### **PUT /notifications/read-all**
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```typescript
{
  message: "All notifications marked as read"
}
```

---

## 🔒 Error Handling

### Standard Error Response
```typescript
{
  error: {
    code: string;        // Error code
    message: string;     // Human readable message
    details?: object;    // Additional error details
  },
  timestamp: string;
  path: string;
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Codes
```typescript
// Authentication
AUTH_INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
AUTH_TOKEN_EXPIRED = "TOKEN_EXPIRED"
AUTH_2FA_REQUIRED = "2FA_REQUIRED"

// Validation
VALIDATION_ERROR = "VALIDATION_ERROR"
INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT"
PASSWORD_TOO_WEAK = "PASSWORD_TOO_WEAK"

// Business Logic
DEBT_CANNOT_OWE_YOURSELF = "CANNOT_OWE_YOURSELF"
DEBT_ALREADY_SETTLED = "DEBT_ALREADY_SETTLED"
INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"

// Rate Limiting
RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
```

---

## 📡 WebSocket Events

### Connection
```typescript
// Connect with JWT token
const socket = io('wss://api.settler.app', {
  auth: {
    token: accessToken
  }
});
```

### Events

#### **debt.created**
```typescript
{
  type: 'debt.created',
  data: {
    debt: DebtDetail,
    userRole: 'creditor' | 'debtor'
  }
}
```

#### **debt.updated**
```typescript
{
  type: 'debt.updated',
  data: {
    debt: DebtDetail,
    changes: string[]
  }
}
```

#### **settlement.requested**
```typescript
{
  type: 'settlement.requested',
  data: {
    settlement: SettlementDetail,
    debt: DebtSummary
  }
}
```

#### **settlement.confirmed**
```typescript
{
  type: 'settlement.confirmed',
  data: {
    settlement: SettlementDetail,
    debt: DebtSummary
  }
}
```

#### **group.expense.added**
```typescript
{
  type: 'group.expense.added',
  data: {
    debt: DebtDetail,
    group: GroupSummary
  }
}
```

---

## 🧪 Testing

### Authentication Test
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Debt Operations Test
```bash
# Create debt
curl -X POST http://localhost:3000/api/v1/debts \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debtorId": "user-uuid",
    "amount": 50.00,
    "currency": "USD",
    "description": "Lunch money",
    "category": "food"
  }'

# Get debts
curl -X GET "http://localhost:3000/api/v1/debts?status=pending" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 🤖 AI Implementation Prompt

```
You are tasked with implementing the Settler app REST API. Use the following guidelines:

1. **NestJS Setup**:
   - Create modular structure with separate modules for auth, users, debts, groups, settlements
   - Implement proper DTOs for request/response validation
   - Use class-validator for input validation
   - Add Swagger documentation with decorators

2. **Authentication Implementation**:
   - JWT strategy with Passport.js
   - Refresh token rotation for security
   - 2FA with TOTP (time-based one-time passwords)
   - Rate limiting on auth endpoints

3. **API Development**:
   - Follow RESTful conventions strictly
   - Implement proper HTTP status codes
   - Add comprehensive error handling with custom exceptions
   - Create interceptors for logging and response transformation

4. **Database Integration**:
   - Use Prisma ORM with TypeScript
   - Implement proper transaction handling
   - Add database constraints validation
   - Create efficient queries with proper includes

5. **Security Features**:
   - CORS configuration
   - Helmet for security headers
   - Input sanitization
   - SQL injection prevention
   - Rate limiting per user/endpoint

6. **Real-time Features**:
   - WebSocket implementation with Socket.io
   - JWT authentication for WebSocket connections
   - Event-driven architecture for notifications
   - Proper room management for groups

7. **Testing**:
   - Unit tests for all services
   - Integration tests for API endpoints
   - E2E tests for complete user flows
   - Mock external dependencies

Generate production-ready API implementation that follows these specifications exactly.
``` 