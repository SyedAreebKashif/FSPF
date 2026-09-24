import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { Server } from 'http';

let server: Server;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB (with graceful fallback if local instance is deferred)
    try {
      await connectDB({ maxRetries: 2, retryIntervalMs: 1000 });
    } catch (dbErr) {
      console.warn('⚠️  MongoDB connection deferred. Server starting in API mode...');
    }

    // Start Express listener
    server = app.listen(env.PORT, () => {
      console.log('==================================================');
      console.log(`🚀 Backend Server listening on port ${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🩺 Health check: http://localhost:${env.PORT}/api/v1/health`);
      console.log(`📁 Portfolio API: http://localhost:${env.PORT}/api/v1/portfolio/data`);
      console.log('==================================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      console.log('Process terminated cleanly.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }

  // Force shutdown after 10 seconds if hanging
  setTimeout(() => {
    console.error('Forcefully terminating server after timeout.');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled rejections
process.on('unhandledRejection', (reason: Error | unknown) => {
  console.error('💥 Unhandled Rejection:', reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Catch uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('💥 Uncaught Exception! Shutting down...', err);
  process.exit(1);
});

// Launch server
startServer();
