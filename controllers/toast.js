const BadRequestError = require("../errors/bad-request-err");
const UnauthorizedError = require("../errors/unauthorized-err");
const {
  getAllTableStatuses,
  isAllowedStatus,
  upsertTableStatus,
} = require("../data/table-status-store");
const {
  emitTableStatusUpdated,
  emitTableStatusesSnapshot,
} = require("../utils/realtime");
const {
  fetchToastTableUpdates,
  extractToastEventUpdates,
} = require("../utils/toast-client");

const applyUpdates = (updates) => {
  const acceptedUpdates = [];

  updates.forEach((update) => {
    if (!update?.tableId || !isAllowedStatus(update?.status)) {
      return;
    }

    const table = upsertTableStatus(update.tableId, update.status);
    acceptedUpdates.push(table);
    emitTableStatusUpdated(table);
  });

  if (!acceptedUpdates.length) {
    throw new BadRequestError("No valid table updates were provided");
  }

  emitTableStatusesSnapshot(getAllTableStatuses());

  return acceptedUpdates;
};

const handleToastEvent = (req, res, next) => {
  const { TOAST_WEBHOOK_SECRET } = process.env;
  const providedSecret = req.get("x-toast-webhook-secret");

  if (TOAST_WEBHOOK_SECRET && providedSecret !== TOAST_WEBHOOK_SECRET) {
    return next(new UnauthorizedError("Invalid webhook secret"));
  }

  const updates = extractToastEventUpdates(req.body);

  if (!updates.length) {
    return next(
      new BadRequestError("No table updates found in Toast event payload"),
    );
  }

  let acceptedUpdates;

  try {
    acceptedUpdates = applyUpdates(updates);
  } catch (err) {
    return next(err);
  }

  return res.send({
    received: acceptedUpdates.length,
    tables: acceptedUpdates,
  });
};

const syncToastTables = async (req, res, next) => {
  try {
    const updates = await fetchToastTableUpdates();
    const acceptedUpdates = applyUpdates(updates);

    return res.send({
      received: acceptedUpdates.length,
      tables: acceptedUpdates,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  handleToastEvent,
  syncToastTables,
};
