import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';
import { 
  handleAdminLogin, 
  handleVerifySession, 
  handleAdminLogout, 
  handleAdminChangePassword 
} from './server/authHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Auto-build on startup if dist/index.html is missing (common Hostinger deployment issue)
if (!fs.existsSync(indexPath)) {
  console.log('⚠️ dist/index.html not found. Attempting automatic production build...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Automatic production build completed successfully!');
  } catch (err) {
    console.error('❌ Automatic build failed. Please run "npm run build" before deploying to Hostinger.', err);
  }
}

app.use(express.json());

// Serve static files from the build output directory if it exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Admin authentication endpoints (Server-side Only)
app.post('/api/admin/login', (req, res) => {
  const result = handleAdminLogin(req.body);
  res.status(result.status).json(result.data);
});

app.post('/api/admin/verify-session', (req, res) => {
  const token = req.body?.token || req.headers.authorization;
  const result = handleVerifySession(token);
  res.status(result.status).json(result.data);
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.body?.token || req.headers.authorization;
  const result = handleAdminLogout(token);
  res.status(result.status).json(result.data);
});

app.post('/api/admin/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  const result = handleAdminChangePassword(req.body, authHeader);
  res.status(result.status).json(result.data);
});

// SPA fallback: send index.html for all client routes
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send(`
      <html>
        <head><title>Build Required | Netronomic Web</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc;">
          <h1 style="color: #38bdf8;">Application Build Required</h1>
          <p>The production build (<code>dist/</code> folder) was not found.</p>
          <p>Please run <code>npm run build</code> in your Hostinger Node.js terminal or cPanel before starting the application.</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Express server is listening on http://${HOST}:${PORT}`);
});
