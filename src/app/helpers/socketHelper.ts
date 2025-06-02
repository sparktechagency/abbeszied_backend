
import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../utils/logger';

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));

    socket.on('messageFromClient', (msg: string) => {
      io.emit(msg);
    });

    //disconnect

    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};

export const socketHelper = { socket };
