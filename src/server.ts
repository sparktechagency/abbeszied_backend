import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import { errorLogger, logger } from './app/utils/logger';
import config from './app/config';
import { socketHelper } from './app/helpers/socketHelper';

// Remove the mongoose.set() calls - they're not needed for this version

// Handle uncaught exceptions globally
process.on('uncaughtException', (error) => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

let server: any;

async function main() {
  try {
    // Connect to MongoDB - simple connection for modern Mongoose
    await mongoose.connect(config.database_url as string).then(() => {
      logger.info(colors.bgCyan('🚀 Database connected successfully'));
      // Seed Super Admin after database connection is successful
      // seedSuperAdmin()
    });

    // Validate and normalize port and IP
    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);
    const ip = config.ip || '0.0.0.0'; // default to all interfaces if not set

    // Start Express server
    server = app.listen(port, ip, () => {
      logger.info(
        colors.yellow(`♻️  Application listening on http://${ip}:${port}`),
      );
    });

    // Initialize Socket.IO with CORS enabled for all origins and pingTimeout
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });

    socketHelper.socket(io);

    //@ts-ignore
    global.io = io;
    logger.info(
      colors.yellow(`♻️ Socket is listening on http://${ip}:${port}`),
    );
  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'), error);
    process.exit(1);
  }

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (error) => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandleRejection Detected', error);
        process.exit(1);
      });
    } else {
      errorLogger.error('UnhandleRejection Detected', error);
      process.exit(1);
    }
  });
}

main();

// Handle graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVED');
  if (server) {
    server.close(() => {
      logger.info('Server closed gracefully');
    });
  }
});
