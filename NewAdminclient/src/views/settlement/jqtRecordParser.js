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
    .map((item) => item.replace(/[^0-9]/g, ""))
    .filter((item) => item !== "")
    .map((item) => toNumber(item, 0));
}

const JQT_LINE_POS_MAP = {
  1: [0, 3, 7],
  2: [0, 4, 7],
  3: [0, 4, 8],
  4: [1, 4, 7],
  5: [1, 4, 8],
  6: [1, 5, 8],
  7: [1, 5, 9],
  8: [2, 5, 8],
  9: [2, 5, 9],
  10: [2, 6, 9],
};

const JQT_POSITIONS = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 0],
  [2, 1],
  [2, 2],
];

const JQT_CASH_TOKEN_MAP = {
  31: { iconId: 100, multiple: 0.5, label: "x0.5", cashColorId: 1 },
  32: { iconId: 100, multiple: 1, label: "x1", cashColorId: 1 },
  33: { iconId: 100, multiple: 2, label: "x2", cashColorId: 1 },
  34: { iconId: 200, multiple: 5, label: "x5", cashColorId: 2 },
  35: { iconId: 200, multiple: 10, label: "x10", cashColorId: 2 },
  36: { iconId: 200, multiple: 20, label: "x20", cashColorId: 2 },
  37: { iconId: 200, multiple: 50, label: "x50", cashColorId: 2 },
  38: { iconId: 500, multiple: 100, label: "x100", cashColorId: 3 },
  39: { iconId: 500, multiple: 500, label: "x500", cashColorId: 3 },
};

const JQT_ICON_TOKEN_MAP = {
  0: { iconId: 666, multiple: 0, label: "" },
  1: { iconId: 1, multiple: 1, label: "1x" },
  2: { iconId: 2, multiple: 1, label: "1x" },
  3: { iconId: 3, multiple: 1, label: "1x" },
  11: { iconId: 11, multiple: 1, label: "1x" },
  12: { iconId: 12, multiple: 1, label: "1x" },
  13: { iconId: 13, multiple: 1, label: "1x" },
  21: { iconId: 22, multiple: 1, label: "1x" },
  22: { iconId: 22, multiple: 1, label: "1x" },
  ...JQT_CASH_TOKEN_MAP,
};

const JQT_ICON_NAME_MAP = {
  1: "A",
  2: "B",
  3: "C",
  11: "D",
  12: "E",
  13: "F",
  22: "Wild",
  100: "绿奖",
  200: "蓝奖",
  500: "红奖",
  666: "空位",
};

const JQT_ICON_ATLAS = {
  url: "/jqt-rollers-bg.webp",
  frames: {
    1: { x: 301, y: 264, width: 275, height: 231, rotated: false, originalWidth: 275, originalHeight: 231, offset: { x: 0, y: 0 } },
    2: { x: 580, y: 301, width: 262, height: 213, rotated: false, originalWidth: 262, originalHeight: 213, offset: { x: 0, y: 0 } },
    3: { x: 298, y: 499, width: 262, height: 192, rotated: false, originalWidth: 262, originalHeight: 192, offset: { x: 0, y: 0 } },
    11: { x: 3, y: 707, width: 225, height: 144, rotated: false, originalWidth: 225, originalHeight: 144, offset: { x: 0, y: 0 } },
    12: { x: 564, y: 518, width: 221, height: 200, rotated: false, originalWidth: 221, originalHeight: 200, offset: { x: 0, y: 0 } },
    13: { x: 298, y: 695, width: 205, height: 179, rotated: false, originalWidth: 205, originalHeight: 179, offset: { x: 0, y: 0 } },
    21: { x: 3, y: 3, width: 300, height: 257, rotated: false, originalWidth: 300, originalHeight: 257, offset: { x: 0, y: 0 } },
    22: { x: 307, y: 3, width: 300, height: 257, rotated: false, originalWidth: 300, originalHeight: 257, offset: { x: 0, y: 0 } },
    100: { x: 611, y: 3, width: 294, height: 219, rotated: true, originalWidth: 294, originalHeight: 219, offset: { x: 0, y: 0 } },
    200: { x: 3, y: 264, width: 294, height: 219, rotated: false, originalWidth: 294, originalHeight: 219, offset: { x: 0, y: 0 } },
    500: { x: 3, y: 802, width: 296, height: 147, rotated: false, originalWidth: 296, originalHeight: 147, offset: { x: 0, y: 0 } },
    666: { x: 3, y: 487, width: 291, height: 216, rotated: false, originalWidth: 291, originalHeight: 216, offset: { x: 0, y: 0 } },
  },
};

