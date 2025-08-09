#!/bin/bash
# Setup script for Settler Iran Database
# اسکریپت راه‌اندازی پایگاه داده Settler ایران

set -e

echo "🚀 شروع راه‌اندازی پایگاه داده Settler ایران..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
DB_NAME="settler_iran"
DB_USER="settler_app"
DB_PASSWORD="settler_secure_pass"
DB_HOST="localhost"
DB_PORT="5432"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --db-name)
      DB_NAME="$2"
      shift 2
      ;;
    --db-user)
      DB_USER="$2"
      shift 2
      ;;
    --db-password)
      DB_PASSWORD="$2"
      shift 2
      ;;
    --db-host)
      DB_HOST="$2"
      shift 2
      ;;
    --db-port)
      DB_PORT="$2"
      shift 2
      ;;
    -h|--help)
      echo "استفاده: $0 [OPTIONS]"
      echo "گزینه‌ها:"
      echo "  --db-name     نام پایگاه داده (پیش‌فرض: settler_iran)"
      echo "  --db-user     نام کاربری (پیش‌فرض: settler_app)"
      echo "  --db-password رمز عبور"
      echo "  --db-host     آدرس سرور (پیش‌فرض: localhost)"
      echo "  --db-port     پورت (پیش‌فرض: 5432)"
      exit 0
      ;;
    *)
      echo -e "${RED}گزینه نامعلوم: $1${NC}"
      exit 1
      ;;
  esac
done

# Check if PostgreSQL is running
echo -e "${YELLOW}بررسی وضعیت PostgreSQL...${NC}"
if ! pg_isready -h $DB_HOST -p $DB_PORT; then
    echo -e "${RED}PostgreSQL در حال اجرا نیست. لطفاً ابتدا PostgreSQL را راه‌اندازی کنید.${NC}"
    exit 1
fi

echo -e "${GREEN}PostgreSQL آماده است.${NC}"

# Check if database already exists
if psql -h $DB_HOST -p $DB_PORT -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}پایگاه داده $DB_NAME از قبل وجود دارد.${NC}"
    read -p "آیا می‌خواهید آن را حذف و مجدداً ایجاد کنید؟ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}حذف پایگاه داده موجود...${NC}"
        psql -h $DB_HOST -p $DB_PORT -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    else
        echo -e "${YELLOW}از پایگاه داده موجود استفاده می‌شود.${NC}"
    fi
fi

# Create database and user
echo -e "${YELLOW}ایجاد پایگاه داده و کاربر...${NC}"
psql -h $DB_HOST -p $DB_PORT -U postgres << EOF
-- Create database with Persian collation
CREATE DATABASE $DB_NAME 
  WITH ENCODING 'UTF8' 
  LC_COLLATE='fa_IR.UTF-8' 
  LC_CTYPE='fa_IR.UTF-8' 
  TEMPLATE=template0;

-- Create user if not exists
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
  END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;

-- Set database settings for Persian support
ALTER DATABASE $DB_NAME SET timezone = 'Asia/Tehran';
ALTER DATABASE $DB_NAME SET default_text_search_config = 'persian';
EOF

echo -e "${GREEN}پایگاه داده و کاربر با موفقیت ایجاد شد.${NC}"

# Run migrations
echo -e "${YELLOW}اجرای migration ها...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/001_create_iran_schema.sql

echo -e "${GREEN}Migration ها با موفقیت اجرا شد.${NC}"

# Test the setup
echo -e "${YELLOW}تست کارکرد...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Test Iranian national ID validation
SELECT 'تست کدملی:' as test, validate_iranian_national_id('1234567890') as result;

-- Test Iranian mobile validation  
SELECT 'تست موبایل:' as test, validate_iranian_mobile('09123456789') as result;

-- Test Persian text normalization
SELECT 'تست نرمال‌سازی:' as test, normalize_persian_text('علي احمدي') as result;

-- Check sample data
SELECT 'تعداد کاربران نمونه:' as test, count(*) as result FROM users;
EOF

echo -e "${GREEN}✅ راه‌اندازی با موفقیت کامل شد!${NC}"

# Create .env file
echo -e "${YELLOW}ایجاد فایل .env...${NC}"
cat > .env << EOF
# Settler Iran Database Configuration
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"
TZ="Asia/Tehran"
EOF

echo -e "${GREEN}فایل .env ایجاد شد.${NC}"

echo ""
echo -e "${GREEN}🎉 راه‌اندازی کامل شد!${NC}"
echo -e "${YELLOW}اطلاعات اتصال:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER" 
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""
echo -e "${YELLOW}برای اتصال از خط فرمان:${NC}"
echo "  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo ""
echo -e "${YELLOW}برای استفاده از Prisma:${NC}"
echo "  npx prisma generate"
echo "  npx prisma studio" 