import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { 
  handleAdminLogin, 
  handleVerifySession, 
  handleAdminLogout, 
  handleAdminChangePassword 
} from './server/authHandler';

function adminAuthDevPlugin(): Plugin {
  return {
    name: 'admin-auth-dev-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/admin/')) {
          return next();
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            res.setHeader('Content-Type', 'application/json');

            if (req.url === '/api/admin/login' && req.method === 'POST') {
              const result = handleAdminLogin(parsedBody);
              res.statusCode = result.status;
              res.end(JSON.stringify(result.data));
              return;
            }

            if (req.url === '/api/admin/verify-session' && req.method === 'POST') {
              const token = parsedBody?.token || req.headers['authorization'];
              const result = handleVerifySession(token as string);
              res.statusCode = result.status;
              res.end(JSON.stringify(result.data));
              return;
            }

            if (req.url === '/api/admin/logout' && req.method === 'POST') {
              const token = parsedBody?.token || req.headers['authorization'];
              const result = handleAdminLogout(token as string);
              res.statusCode = result.status;
              res.end(JSON.stringify(result.data));
              return;
            }

            if (req.url === '/api/admin/change-password' && req.method === 'POST') {
              const authHeader = req.headers['authorization'] as string;
              const result = handleAdminChangePassword(parsedBody, authHeader);
              res.statusCode = result.status;
              res.end(JSON.stringify(result.data));
              return;
            }

            next();
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON request payload' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), adminAuthDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
