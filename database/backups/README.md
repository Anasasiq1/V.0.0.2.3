# Database Backup & Restore Guidelines

## Automated & Manual PostgreSQL Backups

### Manual Backup Command
```bash
pg_dump -U hmqin -h localhost -d hmqin -F c -b -v -f /database/backups/hmq_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Manual Restore Command
```bash
pg_restore -U hmqin -h localhost -d hmqin -v /database/backups/hmq_backup_YYYYMMDD_HHMMSS.dump
```

### JSON Data Store Backup
The system automatically maintains a synchronous atomic backup file `data_store.json.bak` alongside `data_store.json`.
Restore point can be triggered via `/api/restore` API route or Super Admin Panel.
