const BadRequestError = require("../errors/bad-request-err");
const {
  getAllTableStatuses,
  isAllowedStatus,
  upsertTableStatus,
} = require("../data/table-status-store");
const {
  emitTableStatusUpdated,
  emitTableStatusesSnapshot,
} = require("../utils/realtime");
const { fetchToastFloorplan } = require("../utils/toast-client");

const listTableStatuses = (req, res) => {
  res.send({ tables: getAllTableStatuses() });
};

const updateTableStatus = (req, res, next) => {
  const { tableId } = req.params;
  const { status } = req.body;

  if (!isAllowedStatus(status)) {
    return next(new BadRequestError("Invalid table status value"));
  }

  const updatedTable = upsertTableStatus(tableId, status);

  emitTableStatusUpdated(updatedTable);
  emitTableStatusesSnapshot(getAllTableStatuses());

  return res.send({ table: updatedTable });
};

const getToastFloorplan = async (req, res, next) => {
  try {
    const floorplan = await fetchToastFloorplan();
    return res.send(floorplan);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listTableStatuses,
  updateTableStatus,
  getToastFloorplan,
};
