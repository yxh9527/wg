function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

const DWWG_ICON_ATLAS = {
  url: "/dwwg-icon-clear.webp",
  frames: {
    1: { x: 3, y: 189, width: 195, height: 190, rotated: false, originalWidth: 195, originalHeight: 190, offset: { x: 0, y: 0 } },
    2: { x: 202, y: 189, width: 191, height: 191, rotated: false, originalWidth: 191, originalHeight: 191, offset: { x: 0, y: 0 } },
    3: { x: 561, y: 3, width: 196, height: 183, rotated: false, originalWidth: 198, originalHeight: 183, offset: { x: 0, y: 0 } },
    11: { x: 761, y: 3, width: 196, height: 184, rotated: false, originalWidth: 198, originalHeight: 184, offset: { x: 0, y: 0 } },
    12: { x: 3, y: 3, width: 182, height: 182, rotated: false, originalWidth: 182, originalHeight: 182, offset: { x: 0, y: 0 } },
    13: { x: 189, y: 3, width: 182, height: 182, rotated: false, originalWidth: 182, originalHeight: 182, offset: { x: 0, y: 0 } },
    14: { x: 375, y: 3, width: 182, height: 182, rotated: false, originalWidth: 182, originalHeight: 182, offset: { x: 0, y: 0 } },
    21: { x: 615, y: 191, width: 206, height: 214, rotated: true, originalWidth: 206, originalHeight: 214, offset: { x: 0, y: 0 } },
    31: { x: 397, y: 190, width: 205, height: 214, rotated: true, originalWidth: 205, originalHeight: 214, offset: { x: 0, y: 0 } },
  },
};

const DWWG_FUZZY_ICON_ATLAS = {
  url: "/dwwg-icon-fuzzy.webp",
  frames: {
    1: { x: 213, y: 212, width: 190, height: 209, rotated: false, originalWidth: 194, originalHeight: 209, offset: { x: 2, y: 0 } },
    2: { x: 407, y: 212, width: 189, height: 209, rotated: false, originalWidth: 189, originalHeight: 209, offset: { x: 0, y: 0 } },
    3: { x: 648, y: 3, width: 194, height: 202, rotated: false, originalWidth: 196, originalHeight: 202, offset: { x: 0, y: 0 } },
    11: { x: 450, y: 3, width: 194, height: 203, rotated: false, originalWidth: 196, originalHeight: 203, offset: { x: 0, y: 0 } },
    12: { x: 3, y: 239, width: 182, height: 201, rotated: true, originalWidth: 182, originalHeight: 201, offset: { x: 0, y: 0 } },
    13: { x: 600, y: 210, width: 182, height: 201, rotated: false, originalWidth: 182, originalHeight: 201, offset: { x: 0, y: 0 } },
    14: { x: 786, y: 209, width: 182, height: 201, rotated: false, originalWidth: 182, originalHeight: 201, offset: { x: 0, y: 0 } },
    21: { x: 3, y: 3, width: 206, height: 232, rotated: false, originalWidth: 206, originalHeight: 232, offset: { x: 0, y: 0 } },
    31: { x: 213, y: 3, width: 205, height: 233, rotated: true, originalWidth: 205, originalHeight: 233, offset: { x: 0, y: 0 } },
  },
};

const DWWG_LINES = {
  1: [1, 4, 7, 10, 13],
  2: [0, 3, 6, 9, 12],
  3: [2, 5, 8, 11, 14],
  4: [0, 4, 8, 10, 12],
  5: [2, 4, 6, 10, 14],
  6: [0, 3, 7, 9, 12],
  7: [2, 5, 7, 11, 14],
  8: [1, 5, 8, 11, 13],
  9: [1, 3, 6, 9, 13],
  10: [0, 4, 7, 10, 12],
  11: [2, 4, 7, 10, 14],
  12: [1, 4, 6, 10, 13],
  13: [1, 4, 8, 10, 13],
  14: [1, 3, 7, 9, 13],
  15: [1, 5, 7, 11, 13],
  16: [0, 4, 6, 10, 12],
  17: [2, 4, 8, 10, 14],
  18: [0, 3, 7, 11, 14],
  19: [2, 5, 7, 9, 12],
  20: [1, 3, 7, 11, 13],
};

function parseIcons(rawIcons) {
  return String(rawIcons || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => toNumber(item, 0));
}

function buildCells(icons) {
  return toArray(icons).map((icon, index) => ({
    key: index,
    column: Math.floor(index / 3),
    row: index % 3,
    icon,
  }));
}

function buildLine(area, index) {
  const lineIndexes = DWWG_LINES[toNumber(area && area.betAreaId, 0)] || [];
  const linePos = lineIndexes.map((item) => [item % 3, Math.floor(item / 3)]);
  return {
    index,
    betAreaId: toNumber(area && area.betAreaId, 0),
    betGold: toNumber(area && area.betGold, 0),
    betMultiple: toNumber(area && area.betMultiple, 0),
    winLoseGold: toNumber(area && area.winLoseGold, 0),
    num: toNumber(area && area.num, 0),
    iconMultiple: toNumber(area && area.iconMultiple, 0),
    iconId: toNumber(area && area.iconId, 0),
    linePos,
    highlightKeys: linePos.map(([row, column]) => `${row}-${column}`),
    formula: `${toNumber(area && area.betGold, 0)} x ${toNumber(area && area.betMultiple, 0)} x ${toNumber(area && area.iconMultiple, 0)}`,
  };
}

function parseSpecialPage(segment) {
  const [left = "", iconsPart = ""] = String(segment || "").split("#");
  const [areaPart = "", roundWin = "0"] = left.split("$");
  return {
    icons: parseIcons(iconsPart),
    winLoseGold: toNumber(roundWin, 0),
    betAreas: areaPart
      .split("*")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const parts = item.split(",");
        return {
          betAreaId: toNumber(parts[0], 0),
          betGold: toNumber(parts[1], 0),
          betMultiple: toNumber(parts[2], 0),
          winLoseGold: toNumber(parts[3], 0),
          num: toNumber(parts[4], 0),
          iconMultiple: toNumber(parts[5], 0),
          iconId: toNumber(parts[6], 0),
        };
      }),
  };
}

function parseSpecialPages(rawValue) {
  return String(rawValue || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(parseSpecialPage);
}

function hasSpecialPageContent(page) {
  if (!page) return false;
  if (toArray(page.icons).length) return true;
  if (toArray(page.betAreas).length) return true;
  return toNumber(page.winLoseGold, 0) !== 0;
}

export function buildDwwgViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const mainIcons = parseIcons(mergedSource.icons);
  const mainLines = toArray(mergedSource.betAreas).map(buildLine);
  const specialPages = parseSpecialPages(
    connection.specialInfoStr || betRecord.specialInfoStr || source.specialInfoStr || ""
  ).filter(hasSpecialPageContent);

  const pages = [
    {
      pageIndex: 0,
      label: "\u4e3b\u76d8",
      cells: buildCells(mainIcons),
      winAreas: mainLines,
      winLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    },
  ].concat(
    specialPages.map((page, index) => ({
      pageIndex: index + 1,
      label: `\u9636\u6bb5 ${index + 1}`,
      cells: buildCells(page.icons),
      winAreas: toArray(page.betAreas).map(buildLine),
      winLoseGold: toNumber(page.winLoseGold, 0),
    }))
  );

  return {
    mode: "dwwg",
    confName: "dwwg",
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    iconAtlas: DWWG_ICON_ATLAS,
    fuzzyAtlas: DWWG_FUZZY_ICON_ATLAS,
    pages,
  };
}
