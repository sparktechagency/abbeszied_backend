import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // Online users
  const onlineUser = new Set();

  io.on('connection', async (socket) => {
    // console.log('connected', socket?.id);

    try {
      //----------------------user token get from front end-------------------------//
      // const token =
      //   socket.handshake.auth?.token || socket.handshake.headers?.token;
      // //----------------------check Token and return user details-------------------------//
      // const user: any = await getUserDetailsFromToken(token);
      // if (!user) {
      //   // io.emit('io-error', {success:false, message:'invalid Token'});
      //   throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
      // }

      // socket.join(user?._id?.toString());

      // //----------------------user id set in online array-------------------------//
      // onlineUser.add(user?._id?.toString());

      // socket.on('check', (data, callback) => {
      //   callback({ success: true });
      // });

      //-----------------------Disconnect------------------------//
      socket.on('disconnect', () => {
        // Skip deleting user since user variable is not defined in this scope
        io.emit('onlineUser', Array.from(onlineUser));
        // console.log('disconnect user ', socket.id);
      });
    } catch (error) {
      console.error('-- socket.io connection error --', error);
    }
  });

  return io;
};

export default initializeSocketIO;
