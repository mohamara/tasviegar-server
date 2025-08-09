-- =============================================================================
-- اسکریپت پاک‌سازی و نگهداری پایگاه داده Settler ایران
-- Cleanup and Maintenance Script for Settler Iran Database
-- =============================================================================

\echo '🧹 شروع پاک‌سازی پایگاه داده...'

-- =============================================================================
-- پاک‌سازی داده‌های تست
-- =============================================================================

\echo '🗑️ پاک‌سازی داده‌های تست...'

-- حذف تراکنش‌های تست
DELETE FROM transactions 
WHERE debt_id IN (
    SELECT d.id FROM debts d
    JOIN users u ON (d.creditor_id = u.id OR d.debtor_id = u.id)
    WHERE u.email LIKE '%test%'
);

-- حذف اعلان‌های تست
DELETE FROM notifications 
WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%test%'
);

-- حذف بدهی‌های تست
DELETE FROM debts 
WHERE creditor_id IN (SELECT id FROM users WHERE email LIKE '%test%')
   OR debtor_id IN (SELECT id FROM users WHERE email LIKE '%test%');

-- حذف اعضای گروه‌های تست
DELETE FROM group_members 
WHERE group_id IN (
    SELECT id FROM groups WHERE name LIKE '%تست%'
);

-- حذف گروه‌های تست
DELETE FROM groups WHERE name LIKE '%تست%';

-- حذف کاربران تست
DELETE FROM users WHERE email LIKE '%test%';

\echo '✅ داده‌های تست پاک شد.'

-- =============================================================================
-- پاک‌سازی اعلان‌های قدیمی
-- =============================================================================

\echo '📬 پاک‌سازی اعلان‌های قدیمی...'

-- حذف اعلان‌های خوانده شده قدیمی‌تر از 30 روز
DELETE FROM notifications 
WHERE is_read = TRUE 
  AND created_at < NOW() - INTERVAL '30 days';

-- حذف اعلان‌های منقضی شده
DELETE FROM notifications 
WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();

-- حذف اعلان‌های خوانده نشده قدیمی‌تر از 90 روز
DELETE FROM notifications 
WHERE is_read = FALSE 
  AND created_at < NOW() - INTERVAL '90 days';

SELECT COUNT(*) as remaining_notifications FROM notifications;

\echo '✅ اعلان‌های قدیمی پاک شد.'

-- =============================================================================
-- پاک‌سازی audit logs قدیمی
-- =============================================================================

\echo '📋 پاک‌سازی audit logs قدیمی...'

-- حذف audit logs قدیمی‌تر از 6 ماه
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '6 months';

SELECT COUNT(*) as remaining_audit_logs FROM audit_logs;

\echo '✅ audit logs قدیمی پاک شد.'

-- =============================================================================
-- بروزرسانی آمار
-- =============================================================================

\echo '📊 بروزرسانی آمار و indexes...'

-- آنالیز جداول برای بهینه‌سازی query planner
ANALYZE users;
ANALYZE debts;
ANALYZE groups;
ANALYZE group_members;
ANALYZE transactions;
ANALYZE notifications;
ANALYZE audit_logs;

-- بروزرسانی materialized views
REFRESH MATERIALIZED VIEW daily_statistics;

\echo '✅ آمار بروزرسانی شد.'

-- =============================================================================
-- بررسی سلامت پایگاه داده
-- =============================================================================

\echo '🔍 بررسی سلامت پایگاه داده...'

-- بررسی integrity constraints
\echo '  ✓ بررسی integrity constraints:'
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    conrelid::regclass as table_name
FROM pg_constraint 
WHERE contype IN ('f', 'c', 'u') -- foreign key, check, unique
  AND connamespace = 'public'::regnamespace
ORDER BY table_name, constraint_name;

-- بررسی unused indexes
\echo '  ✓ بررسی indexes استفاده نشده:'
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes 
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- بررسی جداول بزرگ
\echo '  ✓ بررسی سایز جداول:'
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as total_size,
    pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size,
    pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) as indexes_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- بررسی آمار کلی
\echo '  ✓ آمار کلی جداول:'
SELECT 
    'users' as table_name,
    count(*) as total_rows,
    count(*) FILTER (WHERE deleted_at IS NULL) as active_rows,
    count(*) FILTER (WHERE status = 'active') as verified_users
FROM users
UNION ALL
SELECT 
    'debts' as table_name,
    count(*) as total_rows,
    count(*) FILTER (WHERE deleted_at IS NULL) as active_rows,
    count(*) FILTER (WHERE status = 'settled') as settled_debts
FROM debts
UNION ALL
SELECT 
    'groups' as table_name,
    count(*) as total_rows,
    count(*) FILTER (WHERE deleted_at IS NULL) as active_rows,
    count(*) FILTER (WHERE is_active = TRUE) as active_groups
FROM groups
UNION ALL
SELECT 
    'transactions' as table_name,
    count(*) as total_rows,
    count(*) FILTER (WHERE status = 'completed') as completed_transactions,
    count(*) FILTER (WHERE status = 'pending') as pending_transactions
FROM transactions;

\echo '✅ بررسی سلامت کامل شد.'

-- =============================================================================
-- بهینه‌سازی
-- =============================================================================

\echo '⚡ اجرای بهینه‌سازی...'

-- VACUUM و REINDEX برای بهینه‌سازی
VACUUM ANALYZE;

-- بروزرسانی آمار PostgreSQL
UPDATE pg_stat_user_tables SET n_tup_ins = 0, n_tup_upd = 0, n_tup_del = 0;

\echo '✅ بهینه‌سازی کامل شد.'

-- =============================================================================
-- گزارش نهایی
-- =============================================================================

\echo '📋 گزارش نهایی پاک‌سازی:'

-- خلاصه آمار پس از پاک‌سازی
WITH table_stats AS (
    SELECT 'users' as table_name, count(*) as count FROM users WHERE deleted_at IS NULL
    UNION ALL
    SELECT 'debts', count(*) FROM debts WHERE deleted_at IS NULL
    UNION ALL  
    SELECT 'groups', count(*) FROM groups WHERE deleted_at IS NULL
    UNION ALL
    SELECT 'transactions', count(*) FROM transactions
    UNION ALL
    SELECT 'notifications', count(*) FROM notifications
    UNION ALL
    SELECT 'audit_logs', count(*) FROM audit_logs
)
SELECT 
    table_name as "جدول",
    count as "تعداد رکورد"
FROM table_stats
ORDER BY table_name;

-- محاسبه فضای آزاد شده
SELECT 
    pg_size_pretty(
        pg_database_size(current_database())
    ) as "سایز کل پایگاه داده";

\echo ''
\echo '🎉 پاک‌سازی با موفقیت کامل شد!'
\echo ''
\echo '📝 توصیه‌ها:'
\echo '  • این اسکریپت را به صورت دوره‌ای (هفتگی) اجرا کنید'
\echo '  • قبل از اجرا backup تهیه کنید'
\echo '  • در ساعات کم ترافیک اجرا کنید'
\echo '  • وضعیت indexes را مانیتور کنید'
\echo '' 