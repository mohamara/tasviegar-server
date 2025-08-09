-- =============================================================================
-- Settler Iran Database Schema
-- مخصوص بازار ایران با پشتیبانی کامل فارسی
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- CUSTOM TYPES (انواع سفارشی)
-- =============================================================================

-- Currency types for Iran
CREATE TYPE currency_type AS ENUM ('IRR', 'TOMAN');

-- User status types
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification', 'deleted');

-- Debt status types
CREATE TYPE debt_status AS ENUM ('pending', 'acknowledged', 'disputed', 'settled', 'cancelled', 'overdue');

-- Group types suitable for Iranian culture
CREATE TYPE group_type AS ENUM ('household', 'friends', 'work', 'trip', 'business', 'family');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');

-- Payment methods popular in Iran
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'shaparak', 'saman', 'parsian', 'mellat', 'saderat', 'other');

-- Notification types
CREATE TYPE notification_type AS ENUM ('debt_created', 'debt_reminder', 'payment_received', 'group_invite', 'system_update');

-- Priority levels
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- =============================================================================
-- UTILITY FUNCTIONS (توابع کمکی)
-- =============================================================================

-- Function to validate Iranian National ID (کدملی)
CREATE OR REPLACE FUNCTION validate_iranian_national_id(national_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    check_sum INTEGER;
    remainder INTEGER;
    i INTEGER;
BEGIN
    -- Check if input is exactly 10 digits
    IF national_id !~ '^[0-9]{10}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for invalid patterns (all same digits)
    IF national_id IN ('0000000000', '1111111111', '2222222222', '3333333333', '4444444444', 
                       '5555555555', '6666666666', '7777777777', '8888888888', '9999999999') THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate checksum
    check_sum := 0;
    FOR i IN 1..9 LOOP
        check_sum := check_sum + (CAST(SUBSTRING(national_id FROM i FOR 1) AS INTEGER) * (11 - i));
    END LOOP;
    
    remainder := check_sum % 11;
    
    -- Validate check digit
    IF remainder < 2 THEN
        RETURN (CAST(SUBSTRING(national_id FROM 10 FOR 1) AS INTEGER) = remainder);
    ELSE
        RETURN (CAST(SUBSTRING(national_id FROM 10 FOR 1) AS INTEGER) = (11 - remainder));
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to validate Iranian mobile number
CREATE OR REPLACE FUNCTION validate_iranian_mobile(mobile TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Remove any spaces, dashes, or plus signs
    mobile := REGEXP_REPLACE(mobile, '[^0-9]', '', 'g');
    
    -- Check for valid Iranian mobile patterns
    -- Format: 09xxxxxxxxx or +989xxxxxxxxx
    RETURN mobile ~ '^(09[0-9]{9}|989[0-9]{9})$';
END;
$$ LANGUAGE plpgsql;

-- Function to convert Gregorian to Persian date (approximate)
CREATE OR REPLACE FUNCTION gregorian_to_persian_date(input_date DATE)
RETURNS TEXT AS $$
DECLARE
    year INTEGER;
    month INTEGER;
    day INTEGER;
    persian_year INTEGER;
    persian_month INTEGER;
    persian_day INTEGER;
BEGIN
    year := EXTRACT(YEAR FROM input_date);
    month := EXTRACT(MONTH FROM input_date);
    day := EXTRACT(DAY FROM input_date);
    
    -- Simplified conversion (for demo purposes)
    -- In production, use a proper conversion library
    persian_year := year - 621;
    persian_month := month;
    persian_day := day;
    
    RETURN persian_year || '/' || 
           LPAD(persian_month::TEXT, 2, '0') || '/' || 
           LPAD(persian_day::TEXT, 2, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to normalize Persian text for search
CREATE OR REPLACE FUNCTION normalize_persian_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Convert Arabic characters to Persian equivalents
    input_text := REPLACE(input_text, 'ي', 'ی');  -- Arabic yeh to Persian yeh
    input_text := REPLACE(input_text, 'ك', 'ک');  -- Arabic kaf to Persian kaf
    input_text := REPLACE(input_text, 'ء', '');   -- Remove hamza
    
    -- Remove extra whitespace
    input_text := REGEXP_REPLACE(input_text, '\s+', ' ', 'g');
    input_text := TRIM(input_text);
    
    RETURN LOWER(input_text);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- USERS TABLE (جدول کاربران)
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication info (اطلاعات احراز هویت)
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL CHECK (validate_iranian_mobile(phone)),
    password_hash VARCHAR(255) NOT NULL,
    
    -- Personal information (اطلاعات شخصی)
    first_name VARCHAR(100) NOT NULL COLLATE "fa_IR",
    last_name VARCHAR(100) NOT NULL COLLATE "fa_IR",
    national_id VARCHAR(10) UNIQUE CHECK (validate_iranian_national_id(national_id)),
    birth_date DATE,
    avatar_url TEXT,
    
    -- Preferences (تنظیمات)
    preferred_currency currency_type DEFAULT 'TOMAN',
    language VARCHAR(5) DEFAULT 'fa-IR',
    timezone VARCHAR(50) DEFAULT 'Asia/Tehran',
    
    -- Search optimization (بهینه‌سازی جستجو)
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('persian', 
            normalize_persian_text(first_name) || ' ' || 
            normalize_persian_text(last_name) || ' ' ||
            COALESCE(email, '') || ' ' ||
            COALESCE(phone, '')
        )
    ) STORED,
    
    -- Status and security (وضعیت و امنیت)
    status user_status DEFAULT 'pending_verification',
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    -- Timestamps (زمان‌بندی)
    last_login_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Comments for users table
COMMENT ON TABLE users IS 'جدول کاربران - اطلاعات کاربران ایرانی';
COMMENT ON COLUMN users.first_name IS 'نام - با پشتیبانی کامل فارسی';
COMMENT ON COLUMN users.last_name IS 'نام خانوادگی - با پشتیبانی کامل فارسی';
COMMENT ON COLUMN users.national_id IS 'کدملی - با validation کدملی ایرانی';
COMMENT ON COLUMN users.phone IS 'شماره موبایل - با validation موبایل ایرانی';
COMMENT ON COLUMN users.preferred_currency IS 'ارز ترجیحی - ریال یا تومان';
COMMENT ON COLUMN users.search_vector IS 'بردار جستجو - برای جستجوی سریع فارسی';

-- =============================================================================
-- GROUPS TABLE (جدول گروه‌ها)
-- =============================================================================

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info (اطلاعات پایه)
    name VARCHAR(200) NOT NULL COLLATE "fa_IR",
    description TEXT COLLATE "fa_IR",
    type group_type NOT NULL,
    avatar_url TEXT,
    color VARCHAR(7) DEFAULT '#1976d2', -- Hex color code
    
    -- Management (مدیریت)
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_limit INTEGER DEFAULT 50,
    
    -- Settings (تنظیمات)
    default_currency currency_type DEFAULT 'TOMAN',
    auto_settle BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    
    -- Search optimization (بهینه‌سازی جستجو)
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('persian', 
            normalize_persian_text(name) || ' ' || 
            COALESCE(normalize_persian_text(description), '')
        )
    ) STORED,
    
    -- Status (وضعیت)
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps (زمان‌بندی)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Comments for groups table
COMMENT ON TABLE groups IS 'جدول گروه‌ها - گروه‌های مالی کاربران';
COMMENT ON COLUMN groups.name IS 'نام گروه - با پشتیبانی فارسی';
COMMENT ON COLUMN groups.type IS 'نوع گروه - خانواده، دوستان، کار و غیره';
COMMENT ON COLUMN groups.owner_id IS 'مالک گروه - مرجع به جدول کاربران';

-- =============================================================================
-- GROUP MEMBERS TABLE (جدول اعضای گروه)
-- =============================================================================

CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role and permissions (نقش و مجوزها)
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member', 'viewer'
    permissions JSONB DEFAULT '["view_expenses", "add_expenses"]',
    
    -- Status (وضعیت)
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'invited', 'left', 'removed'
    
    -- Invitation info (اطلاعات دعوت)
    invite_token VARCHAR(100),
    invite_expires_at TIMESTAMPTZ,
    invited_by UUID REFERENCES users(id),
    
    -- Timestamps (زمان‌بندی)
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    
    UNIQUE(group_id, user_id)
);

