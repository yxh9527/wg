function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseIconList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => toNumber(item, 0));
}

const FKSEVEN_ICON_ATLAS = {
  url: "/fkseven-rollers-bg.webp",
  frames: {
    1: { x: 3, y: 1505, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    2: { x: 3, y: 1005, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    3: { x: 3, y: 3, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    11: { x: 3, y: 1339, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    12: { x: 3, y: 1172, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    21: { x: 3, y: 838, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    22: { x: 3, y: 671, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    23: { x: 3, y: 504, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    24: { x: 3, y: 337, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    25: { x: 3, y: 170, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
  },
};

const FKSEVEN_FUZZY_ATLAS = {
  url: "/fkseven-fuzzy-bg.webp",
  frames: {
    1: { x: 3, y: 1505, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    2: { x: 3, y: 1005, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    3: { x: 3, y: 3, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    11: { x: 3, y: 1339, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    12: { x: 3, y: 1172, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    21: { x: 3, y: 838, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    22: { x: 3, y: 671, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    23: { x: 3, y: 504, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    24: { x: 3, y: 337, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
    25: { x: 3, y: 170, width: 206, height: 163, rotated: false, originalWidth: 206, originalHeight: 163, offset: { x: 0, y: 0 } },
  },
};

const SPECIAL_ICON_LABEL_MAP = {
  21: "x10",
  22: "x5",
  23: "x2",
  24: "+100",
  25: "+10",
};

function buildColumns(icons) {
  const columns = [];
  for (let columnIndex = 0; columnIndex < 4; columnIndex += 1) {
    const base = columnIndex * 5;
    const raw = [
      toNumber(icons[base], 0),
      toNumber(icons[base + 1], 0),
      toNumber(icons[base + 2], 0),
      toNumber(icons[base + 3], 0),
      toNumber(icons[base + 4], 0),
    ];
    const rows = raw[2] > 0 ? [raw[0], raw[2], raw[4]] : [raw[1], 0, raw[3]];
    columns.push({
      columnIndex,
      rows,
      raw,
    });
  }
  return columns;
}

function buildFormula(area, specialInfo, specialIconId) {
  if (!area) return "";
  const base = `(${area.betGold || 0} x ${area.betMultiple || 0} x ${area.iconMultiple || 0}`;
  if (specialIconId === 21) return `${base} x10)`;
  if (specialIconId === 22) return `${base} x5)`;
  if (specialIconId === 23) return `${base} x2)`;
  if (specialIconId === 24 || specialIconId === 25) {
    const extra = toNumber(specialInfo && specialInfo.jewelMultiple, 0);
    return `${base} + ${area.betGold || 0} x ${area.betMultiple || 0} x ${extra})`;
  }
  return `${base})`;
}

export function buildFksevenViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const icons = parseIconList(mergedSource.icons);
  const area = (toArray(mergedSource.betAreas)[0] || {});
  const specialInfo = toArray(mergedSource.specialInfo)[0] || {};
  const specialIconId = toNumber(icons[17], 0);
  const hasWin = toNumber(mergedSource.winLoseGold, 0) > 0;

  return {
    mode: "fkseven",
    confName: "fkseven",
    betSingle: toNumber(area.betGold || mergedSource.betSingle, 0),
    betTimes: toNumber(area.betMultiple || mergedSource.betTimes, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    columns: buildColumns(icons),
    specialIconId,
    specialLabel: SPECIAL_ICON_LABEL_MAP[specialIconId] || "",
    rewardItem: {
      betAreaId: toNumber(area.betAreaId, 0),
      betGold: toNumber(area.betGold, 0),
      betMultiple: toNumber(area.betMultiple, 0),
      iconMultiple: toNumber(area.iconMultiple, 0),
      winLoseGold: toNumber(area.winLoseGold ?? mergedSource.winLoseGold, 0),
      formula: buildFormula(area, specialInfo, specialIconId),
    },
    hasWin,
    iconAtlas: FKSEVEN_ICON_ATLAS,
    fuzzyAtlas: FKSEVEN_FUZZY_ATLAS,
  };
}