const JQT_FUZZY_ATLAS = {
  url: "/jqt-fuzzy-bg.webp",
  swapRotatedSize: true,
  rotateDegrees: -90,
  frames: {
    1: { x: 307, y: 3, width: 275, height: 260, rotated: false, originalWidth: 275, originalHeight: 260, offset: { x: 0, y: 0 } },
    2: { x: 527, y: 301, width: 262, height: 242, rotated: false, originalWidth: 262, originalHeight: 242, offset: { x: 0, y: 0 } },
    3: { x: 527, y: 547, width: 262, height: 221, rotated: false, originalWidth: 262, originalHeight: 221, offset: { x: 0, y: 0 } },
    11: { x: 535, y: 772, width: 225, height: 173, rotated: false, originalWidth: 225, originalHeight: 173, offset: { x: 0, y: 0 } },
    12: { x: 303, y: 772, width: 221, height: 228, rotated: true, originalWidth: 221, originalHeight: 228, offset: { x: 0, y: 0 } },
    13: { x: 307, y: 562, width: 205, height: 207, rotated: true, originalWidth: 205, originalHeight: 207, offset: { x: 0, y: 0 }, rotateDegrees: 90 },
    21: { x: 3, y: 292, width: 300, height: 283, rotated: false, originalWidth: 300, originalHeight: 285, offset: { x: 0, y: -1 } },
    22: { x: 3, y: 3, width: 300, height: 285, rotated: false, originalWidth: 300, originalHeight: 285, offset: { x: 0, y: 0 } },
    100: { x: 586, y: 3, width: 294, height: 219, rotated: true, originalWidth: 294, originalHeight: 219, offset: { x: 0, y: 0 } },
    200: { x: 3, y: 579, width: 294, height: 219, rotated: false, originalWidth: 294, originalHeight: 219, offset: { x: 0, y: 0 } },
    500: { x: 3, y: 802, width: 296, height: 147, rotated: false, originalWidth: 296, originalHeight: 147, offset: { x: 0, y: 0 } },
    666: { x: 307, y: 267, width: 291, height: 216, rotated: true, originalWidth: 291, originalHeight: 216, offset: { x: 0, y: 0 } },
  },
};

function hasAtlasFrame(atlas, frameKey) {
  return !!(atlas && atlas.frames && atlas.frames[String(frameKey)]);
}

function normalizeToken(token) {
  const value = toNumber(token, 0);
  if (value === 0) return 0;
  if (value === 21) return 22;
  return value;
}

