# Environment Variables Reference

HM-Q uses environment variables to control its deployment mode, runtime port, API routing, database connectivity, AI acceleration, and automation triggers.

---

## 1. Classification Overview

| Scope | Prefix / Variable | Visibility | Notes |
| :--- | :--- | :--- | :--- |
| **PUBLIC (Frontend Safe)** | `NEXT_PUBLIC_SSR`, `VITE_API_URL` | Bundled into client JS / exposed to browser | Never store database or server secrets here |
| **SERVER ONLY (Node Runtime)** | `PORT`, `NODE_ENV`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME` | Private to Node.js backend | Configures internal network & database connection |
| **SERVER SECRET (Strict Private)**| `DB_PASSWORD`, `GEMINI_API_KEY`, `JWT_SECRET`, `N8N_WEBHOOK_SECRET`, `N8N_ENCRYPTION_KEY` | Server-side only | **NEVER** commit to Git or expose in frontend |

---

## 2. Detailed Variable Specification

### 2.1 Deployment Mode & Port Configuration

#### `NEXT_PUBLIC_SSR`
- **Type**: Boolean (`true` | `false`)
- **Default**: `true`
- **Scope**: PUBLIC
- **Description**: 
  - When set to `true`: Enables full Node.js SSR/Express full-stack mode with backend API routing.
  - When set to `false`: Directs frontend build tooling for standalone static deployment in `public_html` / `www` without a local Node.js process.

#### `PORT`
- **Type**: Integer / Number
- **Default**: `3000`
- **Supported Ports**: `3000`, `3001`, `4302`, or any valid port provided by your cloud/aaPanel environment.
- **Scope**: SERVER ONLY
- **Description**: Configures the internal TCP port on which the Express application listens (`0.0.0.0:${PORT}`).

#### `NODE_ENV`
- **Type**: String (`production` | `development`)
- **Default**: `production`
- **Scope**: SERVER ONLY
- **Description**: Controls optimization modes and logging levels.

---

### 2.2 Frontend API Routing (Static Mode)

#### `VITE_API_URL`
- **Type**: String (URL)
- **Default**: `""` (Empty string, relative `/api/*` endpoints)
- **Scope**: PUBLIC
- **Description**: When frontend is hosted as a static website on a separate domain (e.g. `https://shop.example.com`) and the API backend is on another URL (e.g. `https://api.example.com`), specify the API origin here. If reverse-proxied on the same domain, leave empty.

---

### 2.3 Database Configuration (MySQL / Cloud SQL)

#### `DB_HOST` / `MYSQL_HOST`
- **Type**: String (Hostname / IP)
- **Default**: `localhost` (or `127.0.0.1`)
- **Scope**: SERVER ONLY
- **Description**: Hostname or IP address of the MySQL database server.

#### `DB_PORT` / `MYSQL_PORT`
- **Type**: Number
- **Default**: `3306`
- **Scope**: SERVER ONLY
- **Description**: Port of the MySQL database server.

#### `DB_NAME` / `DB_DATABASE` / `MYSQL_DATABASE`
- **Type**: String
- **Default**: `hmq_database`
- **Scope**: SERVER ONLY
- **Description**: Name of the database schema.

#### `DB_USER` / `DB_USERNAME` / `MYSQL_USER`
- **Type**: String
- **Default**: `root` or `hmqin`
- **Scope**: SERVER ONLY
- **Description**: Database username.

#### `DB_PASSWORD` / `MYSQL_PASSWORD`
- **Type**: String (Secret)
- **Default**: `""`
- **Scope**: SECRET (Server Only)
- **Description**: Secure database password.

---

### 2.4 Server Secrets, AI & Integrations

#### `GEMINI_API_KEY`
- **Type**: String (Secret)
- **Default**: `""`
- **Scope**: SECRET (Server Only)
- **Description**: Google Gemini API key used by the backend proxy for AI product title generation, catalog upscale, and store marketing story creation.

#### `JWT_SECRET`
- **Type**: String (Secret)
- **Default**: Auto-generated if omitted
- **Scope**: SECRET (Server Only)
- **Description**: Secret key used to sign and verify administrative session tokens.

#### `N8N_WEBHOOK_URL`
- **Type**: String (URL)
- **Default**: Configurable in Super Admin Panel or server environment
- **Scope**: SERVER ONLY
- **Description**: Target webhook endpoint on your n8n instance for instant order notifications and workflow execution.

#### `N8N_WEBHOOK_SECRET`
- **Type**: String (Secret)
- **Default**: `""`
- **Scope**: SECRET (Server Only)
- **Description**: Signing token sent in request headers (`x-webhook-secret`) to authenticate calls from HM-Q to n8n.

#### `N8N_ENCRYPTION_KEY`
- **Type**: String (32-character Hex/Alpha)
- **Scope**: SECRET (Server Only)
- **Description**: Encryption key used by n8n workflow engine.

---

## 3. Template `.env.example` File

```env
# ==============================================================================
# HM-Q HYPERLOCAL COMMERCE PLATFORM - ENVIRONMENT CONFIGURATION
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. DEPLOYMENT MODE & SERVER PORT
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SSR=true
PORT=3000

# ------------------------------------------------------------------------------
# 2. FRONTEND API CONFIGURATION (FOR STATIC MODE)
# ------------------------------------------------------------------------------
# Leave empty for same-domain proxying, or specify https://api.yourdomain.com
VITE_API_URL=

# ------------------------------------------------------------------------------
# 3. DATABASE CONFIGURATION (MYSQL / CLOUD SQL)
# ------------------------------------------------------------------------------
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=hmq_database

# ------------------------------------------------------------------------------
# 4. SERVER SECRETS & AI CAPABILITIES
# ------------------------------------------------------------------------------
GEMINI_API_KEY=
JWT_SECRET=your_jwt_secret_key
N8N_WEBHOOK_SECRET=your_n8n_secret_token
N8N_ENCRYPTION_KEY=your_encryption_key
```
