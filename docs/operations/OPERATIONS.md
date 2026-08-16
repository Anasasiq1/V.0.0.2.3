# HM-Q Operations, Health Checks & Maintenance Guide

## Health Monitoring
The application provides a continuous health check endpoint at `/api/health`.

### Continuous Automated Monitoring
n8n runs a scheduled health check workflow every 15 minutes (`/automation/n8n/workflows/scheduled_health_checks.json`).

## Maintenance & Incident Response

### Platform Template Rollback
If a newly activated platform template causes visual or functional issues:
1. Open Admin Panel → Platform Template Engine.
2. Click **Rollback Template**.
3. The server instantly reverts to the previous active template and logs the audit event.

### Database Backup Execution
Perform scheduled PostgreSQL backups:
```bash
pg_dump -U hmqin -h localhost -d hmqin -F c -b -v -f /database/backups/hmq_backup_$(date +%Y%m%d_%H%M%S).dump
```
