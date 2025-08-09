# 🗄️ Settler Iran Database Schema

## استفاده سریع

### راه‌اندازی
```bash
# اجازه اجرا به اسکریپت
chmod +x database/setup.sh

# راه‌اندازی پایگاه داده
./database/setup.sh --db-password your_password

# یا اجرای manual
psql -U postgres -f database/migrations/001_create_iran_schema.sql
```

### تست
```bash
# اجرای تست‌ها
psql -U settler_app -d settler_iran -f database/test_iranian_data.sql

# پاک‌سازی
psql -U settler_app -d settler_iran -f database/cleanup.sql
```

### Prisma
```bash
# تولید client
npx prisma generate

# مشاهده داده‌ها
npx prisma studio
```

## ویژگی‌های کلیدی

✅ **پشتیبانی کامل فارسی**: UTF-8, collation, RTL
✅ **Validation ایرانی**: کدملی، موبایل، تاریخ شمسی  
✅ **Search بهینه**: GIN indexes, trigram, full-text
✅ **امنیت**: RLS, constraints, audit logs
✅ **عملکرد**: بهینه‌سازی indexes، materialized views

## جداول اصلی

- `users` - کاربران با validation ایرانی
- `debts` - بدهی‌ها با پشتیبانی ریال/تومان
- `groups` - گروه‌های مالی
- `transactions` - تراکنش‌ها و درگاه‌های پرداخت
- `notifications` - اعلان‌های فارسی

## Functions مهم

- `validate_iranian_national_id()` - اعتبارسنجی کدملی
- `validate_iranian_mobile()` - اعتبارسنجی موبایل
- `normalize_persian_text()` - نرمال‌سازی فارسی
- `gregorian_to_persian_date()` - تبدیل تاریخ

## Connection String
```
postgresql://settler_app:password@localhost:5432/settler_iran?schema=public
``` 