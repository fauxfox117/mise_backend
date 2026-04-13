const BadRequestError = require("../errors/bad-request-err");
const { loadToastCredentials } = require("./toast-credentials");

const STATUS_MAP = {
  AVAILABLE: "open",
  OPEN: "open",
  OCCUPIED: "occupied",
  SEATED: "occupied",
  BREAD_DRINKS: "drinks/bread",
  COURSE_1: "course1",
  COURSE_2: "course2",
  COURSE_3: "course3",
  DESSERT: "dessert",
  RESERVED: "reserved",
  HOLD: "reserved",
  DIRTY: "dirty",
  BUSSING: "dirty",
};

const normalizeStatus = (value) => {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim().toUpperCase();
  return STATUS_MAP[normalized] || null;
};

const extractToastEventUpdates = (payload) => {
  if (Array.isArray(payload?.updates)) {
    return payload.updates
      .map((update) => ({
        tableId: update?.tableId || update?.table?.id,
        status: normalizeStatus(
          update?.status || update?.course || update?.courseName,
        ),
      }))
      .filter((update) => update.tableId && update.status);
  }

  if (Array.isArray(payload?.events)) {
    return payload.events
      .map((event) => {
        const tableId =
          event?.tableId ||
          event?.table?.id ||
          event?.entity?.tableId ||
          event?.entity?.table?.id;
        const rawStatus =
          event?.status ||
          event?.course ||
          event?.courseName ||
          event?.entity?.status ||
          event?.entity?.course;

        return {
          tableId,
          status: normalizeStatus(rawStatus),
        };
      })
      .filter((update) => update.tableId && update.status);
  }

  if (
    payload?.tableId &&
    (payload?.status || payload?.course || payload?.courseName)
  ) {
    return [
      {
        tableId: payload.tableId,
        status: normalizeStatus(
          payload.status || payload.course || payload.courseName,
        ),
      },
    ].filter((update) => update.status);
  }

  if (
    payload?.table?.id &&
    (payload?.table?.status || payload?.table?.course)
  ) {
    return [
      {
        tableId: payload.table.id,
        status: normalizeStatus(payload.table.status || payload.table.course),
      },
    ].filter((update) => update.status);
  }

  return [];
};

const readByPath = (payload, path) => {
  if (!path) {
    return payload;
  }

  return path.split(".").reduce((acc, key) => {
    if (!acc || typeof acc !== "object") {
      return undefined;
    }

    return acc[key];
  }, payload);
};

const toUpdates = (rawItems, tableIdKey, statusKey) => {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => {
      const tableId = item?.[tableIdKey];
      const status = normalizeStatus(item?.[statusKey]);

      if (!tableId || !status) {
        return null;
      }

      return {
        tableId: String(tableId),
        status,
      };
    })
    .filter(Boolean);
};

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

const firstDefined = (item, keys) =>
  keys.find((key) => item?.[key] !== undefined && item?.[key] !== null);

const getField = (item, keys) => {
  const key = firstDefined(item, keys);
  return key ? item[key] : undefined;
};

const toFloorplanTables = (rawItems) => {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item, index) => {
      const id =
        getField(item, ["guid", "id", "tableGuid", "tableId"]) ||
        `table-${index + 1}`;
      const label =
        getField(item, ["name", "label", "displayName", "number"]) ||
        String(id);
      const status = normalizeStatus(
        getField(item, [
          "occupancyStatus",
          "status",
          "tableStatus",
          "course",
          "courseName",
        ]),
      );
      const x = toNumber(getField(item, ["x", "xPos", "xPosition", "left"]));
      const y = toNumber(getField(item, ["y", "yPos", "yPosition", "top"]));
      const width =
        toNumber(getField(item, ["width", "w", "tableWidth"])) || 96;
      const height =
        toNumber(getField(item, ["height", "h", "tableHeight"])) || 64;
      const shape = String(
        getField(item, ["shape", "tableShape"]) || "rectangle",
      ).toLowerCase();
      const rotation = toNumber(
        getField(item, ["rotation", "rotationDegrees", "angle"]),
      );
      const seats = toNumber(
        getField(item, ["seats", "capacity", "maxGuests", "seatCount"]),
      );
      const section = getField(item, [
        "diningAreaName",
        "areaName",
        "section",
        "room",
        "diningArea",
      ]);

      return {
        tableId: String(id),
        label: String(label),
        status: status || "open",
        x,
        y,
        width,
        height,
        shape: shape === "circle" || shape === "round" ? "circle" : "rectangle",
        rotation: Number.isFinite(rotation) ? rotation : 0,
        seats: Number.isFinite(seats) ? seats : null,
        section: section ? String(section) : "Main Dining",
      };
    })
    .filter((item) => item.tableId);
};

