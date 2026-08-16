# Database Architecture & Setup Guide

HM-Q features a dual-resilience storage architecture:
1. **Primary Enterprise Engine**: **MySQL 8.0+ / Cloud SQL / MariaDB 10.6+** with relational schema, foreign keys, and indexes.
2. **Built-in Atomic File Storage**: **File-backed Atomic JSON Store (`data_store.json`)** with automatic rolling `.bak` snapshots. If MySQL credentials are not provided or the database is unreachable, the system gracefully falls back to atomic file storage without downtime.

---

## 1. Database Specifications

- **Engine**: MySQL 8.0+ / MariaDB 10.6+
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **Default Port**: `3306`

---

## 2. Environment Variables Configuration

Set your database credentials in your `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=hmq_user
DB_PASSWORD=SecurePassword_123!
DB_NAME=hmq_database
```

HM-Q also recognizes standard aaPanel/Cloud SQL fallback aliases: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.

---

## 3. Step-by-Step Initial Installation

### Step 3.1: Create Database & User in MySQL
Log into MySQL CLI or use phpMyAdmin / aaPanel Database Manager:

```sql
CREATE DATABASE IF NOT EXISTS `hmq_database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'hmq_user'@'localhost' IDENTIFIED BY 'SecurePassword_123!';
GRANT ALL PRIVILEGES ON `hmq_database`.* TO 'hmq_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3.2: Run Schema Migration
HM-Q includes migration SQL files in `database/migrations/` and a consolidated `schema.sql` in the root:

```bash
# Option A: Import via MySQL CLI
mysql -u hmq_user -p hmq_database < database/migrations/001_initial_schema.sql

# Option B: Or import root schema
mysql -u hmq_user -p hmq_database < schema.sql
```

### Step 3.3: (Optional) Seed Initial Catalog & Stores
To populate sample categories, modules, demo stores, and sample products:

```bash
mysql -u hmq_user -p hmq_database < database/seed/001_seed_data.sql
```

---

## 4. Automatic Schema & Data Synchronization

When the Node.js backend starts (`npm run start` or `npm run dev`):
1. It automatically tests the MySQL pool connection.
2. If tables are empty, it automatically syncs the initial baseline data from `src/data/initialData.ts`.
3. Every write action in the Admin Panel or store operations is asynchronously persisted to MySQL and atomic snapshot files simultaneously.

You can verify database status at runtime via the API:
```bash
curl http://localhost:3000/api/database/status
```

---

## 5. Database Backup & Restore

### Automated / CLI MySQL Dump
```bash
# Export full database dump
mysqldump -u hmq_user -p --single-transaction --routines --triggers hmq_database > hmq_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from database dump
mysql -u hmq_user -p hmq_database < hmq_backup_20260816.sql
```

### Web GUI Backup & Restore
Administrators can create full or selective backups directly from the **Super Admin Panel -> Backup Management** tab, which creates single-archive JSON/ZIP exports containing:
- Stores & Merchant Users
- Products & Categories
- Orders & Customer Records
- System Settings & Audit Logs
