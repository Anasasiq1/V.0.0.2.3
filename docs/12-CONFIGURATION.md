# 12 - Configuration Management

This document describes how project settings, environment variables, database options, and server configurations are defined and loaded.

---

## Configuration Files Matrix

| Config File | Location | Purpose |
|-------------|----------|---------|
| `.env` | Root directory | Environment variables (ports, keys, database) |
| `.env.example` | Root directory | Template for required environment variables |
| `package.json` | Root directory | NPM dependencies, build scripts, entry points |
| `/data/store_data.json` | `/data/` | Main application data storage file |
| `/metadata.json` | Root directory | App metadata, title, and platform capability flags |

---

## Server Runtime Behavior

The server is launched via `server.ts` (using `tsx` in development or `node dist/server.cjs` in production).

### Express Application Port Binding
- Default port: `3000` (Bound to host `0.0.0.0`).
- Read dynamically from `process.env.PORT`.

### File Persistence Behavior
- On startup, `server.ts` checks if `/data/store_data.json` exists.
- If missing, initializes `/data/store_data.json` using default data from `initialData.ts`.
- Every mutation (store creation, order placement, customer registration, product update) performs an atomic write to `/data/store_data.json`.
