import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use('/api', (_req, res) => res.status(404).json({error: 'Utilisez les fonctions authentifiées Supabase.'}));
// Vite Middleware for SPA development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Centre de Commande FFMC 06 server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
