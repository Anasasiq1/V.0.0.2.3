# HM-Q n8n Automation & Webhook Integration Guide

## Overview
n8n functions as the workflow automation layer for the HM-Q Hyperlocal Ecosystem. It does NOT serve as the primary database; instead, it triggers and reacts to secured HTTP API endpoints provided by the HM-Q backend.

## Production Setup with Docker Compose

1. Navigate to `/automation` directory.
2. Launch PostgreSQL and n8n services:
   ```bash
   docker-compose up -d
   ```
3. Open `http://localhost:5678` in your browser.
4. Set up admin credentials upon initial launch.

## How to Import Workflows into n8n

1. Open n8n interface (`http://localhost:5678`).
2. Go to **Workflows** → **Import from File**.
3. Select any `.json` file from `/automation/n8n/workflows/`:
   - `template_activation.json`
   - `store_template_publish.json`
   - `template_import_validation.json`
   - `scheduled_health_checks.json`
   - `whatsapp_order_integration.json`
4. Configure required HTTP header credentials if authentication is enabled.
5. Click **Save** and toggle the workflow to **Active**.

## Security Guidelines

- Never store secrets or API keys in exported workflow JSON.
- Use n8n Environment Variables (`N8N_ENCRYPTION_KEY`, `WEBHOOK_URL`).
- Secure n8n behind HTTPS using Nginx, Caddy, or Cloudflare Tunnel in production.
