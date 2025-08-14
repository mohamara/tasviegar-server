# راهنمای راه‌اندازی و تست سیستم Tasviegar

## 🚀 مراحل راه‌اندازی

### 1. نصب وابستگی‌ها
```bash
cd backend
npm install
```

### 2. تنظیم متغیرهای محیطی
فایل `.env` را در پوشه `backend` ایجاد کنید:
```env
# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=tasviegar
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

# Redis (optional)
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

### 3. راه‌اندازی دیتابیس
```bash
# ایجاد دیتابیس
createdb tasviegar

# اجرای migration اول
psql -d tasviegar -f database/migrations/001_create_iran_schema.sql

# اجرای migration جدید
psql -d tasviegar -f database/migrations/002_create_debts_schema.sql
```

### 4. راه‌اندازی Redis (اختیاری)
```bash
# نصب Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# راه‌اندازی Redis
redis-server
```

### 5. راه‌اندازی سرور
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm start
```

## 🧪 تست سیستم

### 1. تست اتصال دیتابیس
```bash
# تست اتصال
psql -h localhost -U postgres -d tasviegar -c "SELECT version();"
```

### 2. تست API با Swagger
```
http://localhost:3000/api/docs
```

### 3. تست با فایل HTTP
از فایل `test-api.http` استفاده کنید:
```bash
# نصب REST Client extension در VS Code
# یا استفاده از Postman/Insomnia
```

### 4. تست‌های خودکار
```bash
# اجرای تمام تست‌ها
npm test

# اجرای تست‌ها در حالت watch
npm run test:watch

# اجرای تست‌ها با coverage
npm run test:coverage
```

## 📊 تست‌های دستی

### 1. تست ثبت‌نام و ورود
```bash
# 1. ثبت‌نام کاربر جدید
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "09123456789",
    "password": "password123"
  }'

# 2. ورود کاربر
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "09123456789",
    "password": "password123"
  }'
```

### 2. تست ایجاد بدهی
```bash
# ایجاد بدهی جدید (نیاز به token دارد)
curl -X POST http://localhost:3000/api/v1/debts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "خرید ناهار گروهی",
    "description": "ناهار گروهی در رستوران",
    "totalAmount": 500000,
    "type": "group_expense",
    "currency": "IRR",
    "participants": [
      {
        "userId": "USER_ID_1",
        "shareAmount": 200000,
        "role": "debtor"
      },
      {
        "userId": "USER_ID_2",
        "shareAmount": 150000,
        "role": "debtor"
      },
      {
        "userId": "USER_ID_3",
        "shareAmount": 150000,
        "role": "debtor"
      }
    ]
  }'
```

### 3. تست دریافت لیست بدهی‌ها
```bash
curl -X GET "http://localhost:3000/api/v1/debts?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. تست آمار بدهی‌ها
```bash
curl -X GET http://localhost:3000/api/v1/debts/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 بررسی لاگ‌ها

### 1. لاگ‌های سرور
```bash
# مشاهده لاگ‌های real-time
tail -f backend/logs/app.log

# جستجو در لاگ‌ها
grep "ERROR" backend/logs/app.log
grep "WARN" backend/logs/app.log
```

### 2. لاگ‌های دیتابیس
```bash
# فعال‌سازی logging در PostgreSQL
# در postgresql.conf:
log_statement = 'all'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

## 🚨 عیب‌یابی

### 1. مشکلات رایج

#### خطای اتصال دیتابیس
```bash
# بررسی وضعیت PostgreSQL
sudo systemctl status postgresql

# بررسی پورت
netstat -an | grep 5432

# تست اتصال
psql -h localhost -U postgres -d tasviegar
```

#### خطای JWT
```bash
# بررسی JWT_SECRET در .env
echo $JWT_SECRET

# بررسی تاریخ انقضا
# JWT_EXPIRES_IN=15m
```

#### خطای CORS
```bash
# بررسی CORS_ORIGIN در .env
# باید شامل origin فرانت‌اند باشد
CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080
```

### 2. بررسی وضعیت سیستم
```bash
# بررسی پورت‌های استفاده شده
lsof -i :3000

# بررسی فرآیندهای Node.js
ps aux | grep node

# بررسی استفاده از حافظه
top -p $(pgrep -f "node.*main.ts")
```

## 📈 مانیتورینگ

### 1. Health Check
```bash
# بررسی وضعیت API
curl http://localhost:3000/api/v1/health

# بررسی وضعیت دیتابیس
curl http://localhost:3000/api/v1/health/database
```

### 2. Metrics
```bash
# بررسی تعداد اتصالات دیتابیس
psql -d tasviegar -c "SELECT count(*) FROM pg_stat_activity;"

# بررسی اندازه جداول
psql -d tasviegar -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

## 🔧 تنظیمات پیشرفته

### 1. تنظیمات TypeORM
```typescript
// در database.config.ts
export function getDatabaseConfig(configService: ConfigService) {
  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get('DB_SYNC') === 'true',
    logging: configService.get('DB_LOGGING') === 'true',
    ssl: configService.get('DB_SSL') === 'true',
    migrations: [__dirname + '/../database/migrations/*.sql'],
    migrationsRun: configService.get('DB_MIGRATIONS_RUN') === 'true',
  }
}
```

### 2. تنظیمات Rate Limiting
```typescript
// در main.ts
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقیقه
    max: 100, // حداکثر 100 درخواست
    message: 'تعداد درخواست بیش از حد مجاز است',
    standardHeaders: true,
    legacyHeaders: false,
  })
)
```

## 📚 منابع اضافی

### 1. مستندات
- [API Documentation](./API_DOCUMENTATION.md)
- [Debts Module Documentation](./DEBTS_MODULE.md)
- [Swagger UI](http://localhost:3000/api/docs)

### 2. فایل‌های تست
- [Test API](./test-api.http)
- [Database Migrations](./database/migrations/)

### 3. تنظیمات
- [Environment Variables](./.env.example)
- [TypeScript Config](./tsconfig.json)
- [Package.json](./package.json)

## 🎯 مراحل بعدی

1. **تکمیل ماژول‌های Groups و Notifications**
2. **اضافه کردن تست‌های خودکار**
3. **پیاده‌سازی سیستم اعلان‌ها**
4. **اضافه کردن API برای گزارش‌گیری**
5. **بهینه‌سازی عملکرد**
6. **اضافه کردن Docker support**
7. **پیاده‌سازی CI/CD**

## 📞 پشتیبانی

در صورت بروز مشکل:
1. بررسی لاگ‌ها
2. بررسی مستندات
3. بررسی GitHub Issues
4. تماس با تیم توسعه