const getToastAccessToken = async (credentials) => {
  const tokenUrl =
    credentials.tokenUrl ||
    "https://ws-api.toasttab.com/authentication/v1/authentication/login";

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userAccessType: credentials.userAccessType || "TOAST_MACHINE_CLIENT",
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.token?.accessToken) {
    throw new BadRequestError("Failed to authenticate with Toast API");
  }

  return payload.token.accessToken;
};

const fetchToastTableUpdates = async () => {
  const credentials = await loadToastCredentials();
  const {
    clientId,
    clientSecret,
    tablesUrl,
    tableIdKey = "guid",
    statusKey = "occupancyStatus",
    responsePath = "tables",
    restaurantGuid = "",
  } = credentials;

  if (!clientId || !clientSecret) {
    throw new BadRequestError(
      "Toast credentials are missing clientId or clientSecret",
    );
  }

  if (!tablesUrl) {
    throw new BadRequestError("Toast credentials must include tablesUrl");
  }

  const accessToken = await getToastAccessToken(credentials);

  const response = await fetch(tablesUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Toast-Restaurant-External-ID": restaurantGuid,
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new BadRequestError("Failed to fetch table statuses from Toast API");
  }

  const rawItems = readByPath(payload, responsePath);
  const updates = toUpdates(rawItems, tableIdKey, statusKey);

  if (!updates.length) {
    throw new BadRequestError(
      "No mappable table statuses returned by Toast API",
    );
  }

  return updates;
};

const fetchToastFloorplan = async () => {
  const credentials = await loadToastCredentials();
  const {
    clientId,
    clientSecret,
    tablesUrl,
    responsePath = "tables",
    restaurantGuid = "",
  } = credentials;

  if (!clientId || !clientSecret) {
    throw new BadRequestError(
      "Toast credentials are missing clientId or clientSecret",
    );
  }

  if (!tablesUrl) {
    throw new BadRequestError("Toast credentials must include tablesUrl");
  }

  const accessToken = await getToastAccessToken(credentials);
  const response = await fetch(tablesUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Toast-Restaurant-External-ID": restaurantGuid,
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new BadRequestError("Failed to fetch floorplan from Toast API");
  }

  const rawItems = readByPath(payload, responsePath);
  const tables = toFloorplanTables(rawItems);

  if (!tables.length) {
    throw new BadRequestError("No table layout data returned by Toast API");
  }

  const withCoords = tables.filter(
    (item) => Number.isFinite(item.x) && Number.isFinite(item.y),
  );

  const layoutTables = withCoords.length
    ? withCoords
    : tables.map((item, index) => ({
        ...item,
        x: 40 + (index % 5) * 120,
        y: 40 + Math.floor(index / 5) * 90,
      }));

  return {
    width: Math.max(...layoutTables.map((item) => item.x + item.width), 800),
    height: Math.max(...layoutTables.map((item) => item.y + item.height), 520),
    tables: layoutTables,
  };
};

module.exports = {
  fetchToastTableUpdates,
  fetchToastFloorplan,
  normalizeStatus,
  extractToastEventUpdates,
};
