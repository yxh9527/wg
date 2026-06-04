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

const HDBZ_LINE_INDEX_MAP = {
  1: [1, 4, 7],
  2: [0, 3, 6],
  3: [2, 5, 8],
  4: [0, 4, 8],
  5: [2, 4, 6],
};

const HDBZ_ICON_ATLAS = {
  url: "/hdbz-rollers-bg.webp",
  frames: {
    1: { x: 0, y: 761, width: 282, height: 230, rotated: false, originalWidth: 282, originalHeight: 230, offset: { x: 0, y: 0 } },
    2: { x: 0, y: 1221, width: 282, height: 232, rotated: false, originalWidth: 282, originalHeight: 232, offset: { x: 0, y: 0 } },
    3: { x: 0, y: 363, width: 327, height: 199, rotated: false, originalWidth: 327, originalHeight: 199, offset: { x: 0, y: 0 } },
    11: { x: 0, y: 562, width: 233, height: 199, rotated: false, originalWidth: 233, originalHeight: 199, offset: { x: 0, y: 0 } },
    12: { x: 0, y: 176, width: 270, height: 187, rotated: false, originalWidth: 270, originalHeight: 187, offset: { x: 0, y: 0 } },
    13: { x: 0, y: 0, width: 247, height: 176, rotated: false, originalWidth: 247, originalHeight: 176, offset: { x: 0, y: 0 } },
    21: { x: 0, y: 991, width: 283, height: 230, rotated: false, originalWidth: 283, originalHeight: 230, offset: { x: 0, y: 0 } },
    31: { x: 0, y: 1453, width: 286, height: 232, rotated: false, originalWidth: 286, originalHeight: 232, offset: { x: 0, y: 0 } },
  },
};

const HDBZ_FUZZY_ATLAS = {
  url: "/hdbz-fuzzy-bg.webp",
  frames: {
    1: { x: 1, y: 1000, width: 282, height: 252, rotated: false, originalWidth: 282, originalHeight: 252, offset: { x: 0, y: 0 } },
    2: { x: 1, y: 745, width: 282, height: 253, rotated: false, originalWidth: 282, originalHeight: 253, offset: { x: 0, y: 0 } },
    3: { x: 1, y: 1, width: 314, height: 229, rotated: false, originalWidth: 314, originalHeight: 229, offset: { x: 0, y: 0 } },
    11: { x: 1, y: 1676, width: 201, height: 228, rotated: true, originalWidth: 201, originalHeight: 228, offset: { x: 0, y: 0 } },
    12: { x: 1, y: 1254, width: 249, height: 215, rotated: false, originalWidth: 249, originalHeight: 215, offset: { x: 0, y: 0 } },
    13: { x: 1, y: 1471, width: 238, height: 203, rotated: false, originalWidth: 238, originalHeight: 203, offset: { x: 0, y: 0 } },
    21: { x: 1, y: 232, width: 285, height: 256, rotated: false, originalWidth: 285, originalHeight: 256, offset: { x: 0, y: 0 } },
    31: { x: 1, y: 490, width: 285, height: 253, rotated: false, originalWidth: 285, originalHeight: 253, offset: { x: 0, y: 0 } },
  },
};

const HDBZ_ICON_NAME_MAP = {
  21: "Wild",
  31: "Bonus",
};

function transposeBoardIcons(rawIcons) {
  const icons = toArray(rawIcons).slice(0, 9);
  const result = [];

  for (let visualRow = 0; visualRow < 3; visualRow += 1) {
    for (let visualCol = 0; visualCol < 3; visualCol += 1) {
      const rawIndex = visualCol * 3 + visualRow;
      result.push(icons[rawIndex] !== undefined ? icons[rawIndex] : 0);
    }
  }

  return result;
}

function buildVisualLinePos(betAreaId) {
  const line = HDBZ_LINE_INDEX_MAP[toNumber(betAreaId, 0)] || [];
  return line.map((index) => {
    const logicalRow = Math.floor(index / 3);
    const logicalCol = index % 3;
    return [logicalCol, logicalRow];
  });
}

function buildWinArea(area, index) {
  const linePos = buildVisualLinePos(area && area.betAreaId);
  return {
    index,
    betAreaId: toNumber(area && area.betAreaId, 0),
    iconId: toNumber(area && area.iconId, 0),
    num: toNumber(area && area.num, 0),
    betGold: toNumber(area && area.betGold, 0),
    betMultiple: toNumber(area && area.betMultiple, 0),
    iconMultiple: toNumber(area && area.iconMultiple, 0),
    exMultiple: toNumber(area && area.exMultiple, 0),
    winLoseGold: toNumber(area && area.winLoseGold, 0),
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: linePos.map(([row, col]) => `${row + 1}-${col + 1}`).join(" / "),
  };
}

function buildRound(source, roundIndex, label, winAreasOverride) {
  const rawIcons = parseIconList(source && source.icons);
  const winAreas = toArray(winAreasOverride !== undefined ? winAreasOverride : source && source.betAreas)
    .slice()
    .sort((left, right) => toNumber(left && left.betAreaId, 0) - toNumber(right && right.betAreaId, 0))
    .map((area, index) => buildWinArea(area, index));

  return {
    roundIndex,
    label,
    icons: transposeBoardIcons(rawIcons),
    raw: String((source && source.icons) || ""),
    columns: 3,
    rows: 3,
    winAreas,
    winLoseGold: toNumber(source && source.winLoseGold, winAreas.reduce((total, area) => total + toNumber(area && area.winLoseGold, 0), 0)),
  };
}

export function buildHdbzViewModel(parsed) {
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
  const parsedSpecialInfo = rawSpecialInfo.length ? rawSpecialInfo : parseSpecialInfoStr(mergedSource.specialInfoStr || "");
  const lastSpecialPage = parsedSpecialInfo.length ? parsedSpecialInfo[parsedSpecialInfo.length - 1] : null;
  const hasSpecialPage = !!lastSpecialPage;

  const rounds = [
    buildRound(
      mergedSource,
      0,
      "主盘",
      hasSpecialPage ? [] : mergedSource.betAreas || betRecord.betAreas || []
    ),
  ];

  if (hasSpecialPage) {
    rounds.push(buildRound(lastSpecialPage, 1, "奖励阶段"));
  }

  return {
    mode: "slot",
    confName: "hdbz",
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    rounds,
    winAreas: rounds[rounds.length - 1].winAreas,
    iconNameMap: HDBZ_ICON_NAME_MAP,
    iconAtlas: HDBZ_ICON_ATLAS,
    fuzzyAtlas: HDBZ_FUZZY_ATLAS,
  };
}
