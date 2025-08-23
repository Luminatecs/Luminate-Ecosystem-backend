# Database Management Guide

This guide covers all the ways you can interact with the database, create super admins, and manage the system manually.

## 🛠️ Database Admin Tool

The most convenient way to manage users and organizations is through the database admin tool.

### Create a Super Admin

```bash
npm run db:admin create-super-admin admin@yourcompany.com password123 "Super" "Admin"
```

### List All Users

```bash
npm run db:admin list-users
```

### Update User Role

```bash
npm run db:admin update-role user@example.com super_admin
```

Available roles: `user`, `admin`, `super_admin`

### Reset User Password

```bash
npm run db:admin reset-password user@example.com newpassword123
```

### Create Organization

```bash
npm run db:admin create-org "My Company" "Company description" "https://company.com"
```

### List Organizations

```bash
npm run db:admin list-orgs
```

### Database Health Check

```bash
npm run db:admin health
```

### Run Custom SQL Query

```bash
npm run db:admin query "SELECT * FROM users WHERE role = 'super_admin'"
```

### Get Help

```bash
npm run db:admin
```

## 🗄️ Database Console (Interactive SQL)

For more complex queries and manual database interaction:

```bash
npm run db:console
```

This opens an interactive SQL console where you can:

- Type SQL queries directly
- Use `help` for commands
- Use `tables` to list all tables
- Use `desc tablename` to see table structure
- Type `exit` to quit

Example session:
```sql
luminate_db> SELECT * FROM users WHERE role = 'super_admin';
luminate_db> UPDATE users SET is_active = false WHERE email = 'old@user.com';
luminate_db> desc users
luminate_db> tables
luminate_db> exit
```

## 📋 Migration Approach

### Option 1: Run Migration with Super Admin

I've created a migration file that will create a super admin automatically:

```bash
npm run migrate
```

This will create:
- Super admin user: `superadmin@luminate-ecosystem.com` / `superadmin123`
- Admin organization: "System Administration"

### Option 2: Custom Migration

Create a new migration file in `/migrations/` folder:

```sql
-- migrations/004_my_custom_admin.sql
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES 
(
    'myadmin@company.com',
    '$2a$12$hashed_password_here',
    'My',
    'Admin',
    'super_admin',
    true
);
```

Then run: `npm run migrate`

## 🔧 Direct Database Access

### Using psql (PostgreSQL client)

```bash
psql -h localhost -U postgres -d luminate_ecosystem
```

Common queries:
```sql
-- List all super admins
SELECT email, first_name, last_name, created_at FROM users WHERE role = 'super_admin';

-- Create super admin manually
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
VALUES ('admin@test.com', '$2a$12$encrypted_password', 'Test', 'Admin', 'super_admin', true);

-- Update user role
UPDATE users SET role = 'super_admin' WHERE email = 'user@example.com';

-- Check user permissions
SELECT u.email, u.role, u.is_active, o.name as organization 
FROM users u 
LEFT JOIN organizations o ON u.organization_id = o.id;
```

## 🔑 Password Hashing

If you need to create password hashes manually:

```javascript
// In Node.js console
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('yourpassword', 12);
console.log(hash); // Use this in your SQL
```

## 📊 Quick Setup Commands

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Run migrations (creates database schema + sample data)
npm run migrate

# Create your super admin
npm run db:admin create-super-admin admin@yourcompany.com securepassword123 "Admin" "User"
```

### 2. Daily Admin Tasks
```bash
# Check database health
npm run db:admin health

# List all users
npm run db:admin list-users

# Promote user to admin
npm run db:admin update-role user@example.com admin

# Reset forgotten password
npm run db:admin reset-password user@example.com newpassword123
```

### 3. Advanced Database Work
```bash
# Open interactive SQL console
npm run db:console

# Run specific queries
npm run db:admin query "SELECT COUNT(*) FROM users WHERE is_active = true"
```

## 🚨 Emergency Access

If you're locked out completely:

### Method 1: Create Super Admin via Script
```bash
npm run db:admin create-super-admin emergency@admin.com emergency123 "Emergency" "Admin"
```

### Method 2: Direct Database Update
```bash
npm run db:console
```
Then run:
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'existing@user.com';
```

### Method 3: Reset via Migration
Create a new migration file and run it:
```sql
-- migrations/999_emergency_admin.sql
UPDATE users SET role = 'super_admin', password_hash = '$2a$12$emergency_hash' WHERE email = 'your@email.com';
```

## 🔍 Useful Queries

### User Management
```sql
-- All users with their organizations
SELECT u.email, u.first_name, u.last_name, u.role, u.is_active, o.name as org_name
FROM users u 
LEFT JOIN organizations o ON u.organization_id = o.id 
ORDER BY u.created_at DESC;

-- Inactive users
SELECT email, first_name, last_name, last_login_at 
FROM users 
WHERE is_active = false;

-- Recent registrations
SELECT email, first_name, last_name, created_at 
FROM users 
WHERE created_at > NOW() - INTERVAL '7 days' 
ORDER BY created_at DESC;
```

### Organization Stats
```sql
-- Users per organization
SELECT o.name, COUNT(u.id) as user_count, COUNT(CASE WHEN u.is_active THEN 1 END) as active_users
FROM organizations o 
LEFT JOIN users u ON o.id = u.organization_id 
GROUP BY o.id, o.name 
ORDER BY user_count DESC;
```

### System Overview
```sql
-- System stats
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
  (SELECT COUNT(*) FROM users WHERE role = 'super_admin') as super_admins,
  (SELECT COUNT(*) FROM organizations) as total_orgs,
  (SELECT COUNT(*) FROM organizations WHERE is_active = true) as active_orgs;
```

## 📝 Best Practices

1. **Always use the admin tool** for routine tasks
2. **Use the console** for complex queries
3. **Create migrations** for permanent schema changes
4. **Backup before** making bulk changes
5. **Test queries** on non-production data first
6. **Use transactions** for multi-step operations

## 🎯 Summary

You have multiple ways to manage your database:

- **`npm run db:admin`** - Best for routine admin tasks
- **`npm run db:console`** - Best for interactive SQL work  
- **`npm run migrate`** - Best for schema changes
- **Direct psql** - Best for advanced database administration

Choose the method that fits your comfort level and the task at hand!
