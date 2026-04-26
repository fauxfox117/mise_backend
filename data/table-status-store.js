const ALLOWED_STATUSES = [
  "open",
  "occupied",
  "reserved",
  "dirty",
  "drinks/bread",
  "course1",
  "course2",
  "course3",
  "dessert",
];

const {
  getCustomFloorplanSeedStatuses,
  loadCustomFloorplanSync,
} = require("../utils/custom-floorplan");

const defaultTableStatuses = [
  ["T1", "open"],
  ["T2", "occupied"],
  ["T3", "reserved"],
];

const customFloorplanStatuses = getCustomFloorplanSeedStatuses(
  loadCustomFloorplanSync(),
);

const tableStatuses = new Map(
  customFloorplanStatuses.length
    ? customFloorplanStatuses.map((table) => [table.tableId, table.status])
    : defaultTableStatuses,
);

const getAllTableStatuses = () =>
  Array.from(tableStatuses.entries()).map(([tableId, status]) => ({
    tableId,
    status,
  }));

const isAllowedStatus = (status) => ALLOWED_STATUSES.includes(status);

const upsertTableStatus = (tableId, status) => {
  tableStatuses.set(String(tableId), status);

  return {
    tableId: String(tableId),
    status,
  };
};

module.exports = {
  ALLOWED_STATUSES,
  getAllTableStatuses,
  isAllowedStatus,
  upsertTableStatus,
};
