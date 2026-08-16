# HM-Q Production Deployment & Installation Guide

## Step-by-Step Installation Order

1. **Install Prerequisites**:
   - Node.js 20+ and npm / bun / yarn
   - PostgreSQL 12+ (or MySQL 5.7+ / 8.0+)
   - Docker and Docker Compose (for n8n automation layer)

2. **Database Provisioning**:
   - Run SQL schema migration:
     ```bash
     psql -U hmqin -d hmqin -f /schema.sql
     psql -U hmqin -d hmqin -f /database/seed/001_seed_data.sql
     ```

3. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`:
     ```env
     MYSQL_HOST=localhost
     MYSQL_PORT=3306
     MYSQL_USER=hmqin
     MYSQL_PASSWORD=hmqin@
     MYSQL_DATABASE=hmqin
     APP_URL=http://localhost:3000
     ```

4. **Install App Dependencies & Build**:
   ```bash
   npm install
   npm run build
   ```

5. **Start Application Server**:
   ```bash
   npm run start
   ```

6. **Deploy n8n Automation Engine**:
   ```bash
   cd automation
   docker-compose up -d
   ```
