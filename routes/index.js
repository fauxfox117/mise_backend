const router = require("express").Router();
const { createUser, login } = require("../controllers/users");
const { handleToastEvent, syncToastTables } = require("../controllers/toast");
const userRouter = require("./users");
const tableRouter = require("./tables");
const auth = require("../middlewares/auth");
const { NOT_FOUND } = require("../utils/errors");
const {
  validateAuthentication,
  validateUserBody,
} = require("../middlewares/validation");

router.post("/signup", validateUserBody, createUser);
router.post("/signin", validateAuthentication, login);
router.post("/toast/events", handleToastEvent);

router.use(auth);

router.use("/users", userRouter);
router.use("/tables", tableRouter);
router.post("/toast/sync", syncToastTables);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Resource not found" });
});

module.exports = router;
