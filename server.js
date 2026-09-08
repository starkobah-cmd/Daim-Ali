import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
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

app.use(express.json());

// Serve static files from the build output directory
app.use(express.static(distPath));

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
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Express server is listening on http://${HOST}:${PORT}`);
});
