import { createServer } from 'vite';

async function startFrontendServer() {
  const server = await createServer({
    // Configure Vite
    server: { 
      port: 3000, 
      open: true
    },
    // Use default Vite config
    configFile: './vite.config.ts',
  });
  
  await server.listen();
  console.log('Frontend server running at http://localhost:3000');
}

startFrontendServer();