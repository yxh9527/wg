function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseSpecialInfoStr(value) {
  if (!value) return [];
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch (error) {
      return [];
    }
  }
  return toArray(parsed);
}

function parseStageSpecialInfo(value) {
  const parts = String(value || "").split("#");
  const stage = {
    betAreaCount: toNumber(parts[0], 0),
    winLoseGold: toNumber(parts[2], 0),
    icons: parts[3] || "",
    betAreas: [],
  };

  let rawAreas = [];
  try {
    rawAreas = parts[1] ? JSON.parse(parts[1]) : [];
  } catch (error) {
    rawAreas = [];
  }

  stage.betAreas = toArray(rawAreas).map((row) => {
    const cols = String(row || "").split(",");
    const linePos = [];
    for (let index = 7; index < cols.length; index += 2) {
      linePos.push({
        pos: [toNumber(cols[index], 0), toNumber(cols[index + 1], 0)],
      });
    }
    return {
      betAreaId: toNumber(cols[0], 0),
      betGold: toNumber(cols[1], 0),
      winLoseGold: toNumber(cols[2], 0),
      num: toNumber(cols[3], 0),
      betMultiple: toNumber(cols[4], 0),
      iconMultiple: toNumber(cols[5], 0),
      iconId: toNumber(cols[6], 0),
      linePos,
    };
  });

  return stage;
}

function parseIconsRounds(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((round, roundIndex) => {
      const cols = round.split(",").map((item) => item.trim());
      return {
        roundIndex,
        icons: cols.slice(0, 20).map((item) => item),
        rewardRoad: toNumber(cols[20], 0),
        timeIndex: toNumber(cols[21], 0),
        rewardMultiplier: toNumber(cols[22], 1),
        raw: round,
      };
    });
}

const XMWLJ_ICON_NAME_MAP = {
  1: "图标1",
  2: "图标2",
  3: "图标3",
  4: "图标4",
  11: "图标11",
  12: "图标12",
  13: "图标13",
  14: "图标14",
  15: "图标15",
  21: "金框",
  "21_en": "金框",
  31: "Scatter",
  "31_en": "Scatter",
  41: "图标41",
  42: "图标42",
  43: "图标43",
  44: "图标44",
  51: "图标51",
  52: "图标52",
  53: "图标53",
  54: "图标54",
  55: "图标55",
};

const XMWLJ_ICON_ATLAS = {
  url: "/xmwlj-rollers-bg.webp",
  swapRotatedSize: true,
  rotateDegrees: -90,
  frames: {
    1: { x: 3, y: 3, width: 214, height: 211, rotated: true, originalWidth: 224, originalHeight: 211, offset: { x: -5, y: 0 } },
    2: { x: 638, y: 213, width: 209, height: 203, rotated: false, originalWidth: 209, originalHeight: 203, offset: { x: 0, y: 0 } },
    3: { x: 845, y: 420, width: 188, height: 170, rotated: true, originalWidth: 188, originalHeight: 170, offset: { x: 0, y: 0 } },
    4: { x: 843, y: 633, width: 195, height: 170, rotated: true, originalWidth: 195, originalHeight: 170, offset: { x: 0, y: 0 } },
    11: { x: 787, y: 842, width: 166, height: 177, rotated: true, originalWidth: 166, originalHeight: 177, offset: { x: 0, y: 0 } },
    12: { x: 214, y: 863, width: 141, height: 194, rotated: true, originalWidth: 141, originalHeight: 194, offset: { x: 0, y: 0 } },
    13: { x: 412, y: 863, width: 141, height: 167, rotated: true, originalWidth: 141, originalHeight: 167, offset: { x: 0, y: 0 } },
    14: { x: 583, y: 847, width: 200, height: 161, rotated: false, originalWidth: 200, originalHeight: 161, offset: { x: 0, y: 0 } },
    15: { x: 3, y: 881, width: 127, height: 171, rotated: true, originalWidth: 127, originalHeight: 171, offset: { x: 0, y: 0 } },
    21: { x: 3, y: 439, width: 217, height: 207, rotated: true, originalWidth: 217, originalHeight: 207, offset: { x: 0, y: 0 } },
    31: { x: 428, y: 3, width: 202, height: 211, rotated: true, originalWidth: 202, originalHeight: 211, offset: { x: 0, y: 0 } },
    41: { x: 3, y: 221, width: 214, height: 211, rotated: true, originalWidth: 224, originalHeight: 211, offset: { x: -5, y: 0 } },
    42: { x: 214, y: 439, width: 209, height: 206, rotated: true, originalWidth: 209, originalHeight: 206, offset: { x: 0, y: 0 } },
    43: { x: 214, y: 652, width: 207, height: 206, rotated: true, originalWidth: 207, originalHeight: 206, offset: { x: 0, y: 0 } },
    44: { x: 218, y: 3, width: 207, height: 206, rotated: true, originalWidth: 207, originalHeight: 206, offset: { x: 0, y: 0 } },
    51: { x: 218, y: 214, width: 207, height: 206, rotated: true, originalWidth: 207, originalHeight: 206, offset: { x: 0, y: 0 } },
    52: { x: 424, y: 425, width: 207, height: 206, rotated: true, originalWidth: 207, originalHeight: 206, offset: { x: 0, y: 0 } },
    53: { x: 424, y: 636, width: 207, height: 206, rotated: true, originalWidth: 207, originalHeight: 206, offset: { x: 0, y: 0 } },
    54: { x: 787, y: 3, width: 207, height: 206, rotated: false, originalWidth: 207, originalHeight: 206, offset: { x: 0, y: 0 } },
    55: { x: 428, y: 213, width: 207, height: 206, rotated: true, originalWidth: 207, originalHeight: 206, offset: { x: 0, y: 0 } },
    "21_en": { x: 3, y: 660, width: 217, height: 207, rotated: true, originalWidth: 217, originalHeight: 207, offset: { x: 0, y: 0 } },
    "31_en": { x: 634, y: 633, width: 205, height: 205, rotated: false, originalWidth: 205, originalHeight: 205, offset: { x: 0, y: 0 } },
    bg: { x: 634, y: 424, width: 205, height: 207, rotated: true, originalWidth: 205, originalHeight: 207, offset: { x: 0, y: 0 } },
  },
};