function formatCashValue(value) {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function buildCell(rawToken, index, betGold) {
  const sourceIcon = toNumber(rawToken, 0);
  const tokenMeta = JQT_ICON_TOKEN_MAP[sourceIcon] || { iconId: normalizeToken(sourceIcon), multiple: 0, label: String(sourceIcon || "") };
  const position = JQT_POSITIONS[index] || [0, 0];
  const cashValue = sourceIcon >= 31 && sourceIcon <= 39 ? tokenMeta.multiple * toNumber(betGold, 0) : 0;

  return {
    key: String(index),
    column: position[0],
    row: position[1],
    coordKey: `${position[0]}-${position[1]}`,
    sourceIcon,
    icon: tokenMeta.iconId,
    fuzzyIcon: tokenMeta.iconId,
    cashValue,
    cashText: cashValue > 0 ? formatCashValue(cashValue) : "",
    cashColorId: tokenMeta.cashColorId || 0,
  };
}

function buildLineArea(area, index, betGold) {
  const betAreaId = toNumber(area && area.betAreaId, 0);
  const linePos = JQT_LINE_POS_MAP[betAreaId] || [];
  const iconId = toNumber(area && area.iconId, 0);
  const tokenMeta = JQT_ICON_TOKEN_MAP[iconId] || { iconId: normalizeToken(iconId), multiple: 0, label: String(iconId || "") };
  const cashValue = iconId >= 31 && iconId <= 39 ? tokenMeta.multiple * toNumber(betGold, 0) : 0;

  return {
    index,
    betAreaId,
    lineNo: toNumber(area && area.lineNo, -1),
    betGold: toNumber(area && area.betGold, 0),
    betMultiple: toNumber(area && area.betMultiple, 0),
    iconMultiple: toNumber(area && area.iconMultiple, 0),
    winLoseGold: toNumber(area && area.winLoseGold, 0),
    num: toNumber(area && area.num, 0),
    iconId,
    displayIconId: tokenMeta.iconId,
    badgeText: tokenMeta.label,
    cashValue,
    cashText: cashValue > 0 ? formatCashValue(cashValue) : "",
    linePos,
    highlightKeys: linePos.map((cellIndex) => {
      const position = JQT_POSITIONS[cellIndex] || [0, 0];
      return `${position[0]}-${position[1]}`;
    }),
    formula: `${toNumber(area && area.betGold, 0)} x ${toNumber(area && area.betMultiple, 0)} x ${toNumber(area && area.iconMultiple, 0)}`,
  };
}

function buildPage(icons, pageIndex, totalPages, mergedSource, pageBetAreas) {
  const iconList = parseIconList(icons).slice(0, 10);
  const cells = iconList.map((token, index) => buildCell(token, index, mergedSource.betGold));
  const winAreas = toArray(pageBetAreas).map((area, index) => buildLineArea(area, index, mergedSource.betGold));
  const freeCashValues = iconList
    .filter((token) => token >= 31 && token <= 39)
    .map((token) => JQT_CASH_TOKEN_MAP[token])
    .filter(Boolean)
    .map((item) => formatCashValue(item.multiple * toNumber(mergedSource.betGold, 0)));

  return {
    pageIndex,
    label: totalPages > 1 ? `免费 ${pageIndex + 1}` : "主盘",
    idxText: totalPages > 1 ? `${pageIndex + 1}/${totalPages}` : "",
    cells,
    winAreas,
    winLoseGold: toNumber((pageBetAreas && pageBetAreas[0] && pageBetAreas[0].winLoseGold) || mergedSource.winLoseGold, 0),
    freeCashValues,
    rawIcons: icons,
  };
}

export function buildJqtViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const pagesRaw = String(mergedSource.icons || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
  const hasMultiPage = pagesRaw.length > 1;
  const allAreas = toArray(mergedSource.betAreas);

  const pages = pagesRaw.length
    ? pagesRaw.map((icons, index) => {
        const pageBetAreas = hasMultiPage
          ? allAreas.filter((area) => toNumber(area && area.lineNo, -1) === index)
          : allAreas;
        return buildPage(icons, index, pagesRaw.length, mergedSource, pageBetAreas);
      })
    : [buildPage(String(mergedSource.icons || ""), 0, 1, mergedSource, allAreas)];

  return {
    mode: "jqt",
    confName: "jqt",
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    betGold: toNumber(mergedSource.betGold, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    iconAtlas: JQT_ICON_ATLAS,
    fuzzyAtlas: JQT_FUZZY_ATLAS,
    iconNameMap: JQT_ICON_NAME_MAP,
    pages,
    hasSpecialPages: hasMultiPage,
  };
}