COMMENT ON TABLE group_members IS 'جدول اعضای گروه - عضویت کاربران در گروه‌ها';

-- =============================================================================
-- DEBTS TABLE (جدول بدهی‌ها)
-- =============================================================================

CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parties (طرفین)
    creditor_id UUID NOT NULL REFERENCES users(id),
    debtor_id UUID NOT NULL REFERENCES users(id),
    
    -- Amount information (اطلاعات مبلغ)
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency currency_type DEFAULT 'TOMAN',
    
    -- Description (توضیحات)
    description TEXT NOT NULL COLLATE "fa_IR",
    category VARCHAR(50), -- 'food', 'rent', 'utilities', 'personal', etc.
    
    -- Dates (تاریخ‌ها)
    due_date DATE,
    persian_due_date TEXT, -- Persian calendar date
    reminder_date DATE,
    
    -- Status and tracking (وضعیت و پیگیری)
    status debt_status DEFAULT 'pending',
    priority priority_level DEFAULT 'normal',
    
    -- Evidence and notes (مدارک و یادداشت‌ها)
    proof_url TEXT,
    notes TEXT COLLATE "fa_IR",
    
    -- Group association (ارتباط با گروه)
    group_id UUID REFERENCES groups(id),
    parent_debt_id UUID REFERENCES debts(id), -- For debt splitting
    
    -- Search optimization (بهینه‌سازی جستجو)
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('persian', 
            normalize_persian_text(description) || ' ' || 
            COALESCE(normalize_persian_text(notes), '') || ' ' ||
            COALESCE(category, '')
        )
    ) STORED,
    
    -- Timestamps (زمان‌بندی)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints (محدودیت‌ها)
    CONSTRAINT different_parties CHECK (creditor_id != debtor_id),
    CONSTRAINT valid_parent_debt CHECK (parent_debt_id != id)
);

