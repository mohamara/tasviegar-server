-- Migration: Create Debts Schema
-- Version: 002
-- Description: Create tables for debts, participants, and transactions

-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'group_expense',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    creator_id UUID NOT NULL,
    currency VARCHAR(10) DEFAULT 'IRR',
    due_date DATE,
    metadata JSONB,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create debt_participants table
CREATE TABLE IF NOT EXISTS debt_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'debtor',
    share_amount DECIMAL(15,2) DEFAULT 0,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(debt_id, user_id)
);

-- Create debt_transactions table
CREATE TABLE IF NOT EXISTS debt_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL,
    payer_id UUID NOT NULL,
    payee_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(50) DEFAULT 'payment',
    status VARCHAR(50) DEFAULT 'pending',
    description VARCHAR(255),
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    metadata JSONB,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'other',
    privacy VARCHAR(50) DEFAULT 'private',
    creator_id UUID NOT NULL,
    avatar VARCHAR(255),
    invite_code VARCHAR(10),
    member_count INTEGER DEFAULT 0,
    max_members INTEGER DEFAULT 50,
    metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    status VARCHAR(50) DEFAULT 'pending',
    nickname VARCHAR(255),
    notes TEXT,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- Create group_invitations table
CREATE TABLE IF NOT EXISTS group_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    invited_by UUID NOT NULL,
    mobile VARCHAR(20),
    email VARCHAR(255),
    invite_code VARCHAR(10),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    message TEXT,
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    channels JSONB,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    language VARCHAR(10) DEFAULT 'fa',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'normal',
    variables JSONB,
    channels JSONB,
    metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debts_creator_id ON debts(creator_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
CREATE INDEX IF NOT EXISTS idx_debts_created_at ON debts(created_at);

CREATE INDEX IF NOT EXISTS idx_debt_participants_debt_id ON debt_participants(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_participants_user_id ON debt_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_participants_role ON debt_participants(role);

CREATE INDEX IF NOT EXISTS idx_debt_transactions_debt_id ON debt_transactions(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_transactions_payer_id ON debt_transactions(payer_id);
CREATE INDEX IF NOT EXISTS idx_debt_transactions_payee_id ON debt_transactions(payee_id);
CREATE INDEX IF NOT EXISTS idx_debt_transactions_status ON debt_transactions(status);
CREATE INDEX IF NOT EXISTS idx_debt_transactions_type ON debt_transactions(type);
CREATE INDEX IF NOT EXISTS idx_debt_transactions_created_at ON debt_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_groups_creator_id ON groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_privacy ON groups(privacy);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);

CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_by ON group_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_type ON group_invitations(type);
CREATE INDEX IF NOT EXISTS idx_group_invitations_created_at ON group_invitations(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_language ON notification_templates(language);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

-- Add foreign key constraints
ALTER TABLE debts ADD CONSTRAINT fk_debts_creator_id 
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE debt_participants ADD CONSTRAINT fk_debt_participants_debt_id 
    FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE;
ALTER TABLE debt_participants ADD CONSTRAINT fk_debt_participants_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE debt_transactions ADD CONSTRAINT fk_debt_transactions_debt_id 
    FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE;
ALTER TABLE debt_transactions ADD CONSTRAINT fk_debt_transactions_payer_id 
    FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE debt_transactions ADD CONSTRAINT fk_debt_transactions_payee_id 
    FOREIGN KEY (payee_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE groups ADD CONSTRAINT fk_groups_creator_id 
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE group_members ADD CONSTRAINT fk_group_members_group_id 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
ALTER TABLE group_members ADD CONSTRAINT fk_group_members_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE group_invitations ADD CONSTRAINT fk_group_invitations_group_id 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
ALTER TABLE group_invitations ADD CONSTRAINT fk_group_invitations_invited_by 
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Insert default notification templates
INSERT INTO notification_templates (name, type, language, title, message, priority, variables, channels, metadata) VALUES
('debt_created_fa', 'debt_created', 'fa', 'بدهی جدید ایجاد شد', '{{creatorName}} یک بدهی جدید به مبلغ {{amount}} تومان ایجاد کرد', 'normal', '{"creatorName": {"type": "string", "required": true, "description": "نام ایجادکننده"}, "amount": {"type": "number", "required": true, "description": "مبلغ بدهی"}}', '{"inApp": true, "email": true, "sms": false, "push": true}', '{"category": "debt", "tags": ["debt", "creation"]}'),
('debt_settled_fa', 'debt_settled', 'fa', 'بدهی تسویه شد', 'بدهی "{{debtTitle}}" با موفقیت تسویه شد', 'normal', '{"debtTitle": {"type": "string", "required": true, "description": "عنوان بدهی"}}', '{"inApp": true, "email": true, "sms": false, "push": true}', '{"category": "debt", "tags": ["debt", "settlement"]}'),
('payment_received_fa', 'transaction_completed', 'fa', 'پرداخت دریافت شد', '{{payerName}} مبلغ {{amount}} تومان را پرداخت کرد', 'normal', '{"payerName": {"type": "string", "required": true, "description": "نام پرداخت‌کننده"}, "amount": {"type": "number", "required": true, "description": "مبلغ پرداخت"}}', '{"inApp": true, "email": true, "sms": false, "push": true}', '{"category": "transaction", "tags": ["payment", "received"]}'),
('group_invitation_fa', 'group_invitation', 'fa', 'دعوت به گروه', '{{inviterName}} شما را به گروه "{{groupName}}" دعوت کرده است', 'normal', '{"inviterName": {"type": "string", "required": true, "description": "نام دعوت‌کننده"}, "groupName": {"type": "string", "required": true, "description": "نام گروه"}}', '{"inApp": true, "email": true, "sms": true, "push": true}', '{"category": "group", "tags": ["invitation", "group"]}');

-- Update sequence if needed
SELECT setval(pg_get_serial_sequence('debts', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('debt_participants', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('debt_transactions', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('groups', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('group_members', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('group_invitations', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('notifications', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('notification_templates', 'id'), 1, false);
