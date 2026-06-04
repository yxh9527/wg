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

function buildBoardCells(icons) {
  return toArray(icons).slice(0, 9).map((icon, index) => ({
    key: String(index),
    column: Math.floor(index / 3),
    row: index % 3,
    icon,
  }));
}

function normalizeLinePos(linePos) {
  return toArray(linePos)
    .map((item) => (Array.isArray(item && item.pos) ? item.pos : []))
    .filter((item) => item.length >= 2)
    .map((item) => [toNumber(item[0], 0), toNumber(item[1], 0)]);
}

const JLBZ_LINE_POS_MAP = {
  1: [
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  2: [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  3: [
    [0, 2],
    [1, 2],
    [2, 2],
  ],
  4: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  5: [
    [0, 2],
    [1, 1],
    [2, 0],
  ],
};

function buildFormula(area) {
  const parts = [
    String(toNumber(area && area.betGold, 0)),
    String(toNumber(area && area.betMultiple, 0)),
    String(toNumber(area && area.iconMultiple, 0)),
  ];
  const exMultiple = toNumber(area && area.exMultiple, 0);
  if (exMultiple > 1) {
    parts.push(String(exMultiple));
  }
  return parts.join(" x ");
}

function buildWinArea(area, index) {
  const betAreaId = toNumber(area && area.betAreaId, 0);
  const lineNo = toNumber(area && area.lineNo, 0);
  const fallbackLinePos = JLBZ_LINE_POS_MAP[betAreaId] || JLBZ_LINE_POS_MAP[lineNo] || [];
  const linePos = normalizeLinePos(area && area.linePos).length
    ? normalizeLinePos(area && area.linePos)
    : fallbackLinePos;
  return {
    index,
    betAreaId,
    iconId: toNumber(area && area.iconId, 0),
    num: toNumber(area && area.num, 0),
    betGold: toNumber(area && area.betGold, 0),
    betMultiple: toNumber(area && area.betMultiple, 0),
    iconMultiple: toNumber(area && area.iconMultiple, 0),
    exMultiple: toNumber(area && area.exMultiple, 0),
    winLoseGold: toNumber(area && area.winLoseGold, 0),
    linePos,
    highlightKeys: linePos.map(([column, row]) => `${column}-${row}`),
    formula: buildFormula(area),
    positionText: linePos.map(([column, row]) => `${column + 1}-${row + 1}`).join(" / "),
  };
}

function sumWinLoseGold(winAreas) {
  return toArray(winAreas).reduce((total, area) => total + toNumber(area && area.winLoseGold, 0), 0);
}

function hasPageContent(page) {
  if (!page || typeof page !== "object") return false;
  if (parseIconList(page.icons).length) return true;
  if (toArray(page.betAreas).length) return true;
  return toNumber(page.winLoseGold, 0) !== 0;
}

const JLBZ_ICON_ATLAS = {
  url: "/jlbz-rollers-bg.webp",
  frames: {
    1: { x: 1, y: 298, width: 264, height: 276, rotated: true, originalWidth: 266, originalHeight: 276, offset: { x: -1, y: 0 } },
    2: { x: 263, y: 628, width: 246, height: 245, rotated: true, originalWidth: 248, originalHeight: 247, offset: { x: -1, y: 1 } },
    3: { x: 1, y: 564, width: 260, height: 250, rotated: false, originalWidth: 262, originalHeight: 250, offset: { x: -1, y: 0 } },
    11: { x: 279, y: 376, width: 219, height: 250, rotated: false, originalWidth: 221, originalHeight: 250, offset: { x: 0, y: 0 } },
    12: { x: 1, y: 816, width: 167, height: 215, rotated: true, originalWidth: 169, originalHeight: 215, offset: { x: 0, y: 0 } },
    13: { x: 312, y: 1, width: 271, height: 191, rotated: true, originalWidth: 271, originalHeight: 191, offset: { x: 0, y: 0 } },
    21: { x: 1, y: 1, width: 309, height: 295, rotated: false, originalWidth: 309, originalHeight: 295, offset: { x: 0, y: 0 } },
    31: { x: 312, y: 274, width: 170, height: 100, rotated: false, originalWidth: 170, originalHeight: 100, offset: { x: 0, y: 0 } },
    32: { x: 348, y: 876, width: 124, height: 98, rotated: false, originalWidth: 124, originalHeight: 98, offset: { x: 0, y: 0 } },
    33: { x: 218, y: 876, width: 128, height: 99, rotated: false, originalWidth: 128, originalHeight: 99, offset: { x: 0, y: 0 } },
  },
};

const JLBZ_FUZZY_ATLAS = {
  url: "/jlbz-fuzzy-bg.webp",
  frames: {
    1: { x: 359, y: 1, width: 263, height: 309, rotated: false, originalWidth: 265, originalHeight: 309, offset: { x: 0, y: 0 } },
    2: { x: 1, y: 335, width: 245, height: 278, rotated: true, originalWidth: 247, originalHeight: 280, offset: { x: -1, y: 1 } },
    3: { x: 624, y: 1, width: 259, height: 284, rotated: false, originalWidth: 261, originalHeight: 284, offset: { x: 0, y: 0 } },
    11: { x: 676, y: 287, width: 217, height: 285, rotated: false, originalWidth: 219, originalHeight: 285, offset: { x: 0, y: 0 } },
    12: { x: 281, y: 335, width: 167, height: 248, rotated: false, originalWidth: 169, originalHeight: 248, offset: { x: 0, y: 0 } },
    13: { x: 450, y: 312, width: 271, height: 224, rotated: true, originalWidth: 271, originalHeight: 224, offset: { x: 0, y: 0 } },
    21: { x: 1, y: 1, width: 356, height: 332, rotated: false, originalWidth: 360, originalHeight: 340, offset: { x: 1, y: 4 } },
  },
};

const JLBZ_ICON_NAME_MAP = {
  1: "A",
  2: "K",
  3: "Q",
  11: "J",
  12: "绿宝石",
  13: "蓝宝石",
  21: "Wild",
  31: "1x",
  32: "2x",
  33: "3x",
};

function buildPage(source, pageIndex, totalSpecialPages) {
  const icons = parseIconList(source && source.icons);
  const winAreas = toArray(source && source.betAreas).map((area, index) => buildWinArea(area, index));
  const pageWinLoseGold = toNumber(source && source.winLoseGold, sumWinLoseGold(winAreas));
  return {
    pageIndex,
    label: pageIndex === 0 ? "主盘" : `阶段 ${pageIndex}`,
    pageType: pageIndex === 0 ? "main" : "bonus",
    idxText: pageIndex === 0 ? "" : `${pageIndex}/${totalSpecialPages}`,
    cells: buildBoardCells(icons),
    extraIcons: icons.slice(9).filter((icon) => toNumber(icon, 0) > 0),
    winAreas,
    winLoseGold: pageWinLoseGold,
  };
}

export function buildJlbzViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const specialPages = toArray(mergedSource.specialInfo || connection.specialInfo || betRecord.specialInfo).filter(hasPageContent);
  const pages = [buildPage(mergedSource, 0, specialPages.length)].concat(
    specialPages.map((page, index) => buildPage(page, index + 1, specialPages.length))
  );

  return {
    mode: "jlbz",
    confName: "jlbz",
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    isExMode: !!mergedSource.isExMode,
    hasSpecialPages: specialPages.length > 0,
    iconAtlas: JLBZ_ICON_ATLAS,
    fuzzyAtlas: JLBZ_FUZZY_ATLAS,
    iconNameMap: JLBZ_ICON_NAME_MAP,
    pages,
  };
}
