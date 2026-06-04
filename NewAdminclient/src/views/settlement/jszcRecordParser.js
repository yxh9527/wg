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

const JSZC_LINES = {
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

const JSZC_POSITIONS = [
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

const JSZC_ICON_NAME_MAP = {
  1: "图标1",
  2: "图标2",
  3: "图标3",
  11: "图标11",
  12: "图标12",
  13: "图标13",
  21: "百搭",
  22: "百搭",
  666: "大百搭",
};

const JSZC_ICON_ATLAS = {
  url: "/jszc-rollers-bg.webp",
  swapRotatedSize: true,
  rotateDegrees: -90,
  frames: {
    1: { x: 566, y: 3, width: 286, height: 245, rotated: false, originalWidth: 316, originalHeight: 315, offset: { x: 8, y: -1 } },
    2: { x: 599, y: 252, width: 277, height: 245, rotated: false, originalWidth: 291, originalHeight: 245, offset: { x: 7, y: 0 } },
    3: { x: 856, y: 3, width: 292, height: 215, rotated: false, originalWidth: 316, originalHeight: 315, offset: { x: 8, y: -2 } },
    11: {
      x: 386,
      y: 287,
      width: 210,
      height: 209,
      rotated: true,
      rotateDegrees: -90,
      originalWidth: 316,
      originalHeight: 315,
      offset: { x: 8, y: -2 },
    },
    12: { x: 3, y: 300, width: 198, height: 181, rotated: false, originalWidth: 198, originalHeight: 181, offset: { x: 0, y: 0 } },
    13: {
      x: 205,
      y: 300,
      width: 190,
      height: 177,
      rotated: true,
      rotateDegrees: -90,
      originalWidth: 214,
      originalHeight: 177,
      offset: { x: 12, y: 0 },
    },
    21: {
      x: 284,
      y: 3,
      width: 280,
      height: 278,
      rotated: true,
      rotateDegrees: -90,
      originalWidth: 280,
      originalHeight: 278,
      offset: { x: 0, y: 0 },
    },
    22: {
      x: 3,
      y: 3,
      width: 293,
      height: 277,
      rotated: true,
      rotateDegrees: -90,
      originalWidth: 293,
      originalHeight: 277,
      offset: { x: 0, y: 0 },
    },
    666: { x: 878, y: 252, width: 270, height: 221, rotated: false, originalWidth: 270, originalHeight: 221, offset: { x: 0, y: 0 } },
  },
};

const JSZC_FUZZY_ATLAS = {
  url: "/jszc-fuzzy-bg.webp",
  swapRotatedSize: true,
  rotateDegrees: -90,
  frames: {
    1: { x: 3, y: 615, width: 282, height: 269, rotated: true, originalWidth: 316, originalHeight: 315, offset: { x: 8, y: -1 } },
    2: { x: 248, y: 909, width: 275, height: 256, rotated: true, originalWidth: 293, originalHeight: 314, offset: { x: 1, y: 4 } },
    3: { x: 3, y: 901, width: 292, height: 241, rotated: true, originalWidth: 316, originalHeight: 315, offset: { x: 8, y: -1 } },
    11: { x: 287, y: 398, width: 210, height: 233, rotated: false, originalWidth: 316, originalHeight: 315, offset: { x: 8, y: -2 } },
    12: { x: 300, y: 196, width: 198, height: 204, rotated: true, originalWidth: 198, originalHeight: 204, offset: { x: 0, y: 0 } },
    13: {
      x: 300,
      y: 3,
      width: 189,
      height: 206,
      rotated: true,
      rotateDegrees: -90,
      originalWidth: 293,
      originalHeight: 314,
      offset: { x: 2, y: 7 },
    },
    21: { x: 3, y: 309, width: 280, height: 302, rotated: false, originalWidth: 280, originalHeight: 302, offset: { x: 0, y: 0 } },
    22: { x: 3, y: 3, width: 293, height: 302, rotated: false, originalWidth: 293, originalHeight: 302, offset: { x: 0, y: 0 } },
    666: { x: 276, y: 635, width: 270, height: 221, rotated: true, originalWidth: 270, originalHeight: 221, offset: { x: 0, y: 0 } },
  },
};

function buildCells(icons) {
  return JSZC_POSITIONS.map(([column, row], index) => ({
    key: `${column}-${row}`,
    column,
    row,
    icon: icons[index] !== undefined ? icons[index] : 0,
    posIndex: index,
    coordKey: `${column}-${row}`,
  }));
}

function isBigWildPage(icons) {
  return [3, 4, 5, 6].every((index) => {
    const icon = toNumber(icons[index], 0);
    return icon === 21 || icon === 22;
  });
}

function buildHighlightKeysByLineNo(lineNo) {
  const indexes = JSZC_LINES[toNumber(lineNo, 0)] || [];
  return indexes
    .map((posIndex) => JSZC_POSITIONS[posIndex] || null)
    .filter(Boolean)
    .map(([column, row]) => `${column}-${row}`);
}

function buildWinArea(area, index) {
  const lineNo = toNumber(area && area.lineNo, 0) || toNumber(area && area.betAreaId, 0) || index + 1;
  const highlightKeys = buildHighlightKeysByLineNo(lineNo);
  return {
    index,
    lineNo,
    betAreaId: toNumber(area && area.betAreaId, 0),
    iconId: toNumber(area && area.iconId, 0),
    betGold: toNumber(area && area.betGold, 0),
    betMultiple: toNumber(area && area.betMultiple, 0),
    iconMultiple: toNumber(area && area.iconMultiple, 0),
    num: toNumber(area && area.num, 0),
    winLoseGold: toNumber(area && area.winLoseGold, 0),
    highlightKeys,
    formula: `(${toNumber(area && area.betGold, 0)} x ${toNumber(area && area.betMultiple, 0)} x ${toNumber(
      area && area.iconMultiple,
      0
    )})`,
  };
}

function buildPages(mergedSource, commonRecord) {
  const specialInfo = toArray(mergedSource.specialInfo);
  const timestampList = toArray(mergedSource.timestampList);

  const pageSources =
    specialInfo.length > 1
      ? specialInfo.map((item) => ({
          icons: item && item.icons ? item.icons : "",
          betAreas: toArray(item && item.betAreas),
          winLoseGold: toNumber(item && item.winLoseGold, 0),
        }))
      : [
          {
            icons: mergedSource.icons || "",
            betAreas: toArray(mergedSource.betAreas),
            winLoseGold: toNumber(mergedSource.winLoseGold, 0),
          },
        ];

  return pageSources.map((pageSource, index) => {
    const icons = parseIconList(pageSource.icons).slice(0, 10);
    const winAreas = toArray(pageSource.betAreas).map((area, areaIndex) => buildWinArea(area, areaIndex));
    return {
      pageIndex: index,
      label: index === 0 ? "普通模式" : `重转 ${index}`,
      timestamp: timestampList[index] || commonRecord.settlementTimestamp || "",
      icons,
      cells: buildCells(icons),
      isBigWild: isBigWildPage(icons),
      winAreas,
      winLoseGold: toNumber(pageSource.winLoseGold, winAreas.reduce((total, item) => total + toNumber(item.winLoseGold, 0), 0)),
    };
  });
}

export function buildJszcViewModel(parsed) {
  const source = parsed.source || {};
  const connectionRecord = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connectionRecord,
    ...source,
  };

  return {
    mode: "jszc",
    confName: "jszc",
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    betGold: toNumber(mergedSource.betGold, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    iconAtlas: JSZC_ICON_ATLAS,
    fuzzyAtlas: JSZC_FUZZY_ATLAS,
    iconNameMap: JSZC_ICON_NAME_MAP,
    pages: buildPages(mergedSource, commonRecord),
  };
}
