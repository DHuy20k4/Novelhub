import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { createServer } from 'http';
import SocketService from './services/socket.service';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
SocketService.init(httpServer);

const server = httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
