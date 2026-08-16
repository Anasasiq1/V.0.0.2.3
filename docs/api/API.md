# HM-Q API Reference Documentation

## Platform Template Engine API

### 1. Get All Installed Platform Templates
`GET /api/platform/templates`

**Response:**
```json
{
  "success": true,
  "templates": [ ... ],
  "settings": { "active_template_id": "hm-q-modern" },
  "audit_logs": [ ... ]
}
```

### 2. Get Single Platform Template
`GET /api/platform/templates/:id`

### 3. Activate Platform Template (Atomic Switch)
`POST /api/platform/templates/activate`
**Body:**
```json
{
  "templateId": "hm-q-classic",
  "adminUsername": "superadmin"
}
```

### 4. Rollback to Previous Platform Template
`POST /api/platform/templates/rollback`
**Body:**
```json
{
  "adminUsername": "superadmin"
}
```

### 5. Import Platform Template Package
`POST /api/platform/templates/import`
**Body:**
```json
{
  "template": {
    "id": "new-theme",
    "manifest": { ... },
    "status": "Installed"
  }
}
```

---

## Store Template Customization API

### 1. Get Store Template Configuration
`GET /api/stores/:storeId/template`

### 2. Save Draft Store Template Configuration
`PUT /api/stores/:storeId/template`

### 3. Preview Store Template Configuration
`POST /api/stores/:storeId/template/preview`

### 4. Publish Store Template Configuration
`POST /api/stores/:storeId/template/publish`

### 5. Reset Store Template Configuration
`POST /api/stores/:storeId/template/reset`
