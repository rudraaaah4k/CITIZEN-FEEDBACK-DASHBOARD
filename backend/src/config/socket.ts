import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from './jwt';
import logger from '../utils/logger';

interface AuthedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

let io: SocketIOServer | null = null;

const ADMIN_ROLES = ['admin', 'moderator', 'department_head'];

export const initSocket = (server: HTTPServer): SocketIOServer => {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.PRODUCTION_CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean) as string[];

  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Socket CORS: Origin ${origin} not allowed`));
        }
      },
      credentials: true,
    },
  });

  io.use((socket: AuthedSocket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ||
        (socket.handshake.headers?.authorization?.toString().startsWith('Bearer ')
          ? socket.handshake.headers.authorization!.toString().split(' ')[1]
          : undefined);

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }
    if (socket.userRole && ADMIN_ROLES.includes(socket.userRole)) {
      socket.join('admins');
    }

    logger.info(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    socket.on('feedback:subscribe', (feedbackId: string) => {
      if (typeof feedbackId === 'string') socket.join(`feedback:${feedbackId}`);
    });

    socket.on('feedback:unsubscribe', (feedbackId: string) => {
      if (typeof feedbackId === 'string') socket.leave(`feedback:${feedbackId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => io;

// ---- Emit helpers ----

export const emitToUser = (userId: string, event: string, payload: unknown): void => {
  io?.to(`user:${userId}`).emit(event, payload);
};

export const emitToAdmins = (event: string, payload: unknown): void => {
  io?.to('admins').emit(event, payload);
};

export const emitToFeedback = (feedbackId: string, event: string, payload: unknown): void => {
  io?.to(`feedback:${feedbackId}`).emit(event, payload);
};