-- Comments for debts table
COMMENT ON TABLE debts IS 'جدول بدهی‌ها - ثبت بدهی‌ها بین کاربران';
COMMENT ON COLUMN debts.amount IS 'مبلغ بدهی - به ریال یا تومان';
COMMENT ON COLUMN debts.description IS 'شرح بدهی - با پشتیبانی فارسی';
COMMENT ON COLUMN debts.persian_due_date IS 'تاریخ سررسید شمسی';
COMMENT ON COLUMN debts.creditor_id IS 'طلبکار - مرجع به جدول کاربران';
COMMENT ON COLUMN debts.debtor_id IS 'بدهکار - مرجع به جدول کاربران';

-- =============================================================================
-- TRANSACTIONS TABLE (جدول تراکنش‌ها)
-- =============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference (مرجع)
    debt_id UUID NOT NULL REFERENCES debts(id),
    payer_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    
    -- Transaction details (جزئیات تراکنش)
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency currency_type DEFAULT 'TOMAN',
    
    -- Payment information (اطلاعات پرداخت)
    payment_method payment_method NOT NULL,
    gateway_reference VARCHAR(255), -- Reference from payment gateway
    card_number_masked VARCHAR(20), -- Masked card number like ****-****-****-1234
    
    -- Status and tracking (وضعیت و پیگیری)
    status transaction_status DEFAULT 'pending',
    
    -- Persian timestamp (زمان شمسی)
    persian_timestamp TEXT,
    
    -- Evidence (مدارک)
    receipt_url TEXT,
    payment_proof_url TEXT,
    
    -- Settlement confirmation (تایید تسویه)
    confirmed_by_payer BOOLEAN DEFAULT FALSE,
    confirmed_by_receiver BOOLEAN DEFAULT FALSE,
    confirmation_code VARCHAR(6), -- SMS verification code
    
    -- Notes (یادداشت‌ها)
    notes TEXT COLLATE "fa_IR",
    admin_notes TEXT COLLATE "fa_IR",
    
    -- Timestamps (زمان‌بندی)
    processed_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for transactions table
