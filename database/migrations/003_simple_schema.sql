-- Simple schema without Persian collation
-- ایجاد schema ساده بدون collation فارسی

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enums
CREATE TYPE currency_type AS ENUM ('IRR', 'TOMAN');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification', 'deleted');
CREATE TYPE debt_status AS ENUM ('pending', 'acknowledged', 'disputed', 'settled', 'cancelled', 'overdue');
CREATE TYPE group_type AS ENUM ('household', 'friends', 'work', 'trip', 'business', 'family');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'shaparak', 'saman', 'parsian', 'mellat', 'saderat', 'other');
CREATE TYPE notification_type AS ENUM ('debt_created', 'debt_reminder', 'payment_received', 'group_invite', 'system_update');
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(10) UNIQUE,
    birth_date DATE,
    avatar_url TEXT,
    preferred_currency currency_type DEFAULT 'TOMAN',
    language VARCHAR(5) DEFAULT 'fa-IR',
    timezone VARCHAR(50) DEFAULT 'Asia/Tehran',
    status user_status DEFAULT 'pending_verification',
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create groups table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type group_type NOT NULL,
    avatar_url TEXT,
    color VARCHAR(7) DEFAULT '#1976d2',
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_limit INTEGER DEFAULT 50,
    default_currency currency_type DEFAULT 'TOMAN',
    auto_settle BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create group_members table
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    permissions JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active',
    invite_token VARCHAR(100),
    invite_expires_at TIMESTAMPTZ,
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    UNIQUE(group_id, user_id)
);

-- Create debts table
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creditor_id UUID NOT NULL REFERENCES users(id),
    debtor_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    currency currency_type DEFAULT 'TOMAN',
    description TEXT NOT NULL,
    category VARCHAR(50),
    due_date DATE,
    persian_due_date VARCHAR(20),
    reminder_date DATE,
    status debt_status DEFAULT 'pending',
    priority priority_level DEFAULT 'normal',
    proof_url TEXT,
    notes TEXT,
    group_id UUID REFERENCES groups(id),
    parent_debt_id UUID REFERENCES debts(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debt_id UUID NOT NULL REFERENCES debts(id),
    payer_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    currency currency_type DEFAULT 'TOMAN',
    payment_method payment_method NOT NULL,
    gateway_reference VARCHAR(255),
    card_number_masked VARCHAR(20),
    status transaction_status DEFAULT 'pending',
    persian_timestamp VARCHAR(50),
    receipt_url TEXT,
    payment_proof_url TEXT,
    confirmed_by_payer BOOLEAN DEFAULT FALSE,
    confirmed_by_receiver BOOLEAN DEFAULT FALSE,
    confirmation_code VARCHAR(6),
    notes TEXT,
    admin_notes TEXT,
    processed_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    priority priority_level DEFAULT 'normal',
    data JSONB,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    send_push BOOLEAN DEFAULT TRUE,
    send_sms BOOLEAN DEFAULT FALSE,
    send_email BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    description TEXT,
    metadata JSONB,
    persian_timestamp VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_debts_creditor ON debts(creditor_id);
CREATE INDEX idx_debts_debtor ON debts(debtor_id);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_group ON debts(group_id);
CREATE INDEX idx_transactions_debt ON transactions(debt_id);
CREATE INDEX idx_transactions_payer ON transactions(payer_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Insert sample data
INSERT INTO users (email, phone, password_hash, first_name, last_name, national_id, status, is_phone_verified) VALUES
('admin@tasviegar.com', '09123456789', '$2b$10$example', 'مدیر', 'اصلی', '1234567890', 'active', TRUE),
('user1@example.com', '09111111111', '$2b$10$example', 'علی', 'احمدی', '1111111111', 'active', TRUE),
('user2@example.com', '09222222222', '$2b$10$example', 'فاطمه', 'محمدی', '2222222222', 'active', TRUE);

INSERT INTO groups (name, description, type, owner_id) VALUES
('خانواده', 'گروه خانوادگی', 'family', (SELECT id FROM users WHERE email = 'admin@tasviegar.com')),
('دوستان', 'گروه دوستان', 'friends', (SELECT id FROM users WHERE email = 'user1@example.com'));

INSERT INTO group_members (group_id, user_id, role) VALUES
((SELECT id FROM groups WHERE name = 'خانواده'), (SELECT id FROM users WHERE email = 'admin@tasviegar.com'), 'owner'),
((SELECT id FROM groups WHERE name = 'خانواده'), (SELECT id FROM users WHERE email = 'user1@example.com'), 'member'),
((SELECT id FROM groups WHERE name = 'دوستان'), (SELECT id FROM users WHERE email = 'user1@example.com'), 'owner'),
((SELECT id FROM groups WHERE name = 'دوستان'), (SELECT id FROM users WHERE email = 'user2@example.com'), 'member');

INSERT INTO debts (creditor_id, debtor_id, amount, currency, description, status) VALUES
((SELECT id FROM users WHERE email = 'user1@example.com'), (SELECT id FROM users WHERE email = 'user2@example.com'), 500000, 'TOMAN', 'قرض برای خرید ماشین', 'pending'),
((SELECT id FROM users WHERE email = 'user2@example.com'), (SELECT id FROM users WHERE email = 'user1@example.com'), 200000, 'TOMAN', 'قرض برای غذا', 'acknowledged');

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO settler_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO settler_app;
GRANT USAGE ON SCHEMA public TO settler_app;

-- Set timezone
ALTER DATABASE settler_iran SET timezone = 'Asia/Tehran';

COMMENT ON DATABASE settler_iran IS 'پایگاه داده سیستم تسویه‌گر - Settler Iran Database';
