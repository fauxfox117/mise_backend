const {
  JWT_SECRET = "super-strong-secret",
  TOAST_WEBHOOK_SECRET = "",
  DEMO_AUTH = "false",
  DEMO_USER_ID = "demo-user",
} = process.env;

module.exports = {
  JWT_SECRET,
  TOAST_WEBHOOK_SECRET,
  DEMO_AUTH: DEMO_AUTH === "true",
  DEMO_USER_ID,
};
