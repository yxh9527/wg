function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

const CJWP_ICON_NAME_MAP = {
  1: "图标1",
  2: "图标2",
  3: "图标3",
  4: "图标4",
  11: "图标11",
  12: "图标12",
  13: "图标13",
  14: "图标14",
  41: "图标41",
  42: "图标42",
  43: "图标43",
  44: "图标44",
  51: "图标51",
  52: "图标52",
  53: "图标53",
  54: "图标54",
  "21-zh": "百搭1",
  "22-zh": "百搭2",
  "31-zh": "Scatter",
};

const CJWP_ICON_ATLAS = {
  url: "/cjwp-rollers-bg.webp",
  swapRotatedSize: true,
  rotateDegrees: -90,
  frames: {
    1: { x: 3, y: 227, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    2: { x: 243, y: 3, width: 190, height: 247, rotated: true, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    3: { x: 3, y: 478, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    4: { x: 494, y: 3, width: 190, height: 247, rotated: true, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    11: { x: 3, y: 729, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    12: { x: 745, y: 3, width: 190, height: 247, rotated: true, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    13: { x: 197, y: 227, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    14: { x: 197, y: 478, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    41: { x: 391, y: 699, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    42: { x: 585, y: 448, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    43: { x: 779, y: 197, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    44: { x: 585, y: 699, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    51: { x: 779, y: 448, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    52: { x: 779, y: 699, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    53: { x: 973, y: 197, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    54: { x: 973, y: 448, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    "21-zh": { x: 391, y: 197, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    "22-zh": { x: 585, y: 197, width: 190, height: 247, rotated: false, originalWidth: 190, originalHeight: 247, offset: { x: 0, y: 0 } },
    "31-zh": { x: 973, y: 699, width: 197, height: 221, rotated: false, originalWidth: 197, originalHeight: 221, offset: { x: 0, y: 0 } },
  },
};

function normalizeIconKey(icon) {
  const value = String(icon || "");
  if (value === "21" || value === "22" || value === "31") {
    return `${value}-zh`;
  }
  return value;
}

function buildCells(iconList) {
  return toArray(iconList).slice(0, 20).map((icon, index) => ({
    key: String(index),
    column: Math.floor(index / 4),
    row: index % 4,
    icon: String(icon),
    coordKey: `${Math.floor(index / 4)}-${index % 4}`,
  }));
}

function parseRoundLine(line, betSingle, betTimes, roundMultiple, index) {
  const parts = String(line || "").split("*");
  const iconId = normalizeIconKey(parts[0]);
  const iconMultiple = toNumber(parts[1], 0);
  const winLoseGold = toNumber(parts[2], 0);
  const reels = String(parts[3] || "")
    .split("|")
    .filter(Boolean);

  const linePos = [];
  let num = 1;

  reels.forEach((reel, columnIndex) => {
    const rows = String(reel)
      .split(",")
      .map((value) => toNumber(value, -1))
      .filter((value) => value >= 0);
    num *= rows.length || 1;
    rows.forEach((row) => {
      linePos.push([columnIndex, row]);
    });
  });

  return {
    index,
    lineNo: index + 1,
    iconId,
    betGold: betSingle,
    betMultiple: betTimes,
    num,
    iconMultiple,
    winLoseGold,
    linePos,
    highlightKeys: linePos.map(([column, row]) => `${column}-${row}`),
    formula: `(${betSingle} x ${betTimes} x ${num} x ${iconMultiple} x ${roundMultiple})`,
  };
}

function parseRound(roundText, betSingle, betTimes, roundMultiple) {
  const parts = String(roundText || "").split("#");
  const icons = String(parts[0] || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const lineData = parts[1] ? safeJsonParse(parts[1], []) : [];

  return {
    raw: roundText,
    icons,
    cells: buildCells(icons),
    winAreas: toArray(lineData).map((line, index) => parseRoundLine(line, betSingle, betTimes, roundMultiple, index)),
  };
}

function roundMultiplier(inningIndex, roundIndex) {
  const values = inningIndex > 0 ? [2, 4, 6, 10] : [1, 2, 3, 5];
  return values[Math.min(Math.max(roundIndex, 0), 3)] || values[0];
}

function stageLabel(inningIndex) {
  return inningIndex === 0 ? "普通旋转" : `免费旋转 ${inningIndex}`;
}

function stageWinLoseGold(stageText) {
  const parts = String(stageText || "").split("$");
  return toNumber(parts[1], 0);
}

function parseStages(specialInfoStr, betSingle, betTimes, timestampList) {
  const stagesRaw = safeJsonParse(specialInfoStr || "[]", []);
  let roundCursor = 0;

  return toArray(stagesRaw).map((stageText, inningIndex) => {
    const parts = String(stageText || "").split("$");
    const roundsRaw = safeJsonParse(parts[0] || "[]", []);
    const pages = toArray(roundsRaw).map((roundText, roundIndex) => {
      const multiplier = roundMultiplier(inningIndex, roundIndex);
      const parsedRound = parseRound(roundText, betSingle, betTimes, multiplier);
      const page = {
        key: `inning-${inningIndex}-round-${roundIndex}`,
        inningIndex,
        roundIndex,
        roundLabel: `第${roundIndex + 1}回合`,
        roundTime: toArray(timestampList)[roundCursor] || "",
        rewardMultiplier: multiplier,
        ...parsedRound,
      };
      roundCursor += 1;
      return page;
    });

    return {
      key: `inning-${inningIndex}`,
      label: stageLabel(inningIndex),
      inningIndex,
      pages,
      totalWinLoseGold: stageWinLoseGold(stageText),
    };
  });
}

export function buildCjwpViewModel(parsed) {
  const source = parsed.source || {};
  const connectionRecord = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connectionRecord,
    ...source,
  };

  const betSingle = toNumber(mergedSource.betSingle, 0);
  const betTimes = toNumber(mergedSource.betTimes, 0);
  const stages = parseStages(mergedSource.specialInfoStr, betSingle, betTimes, mergedSource.timestampList).filter(
    (stage) => stage.pages.length
  );

  return {
    mode: "cjwp",
    confName: "cjwp",
    betSingle,
    betTimes,
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    iconAtlas: CJWP_ICON_ATLAS,
    fuzzyAtlas: CJWP_ICON_ATLAS,
    iconNameMap: CJWP_ICON_NAME_MAP,
    stages,
  };
}
