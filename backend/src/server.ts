const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);



import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import connectDB from './config/database';
import logger from './utils/logger';
import { initSocket } from './config/socket';

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async (): Promise<void> => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  const server = httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`📊 API: http://localhost:${PORT}/api/v1`);
    logger.info(`❤️  Health: http://localhost:${PORT}/health`);
    logger.info(`🔌 WebSocket ready`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    shutdown('Unhandled Rejection');
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    shutdown('Uncaught Exception');
  });
};

startServer();
