import mongoose from 'mongoose';
import { Server } from 'http';
import app from './app';
import config from './app/config';
import { seed } from './app/utils/seeding';
// import { seed } from './app/utils/seeding';
const PORT = config.port || 5000;
let server: Server;

async function connectServer() {
  try {
    await mongoose.connect(config.database_url as string);
    await seed();
    server = app.listen(PORT, () => {
      console.log(`🚀 The server is running on ${PORT} port.`);
    });
  } catch {
    console.log('❌ Error found in mongoose connection time');
  }
}

connectServer();

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (server) {
    server.close(() => {
      console.error('Server closed due to unhandled rejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (server) {
    server.close(() => {
      console.log('Server closed due to SIGTERM');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  if (server) {
    server.close(() => {
      console.log('Server closed due to SIGINT');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
