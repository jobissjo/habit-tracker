import express from 'express';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Simple Express server to serve static HTML
function startServer() {
  const app = express();
  
  // Enable CORS for all routes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  
  // Serve static files from the public directory
  app.use(express.static(resolve(__dirname, '../public')));
  
  // SPA fallback - always serve index.html for any path
  app.get('*', (req, res) => {
    res.sendFile(resolve(__dirname, '../public/index.html'));
  });
  
  // Start the server
  app.listen(port, '0.0.0.0', () => {
    console.log(`[Static Habit Tracker] Server running on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
  });
}

startServer();