const XMWLJ_FUZZY_ATLAS = {
  url: "/xmwlj-fuzzy-bg.webp",
  swapRotatedSize: true,
  rotateDegrees: -90,
  frames: {
    1: { x: 3, y: 485, width: 212, height: 231, rotated: false, originalWidth: 212, originalHeight: 231, offset: { x: 0, y: 0 } },
    2: { x: 216, y: 3, width: 209, height: 232, rotated: false, originalWidth: 209, originalHeight: 232, offset: { x: 0, y: 0 } },
    3: { x: 804, y: 791, width: 188, height: 188, rotated: false, originalWidth: 188, originalHeight: 188, offset: { x: 0, y: 0 } },
    4: { x: 651, y: 467, width: 195, height: 190, rotated: false, originalWidth: 195, originalHeight: 190, offset: { x: 0, y: 0 } },
    11: { x: 636, y: 791, width: 164, height: 197, rotated: false, originalWidth: 164, originalHeight: 197, offset: { x: 0, y: 0 } },
    12: { x: 850, y: 440, width: 139, height: 212, rotated: true, originalWidth: 139, originalHeight: 212, offset: { x: 0, y: 0 } },
    13: { x: 996, y: 766, width: 140, height: 187, rotated: false, originalWidth: 140, originalHeight: 187, offset: { x: 0, y: 0 } },
    14: { x: 850, y: 583, width: 198, height: 179, rotated: false, originalWidth: 198, originalHeight: 179, offset: { x: 0, y: 0 } },
    15: { x: 651, y: 661, width: 126, height: 189, rotated: true, originalWidth: 126, originalHeight: 189, offset: { x: 0, y: 0 } },
    21: { x: 430, y: 473, width: 217, height: 226, rotated: false, originalWidth: 217, originalHeight: 226, offset: { x: 0, y: 0 } },
    31: { x: 640, y: 3, width: 202, height: 231, rotated: false, originalWidth: 202, originalHeight: 231, offset: { x: 0, y: 0 } },
    41: { x: 3, y: 245, width: 212, height: 236, rotated: false, originalWidth: 212, originalHeight: 236, offset: { x: 0, y: 0 } },
    42: { x: 3, y: 3, width: 209, height: 238, rotated: false, originalWidth: 209, originalHeight: 240, offset: { x: 0, y: -1 } },
    43: { x: 3, y: 720, width: 207, height: 231, rotated: false, originalWidth: 207, originalHeight: 231, offset: { x: 0, y: 0 } },
    44: { x: 214, y: 720, width: 207, height: 231, rotated: false, originalWidth: 207, originalHeight: 231, offset: { x: 0, y: 0 } },
    51: { x: 219, y: 239, width: 207, height: 231, rotated: false, originalWidth: 207, originalHeight: 231, offset: { x: 0, y: 0 } },
    52: { x: 429, y: 3, width: 207, height: 231, rotated: false, originalWidth: 207, originalHeight: 231, offset: { x: 0, y: 0 } },
    53: { x: 219, y: 474, width: 207, height: 231, rotated: false, originalWidth: 207, originalHeight: 231, offset: { x: 0, y: 0 } },
    54: { x: 425, y: 709, width: 207, height: 231, rotated: false, originalWidth: 207, originalHeight: 231, offset: { x: 0, y: 0 } },
    55: { x: 430, y: 238, width: 207, height: 231, rotated: false, originalWidth: 207, originalHeight: 231, offset: { x: 0, y: 0 } },
    "21_en": { x: 846, y: 3, width: 217, height: 224, rotated: false, originalWidth: 217, originalHeight: 224, offset: { x: 0, y: 0 } },
    "31_en": { x: 850, y: 231, width: 205, height: 224, rotated: true, originalWidth: 205, originalHeight: 224, offset: { x: 0, y: 0 } },
    bg: { x: 641, y: 238, width: 205, height: 225, rotated: false, originalWidth: 205, originalHeight: 225, offset: { x: 0, y: 0 } },
  },
};