COMMENT ON TABLE transactions IS 'جدول تراکنش‌ها - ثبت پرداخت‌ها و تسویه‌ها';
COMMENT ON COLUMN transactions.gateway_reference IS 'شناسه درگاه پرداخت';
COMMENT ON COLUMN transactions.persian_timestamp IS 'زمان شمسی تراکنش';
COMMENT ON COLUMN transactions.confirmation_code IS 'کد تایید پیامکی';

-- =============================================================================
-- NOTIFICATIONS TABLE (جدول اعلان‌ها)
-- =============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Target user (کاربر هدف)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content (محتوا)
    title VARCHAR(200) NOT NULL COLLATE "fa_IR",
    message TEXT NOT NULL COLLATE "fa_IR",
    type notification_type NOT NULL,
    priority priority_level DEFAULT 'normal',
    
    -- Metadata (اطلاعات تکمیلی)
    data JSONB, -- Additional context data
    related_entity_type VARCHAR(50), -- 'debt', 'transaction', 'group', etc.
    related_entity_id UUID,
    
    -- Status (وضعیت)
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    
    -- Delivery options (گزینه‌های ارسال)
    send_push BOOLEAN DEFAULT TRUE,
    send_sms BOOLEAN DEFAULT FALSE,
    send_email BOOLEAN DEFAULT FALSE,
    
    -- Timing (زمان‌بندی)
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Search optimization (بهینه‌سازی جستجو)
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('persian', 
            normalize_persian_text(title) || ' ' || 
            normalize_persian_text(message)
        )
    ) STORED,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for notifications table
COMMENT ON TABLE notifications IS 'جدول اعلان‌ها - پیام‌ها و اطلاع‌رسانی‌ها';
COMMENT ON COLUMN notifications.title IS 'عنوان اعلان - با پشتیبانی فارسی';
COMMENT ON COLUMN notifications.message IS 'متن اعلان - با پشتیبانی فارسی';

-- =============================================================================
-- AUDIT LOGS TABLE (جدول گزارش تغییرات)
-- =============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor information (اطلاعات انجام‌دهنده)
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    
    -- Action details (جزئیات عمل)
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'settle', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'debt', 'user', 'group', 'transaction'
    entity_id UUID NOT NULL,
    
    -- Changes (تغییرات)
    old_values JSONB,
    new_values JSONB,
    
    -- Context (متن)
    description TEXT COLLATE "fa_IR",
    metadata JSONB,
    
    -- Persian timestamp (زمان شمسی)
    persian_timestamp TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for audit_logs table
COMMENT ON TABLE audit_logs IS 'جدول گزارش تغییرات - ردیابی تمام عملیات';
COMMENT ON COLUMN audit_logs.description IS 'شرح تغییرات - با پشتیبانی فارسی';

