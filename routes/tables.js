const router = require("express").Router();
const {
  listTableStatuses,
  updateTableStatus,
  getToastFloorplan,
} = require("../controllers/table-statuses");
const { validateTableStatusUpdate } = require("../middlewares/validation");

router.get("/statuses", listTableStatuses);
router.get("/floorplan", getToastFloorplan);
router.patch("/:tableId/status", validateTableStatusUpdate, updateTableStatus);

module.exports = router;
