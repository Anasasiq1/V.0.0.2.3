# DEPLOYMENT CHOICE

This repository is built with a **Dual-Deployment Architecture**: **One Codebase, Two Deployment Options**.

Choose the deployment method that fits your server:

---

## OPTION A: File Manager / Website Mode
> **Best for:** aaPanel File Manager, cPanel, Apache, Nginx, Shared Hosting (`public_html` / `wwwroot`).
> **No Node.js runtime required on the server.**

### Quick Steps:
1. Run static build:
   ```bash
   npm run build:static
   ```
2. Upload the generated `dist` folder contents (or `dist.zip`) to your server's `public_html` or `wwwroot` directory using File Manager.
3. Open your domain.
4. **Done!**

See detailed guide: [FILE_MANAGER_DEPLOYMENT.md](./FILE_MANAGER_DEPLOYMENT.md)

---

## OPTION B: Node.js Mode
> **Best for:** VPS, Dedicated Server, aaPanel Node.js Project Manager, PM2, Docker, Cloud Run.
> **Provides full-stack SSR, persistent MySQL/JSON API backend, and dynamic port binding.**

### Quick Steps:
1. Upload the source code to your server.
2. Install dependencies & build:
   ```bash
   npm install
   npm run build
   ```
3. Start the application (configurable on any port: `3000`, `3001`, `4302`):
   ```bash
   PORT=4302 NODE_ENV=production npm start
   ```
   *Or with PM2:*
   ```bash
   pm2 start dist/server.cjs --name "hmq-commerce" --env PORT=4302
   ```
4. Point your domain or Nginx reverse proxy to `http://127.0.0.1:4302`.
5. **Done!**

See detailed guide: [NODE_JS_DEPLOYMENT.md](./NODE_JS_DEPLOYMENT.md)
