const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const requestLogStream = fs.createWriteStream(
  path.join(__dirname, "../request.log"),
  { flags: "a" }
);

const errorLogStream = fs.createWriteStream(
  path.join(__dirname, "../error.log"),
  { flags: "a" }
);

const requestLogger = morgan("combined", { stream: requestLogStream });

const errorLogger = (err, req, res, next) => {
  const entry = {
    date: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    message: err.message,
  };
  errorLogStream.write(JSON.stringify(entry) + "\n");
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger,
};
