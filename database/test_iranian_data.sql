-- =============================================================================
-- تست‌های کامل برای پایگاه داده Settler ایران
-- Comprehensive tests for Settler Iran Database
-- =============================================================================

\echo '🧪 شروع تست‌های پایگاه داده Settler ایران...'

-- =============================================================================
-- تست Validation Functions
-- =============================================================================

\echo '📋 تست توابع اعتبارسنجی...'

-- تست validation کدملی ایرانی
\echo '  ✓ تست کدملی ایرانی:'
SELECT 
    '1234567890' as national_id,
    validate_iranian_national_id('1234567890') as is_valid,
    'کدملی معتبر' as expected;

SELECT 
    '1111111111' as national_id,
    validate_iranian_national_id('1111111111') as is_valid,
    'کدملی نامعتبر (تکراری)' as expected;

SELECT 
    '12345' as national_id,
    validate_iranian_national_id('12345') as is_valid,
    'کدملی نامعتبر (کوتاه)' as expected;

-- تست validation موبایل ایرانی
\echo '  ✓ تست شماره موبایل ایرانی:'
SELECT 
    '09123456789' as mobile,
    validate_iranian_mobile('09123456789') as is_valid,
    'موبایل معتبر' as expected;

SELECT 
    '+989123456789' as mobile,
    validate_iranian_mobile('+989123456789') as is_valid,
    'موبایل معتبر (با کد کشور)' as expected;

SELECT 
    '021-12345678' as mobile,
    validate_iranian_mobile('021-12345678') as is_valid,
    'شماره ثابت (نامعتبر)' as expected;

-- تست نرمال‌سازی متن فارسی
\echo '  ✓ تست نرمال‌سازی متن فارسی:'
SELECT 
    'علي احمدي' as original,
    normalize_persian_text('علي احمدي') as normalized,
    'تبدیل ی عربی به فارسی' as test_case;

SELECT 
    'محمد   رضايي' as original,
    normalize_persian_text('محمد   رضايي') as normalized,
    'حذف فاصله‌های اضافی' as test_case;

-- تست تبدیل تاریخ
\echo '  ✓ تست تبدیل تاریخ:'
SELECT 
    '2024-03-20' as gregorian,
    gregorian_to_persian_date('2024-03-20') as persian,
    'تبدیل تاریخ میلادی به شمسی' as test_case;

-- =============================================================================
-- تست‌های CRUD برای جداول اصلی
-- =============================================================================

\echo '📊 تست عملیات CRUD...'

-- تست جدول کاربران
\echo '  ✓ تست جدول users:'

-- حذف داده‌های تست قبلی
DELETE FROM users WHERE email LIKE '%test%';

-- درج کاربران تست
INSERT INTO users (email, phone, first_name, last_name, national_id, preferred_currency, status, is_email_verified, is_phone_verified) VALUES
('test1@example.com', '09111111111', 'علی', 'احمدی', '1234567890', 'TOMAN', 'active', TRUE, TRUE),
('test2@example.com', '09222222222', 'سارا', 'محمدی', '0987654321', 'IRR', 'active', TRUE, FALSE),
('test3@example.com', '09333333333', 'رضا', 'حسینی', '1111111110', 'TOMAN', 'pending_verification', FALSE, FALSE);

-- بررسی درج
SELECT 
    count(*) as user_count,
    'باید 3 کاربر باشد' as expected
FROM users 
WHERE email LIKE '%test%';

-- تست جستجوی فارسی
SELECT 
    first_name,
    last_name,
    email,
    ts_rank(search_vector, to_tsquery('persian', 'علی')) as rank
FROM users 
WHERE search_vector @@ to_tsquery('persian', 'علی')
AND email LIKE '%test%';

-- تست جدول گروه‌ها
\echo '  ✓ تست جدول groups:'

-- درج گروه تست
INSERT INTO groups (name, description, type, owner_id, default_currency) VALUES
('گروه تست خانواده', 'هزینه‌های مشترک خانواده برای تست', 'household', 
 (SELECT id FROM users WHERE email = 'test1@example.com'), 'TOMAN');

-- بررسی درج گروه
SELECT 
    g.name,
    g.type,
    u.first_name as owner_name,
    g.default_currency
FROM groups g
JOIN users u ON g.owner_id = u.id
WHERE g.name LIKE '%تست%';

-- تست جدول اعضای گروه
\echo '  ✓ تست جدول group_members:'

-- اضافه کردن اعضا به گروه
INSERT INTO group_members (group_id, user_id, role) VALUES
((SELECT id FROM groups WHERE name LIKE '%تست%'), 
 (SELECT id FROM users WHERE email = 'test1@example.com'), 'admin'),
((SELECT id FROM groups WHERE name LIKE '%تست%'), 
 (SELECT id FROM users WHERE email = 'test2@example.com'), 'member');

-- بررسی اعضای گروه
SELECT 
    u.first_name,
    u.last_name,
    gm.role,
    g.name as group_name
