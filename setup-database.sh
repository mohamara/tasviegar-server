#!/bin/bash

echo "🗄️ Setting up Tasviegar Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   On macOS: brew install postgresql"
    echo "   On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On macOS: brew services start postgresql"
    echo "   On Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

# Create database
echo "📦 Creating database..."
psql -U postgres -c "CREATE DATABASE tasviegar_db;" 2>/dev/null || echo "Database already exists"

# Create .env file
echo "📝 Creating .env file..."
cat > backend/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=tasviegar_db

# JWT Configuration
JWT_SECRET=tasviegar-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# App Configuration
PORT=3000
NODE_ENV=development

# Database Sync (for development)
DB_SYNC=true
DB_LOGGING=true

# SMS Configuration (for Iranian SMS service)
SMS_API_KEY=your-sms-api-key
SMS_SECRET_KEY=your-sms-secret-key
EOF

echo "✅ Database setup completed!"
echo "📋 Next steps:"
echo "   1. Start the backend: npm run start:dev"
echo "   2. Test the API: curl http://localhost:3000/health"
