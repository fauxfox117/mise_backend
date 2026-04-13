const fs = require("fs/promises");
const path = require("path");

const loadToastCredentials = async () => {
  const { TOAST_CREDENTIALS_PATH = "./config/toast-credentials.json" } =
    process.env;

  const resolvedPath = path.resolve(process.cwd(), TOAST_CREDENTIALS_PATH);
  const fileContents = await fs.readFile(resolvedPath, "utf8");

  return JSON.parse(fileContents);
};

module.exports = {
  loadToastCredentials,
};
