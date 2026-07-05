import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import designRoutes from './routes/design';
import contentRoutes from './routes/content';
import mediaRoutes from './routes/media';
import formsRoutes, { submitRouter } from './routes/forms';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      database: process.env.DATABASE_URL ? 'connected' : 'not configured'
    }
  });
});

// API Routes
app.use('/api/design', designRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/forms-submit', submitRouter);

// Serve static website files in production
if (process.env.NODE_ENV === 'production') {
  const websitePath = path.join(__dirname, '../../web/dist');
  app.use(express.static(websitePath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(websitePath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VYLUX API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
