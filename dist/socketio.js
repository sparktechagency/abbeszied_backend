"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const initializeSocketIO = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
        },
    });
    // Online users
    const onlineUser = new Set();
    io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        catch (error) {
            console.error('-- socket.io connection error --', error);
        }
    }));
    return io;
};
exports.default = initializeSocketIO;
