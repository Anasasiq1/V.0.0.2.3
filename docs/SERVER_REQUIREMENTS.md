# Server Requirements & Prerequisites

This document outlines the hardware, operating system, runtime, database, web server, and network requirements for running HM-Q in either **Mode A (Static File Manager Hosting)** or **Mode B (Node.js SSR / Full-Stack Hosting)**.

---

## 1. Summary Comparison by Deployment Mode

| Component | Mode A: Static File Manager Hosting | Mode B: Node.js Full-Stack / SSR Hosting |
| :--- | :--- | :--- |
| **Hosting Type** | Shared Hosting, cPanel, aaPanel, Apache, Nginx, Cloudflare Pages, S3 | VPS, Dedicated Cloud (AWS/GCP/DigitalOcean/Hetzner), aaPanel Node.js Manager, Docker |
| **Node.js on Server** | **Not Required** (Only on build machine) | **Node.js v18.x, v20.x, or v22.x LTS** |
| **Process Manager** | None (Static web server serves files) | **PM2** / Systemd / aaPanel Node Manager |
| **Web Server** | Apache (mod_rewrite) or Nginx | Nginx (Reverse Proxy to Node Port: 3000, 3001, 4302) |
| **Database** | Optional if using remote backend API | **MySQL 8.0+** or MariaDB 10.6+ / File-backed JSON fallback |
| **SSL / HTTPS** | Required (Let's Encrypt / Cloudflare SSL) | Required (Let's Encrypt / Custom SSL) |

---

## 2. Hardware Requirements (Node.js Server & Database)

### Minimum Specifications (Small Business / Low Traffic)
- **CPU**: 1 Core (x86_64 or ARM64)
- **RAM**: 1 GB RAM (with 1 GB Swap recommended)
- **Disk Storage**: 10 GB SSD / NVMe
- **Network Bandwidth**: 100 Mbps

### Recommended Specifications (Multi-Store / Active Commerce)
- **CPU**: 2–4 Cores
- **RAM**: 2 GB – 4 GB RAM
- **Disk Storage**: 25 GB+ SSD / NVMe
- **Network Bandwidth**: 1 Gbps

---

## 3. Operating System Support

- **Ubuntu Linux**: 20.04 LTS / 22.04 LTS / 24.04 LTS (Recommended)
- **Debian Linux**: 11 (Bullseye) / 12 (Bookworm)
- **AlmaLinux / Rocky Linux / CentOS Stream**: 8 / 9
- **macOS / Windows**: Supported for local development and build tooling.

---

## 4. Software & Runtime Dependencies

### Node.js & Package Managers (For Node.js Mode & Local Build)
- **Node.js**: `v18.18.0` or higher (`v20.x` LTS or `v22.x` LTS strongly recommended)
- **npm**: `v9.0.0` or higher (ships with Node.js)
- **Optional Alternatives**: `pnpm` (v8+) or `bun` (v1.1+)

### Process Manager (Mode B)
- **PM2**: `pm2` installed globally via `npm install -g pm2` or managed via aaPanel Node.js Project Manager.

### Web Server & Reverse Proxy
- **Nginx**: `1.18.0`+ (Recommended for reverse proxy, caching, and SSL termination)
- **Apache**: `2.4.0`+ with `mod_rewrite`, `mod_headers`, and `mod_proxy` enabled.

### Database (Mode B)
- **MySQL**: 8.0.x or higher (Default character set: `utf8mb4`, Collation: `utf8mb4_unicode_ci`)
- **MariaDB**: 10.6.x or higher
- **Fallback Engine**: Local atomic JSON store (`data_store.json`) functions out-of-the-box if MySQL is not configured.

---

## 5. Network & Firewall Port Requirements

Ensure the following inbound ports are configured in your firewall / cloud security group (UFW / AWS Security Group / aaPanel Firewall):

| Port | Protocol | Purpose | Access Level |
| :--- | :--- | :--- | :--- |
| **80** | TCP | HTTP traffic (Redirects to HTTPS) | Public |
| **443** | TCP | HTTPS SSL traffic | Public |
| **22** | TCP | SSH Server Access | Restricted / Administrator |
| **8888** | TCP | aaPanel Web GUI (if using aaPanel) | Restricted / Administrator |
| **3000 / 3001 / 4302** | TCP | Node.js Internal Application Port | **Internal only (127.0.0.1)** — reverse proxied via Nginx |
| **3306** | TCP | MySQL Database Port | Internal (127.0.0.1) or Private Subnet |
| **5678** | TCP | n8n Automation Webhook Port (if self-hosted) | Internal or reverse proxied via HTTPS |

---

## 6. PHP Clarification

> **Important Architecture Note:**
> HM-Q is a modern React + TypeScript + Node.js application. It does **NOT** use PHP on the server runtime.
> "File Manager Deployment" refers to uploading the built static SPA assets (`index.html`, `assets/*.js`, `assets/*.css`) into `public_html` or `www` via any standard web hosting control panel (cPanel/aaPanel). You do not need PHP extensions installed.
