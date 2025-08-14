# مستندات کامل API - Tasviegar

## 📋 فهرست مطالب
1. [معرفی](#معرفی)
2. [احراز هویت](#احراز-هویت)
3. [کاربران](#کاربران)
4. [بدهی‌ها](#بدهی‌ها)
5. [تراکنش‌ها](#تراکنش‌ها)
6. [گروه‌ها](#گروه‌ها)
7. [اعلان‌ها](#اعلان‌ها)
8. [کدهای خطا](#کدهای-خطا)

## 🚀 معرفی

### Base URL
```
http://localhost:3000/api/v1
```

### احراز هویت
تمام endpoint های محافظت شده نیاز به header زیر دارند:
```
Authorization: Bearer <jwt-token>
```

### فرمت پاسخ
```json
{
  "success": true,
  "data": {},
  "message": "عملیات با موفقیت انجام شد"
}
```

---

## 🔐 احراز هویت

### ثبت‌نام کاربر جدید
```http
POST /auth/register
```

**Request Body:**
```json
{
  "mobile": "09123456789",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "کد تایید به شماره شما ارسال شد.",
  "userId": "uuid-string"
}
```

### ورود کاربر
```http
POST /auth/login
```

**Request Body:**
```json
{
  "mobile": "09123456789",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "mobile": "09123456789",
    "firstName": "علی",
    "lastName": "احمدی"
  }
}
```

### تایید کد SMS
```http
POST /auth/verify-sms
```

**Request Body:**
```json
{
  "mobile": "09123456789",
  "code": "123456"
}
```

### تمدید توکن
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

### خروج
```http
POST /auth/logout
```

### فراموشی رمز عبور
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "mobile": "09123456789"
}
```

---

## 👤 کاربران

### دریافت پروفایل کاربر
```http
GET /users/profile
```

**Response:**
```json
{
  "id": "uuid",
  "mobile": "09123456789",
  "firstName": "علی",
  "lastName": "احمدی",
  "email": "ali@example.com",
  "avatar": "avatar-url",
  "birthDate": "1990-01-01",
  "gender": "male",
  "address": "تهران، خیابان ولیعصر",
  "postalCode": "1234567890",
  "city": "تهران",
  "province": "تهران",
  "role": "user",
  "isVerified": true,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### به‌روزرسانی پروفایل
```http
PUT /users/profile
```

**Request Body:**
```json
{
  "firstName": "علی",
  "lastName": "احمدی",
  "email": "ali@example.com",
  "birthDate": "1990-01-01",
  "gender": "male",
  "address": "تهران، خیابان ولیعصر",
  "postalCode": "1234567890",
  "city": "تهران",
  "province": "تهران"
}
```

### دریافت تنظیمات کاربر
```http
GET /users/preferences
```

**Response:**
```json
{
  "language": "fa",
  "theme": "light",
  "notifications": {
    "sms": true,
    "email": true,
    "push": true
  },
  "privacy": {
    "profileVisibility": "friends",
    "showBalance": false
  }
}
```

### به‌روزرسانی تنظیمات
```http
PUT /users/preferences
```

**Request Body:**
```json
{
  "language": "fa",
  "theme": "dark",
  "notifications": {
    "sms": true,
    "email": true,
    "push": false
  },
  "privacy": {
    "profileVisibility": "friends",
    "showBalance": false
  }
}
```

---

## 💰 بدهی‌ها

### ایجاد بدهی جدید
```http
POST /debts
```

**Request Body:**
```json
{
  "title": "خرید ناهار گروهی",
  "description": "ناهار گروهی در رستوران",
  "totalAmount": 500000,
  "type": "group_expense",
  "currency": "IRR",
  "dueDate": "2024-02-01",
  "isRecurring": false,
  "participants": [
    {
      "userId": "user-id-1",
      "shareAmount": 200000,
      "role": "debtor",
      "notes": "سهم علی"
    },
    {
      "userId": "user-id-2",
      "shareAmount": 150000,
      "role": "debtor",
      "notes": "سهم احمد"
    },
    {
      "userId": "user-id-3",
      "shareAmount": 150000,
      "role": "debtor",
      "notes": "سهم محمد"
    }
  ]
}
```

**Response:**
```json
{
  "id": "debt-uuid",
  "title": "خرید ناهار گروهی",
  "description": "ناهار گروهی در رستوران",
  "totalAmount": 500000,
  "type": "group_expense",
  "status": "pending",
  "creatorId": "user-uuid",
  "currency": "IRR",
  "dueDate": "2024-02-01",
  "isRecurring": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "remainingAmount": 500000,
  "participants": [
    {
      "id": "participant-uuid",
      "userId": "user-id-1",
      "role": "debtor",
      "shareAmount": 200000,
      "paidAmount": 0,
      "isConfirmed": false,
      "remainingAmount": 200000,
      "isFullyPaid": false,
      "paymentPercentage": 0,
      "user": {
        "id": "user-id-1",
        "firstName": "علی",
        "lastName": "احمدی",
        "mobile": "09123456789",
        "avatar": "avatar-url"
      }
    }
  ]
}
```

### دریافت لیست بدهی‌ها
```http
GET /debts?page=1&limit=10&status=active&type=group_expense&search=ناهار
```

**Query Parameters:**
- `page`: شماره صفحه (پیش‌فرض: 1)
- `limit`: تعداد در هر صفحه (پیش‌فرض: 10)
- `status`: وضعیت بدهی (pending, active, settled, cancelled)
- `type`: نوع بدهی (group_expense, personal_loan, shared_purchase)
- `search`: جستجو در عنوان و توضیحات

**Response:**
```json
{
  "debts": [
    {
      "id": "debt-uuid",
      "title": "خرید ناهار گروهی",
      "totalAmount": 500000,
      "status": "active",
      "remainingAmount": 300000,
      "participants": []
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### دریافت جزئیات بدهی
```http
GET /debts/{debtId}
```

### ویرایش بدهی
```http
PUT /debts/{debtId}
```

**Request Body:**
```json
{
  "title": "خرید ناهار گروهی - ویرایش شده",
  "description": "توضیحات جدید",
  "status": "active",
  "dueDate": "2024-02-15"
}
```

### حذف بدهی
```http
DELETE /debts/{debtId}
```

### تایید شرکت‌کنندگی
```http
POST /debts/{debtId}/confirm
```

### دریافت آمار بدهی‌ها
```http
GET /debts/statistics
```

**Response:**
```json
{
  "totalDebts": 15,
  "activeDebts": 8,
  "settledDebts": 7,
  "totalOwed": 2500000,
  "totalOwedToMe": 800000,
  "recentTransactions": [
    {
      "id": "transaction-uuid",
      "amount": 50000,
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## 💳 تراکنش‌ها

### ایجاد تراکنش جدید
```http
POST /debts/transactions
```

**Request Body:**
```json
{
  "debtId": "debt-uuid",
  "payeeId": "user-id-2",
  "amount": 50000,
  "description": "پرداخت بخشی از بدهی",
  "paymentMethod": "cash",
  "transactionReference": "ref-123",
  "metadata": {
    "receipt": "receipt-url",
    "notes": "یادداشت اضافی"
  }
}
```

**Response:**
```json
{
  "id": "transaction-uuid",
  "debtId": "debt-uuid",
  "payerId": "user-id-1",
  "payeeId": "user-id-2",
  "amount": 50000,
  "type": "payment",
  "status": "pending",
  "description": "پرداخت بخشی از بدهی",
  "paymentMethod": "cash",
  "transactionReference": "ref-123",
  "createdAt": "2024-01-01T00:00:00Z",
  "formattedAmount": "۵۰,۰۰۰ تومان"
}
```

### تکمیل تراکنش
```http
PUT /debts/transactions/{transactionId}/complete
```

### دریافت لیست تراکنش‌ها
```http
GET /debts/transactions?page=1&limit=10&status=completed&type=payment
```

---

## 👥 گروه‌ها

### ایجاد گروه جدید
```http
POST /groups
```

**Request Body:**
```json
{
  "name": "گروه خانواده",
  "description": "گروه خانوادگی ما",
  "type": "family",
  "privacy": "private",
  "maxMembers": 20,
  "metadata": {
    "tags": ["خانواده", "دوستانه"],
    "location": "تهران",
    "settings": {
      "allowMemberInvites": true,
      "requireApproval": false,
      "allowDebtCreation": true
    }
  }
}
```

### دریافت لیست گروه‌ها
```http
GET /groups?page=1&limit=10&type=family&privacy=private
```

### دریافت جزئیات گروه
```http
GET /groups/{groupId}
```

### ویرایش گروه
```http
PUT /groups/{groupId}
```

### حذف گروه
```http
DELETE /groups/{groupId}
```

### دعوت کاربر به گروه
```http
POST /groups/{groupId}/invite
```

**Request Body:**
```json
{
  "mobile": "09123456789",
  "message": "به گروه ما بپیوندید"
}
```

### پذیرش دعوت گروه
```http
POST /groups/invitations/{invitationId}/accept
```

### رد دعوت گروه
```http
POST /groups/invitations/{invitationId}/reject
```

---

## 🔔 اعلان‌ها

### دریافت لیست اعلان‌ها
```http
GET /notifications?page=1&limit=10&status=unread&type=debt_created
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification-uuid",
      "type": "debt_created",
      "priority": "normal",
      "status": "unread",
      "title": "بدهی جدید ایجاد شد",
      "message": "علی احمدی یک بدهی جدید ایجاد کرد",
      "data": {
        "debtId": "debt-uuid",
        "amount": 500000,
        "actionUrl": "/debts/debt-uuid"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### علامت‌گذاری اعلان به عنوان خوانده شده
```http
PUT /notifications/{notificationId}/read
```

### علامت‌گذاری همه اعلان‌ها به عنوان خوانده شده
```http
PUT /notifications/read-all
```

### حذف اعلان
```http
DELETE /notifications/{notificationId}
```

### دریافت تعداد اعلان‌های نخوانده
```http
GET /notifications/unread-count
```

**Response:**
```json
{
  "count": 5
}
```

---

## ❌ کدهای خطا

### کدهای HTTP
- `200`: موفقیت
- `201`: ایجاد شده
- `400`: درخواست نامعتبر
- `401`: غیرمجاز
- `403`: ممنوع
- `404`: یافت نشد
- `409`: تداخل
- `422`: داده نامعتبر
- `429`: تعداد درخواست بیش از حد
- `500`: خطای سرور

### پیام‌های خطا
```json
{
  "success": false,
  "message": "پیام خطا به فارسی",
  "error": "ERROR_CODE",
  "details": {
    "field": "توضیح خطا"
  }
}
```

### کدهای خطای رایج
- `VALIDATION_ERROR`: خطا در اعتبارسنجی داده‌ها
- `UNAUTHORIZED`: عدم احراز هویت
- `FORBIDDEN`: عدم دسترسی
- `NOT_FOUND`: منبع یافت نشد
- `ALREADY_EXISTS`: منبع قبلاً وجود دارد
- `INVALID_CREDENTIALS`: اطلاعات ورود نامعتبر
- `RATE_LIMIT_EXCEEDED`: تعداد درخواست بیش از حد
- `INSUFFICIENT_PERMISSIONS`: دسترسی ناکافی

---

## 🔧 تنظیمات

### متغیرهای محیطی
```env
# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=tasviegar
DB_SYNC=true

# SMS Service
SMS_PROVIDER=farapayamak
SMS_API_KEY=your-sms-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_DEST=./uploads
```

### محدودیت‌ها
- حداکثر اندازه فایل: 5MB
- حداکثر تعداد درخواست: 100 در دقیقه
- حداکثر تعداد شرکت‌کننده در بدهی: 20 نفر
- حداکثر مبلغ بدهی: 1 میلیارد تومان
- حداکثر تعداد گروه: 50 گروه

---

## 📚 منابع اضافی

### Swagger Documentation
```
http://localhost:3000/api/docs
```

### Health Check
```
GET /health
GET /health/database
```

### Version Info
```
GET /version
```

### API Status
```
GET /status
```
