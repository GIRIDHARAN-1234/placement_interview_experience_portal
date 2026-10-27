const app = require('./app');
const connectDB = require('./config/db');

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Connect to database before accepting application traffic
connectDB().then(async () => {
  try {
    const ensureDefaultData = require('./utils/ensureDefaultData');
    await ensureDefaultData();
  } catch (err) {
    console.warn(`[Auto-Ensure Warning] ${err.message}`);
  }

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[Server] Placement Portal Backend Running on Port ${PORT}`);
    console.log(`[Environment] Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[API URL] http://localhost:${PORT}/api`);
    console.log(`[Health Check] http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n[Server Fatal Error] Port ${PORT} is already in use (EADDRINUSE)!`);
      console.error(`A process is already listening on port ${PORT}.`);
      console.error(`To find and resolve the occupying process on Windows:`);
      console.error(`  1. Run: netstat -ano | findstr :${PORT}`);
      console.error(`  2. Inspect: tasklist /FI "PID eq <PID>"`);
      console.error(`  3. If safe, terminate: taskkill /PID <PID> /F\n`);
      process.exit(1);
    } else {
      console.error(`[Server Error] ${error.message}`);
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
    // server.close(() => process.exit(1));
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] Process terminated.');
    });
  });
});
