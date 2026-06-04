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

function parseSpecialInfoStr(value) {
  if (typeof value !== "string" || !value.trim()) return [];

  return value
    .split("|")
    .map((page) => page.trim())
    .filter(Boolean)
    .map((page) => {
      const result = {
        icons: "",
        winLoseGold: 0,
        betAreas: [],
      };
      const parts = page.split("#");
      result.icons = parts[1] || "";

      const areaPart = parts[0] || "";
      const areaChunks = areaPart.split("$");
      const areaText = areaChunks[0] || "";
      result.winLoseGold = toNumber(areaChunks[1], 0);

      if (areaText) {
        result.betAreas = areaText
          .split("*")
          .map((chunk) => chunk.trim())
          .filter(Boolean)
          .map((chunk) => {
            const items = chunk.split(",");
            return {
              betAreaId: toNumber(items[0], 0),
              betGold: toNumber(items[1], 0),
              betMultiple: toNumber(items[2], 0),
              winLoseGold: toNumber(items[3], 0),
              num: toNumber(items[4], 0),
              iconMultiple: toNumber(items[5], 0),
              iconId: toNumber(items[6], 0),
            };
          });
      }

      return result;
    });
}

const HSHWK_LINE_INDEX_MAP = {
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

const HSHWK_ICON_ATLAS = {
  url: "/hshwk-rollers-bg.webp",
  frames: {
    1: { x: 407, y: 3, width: 186, height: 187, rotated: false, originalWidth: 186, originalHeight: 187, offset: { x: 0, y: 0 } },
    2: { x: 597, y: 3, width: 182, height: 186, rotated: false, originalWidth: 182, originalHeight: 186, offset: { x: 0, y: 0 } },
    3: { x: 214, y: 3, width: 208, height: 189, rotated: true, originalWidth: 238, originalHeight: 189, offset: { x: 15, y: 0 } },
    11: { x: 573, y: 194, width: 150, height: 178, rotated: true, originalWidth: 150, originalHeight: 178, offset: { x: 0, y: 0 } },
    12: { x: 407, y: 194, width: 162, height: 162, rotated: false, originalWidth: 202, originalHeight: 162, offset: { x: 20, y: 0 } },
    13: { x: 214, y: 215, width: 157, height: 142, rotated: false, originalWidth: 157, originalHeight: 142, offset: { x: 0, y: 0 } },
    14: { x: 3, y: 232, width: 145, height: 120, rotated: false, originalWidth: 145, originalHeight: 120, offset: { x: 0, y: 0 } },
    31: { x: 3, y: 3, width: 207, height: 225, rotated: false, originalWidth: 207, originalHeight: 225, offset: { x: 0, y: 0 } },
  },
};

const HSHWK_ICON_NAME_MAP = {
  31: "Bonus",
};

function transposeBoardIcons(rawIcons) {
  const icons = toArray(rawIcons).slice(0, 15);
  const result = [];

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const rawIndex = column * 3 + row;
      result.push(icons[rawIndex] !== undefined ? icons[rawIndex] : 0);
    }
  }

  return result;
}

function buildNormalLinePos(betAreaId, num) {
  const line = HSHWK_LINE_INDEX_MAP[toNumber(betAreaId, 0)] || [];
  const count = Math.max(0, Math.min(toNumber(num, line.length), line.length));
  return line.slice(0, count).map((value) => [Math.floor(value / 3), value % 3]);
}

function buildScatterLinePos(rawLinePos) {
  return toArray(rawLinePos)
    .map((item, column) => {
      const pos = toArray(item && item.pos);
      const row = toNumber(pos[0], 10);
      if (row === 10) return null;
      return [column, row];
    })
    .filter(Boolean);
}

function buildWinArea(area, index) {
  const betAreaId = toNumber(area && area.betAreaId, 0);
  const isScatter = betAreaId === 0;
  const linePos = isScatter
    ? buildScatterLinePos(area && area.linePos)
    : buildNormalLinePos(betAreaId, area && area.num);

  return {
    index,
    betAreaId,
    iconId: toNumber(area && area.iconId, 0),
    num: toNumber(area && area.num, 0),
    betGold: toNumber(area && area.betGold, 0),
    betMultiple: toNumber(area && area.betMultiple, 0),
    iconMultiple: toNumber(area && area.iconMultiple, 0),
    winLoseGold: toNumber(area && area.winLoseGold, 0),
    linePos,
    highlightKeys: linePos.map(([column, row]) => `${row}-${column}`),
    linePosText: linePos.map(([column, row]) => `${column}-${row}`).join(" / "),
    title: isScatter ? "Bonus" : `Line ${betAreaId}`,
  };
}

function sumWinLoseGold(winAreas) {
  return toArray(winAreas).reduce((total, area) => total + toNumber(area && area.winLoseGold, 0), 0);
}

function normalizePage(source, label) {
  const icons = parseIconList(source && source.icons);
  const winAreas = toArray(source && source.betAreas)
    .map((area, index) => {
      const normalized = {
        ...area,
        betAreaId: area && area.betAreaId !== undefined ? area.betAreaId : 0,
      };
      return buildWinArea(normalized, index);
    })
    .sort((left, right) => toNumber(left && left.betAreaId, 0) - toNumber(right && right.betAreaId, 0));

  return {
    label,
    icons: transposeBoardIcons(icons),
    raw: String((source && source.icons) || ""),
    columns: 5,
    rows: 3,
    winAreas,
    winLoseGold: toNumber(source && source.winLoseGold, sumWinLoseGold(winAreas)),
  };
}

export function buildHshwkViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const rawSpecialInfo = toArray(mergedSource.specialInfo || connection.specialInfo || betRecord.specialInfo);
  const specialPages = rawSpecialInfo.length ? rawSpecialInfo : parseSpecialInfoStr(mergedSource.specialInfoStr || "");
  const rounds = [normalizePage(mergedSource, "主盘")].concat(
    specialPages.map((item, index) => normalizePage(item, `阶段 ${index + 1}`))
  );

  return {
    mode: "slot",
    confName: "hshwk",
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    rounds,
    winAreas: rounds[0] ? rounds[0].winAreas : [],
    stageGridColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
    iconNameMap: HSHWK_ICON_NAME_MAP,
    iconAtlas: HSHWK_ICON_ATLAS,
  };
}
