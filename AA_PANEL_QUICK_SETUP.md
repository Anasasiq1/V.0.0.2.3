# aaPanel Quick Setup Guide (V.0.0.2.3)

This application supports two simple deployment methods on **aaPanel**. Choose the one that suits your needs:

---

## SECTION A: FILE MANAGER INSTALLATION (Static Website Mode)
> **Best for:** Fastest setup, static catalog/storefront, zero server background processes required.

### 4 Simple Steps:

1. **Build the Website:**
   On your computer or build terminal, run:
   ```bash
   npm run build:static
   ```
   This generates the production website files inside the `dist` folder.

2. **Zip the `dist` Folder:**
   Compress all files inside `dist/` into a single zip file (e.g., `dist.zip`).
   *(Make sure `index.html`, `.htaccess`, `_redirects`, and the `assets` folder are at the root of the ZIP).*

3. **Upload & Extract via aaPanel File Manager:**
   * Open your **aaPanel** control panel.
   * Go to **Files** / **File Manager**.
   * Navigate to your website root directory: `/www/wwwroot/yourdomain.com/`
   * Upload `dist.zip` and click **Uncompress** (Extract) directly into the directory.

4. **Nginx SPA Configuration (If using Nginx):**
   * In aaPanel, go to **Websites** > Click your website name > **URL rewrite** or **Config**.
   * Add the following rule to ensure direct link refreshes (e.g., `/stores`, `/admin`, `/market`) load without 404 errors:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
   *(If your aaPanel site uses Apache, the included `.htaccess` handles this automatically with zero configuration).*

5. **Open Domain:**
   Visit `https://yourdomain.com` in your browser. Done!

> **Note:** File Manager mode runs as a static client website. It does not require Node.js, PM2, or MySQL on the server.

---

## SECTION B: NODE.JS INSTALLATION (Full Application Mode)
> **Best for:** Full-stack operations with MySQL/JSON persistent database, dynamic stock management, REST APIs, and n8n webhooks.

### 5 Simple Steps:

1. **Upload Source Code to Server:**
   * In aaPanel **File Manager**, upload and extract the project files to `/www/wwwroot/your-app/`.

2. **Configure Environment Variables (`.env`):**
   * Copy `.env.example` to `.env` in the project root.
   * Set your preferred port (`4302`, `3001`, or `3000`):
     ```env
     NODE_ENV=production
     PORT=4302
     ```
   * *(Optional)* Enter your MySQL credentials if using MySQL. If left default, the system automatically uses the zero-config persistent JSON storage.

3. **Open aaPanel Node.js Project Manager:**
   * In aaPanel, go to **App Store** > Open **Node.js Project Manager** (Install if not already installed).
   * Click **Add Node Project**:
     * **Project directory:** `/www/wwwroot/your-app`
     * **Project name:** `hmq-commerce`
     * **Run opt / Start command:** `npm run build && npm start` (or select entry `dist/server.cjs`)
     * **Port:** `4302` (or `3001` / `3000` matching your `.env`)
     * **Node version:** Select `v18.x`, `v20.x`, or `v22.x`.
   * Click **Submit**.

4. **Set Up Domain & Reverse Proxy in aaPanel:**
   * In aaPanel, go to **Websites** > **Add Site**.
   * Domain: `yourdomain.com`
   * Under website settings, open **Reverse Proxy** > **Add Reverse Proxy**:
     * **Proxy Name:** `hmq-proxy`
     * **Target URL:** `http://127.0.0.1:4302` (replace `4302` with your chosen port).
     * **Sent Host:** `$host`
   * Click **Save**.

5. **Open Domain:**
   Visit `https://yourdomain.com` in your browser. The full application with backend APIs is now live!
