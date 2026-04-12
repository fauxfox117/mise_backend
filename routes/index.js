const router = require("express").Router();
const { createUser, login } = require("../controllers/users");
const userRouter = require("./users");
const auth = require("../middlewares/auth");
const { NOT_FOUND } = require("../utils/errors");
const {
  validateAuthentication,
  validateUserBody,
} = require("../middlewares/validation");

router.post("/signup", validateUserBody, createUser);
router.post("/signin", validateAuthentication, login);

router.use(auth);

router.use("/users", userRouter);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Resource not found" });
});

module.exports = router;
