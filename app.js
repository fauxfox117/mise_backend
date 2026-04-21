require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { errors } = require("celebrate");

const routes = require("./routes/index");
const { initSocketServer } = require("./sockets");
const { NOT_FOUND } = require("./utils/errors");
const errorHandler = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();

const {
  PORT = 3001,
  MONGODB_URI = "mongodb://127.0.0.1:27017/mise_db",
  CORS_ORIGIN = "http://localhost:3000",
} = process.env;

const listenPort = Number(PORT) || 3001;

const corsOrigins = CORS_ORIGIN.split(",").map((origin) => origin.trim());

mongoose.connect(MONGODB_URI);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(requestLogger);

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.use("/", routes);

app.use(errorLogger);
app.use(errors());

app.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Resource not found" });
});

app.use(errorHandler);

const server = http.createServer(app);

initSocketServer(server, corsOrigins);

server.listen(listenPort, () => {
  // eslint-disable-next-line no-console
  console.log(`Mise backend listening on port ${listenPort}`);
});
