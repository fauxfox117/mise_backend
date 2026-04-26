const fs = require("fs");
const path = require("path");

const DEFAULT_CUSTOM_FLOORPLAN_PATH = "./config/custom-floorplan.json";

const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const normalizeTable = (table, index) => {
  if (!table || typeof table !== "object") {
    return null;
  }

  const tableId = String(table.tableId || table.id || `T${index + 1}`);
  const label = String(table.label || table.name || tableId);
  const x = toNumber(table.x);
  const y = toNumber(table.y);
  const width = toNumber(table.width) || 96;
  const height = toNumber(table.height) || 64;
  const rotation = toNumber(table.rotation) || 0;
  const seats = toNumber(table.seats);
  const shape = String(table.shape || "rectangle").toLowerCase();

  return {
    tableId,
    label,
    status: String(table.status || "open"),
    x: Number.isFinite(x) ? x : 40 + (index % 5) * 120,
    y: Number.isFinite(y) ? y : 40 + Math.floor(index / 5) * 90,
    width,
    height,
    shape: shape === "circle" || shape === "round" ? "circle" : "rectangle",
    rotation,
    seats: Number.isFinite(seats) ? seats : null,
    section: String(table.section || "Main Dining"),
  };
};

const normalizeFloorplan = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const tables = Array.isArray(payload.tables)
    ? payload.tables.map(normalizeTable).filter(Boolean)
    : [];

  if (!tables.length) {
    return null;
  }

  const width =
    toNumber(payload.width) ||
    Math.max(...tables.map((table) => table.x + table.width), 800);
  const height =
    toNumber(payload.height) ||
    Math.max(...tables.map((table) => table.y + table.height), 520);

  return {
    width,
    height,
    tables,
  };
};

const loadCustomFloorplanSync = () => {
  const { CUSTOM_FLOORPLAN_PATH = DEFAULT_CUSTOM_FLOORPLAN_PATH } = process.env;
  const resolvedPath = path.resolve(process.cwd(), CUSTOM_FLOORPLAN_PATH);

  try {
    const raw = fs.readFileSync(resolvedPath, "utf8");
    return normalizeFloorplan(JSON.parse(raw));
  } catch (err) {
    return null;
  }
};

const getCustomFloorplanSeedStatuses = (floorplan) => {
  if (!floorplan?.tables?.length) {
    return [];
  }

  return floorplan.tables.map((table) => ({
    tableId: String(table.tableId),
    status: String(table.status || "open"),
  }));
};

module.exports = {
  loadCustomFloorplanSync,
  getCustomFloorplanSeedStatuses,
};