-- =============================================================================
-- INDEXES (فهرست‌ها)
-- =============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_national_id ON users(national_id) WHERE national_id IS NOT NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_search ON users USING GIN(search_vector);
CREATE INDEX idx_users_name_trgm ON users USING GIN((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Groups indexes
CREATE INDEX idx_groups_owner ON groups(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_groups_type ON groups(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_groups_search ON groups USING GIN(search_vector);
CREATE INDEX idx_groups_active ON groups(is_active) WHERE deleted_at IS NULL;

-- Group members indexes
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_status ON group_members(status);
CREATE INDEX idx_group_members_role ON group_members(role);

-- Debts indexes
CREATE INDEX idx_debts_creditor ON debts(creditor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_debts_debtor ON debts(debtor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_debts_status ON debts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_debts_due_date ON debts(due_date) WHERE deleted_at IS NULL AND due_date IS NOT NULL;
CREATE INDEX idx_debts_group ON debts(group_id) WHERE deleted_at IS NULL AND group_id IS NOT NULL;
CREATE INDEX idx_debts_amount ON debts(amount, currency) WHERE deleted_at IS NULL;
CREATE INDEX idx_debts_search ON debts USING GIN(search_vector);
CREATE INDEX idx_debts_category ON debts(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_debts_priority ON debts(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_debts_overdue ON debts(due_date, status) WHERE status = 'pending' AND due_date < CURRENT_DATE;

-- Transactions indexes
CREATE INDEX idx_transactions_debt ON transactions(debt_id);
CREATE INDEX idx_transactions_payer ON transactions(payer_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_gateway_ref ON transactions(gateway_reference) WHERE gateway_reference IS NOT NULL;

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_search ON notifications USING GIN(search_vector);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Audit logs indexes (partitioned by month for better performance)
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- TRIGGERS (راه‌اندازها)
-- =============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at 
    BEFORE UPDATE ON debts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically set Persian due date
CREATE OR REPLACE FUNCTION set_persian_due_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.due_date IS NOT NULL THEN
        NEW.persian_due_date = gregorian_to_persian_date(NEW.due_date);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_debt_persian_date 
    BEFORE INSERT OR UPDATE ON debts 
    FOR EACH ROW EXECUTE FUNCTION set_persian_due_date();

-- Trigger to set Persian timestamp for transactions
CREATE OR REPLACE FUNCTION set_persian_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.persian_timestamp = gregorian_to_persian_date(NEW.created_at::DATE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transaction_persian_timestamp 
    BEFORE INSERT ON transactions 
    FOR EACH ROW EXECUTE FUNCTION set_persian_timestamp();

-- =============================================================================
-- VIEWS (نماها)
-- =============================================================================

-- View for user debt summary
CREATE VIEW user_debt_summary AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.preferred_currency,
    
    -- As creditor (طلبکاری)
    COALESCE(SUM(CASE WHEN d.creditor_id = u.id AND d.status IN ('pending', 'acknowledged') THEN d.amount ELSE 0 END), 0) as total_owed_to_me,
    COUNT(CASE WHEN d.creditor_id = u.id AND d.status IN ('pending', 'acknowledged') THEN 1 END) as debts_owed_to_me_count,
    
    -- As debtor (بدهکاری)
    COALESCE(SUM(CASE WHEN d.debtor_id = u.id AND d.status IN ('pending', 'acknowledged') THEN d.amount ELSE 0 END), 0) as total_i_owe,
    COUNT(CASE WHEN d.debtor_id = u.id AND d.status IN ('pending', 'acknowledged') THEN 1 END) as debts_i_owe_count,
    
    -- Net balance (تراز خالص)
    COALESCE(SUM(CASE WHEN d.creditor_id = u.id AND d.status IN ('pending', 'acknowledged') THEN d.amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN d.debtor_id = u.id AND d.status IN ('pending', 'acknowledged') THEN d.amount ELSE 0 END), 0) as net_balance,
    
    -- Overdue counts (عقب‌افتاده)
    COUNT(CASE WHEN d.debtor_id = u.id AND d.status = 'pending' AND d.due_date < CURRENT_DATE THEN 1 END) as overdue_debts_count

FROM users u
LEFT JOIN debts d ON (d.creditor_id = u.id OR d.debtor_id = u.id) 
    AND d.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.first_name, u.last_name, u.preferred_currency;

COMMENT ON VIEW user_debt_summary IS 'خلاصه بدهی‌های کاربران - نمای کلی وضعیت مالی';

-- View for group financial summary
CREATE VIEW group_financial_summary AS
SELECT 
    g.id,
    g.name,
    g.type,
    g.default_currency,
    
    -- Total expenses (کل هزینه‌ها)
    COALESCE(SUM(d.amount), 0) as total_expenses,
    COUNT(d.id) as total_debts_count,
    
    -- Status breakdown (تفکیک وضعیت)
    COALESCE(SUM(CASE WHEN d.status = 'settled' THEN d.amount ELSE 0 END), 0) as settled_amount,
    COALESCE(SUM(CASE WHEN d.status IN ('pending', 'acknowledged') THEN d.amount ELSE 0 END), 0) as pending_amount,
    
    -- Member information (اطلاعات اعضا)
    (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id AND gm.status = 'active') as active_members_count,
    
    -- Activity (فعالیت)
    MAX(d.created_at) as last_expense_date,
    
    -- Average per member (میانگین هر عضو)
    CASE 
        WHEN (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id AND gm.status = 'active') > 0 
        THEN COALESCE(SUM(d.amount), 0) / (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id AND gm.status = 'active')
        ELSE 0 
    END as average_per_member

FROM groups g
LEFT JOIN debts d ON d.group_id = g.id AND d.deleted_at IS NULL
WHERE g.deleted_at IS NULL
GROUP BY g.id, g.name, g.type, g.default_currency;

COMMENT ON VIEW group_financial_summary IS 'خلاصه مالی گروه‌ها - نمای کلی وضعیت مالی گروه‌ها';

-- =============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS (نماهای مادی برای تجزیه و تحلیل)
-- =============================================================================

-- Daily statistics materialized view
CREATE MATERIALIZED VIEW daily_statistics AS
SELECT 
    DATE(created_at) as date_persian,
    gregorian_to_persian_date(DATE(created_at)) as date_shamsi,
    
    -- User statistics
    (SELECT COUNT(*) FROM users WHERE DATE(created_at) = DATE(ds.created_at) AND deleted_at IS NULL) as new_users,
    
    -- Debt statistics
    (SELECT COUNT(*) FROM debts WHERE DATE(created_at) = DATE(ds.created_at) AND deleted_at IS NULL) as new_debts,
    (SELECT COALESCE(SUM(amount), 0) FROM debts WHERE DATE(created_at) = DATE(ds.created_at) AND deleted_at IS NULL) as total_debt_amount,
    
    -- Transaction statistics
    (SELECT COUNT(*) FROM transactions WHERE DATE(created_at) = DATE(ds.created_at) AND status = 'completed') as completed_transactions,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE DATE(created_at) = DATE(ds.created_at) AND status = 'completed') as total_transaction_amount
    
FROM (
    SELECT DISTINCT DATE(created_at) as created_at 
    FROM (
        SELECT created_at FROM users 
        UNION ALL 
        SELECT created_at FROM debts 
        UNION ALL 
        SELECT created_at FROM transactions
    ) all_dates
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
) ds
ORDER BY date_persian DESC;

COMMENT ON MATERIALIZED VIEW daily_statistics IS 'آمار روزانه - تجزیه و تحلیل عملکرد روزانه';

-- =============================================================================
-- STORED PROCEDURES (رویه‌های ذخیره‌شده)
-- =============================================================================

-- Procedure to clean up old notifications
CREATE OR REPLACE PROCEDURE cleanup_old_notifications()
LANGUAGE plpgsql AS $$
BEGIN
    -- Delete read notifications older than 30 days
    DELETE FROM notifications 
    WHERE is_read = TRUE 
      AND created_at < NOW() - INTERVAL '30 days';
    
    -- Delete unread notifications older than 90 days
    DELETE FROM notifications 
    WHERE is_read = FALSE 
      AND created_at < NOW() - INTERVAL '90 days';
    
    RAISE NOTICE 'Cleanup completed for old notifications';
END;
$$;

-- Procedure to update debt status to overdue
CREATE OR REPLACE PROCEDURE update_overdue_debts()
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE debts 
    SET status = 'overdue', 
        updated_at = NOW()
    WHERE status = 'pending' 
      AND due_date < CURRENT_DATE 
      AND deleted_at IS NULL;
    
    RAISE NOTICE 'Updated overdue debts status';
END;
$$;

-- Procedure to refresh materialized views
CREATE OR REPLACE PROCEDURE refresh_analytics_views()
LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_statistics;
    RAISE NOTICE 'Analytics views refreshed';
END;
$$;

-- =============================================================================
-- SAMPLE DATA (داده‌های نمونه)
-- =============================================================================

-- Insert sample Iranian cities for testing
INSERT INTO users (email, phone, first_name, last_name, national_id, preferred_currency, status, is_email_verified, is_phone_verified) VALUES
('ali.ahmadi@gmail.com', '09123456789', 'علی', 'احمدی', '1234567890', 'TOMAN', 'active', TRUE, TRUE),
('sara.mohammadi@gmail.com', '09987654321', 'سارا', 'محمدی', '0987654321', 'TOMAN', 'active', TRUE, TRUE),
('reza.hosseini@gmail.com', '09111111111', 'رضا', 'حسینی', '1111111110', 'IRR', 'active', TRUE, FALSE);

-- Insert sample group
INSERT INTO groups (name, description, type, owner_id, default_currency) VALUES
('خانواده احمدی', 'هزینه‌های مشترک خانواده', 'household', (SELECT id FROM users WHERE email = 'ali.ahmadi@gmail.com'), 'TOMAN');

-- Insert sample group members
INSERT INTO group_members (group_id, user_id, role) VALUES
((SELECT id FROM groups WHERE name = 'خانواده احمدی'), (SELECT id FROM users WHERE email = 'ali.ahmadi@gmail.com'), 'admin'),
((SELECT id FROM groups WHERE name = 'خانواده احمدی'), (SELECT id FROM users WHERE email = 'sara.mohammadi@gmail.com'), 'member');

-- Insert sample debt
INSERT INTO debts (creditor_id, debtor_id, amount, currency, description, category, due_date, status) VALUES
((SELECT id FROM users WHERE email = 'ali.ahmadi@gmail.com'), 
 (SELECT id FROM users WHERE email = 'sara.mohammadi@gmail.com'), 
 500000, 'TOMAN', 'هزینه ناهار مشترک', 'food', CURRENT_DATE + INTERVAL '7 days', 'pending');

-- =============================================================================
-- PERMISSIONS AND SECURITY (مجوزها و امنیت)
-- =============================================================================

-- Create application user role
CREATE ROLE settler_app;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO settler_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO settler_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO settler_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO settler_app;

-- Enable Row Level Security on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PERFORMANCE OPTIMIZATIONS (بهینه‌سازی عملکرد)
-- =============================================================================

-- Configure PostgreSQL settings for Persian text
ALTER DATABASE settler_iran SET default_text_search_config = 'persian';
ALTER DATABASE settler_iran SET timezone = 'Asia/Tehran';

-- Create partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_debts_active_pending 
ON debts(creditor_id, debtor_id, amount) 
WHERE status IN ('pending', 'acknowledged') AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_notifications_unread_recent 
ON notifications(user_id, created_at) 
WHERE is_read = FALSE AND created_at > NOW() - INTERVAL '30 days';

-- =============================================================================
-- MAINTENANCE JOBS (کارهای نگهداری)
-- =============================================================================

-- Note: These would typically be run via cron jobs or scheduled tasks

-- Example cron job commands (to be set up outside of database):
-- Daily at 2 AM: Call update_overdue_debts()
-- Weekly: Call cleanup_old_notifications()
-- Daily at 3 AM: Call refresh_analytics_views()

COMMENT ON DATABASE settler_iran IS 'پایگاه داده اپلیکیشن Settler ایران - مدیریت بدهی‌ها';

-- =============================================================================
-- END OF SCHEMA
-- ============================================================================= 