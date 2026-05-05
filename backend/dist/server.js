"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const http_1 = require("http");
const socket_service_1 = __importDefault(require("./services/socket.service"));
const PORT = process.env.PORT || 3000;
const httpServer = (0, http_1.createServer)(app_1.default);
socket_service_1.default.init(httpServer);
const server = httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
