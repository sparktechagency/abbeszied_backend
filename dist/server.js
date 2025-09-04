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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./app/utils/logger");
const config_1 = __importDefault(require("./app/config"));
const socketHelper_1 = require("./app/helpers/socketHelper");
// Remove the mongoose.set() calls - they're not needed for this version
// Handle uncaught exceptions globally
process.on('uncaughtException', (error) => {
    logger_1.errorLogger.error('UnhandleException Detected', error);
    process.exit(1);
});
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB - simple connection for modern Mongoose
            yield mongoose_1.default.connect(config_1.default.database_url).then(() => {
                logger_1.logger.info(colors_1.default.bgCyan('🚀 Database connected successfully'));
                // Seed Super Admin after database connection is successful
                // seedSuperAdmin()
            });
            // Validate and normalize port and IP
            const port = typeof config_1.default.port === 'number' ? config_1.default.port : Number(config_1.default.port);
            const ip = config_1.default.ip || '0.0.0.0'; // default to all interfaces if not set
            // Start Express server
            server = app_1.default.listen(port, ip, () => {
                logger_1.logger.info(colors_1.default.yellow(`♻️  Application listening on http://${ip}:${port}`));
            });
            // Initialize Socket.IO with CORS enabled for all origins and pingTimeout
            const io = new socket_io_1.Server(server, {
                pingTimeout: 60000,
                cors: {
                    origin: '*',
                },
            });
            socketHelper_1.socketHelper.socket(io);
            //@ts-ignore
            global.io = io;
            logger_1.logger.info(colors_1.default.yellow(`♻️ Socket is listening on http://${ip}:${port}`));
        }
        catch (error) {
            logger_1.errorLogger.error(colors_1.default.red('🤢 Failed to connect Database'), error);
            process.exit(1);
        }
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (error) => {
            if (server) {
                server.close(() => {
                    logger_1.errorLogger.error('UnhandleRejection Detected', error);
                    process.exit(1);
                });
            }
            else {
                logger_1.errorLogger.error('UnhandleRejection Detected', error);
                process.exit(1);
            }
        });
    });
}
main();
// Handle graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM IS RECEIVED');
    if (server) {
        server.close(() => {
            logger_1.logger.info('Server closed gracefully');
        });
    }
});