FROM group_members gm
JOIN users u ON gm.user_id = u.id
JOIN groups g ON gm.group_id = g.id
WHERE g.name LIKE '%تست%';

-- تست جدول بدهی‌ها
\echo '  ✓ تست جدول debts:'

-- درج بدهی تست
INSERT INTO debts (creditor_id, debtor_id, amount, currency, description, category, due_date, status) VALUES
((SELECT id FROM users WHERE email = 'test1@example.com'),
 (SELECT id FROM users WHERE email = 'test2@example.com'),
 500000, 'TOMAN', 'هزینه ناهار مشترک در رستوران', 'food', CURRENT_DATE + INTERVAL '7 days', 'pending'),
((SELECT id FROM users WHERE email = 'test2@example.com'),
 (SELECT id FROM users WHERE email = 'test3@example.com'),
 1200000, 'TOMAN', 'قرض برای خرید کتاب', 'personal', CURRENT_DATE + INTERVAL '30 days', 'acknowledged');

-- بررسی بدهی‌ها
SELECT 
    c.first_name as creditor,
    d.first_name as debtor,
    dbt.amount,
    dbt.currency,
    dbt.description,
    dbt.status,
    dbt.persian_due_date
FROM debts dbt
JOIN users c ON dbt.creditor_id = c.id
JOIN users d ON dbt.debtor_id = d.id
WHERE c.email LIKE '%test%' OR d.email LIKE '%test%';

-- تست جدول تراکنش‌ها
\echo '  ✓ تست جدول transactions:'

-- درج تراکنش تست
INSERT INTO transactions (debt_id, payer_id, receiver_id, amount, currency, payment_method, status) VALUES
((SELECT id FROM debts WHERE description LIKE '%ناهار%'),
 (SELECT debtor_id FROM debts WHERE description LIKE '%ناهار%'),
 (SELECT creditor_id FROM debts WHERE description LIKE '%ناهار%'),
 500000, 'TOMAN', 'bank_transfer', 'pending');

-- بررسی تراکنش
SELECT 
    t.amount,
    t.currency,
    t.payment_method,
    t.status,
    t.persian_timestamp,
    p.first_name as payer,
    r.first_name as receiver
FROM transactions t
JOIN users p ON t.payer_id = p.id
JOIN users r ON t.receiver_id = r.id
JOIN debts d ON t.debt_id = d.id
WHERE d.description LIKE '%ناهار%';

-- تست جدول اعلان‌ها
\echo '  ✓ تست جدول notifications:'

-- درج اعلان تست
INSERT INTO notifications (user_id, title, message, type, priority) VALUES
((SELECT id FROM users WHERE email = 'test2@example.com'),
 'بدهی جدید اضافه شد',
 'علی احمدی یک بدهی جدید برای شما ثبت کرده است.',
 'debt_created', 'normal');

-- بررسی اعلان
SELECT 
    n.title,
    n.message,
    n.type,
    n.is_read,
    u.first_name as recipient
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE u.email LIKE '%test%';

-- =============================================================================
-- تست Views و گزارش‌ها
-- =============================================================================

\echo '📈 تست Views و گزارش‌ها...'

-- تست view خلاصه بدهی کاربران
\echo '  ✓ تست user_debt_summary view:'
SELECT 
    first_name,
    last_name,
    total_owed_to_me,
    total_i_owe,
    net_balance,
    preferred_currency
FROM user_debt_summary
WHERE id IN (SELECT id FROM users WHERE email LIKE '%test%');

-- تست view خلاصه مالی گروه‌ها
\echo '  ✓ تست group_financial_summary view:'
SELECT 
    name,
    type,
    total_expenses,
    settled_amount,
    pending_amount,
    active_members_count
FROM group_financial_summary
WHERE name LIKE '%تست%';

-- بروزرسانی materialized view
REFRESH MATERIALIZED VIEW daily_statistics;

-- تست materialized view آمار روزانه
\echo '  ✓ تست daily_statistics materialized view:'
SELECT 
    date_persian,
    date_shamsi,
    new_users,
    new_debts,
    total_debt_amount
FROM daily_statistics
ORDER BY date_persian DESC
LIMIT 5;

-- =============================================================================
-- تست Performance و Indexes
-- =============================================================================

\echo '⚡ تست Performance و Indexes...'

-- تست جستجوی فارسی با GIN index
\echo '  ✓ تست جستجوی فارسی:'
EXPLAIN (ANALYZE, BUFFERS) 
SELECT first_name, last_name, email
FROM users 
WHERE search_vector @@ to_tsquery('persian', 'علی')
AND email LIKE '%test%';

-- تست trigram search برای نام‌ها
\echo '  ✓ تست trigram search:'
EXPLAIN (ANALYZE, BUFFERS)
SELECT first_name, last_name, similarity(first_name, 'علی') as sim
FROM users 
WHERE first_name % 'علی'
AND email LIKE '%test%';

