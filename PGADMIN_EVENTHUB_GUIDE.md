# pgAdmin EventHub Database Management Guide

## 🚀 Connection Setup

### Server Connection Details:
- **Server Name**: EventHub Local
- **Host**: localhost
- **Port**: 5432
- **Database**: eventhub_db
- **Username**: eventhub_user
- **Password**: eventhub_password

### Steps to Connect:
1. Launch pgAdmin 4: `open -a pgAdmin\ 4`
2. Right-click "Servers" → "Register" → "Server..."
3. **General Tab**: Name = "EventHub Local"
4. **Connection Tab**: Enter above details, check "Save password"
5. Click "Save"

## 📊 Database Structure

### Main Tables:
```
eventhub_db/
├── users (8 records)
├── events (3 records)
├── tickets
├── transactions
├── attendees
├── coupons
├── promotions
├── reviews
├── notifications
├── point_history
├── event_statistics
├── transaction_tickets
└── _prisma_migrations
```

## 🔍 Key Queries for EventHub Management

### User Management:
```sql
-- View all users by role
SELECT 
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    points,
    referral_code,
    created_at 
FROM users 
ORDER BY role, created_at;

-- User statistics
SELECT 
    role,
    COUNT(*) as count,
    AVG(points) as avg_points
FROM users 
GROUP BY role;
```

### Event Management:
```sql
-- All events with organizer info
SELECT 
    e.id,
    e.name,
    e.description,
    e.start_date,
    e.end_date,
    e.price / 100.0 as price_usd,
    e.available_seats,
    e.total_seats,
    u.first_name || ' ' || u.last_name as organizer_name,
    u.email as organizer_email
FROM events e
JOIN users u ON e.organizer_id = u.id
ORDER BY e.start_date;

-- Event capacity status
SELECT 
    name,
    total_seats,
    available_seats,
    (total_seats - available_seats) as sold_seats,
    ROUND((total_seats - available_seats) * 100.0 / total_seats, 2) as occupancy_percent
FROM events
ORDER BY occupancy_percent DESC;
```

### Transaction Analysis:
```sql
-- Revenue by event
SELECT 
    e.name as event_name,
    COUNT(t.id) as total_transactions,
    SUM(t.total_amount) / 100.0 as total_revenue_usd,
    AVG(t.total_amount) / 100.0 as avg_transaction_usd
FROM transactions t
JOIN events e ON t.event_id = e.id
WHERE t.status = 'COMPLETED'
GROUP BY e.id, e.name
ORDER BY total_revenue_usd DESC;

-- Daily transaction volume
SELECT 
    DATE(created_at) as transaction_date,
    COUNT(*) as transaction_count,
    SUM(total_amount) / 100.0 as daily_revenue_usd
FROM transactions 
WHERE status = 'COMPLETED'
GROUP BY DATE(created_at)
ORDER BY transaction_date DESC;
```

### Referral System:
```sql
-- Referral performance
SELECT 
    u.referral_code,
    u.first_name || ' ' || u.last_name as referrer_name,
    u.email,
    COUNT(referred.id) as total_referrals,
    u.points as current_points
FROM users u
LEFT JOIN users referred ON referred.referred_by = u.referral_code
WHERE u.referral_code IS NOT NULL
GROUP BY u.id, u.referral_code, u.first_name, u.last_name, u.email, u.points
ORDER BY total_referrals DESC, current_points DESC;
```

### Coupon Usage:
```sql
-- Coupon effectiveness
SELECT 
    c.code,
    c.discount_type,
    c.discount_value,
    c.usage_limit,
    c.used_count,
    e.name as event_name,
    ROUND((c.used_count * 100.0 / NULLIF(c.usage_limit, 0)), 2) as usage_percentage
FROM coupons c
LEFT JOIN events e ON c.event_id = e.id
ORDER BY usage_percentage DESC;
```

## 🛠️ Common Administrative Tasks

### 1. Add New Event Category:
```sql
-- First check existing categories
SELECT DISTINCT category FROM events;

-- Add new category (requires enum modification in Prisma schema)
```

### 2. User Role Management:
```sql
-- Promote user to organizer
UPDATE users 
SET role = 'ORGANIZER' 
WHERE email = 'user@example.com';

-- Award bonus points
UPDATE users 
SET points = points + 500 
WHERE email = 'user@example.com';
```

### 3. Event Capacity Updates:
```sql
-- Increase event capacity
UPDATE events 
SET total_seats = 500, available_seats = available_seats + 100 
WHERE id = 1;
```

### 4. Deactivate Events:
```sql
-- Deactivate past events
UPDATE events 
SET is_active = false 
WHERE end_date < NOW();
```

## 📈 Performance Monitoring

### Database Size:
```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Index Usage:
```sql
-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read DESC;
```

## 🔧 Maintenance Tasks

### Backup Database:
1. Right-click `eventhub_db` → `Backup...`
2. Format: Custom
3. Filename: `eventhub_backup_YYYY-MM-DD.backup`
4. Click `Backup`

### Clean Old Data:
```sql
-- Archive old transactions (older than 1 year)
DELETE FROM transactions 
WHERE created_at < NOW() - INTERVAL '1 year' 
AND status != 'COMPLETED';

-- Clean expired coupons
DELETE FROM coupons 
WHERE valid_until < NOW();
```

### Update Statistics:
```sql
-- Update table statistics for better query performance
ANALYZE;
```

## 🎯 Quick Health Check

Run this query to get an overview of your EventHub system:

```sql
SELECT 
    'Users' as metric, COUNT(*)::text as value FROM users
UNION ALL
SELECT 
    'Events' as metric, COUNT(*)::text as value FROM events
UNION ALL
SELECT 
    'Active Events' as metric, COUNT(*)::text as value FROM events WHERE is_active = true
UNION ALL
SELECT 
    'Completed Transactions' as metric, COUNT(*)::text as value FROM transactions WHERE status = 'COMPLETED'
UNION ALL
SELECT 
    'Total Revenue (USD)' as metric, '$' || (SUM(total_amount) / 100.0)::text as value FROM transactions WHERE status = 'COMPLETED'
UNION ALL
SELECT 
    'Active Coupons' as metric, COUNT(*)::text as value FROM coupons WHERE valid_until > NOW()
ORDER BY metric;
```

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Failed**: Check PostgreSQL service is running
   ```bash
   brew services list | grep postgresql
   brew services restart postgresql@14
   ```

2. **Permission Denied**: Verify user privileges
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE eventhub_db TO eventhub_user;
   ```

3. **Slow Queries**: Check for missing indexes
   ```sql
   EXPLAIN ANALYZE SELECT * FROM events WHERE start_date > NOW();
   ```

## 📞 Support Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **pgAdmin Documentation**: https://www.pgadmin.org/docs/

---

**Last Updated**: $(date)
**Database Version**: PostgreSQL 14
**Schema Version**: See `_prisma_migrations` table
