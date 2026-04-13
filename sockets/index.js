const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, DEMO_AUTH } = require("../utils/config");
const { getAllTableStatuses } = require("../data/table-status-store");
const { setSocketServer } = require("../utils/realtime");

const initSocketServer = (httpServer, corsOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    if (DEMO_AUTH) {
      return next();
    }

    const authHeader = socket.handshake.headers.authorization;
    const authToken = socket.handshake.auth?.token;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;
    const token = authToken || tokenFromHeader;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.emit("table:statuses:snapshot", getAllTableStatuses());
  });

  setSocketServer(io);

  return io;
};

module.exports = {
  initSocketServer,
};