function iconFrameKey(icon) {
  const value = String(icon || "");
  if (value === "21" || value === "31") return value;
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

function lineCount(linePos) {
  return toArray(linePos).reduce((result, item) => {
    const size = toArray(item && item.pos).length || 1;
    return result * size;
  }, 1);
}

function buildRoundWinArea(area, index, roundMultiplier) {
  const normalizedLinePos = toArray(area && area.linePos)
    .map((item) => {
      const pos = toArray(item && item.pos)
        .map((value) => toNumber(value, -1))
        .filter((value) => value >= 0);
      return {
        pos,
      };
    })
    .filter((item) => item.pos.length >= 2);

  const highlightKeys = normalizedLinePos.map((item) => `${item.pos[0]}-${item.pos[1]}`);
  const iconId = String(area && area.iconId !== undefined ? area.iconId : "");
  const betGold = toNumber(area && area.betGold, 0);
  const betMultiple = toNumber(area && area.betMultiple, 0);
  const iconMultiple = toNumber(area && area.iconMultiple, 0);
  const num = toNumber(area && area.num, 0);

  return {
    index,
    lineNo: toNumber(area && area.betAreaId, index + 1),
    betAreaId: toNumber(area && area.betAreaId, index + 1),
    iconId,
    num,
    betGold,
    betMultiple,
    iconMultiple,
    winLoseGold: toNumber(area && area.winLoseGold, 0),
    lineCount: lineCount(normalizedLinePos),
    highlightKeys,
    formula: `(${betGold} x ${betMultiple} x ${num} x ${iconMultiple} x ${roundMultiplier})`,
  };
}

function buildRoundPages(stage, commonRecord, timestampList) {
  const rounds = parseIconsRounds(stage.rawIcons);
  let areaOffset = 0;
  return rounds.map((round) => {
    const roundAreas = toArray(stage.betAreas).slice(areaOffset, areaOffset + round.rewardRoad);
    areaOffset += round.rewardRoad;
    const winAreas = roundAreas.map((area, index) => buildRoundWinArea(area, index, round.rewardMultiplier));
    const timestampValue = toArray(timestampList)[round.timeIndex];
    const scatterCount = round.icons.reduce((count, icon) => (String(icon) === "31" ? count + 1 : count), 0);
    return {
      key: `${stage.key}-${round.roundIndex}`,
      roundIndex: round.roundIndex,
      roundLabel: `第${round.roundIndex + 1}回合`,
      roundTime: timestampValue || commonRecord.settlementTimestamp || "",
      rewardMultiplier: round.rewardMultiplier,
      rewardRoad: round.rewardRoad,
      scatterCount,
      showFreeTrigger: round.roundIndex === rounds.length - 1 && scatterCount > 2,
      cells: buildCells(round.icons),
      winAreas,
      winLoseGold: toNumber(stage.winLoseGold, 0),
      rawIcons: round.raw,
    };
  });
}

function normalizeStages(connectionRecord, commonRecord) {
  const rawSpecialInfo = connectionRecord.specialInfo
    ? toArray(connectionRecord.specialInfo)
    : parseSpecialInfoStr(connectionRecord.specialInfoStr).map(parseStageSpecialInfo);

  const stages = [
    {
      key: "main",
      label: "普通旋转",
      mode: "main",
      rawIcons: connectionRecord.icons || "",
      winLoseGold: toNumber(connectionRecord.winLoseGold, 0),
      betAreas: toArray(connectionRecord.betAreas),
    },
  ];

  rawSpecialInfo.forEach((item, index) => {
    stages.push({
      key: `free-${index + 1}`,
      label: `免费旋转 ${index + 1}`,
      mode: "free",
      rawIcons: item && item.icons ? item.icons : "",
      winLoseGold: toNumber(item && item.winLoseGold, 0),
      betAreas: toArray(item && item.betAreas),
    });
  });

  return stages.map((stage) => ({
    ...stage,
    pages: buildRoundPages(stage, commonRecord, connectionRecord.timestampList),
    totalWinLoseGold: toNumber(stage.winLoseGold, 0),
  }));
}

export function buildXmwljViewModel(parsed) {
  const source = parsed.source || {};
  const connectionRecord = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connectionRecord,
    ...source,
  };

  const stages = normalizeStages(connectionRecord, commonRecord).filter((stage) => stage.pages.length);

  return {
    mode: "xmwlj",
    confName: "xmwlj",
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    iconAtlas: XMWLJ_ICON_ATLAS,
    fuzzyAtlas: XMWLJ_FUZZY_ATLAS,
    iconNameMap: XMWLJ_ICON_NAME_MAP,
    stages,
    iconFrameKey,
  };
}
