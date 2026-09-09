# Hostinger Node.js Deployment Guide (Fixing 503 Service Unavailable)

If you see a **503 Service Unavailable** error on Hostinger, it typically means Phusion Passenger could not start the Node.js application because dependencies (`node_modules`) or the production build (`dist/`) were missing.

Follow these simple steps to deploy successfully on Hostinger cPanel:

### Step 1: Upload Files
Upload your project files into your domain's public folder (e.g., `public_html/` or your subdomain folder).

### Step 2: Configure Node.js Selector in Hostinger cPanel
1. Go to your **Hostinger cPanel**.
2. Find and open **Setup Node.js App**.
3. Create or Edit the Node.js application:
   - **Node.js version**: Select `18.x` or `20.x` (or latest LTS).
   - **Application mode**: `production`.
   - **Application root**: `public_html` (or your folder path).
   - **Application URL**: Your domain name.
   - **Application startup file**: `server.js` *(Crucial!)*

### Step 3: Install Dependencies & Build via Terminal
1. Open the **Terminal** in Hostinger cPanel (or via SSH).
2. Navigate to your app directory:
   ```bash
   cd domains/yourdomain.com/public_html
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the application (this creates the `dist/` folder):
   ```bash
   npm run build
   ```

### Step 4: Restart the Application
1. Go back to **Setup Node.js App** in Hostinger cPanel.
2. Click **Restart** next to your application.

*(Note: We have also added auto-building logic inside `server.js` so that if `dist/` is missing, the server attempts to compile automatically on startup).*
