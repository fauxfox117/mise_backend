let io;

const setSocketServer = (socketServer) => {
  io = socketServer;
};

const emitTableStatusUpdated = (table) => {
  if (!io) {
    return;
  }

  io.emit("table:status:updated", table);
};

const emitTableStatusesSnapshot = (tables) => {
  if (!io) {
    return;
  }

  io.emit("table:statuses:snapshot", tables);
};

module.exports = {
  setSocketServer,
  emitTableStatusUpdated,
  emitTableStatusesSnapshot,
};
