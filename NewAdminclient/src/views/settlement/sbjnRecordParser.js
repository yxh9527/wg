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

const SBJN_LINE_POS_MAP = {
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

const SBJN_POSITIONS = [
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

const SBJN_ICON_TOKEN_MAP = {
  1: { iconId: 1, multiple: 1, label: "1x" },
  2: { iconId: 2, multiple: 1, label: "1x" },
  3: { iconId: 3, multiple: 1, label: "1x" },
  11: { iconId: 11, multiple: 1, label: "1x" },
  12: { iconId: 12, multiple: 1, label: "1x" },
  13: { iconId: 13, multiple: 1, label: "1x" },
  21: { iconId: 22, multiple: 1, label: "1x" },
  31: { iconId: 100, multiple: 0.5, label: "x0.5" },
  32: { iconId: 100, multiple: 1, label: "x1" },
  33: { iconId: 100, multiple: 2, label: "x2" },
  34: { iconId: 200, multiple: 5, label: "x5" },
  35: { iconId: 200, multiple: 10, label: "x10" },
  36: { iconId: 200, multiple: 20, label: "x20" },
  37: { iconId: 200, multiple: 50, label: "x50" },
  38: { iconId: 500, multiple: 100, label: "x100" },
  39: { iconId: 500, multiple: 500, label: "x500" },
};

const SBJN_ICON_NAME_MAP = {
  1: "A",
  2: "B",
  3: "C",
  11: "D",
  12: "E",
  13: "F",
  22: "J",
  100: "100",
  200: "200",
  500: "500",
};

const SBJN_ICON_ATLAS = {
  url: "/sbjn-game-ui2.webp",
  frames: {
    1: { x: 633, y: 229, width: 260, height: 236, rotated: false, originalWidth: 260, originalHeight: 236, offset: { x: 0, y: 0 } },
    2: { x: 633, y: 3, width: 297, height: 222, rotated: false, originalWidth: 301, originalHeight: 222, offset: { x: -2, y: 0 } },
    3: { x: 897, y: 229, width: 260, height: 234, rotated: false, originalWidth: 262, originalHeight: 234, offset: { x: -1, y: 0 } },
    11: { x: 3, y: 268, width: 236, height: 202, rotated: false, originalWidth: 236, originalHeight: 202, offset: { x: 0, y: 0 } },
    12: { x: 934, y: 3, width: 203, height: 206, rotated: false, originalWidth: 203, originalHeight: 206, offset: { x: 0, y: 0 } },
    13: { x: 243, y: 268, width: 174, height: 170, rotated: false, originalWidth: 174, originalHeight: 170, offset: { x: 0, y: 0 } },
    21: { x: 3, y: 3, width: 311, height: 261, rotated: false, originalWidth: 315, originalHeight: 261, offset: { x: 0, y: 0 } },
    22: { x: 318, y: 3, width: 311, height: 261, rotated: false, originalWidth: 315, originalHeight: 261, offset: { x: 0, y: 0 } },
  },
};

const SBJN_LINE_ATLAS = {
  url: "/sbjn-game-ui3.webp",
  swapRotatedSize: true,
  frames: {
    1: { x: 3, y: 3, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
    2: { x: 93, y: 3, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
    3: { x: 183, y: 3, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
    4: { x: 273, y: 3, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
    5: { x: 363, y: 3, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
    6: { x: 3, y: 70, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
    7: { x: 93, y: 70, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
    8: { x: 183, y: 70, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
    9: { x: 273, y: 70, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
    10: { x: 363, y: 70, width: 63, height: 86, rotated: true, originalWidth: 63, originalHeight: 86, offset: { x: 0, y: 0 } },
  },
};

function hasAtlasFrame(atlas, frameKey) {
  return !!(atlas && atlas.frames && atlas.frames[String(frameKey)]);
}

function buildCell(cellData, index) {
  const position = SBJN_POSITIONS[index] || [0, 0];
  return {
    key: String(index),
    column: position[0],
    row: position[1],
    coordKey: `${position[0]}-${position[1]}`,
    icon: cellData.icon,
    sourceIcon: cellData.sourceIcon,
    badgeText: cellData.badgeText,
    useWeightBadge: !!cellData.useWeightBadge,
  };
}

function buildLineArea(area, index) {
  const betAreaId = toNumber(area && area.betAreaId, 0);
  const linePos = SBJN_LINE_POS_MAP[betAreaId] || [];
  const iconId = toNumber(area && area.iconId, 0);
  const tokenMeta = SBJN_ICON_TOKEN_MAP[iconId] || { iconId, multiple: 0, label: String(iconId || "") };
  const displayIconId = tokenMeta.iconId;
  const useWeightBadge = !hasAtlasFrame(SBJN_ICON_ATLAS, displayIconId);

  return {
    index,
    betAreaId,
    betGold: toNumber(area && area.betGold, 0),
    betMultiple: toNumber(area && area.betMultiple, 0),
    iconMultiple: toNumber(area && area.iconMultiple, 0),
    winLoseGold: toNumber(area && area.winLoseGold, 0),
    num: toNumber(area && area.num, 0),
    iconId,
    displayIconId: useWeightBadge ? "" : displayIconId,
    displayMultiple: tokenMeta.multiple,
    badgeText: tokenMeta.label,
    useWeightBadge,
    linePos,
    highlightKeys: linePos.map((cellIndex) => {
      const position = SBJN_POSITIONS[cellIndex] || [0, 0];
      return `${position[0]}-${position[1]}`;
    }),
    lineImageId: betAreaId,
    formula: `${toNumber(area && area.betGold, 0)} x ${toNumber(area && area.betMultiple, 0)} x ${toNumber(area && area.iconMultiple, 0)}`,
  };
}

function buildPage(source, pageIndex, totalPages, betAreas) {
  const icons = parseIconList(source && source.icons);
  const cells = icons.slice(0, 10).map((icon) => {
    const tokenMeta = SBJN_ICON_TOKEN_MAP[icon] || { iconId: icon, multiple: 0, label: String(icon || "") };
    const displayIconId = tokenMeta.iconId;
    const useWeightBadge = !hasAtlasFrame(SBJN_ICON_ATLAS, displayIconId);
    return {
      sourceIcon: icon,
      icon: useWeightBadge ? "" : displayIconId,
      badgeText: useWeightBadge ? tokenMeta.label : "",
      useWeightBadge,
    };
  });

  return {
    pageIndex,
    label: pageIndex === 0 ? "主盘" : `第${pageIndex + 1}页`,
    idxText: totalPages > 1 ? `${pageIndex + 1}/${totalPages}` : "",
    cells: cells.map(buildCell),
    winAreas: toArray(betAreas).map((area, index) => buildLineArea(area, index)),
    winLoseGold: toNumber(source && source.winLoseGold, 0),
  };
}

export function buildSbjnViewModel(parsed) {
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

  const pages = pagesRaw.length
    ? pagesRaw.map((icons, index) => {
        const pageBetAreas = hasMultiPage
          ? toArray(mergedSource.betAreas).filter((area) => toNumber(area && area.lineNo, -1) === index)
          : toArray(mergedSource.betAreas);
        return buildPage({ ...mergedSource, icons }, index, pagesRaw.length, pageBetAreas);
      })
    : [buildPage(mergedSource, 0, 1, toArray(mergedSource.betAreas))];

  return {
    mode: "sbjn",
    confName: "sbjn",
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    iconAtlas: SBJN_ICON_ATLAS,
    lineAtlas: SBJN_LINE_ATLAS,
    iconNameMap: SBJN_ICON_NAME_MAP,
    pages,
    hasSpecialPages: hasMultiPage,
  };
}
