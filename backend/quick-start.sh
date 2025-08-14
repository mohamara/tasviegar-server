#!/bin/bash

# Quick Start Script for Tasviegar Backend
# اسکریپت راه‌اندازی سریع برای سیستم Tasviegar

set -e

echo "🚀 Starting Tasviegar Backend Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
}

# Check if PostgreSQL is running
check_postgresql() {
    print_status "Checking PostgreSQL connection..."
    if command -v psql &> /dev/null; then
        if pg_isready -q; then
            print_success "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not running. Please start PostgreSQL first."
            print_status "You can start PostgreSQL with: sudo systemctl start postgresql"
        fi
    else
        print_warning "PostgreSQL client is not installed. Please install postgresql-client first."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found. Please run this script from the backend directory."
        exit 1
    fi
}

# Create .env file if it doesn't exist
create_env_file() {
    print_status "Checking .env file..."
    if [ ! -f ".env" ]; then
        print_status "Creating .env file from template..."
        cat > .env << EOF
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
EOF
        print_success ".env file created successfully"
        print_warning "Please update the .env file with your actual configuration values"
    else
        print_success ".env file already exists"
    fi
}

# Create logs directory
create_logs_directory() {
    print_status "Creating logs directory..."
    mkdir -p logs
    print_success "Logs directory created"
}

# Create uploads directory
create_uploads_directory() {
    print_status "Creating uploads directory..."
    mkdir -p uploads
    print_success "Uploads directory created"
}

# Build the project
build_project() {
    print_status "Building the project..."
    npm run build
    print_success "Project built successfully"
}

# Run database migrations
run_migrations() {
    print_status "Checking database migrations..."
    if [ -d "database/migrations" ]; then
        print_status "Database migrations directory found"
        print_warning "Please run migrations manually:"
        echo "  psql -d tasviegar -f database/migrations/001_create_iran_schema.sql"
        echo "  psql -d tasviegar -f database/migrations/002_create_debts_schema.sql"
    else
        print_warning "Database migrations directory not found"
    fi
}

# Start the development server
start_dev_server() {
    print_status "Starting development server..."
    print_success "Server will start on http://localhost:3000"
    print_success "Swagger documentation will be available at http://localhost:3000/api/docs"
    echo ""
    print_status "Press Ctrl+C to stop the server"
    echo ""
    npm run start:dev
}

# Main execution
main() {
    echo "=========================================="
    echo "    Tasviegar Backend Quick Start"
    echo "=========================================="
    echo ""

    # Check prerequisites
    check_nodejs
    check_npm
    check_postgresql
    echo ""

    # Setup project
    install_dependencies
    create_env_file
    create_logs_directory
    create_uploads_directory
    echo ""

    # Build and run
    build_project
    run_migrations
    echo ""

    print_success "Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Update the .env file with your configuration"
    echo "2. Run database migrations"
    echo "3. Start the development server"
    echo ""

    # Ask if user wants to start the server
    read -p "Do you want to start the development server now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev_server
    else
        print_status "You can start the server later with: npm run start:dev"
    fi
}

# Run main function
main "$@"