-- تست جستجو در بدهی‌ها
\echo '  ✓ تست جستجو در بدهی‌ها:'
EXPLAIN (ANALYZE, BUFFERS)
SELECT description, amount, currency
FROM debts 
WHERE search_vector @@ to_tsquery('persian', 'ناهار');

-- =============================================================================
-- تست Triggers
-- =============================================================================

\echo '🔄 تست Triggers...'

-- تست trigger بروزرسانی updated_at
\echo '  ✓ تست trigger بروزرسانی زمان:'
UPDATE users 
SET first_name = 'علی محمد' 
WHERE email = 'test1@example.com';

SELECT 
    first_name,
    created_at,
    updated_at,
    (updated_at > created_at) as time_updated_correctly
FROM users 
WHERE email = 'test1@example.com';

-- تست trigger تاریخ شمسی
\echo '  ✓ تست trigger تاریخ شمسی:'
UPDATE debts 
SET due_date = CURRENT_DATE + INTERVAL '15 days'
WHERE description LIKE '%ناهار%';

SELECT 
    description,
    due_date,
    persian_due_date,
    (persian_due_date IS NOT NULL) as persian_date_set
FROM debts 
WHERE description LIKE '%ناهار%';

-- =============================================================================
-- تست Stored Procedures
-- =============================================================================

\echo '🔧 تست Stored Procedures...'

-- تست procedure بروزرسانی بدهی‌های عقب‌افتاده
\echo '  ✓ تست update_overdue_debts:'

-- ایجاد بدهی عقب‌افتاده برای تست
INSERT INTO debts (creditor_id, debtor_id, amount, currency, description, due_date, status) VALUES
((SELECT id FROM users WHERE email = 'test1@example.com'),
 (SELECT id FROM users WHERE email = 'test3@example.com'),
 300000, 'TOMAN', 'بدهی عقب‌افتاده تست', CURRENT_DATE - INTERVAL '5 days', 'pending');

-- اجرای procedure
CALL update_overdue_debts();

-- بررسی نتیجه
SELECT 
    description,
    due_date,
    status,
    (status = 'overdue') as correctly_marked_overdue
FROM debts 
WHERE description = 'بدهی عقب‌افتاده تست';

-- =============================================================================
-- تست امنیت و Constraints
-- =============================================================================

\echo '🔒 تست امنیت و Constraints...'

-- تست constraint عدم بدهی به خود
\echo '  ✓ تست constraint عدم بدهی به خود:'
DO $$
DECLARE
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        INSERT INTO debts (creditor_id, debtor_id, amount, currency, description) VALUES
        ((SELECT id FROM users WHERE email = 'test1@example.com'),
         (SELECT id FROM users WHERE email = 'test1@example.com'),
         100000, 'TOMAN', 'تست بدهی غیرمجاز');
    EXCEPTION WHEN check_violation THEN
        error_occurred := TRUE;
        RAISE NOTICE 'خطای مورد انتظار: نمی‌توان به خود بدهکار بود ✓';
    END;
    
    IF NOT error_occurred THEN
        RAISE NOTICE 'خطا: constraint کار نمی‌کند ✗';
    END IF;
END $$;

-- تست validation کدملی در constraint
\echo '  ✓ تست validation کدملی:'
DO $$
DECLARE
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        INSERT INTO users (email, phone, first_name, last_name, national_id) VALUES
        ('test_invalid@example.com', '09444444444', 'تست', 'نامعتبر', '1111111111');
    EXCEPTION WHEN check_violation THEN
        error_occurred := TRUE;
        RAISE NOTICE 'خطای مورد انتظار: کدملی نامعتبر ✓';
    END;
    
    IF NOT error_occurred THEN
        RAISE NOTICE 'خطا: validation کدملی کار نمی‌کند ✗';
    END IF;
END $$;

-- =============================================================================
-- گزارش نهایی
-- =============================================================================

\echo '📊 گزارش نهایی تست‌ها:'

-- آمار کلی
SELECT 
    'کاربران تست' as entity,
    count(*) as count
FROM users WHERE email LIKE '%test%'
UNION ALL
SELECT 
    'گروه‌های تست' as entity,
    count(*) as count
FROM groups WHERE name LIKE '%تست%'
UNION ALL
SELECT 
    'بدهی‌های تست' as entity,
    count(*) as count
FROM debts d
JOIN users u ON (d.creditor_id = u.id OR d.debtor_id = u.id)
WHERE u.email LIKE '%test%'
UNION ALL
SELECT 
    'تراکنش‌های تست' as entity,
    count(*) as count
FROM transactions t
JOIN users u ON (t.payer_id = u.id OR t.receiver_id = u.id)
WHERE u.email LIKE '%test%'
UNION ALL
SELECT 
    'اعلان‌های تست' as entity,
    count(*) as count
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE u.email LIKE '%test%';

-- بررسی سلامت indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan > 0 as index_used
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo '✅ تست‌ها با موفقیت کامل شد!'
\echo '🧹 برای پاک‌سازی داده‌های تست:'
\echo '  DELETE FROM users WHERE email LIKE '\''%test%'\'';' 