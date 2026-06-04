function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseNumberList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => toNumber(item, 0));
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

const SJNW_LINE_INFO_MAP = {
  1: [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1]],
  2: [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
  3: [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2]],
  4: [[1, 0], [2, 1], [3, 2], [4, 1], [5, 0]],
  5: [[1, 2], [2, 1], [3, 0], [4, 1], [5, 2]],
  6: [[1, 0], [2, 0], [3, 1], [4, 0], [5, 0]],
  7: [[1, 2], [2, 2], [3, 1], [4, 2], [5, 2]],
  8: [[1, 1], [2, 2], [3, 2], [4, 2], [5, 1]],
  9: [[1, 1], [2, 0], [3, 0], [4, 0], [5, 1]],
  10: [[1, 0], [2, 1], [3, 1], [4, 1], [5, 0]],
  11: [[1, 2], [2, 1], [3, 1], [4, 1], [5, 2]],
  12: [[1, 1], [2, 1], [3, 0], [4, 1], [5, 1]],
  13: [[1, 1], [2, 1], [3, 2], [4, 1], [5, 1]],
  14: [[1, 1], [2, 0], [3, 1], [4, 0], [5, 1]],
  15: [[1, 1], [2, 2], [3, 1], [4, 2], [5, 1]],
  16: [[1, 0], [2, 1], [3, 0], [4, 1], [5, 0]],
  17: [[1, 2], [2, 1], [3, 2], [4, 1], [5, 2]],
  18: [[1, 0], [2, 0], [3, 1], [4, 2], [5, 2]],
  19: [[1, 2], [2, 2], [3, 1], [4, 0], [5, 0]],
  20: [[1, 0], [2, 2], [3, 0], [4, 2], [5, 0]],
};

const SJNW_ICON_NAME_MAP = {
  1: "图标1",
  2: "图标2",
  3: "图标3",
  4: "图标4",
  11: "图标11",
  12: "图标12",
  13: "图标13",
  21: "百搭",
  31: "免费",
};

const SJNW_ICON_ATLAS = {
  url: "/sjnw-rollers-bg.webp",
  frames: {
    1: { x: 3, y: 3, width: 209, height: 209, rotated: false, originalWidth: 209, originalHeight: 209, offset: { x: 0, y: 0 } },
    2: { x: 216, y: 3, width: 209, height: 209, rotated: false, originalWidth: 209, originalHeight: 209, offset: { x: 0, y: 0 } },
    3: { x: 429, y: 3, width: 209, height: 209, rotated: false, originalWidth: 209, originalHeight: 209, offset: { x: 0, y: 0 } },
    4: { x: 642, y: 3, width: 209, height: 209, rotated: false, originalWidth: 209, originalHeight: 209, offset: { x: 0, y: 0 } },
    11: { x: 3, y: 216, width: 209, height: 209, rotated: false, originalWidth: 209, originalHeight: 209, offset: { x: 0, y: 0 } },
    12: { x: 216, y: 216, width: 209, height: 209, rotated: false, originalWidth: 209, originalHeight: 209, offset: { x: 0, y: 0 } },
    13: { x: 429, y: 216, width: 209, height: 209, rotated: false, originalWidth: 209, originalHeight: 209, offset: { x: 0, y: 0 } },
    21: {
      x: 642,
      y: 216,
      width: 209,
      height: 228,
      rotated: true,
      rotateDegrees: -90,
      originalWidth: 209,
      originalHeight: 228,
      offset: { x: 0, y: 0 },
    },
    31: { x: 235, y: 429, width: 213, height: 226, rotated: true, originalWidth: 213, originalHeight: 226, offset: { x: 0, y: 0 } },
    "21_en": {
      x: 3,
      y: 429,
      width: 209,
      height: 228,
      rotated: true,
      rotateDegrees: -90,
      originalWidth: 209,
      originalHeight: 228,
      offset: { x: 0, y: 0 },
    },
    "31_en": { x: 465, y: 429, width: 213, height: 225, rotated: true, originalWidth: 213, originalHeight: 225, offset: { x: 0, y: 0 } },
  },
};

const SJNW_FUZZY_ATLAS = {
  url: "/sjnw-fuzzy-bg.webp",
  frames: {
    1: { x: 437, y: 3, width: 209, height: 239, rotated: false, originalWidth: 209, originalHeight: 239, offset: { x: 0, y: 0 } },
    2: { x: 527, y: 246, width: 209, height: 239, rotated: true, originalWidth: 209, originalHeight: 239, offset: { x: 0, y: 0 } },
    3: { x: 650, y: 3, width: 209, height: 239, rotated: false, originalWidth: 209, originalHeight: 239, offset: { x: 0, y: 0 } },
    4: { x: 770, y: 246, width: 209, height: 239, rotated: true, originalWidth: 209, originalHeight: 239, offset: { x: 0, y: 0 } },
    11: { x: 863, y: 3, width: 209, height: 239, rotated: false, originalWidth: 209, originalHeight: 239, offset: { x: 0, y: 0 } },
    12: { x: 1013, y: 246, width: 209, height: 239, rotated: true, originalWidth: 209, originalHeight: 239, offset: { x: 0, y: 0 } },
    13: { x: 1076, y: 3, width: 209, height: 239, rotated: false, originalWidth: 209, originalHeight: 239, offset: { x: 0, y: 0 } },
    21: {
      x: 3,
      y: 262,
      width: 209,
      height: 258,
      rotated: true,
      rotateDegrees: -90,
      originalWidth: 209,
      originalHeight: 258,
      offset: { x: 0, y: 0 },
    },
    31: { x: 3, y: 3, width: 213, height: 255, rotated: false, originalWidth: 213, originalHeight: 255, offset: { x: 0, y: 0 } },
    "21_en": {
      x: 265,
      y: 262,
      width: 209,
      height: 258,
      rotated: true,
      rotateDegrees: -90,
      originalWidth: 209,
      originalHeight: 258,
      offset: { x: 0, y: 0 },
    },
    "31_en": { x: 220, y: 3, width: 213, height: 255, rotated: false, originalWidth: 213, originalHeight: 255, offset: { x: 0, y: 0 } },
  },
};

function calculateRoundMultiple(freeIndex, mode, roundIndex) {
  let list = [1, 2, 3, 5];
  if (mode !== "main" && freeIndex === 2) {
    list = [3, 6, 9, 20];
  } else if (mode !== "main" && freeIndex === 3) {
    list = [6, 12, 18, 40];
  }
  const safeIndex = Math.min(Math.max(toNumber(roundIndex, 0), 0), 3);
  return {
    active: list[safeIndex] || list[0],
    values: list,
  };
}

function parseSegmentIcons(value) {
  const parts = String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item !== "");
  if (!parts.length) {
    return {
      roundTime: [],
      auto: 0,
      freeIndex: 1,
      pages: [],
    };
  }

  const roundTime = parts[0] ? parts[0].split(",").map((item) => item.trim()) : [];
  const optionList = parts[1] ? parts[1].split(",").map((item) => item.trim()) : [];
  const pages = parts.slice(2).map((item, pageIndex) => {
    const tokens = parseNumberList(item);
    const lineCount = tokens.length ? toNumber(tokens[tokens.length - 1], 0) : 0;
    return {
      pageIndex,
      raw: item,
      icons: tokens.slice(0, Math.max(tokens.length - 1, 0)),
      lineCount,
    };
  });

  return {
    roundTime,
    auto: toNumber(optionList[0], 0),
    freeIndex: toNumber(optionList[1], 1),
    pages,
  };
}

function parseSpecialStage(value) {
  const parts = String(value || "").split("#");
  const stage = {
    icons: parts[3] || "",
    winLoseGold: toNumber(parts[2], 0),
    betAreaCount: toNumber(parts[0], 0),
    betAreas: [],
  };
  let rows = [];
  try {
    rows = parts[1] ? JSON.parse(parts[1]) : [];
  } catch (error) {
    rows = [];
  }

  stage.betAreas = toArray(rows).map((row) => {
    const columns = String(row || "").split(",");
    const linePos = [];
    for (let index = 7; index < columns.length; index += 2) {
      linePos.push({
        pos: [toNumber(columns[index], 0), toNumber(columns[index + 1], 0)],
      });
    }
    return {
      betAreaId: toNumber(columns[0], 0),
      betGold: toNumber(columns[1], 0),
      winLoseGold: toNumber(columns[2], 0),
      num: toNumber(columns[3], 0),
      betMultiple: toNumber(columns[4], 0),
      iconMultiple: toNumber(columns[5], 0),
      iconId: toNumber(columns[6], 0),
      linePos,
    };
  });

  return stage;
}

function normalizeStages(connectionRecord) {
  const rawSpecialStages = connectionRecord.specialInfo
    ? toArray(connectionRecord.specialInfo)
    : parseSpecialInfoStr(connectionRecord.specialInfoStr).map(parseSpecialStage);
  return [
    {
      key: "main",
      label: "普通模式",
      mode: "main",
      rawIcons: connectionRecord.icons || "",
      winLoseGold: toNumber(connectionRecord.winLoseGold, 0),
      betAreas: toArray(connectionRecord.betAreas),
    },
  ].concat(
    rawSpecialStages.map((item, index) => ({
      key: `free-${index}`,
      label: `免费 ${index + 1}`,
      mode: "free",
      rawIcons: item && item.icons ? item.icons : "",
      winLoseGold: toNumber(item && item.winLoseGold, 0),
      betAreas: toArray(item && item.betAreas),
    }))
  );
}

function buildCells(iconList) {
  return toArray(iconList).slice(0, 15).map((icon, index) => ({
    key: String(index),
    column: Math.floor(index / 3),
    row: index % 3,
    icon: toNumber(icon, 0),
    coordKey: `${Math.floor(index / 3)}-${index % 3}`,
  }));
}

function findLineId(linePos, usedIds) {
  const target = toArray(linePos)
    .map((item) => toArray(item && item.pos))
    .filter((item) => item.length >= 2)
    .map((item) => [toNumber(item[0], 0) + 1, toNumber(item[1], 0)]);
  for (let id = 1; id <= 20; id += 1) {
    const line = SJNW_LINE_INFO_MAP[id];
    if (!line || usedIds.includes(id) || line.length !== target.length) continue;
    let matched = true;
    for (let index = 0; index < line.length; index += 1) {
      if (line[index][0] !== target[index][0] || line[index][1] !== target[index][1]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      usedIds.push(id);
      return id;
    }
  }
  return 0;
}

function buildWinArea(area, index, usedIds, roundMultiple) {
  const linePos = toArray(area && area.linePos)
    .map((item) => ({
      pos: toArray(item && item.pos).slice(0, 2).map((value) => toNumber(value, 0)),
    }))
    .filter((item) => item.pos.length >= 2);
  const lineId = findLineId(linePos, usedIds) || toNumber(area && area.betAreaId, index + 1);
  return {
    index,
    lineId,
    iconId: toNumber(area && area.iconId, 0),
    betGold: toNumber(area && area.betGold, 0),
    betMultiple: toNumber(area && area.betMultiple, 0),
    iconMultiple: toNumber(area && area.iconMultiple, 0),
    num: toNumber(area && area.num, 0),
    winLoseGold: toNumber(area && area.winLoseGold, 0),
    linePos,
    highlightKeys: linePos.map((item) => `${item.pos[0]}-${item.pos[1]}`),
    formula: `(${toNumber(area && area.betGold, 0)} x ${toNumber(area && area.betMultiple, 0)} x ${toNumber(
      area && area.iconMultiple,
      0
    )} x ${roundMultiple})`,
  };
}

function buildStageView(stage, stageIndex, betSingle, betTimes) {
  const parsed = parseSegmentIcons(stage.rawIcons);
  let lineOffset = 0;
  const pages = parsed.pages.map((page, roundIndex) => {
    const currentAreas = toArray(stage.betAreas).slice(lineOffset, lineOffset + page.lineCount);
    lineOffset += page.lineCount;
    const multipleInfo = calculateRoundMultiple(parsed.freeIndex, stage.mode, roundIndex);
    const usedIds = [];
    const winAreas = currentAreas.map((area, index) => buildWinArea(area, index, usedIds, multipleInfo.active));
    const scatterCount = page.icons.filter((icon) => toNumber(icon, 0) === 31).length;
    return {
      key: `${stage.key}-${roundIndex}`,
      stageKey: stage.key,
      roundIndex,
      roundLabel: `第${roundIndex + 1}回合`,
      roundTime: parsed.roundTime[roundIndex] || "",
      auto: parsed.auto,
      freeIndex: parsed.freeIndex,
      multiplierValues: multipleInfo.values,
      multiplierActive: multipleInfo.active,
      cells: buildCells(page.icons),
      lineCount: page.lineCount,
      winAreas,
      winLoseGold: winAreas.reduce((total, item) => total + toNumber(item && item.winLoseGold, 0), 0),
      scatterCount,
      showFreeTrigger: roundIndex === parsed.pages.length - 1 && scatterCount > 2,
    };
  });

  return {
    key: stage.key,
    label: stage.label,
    mode: stage.mode,
    stageIndex,
    betSingle,
    betTimes,
    freeIndex: parsed.freeIndex,
    auto: parsed.auto,
    totalWinLoseGold: toNumber(stage.winLoseGold, 0),
    pages,
  };
}

export function buildSjnwViewModel(parsed) {
  const source = parsed.source || {};
  const connectionRecord = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connectionRecord,
    ...source,
  };

  const stages = normalizeStages(connectionRecord).map((stage, index) =>
    buildStageView(stage, index, toNumber(mergedSource.betSingle, 0), toNumber(mergedSource.betTimes, 0))
  );

  return {
    mode: "sjnw",
    confName: "sjnw",
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    iconAtlas: SJNW_ICON_ATLAS,
    fuzzyAtlas: SJNW_FUZZY_ATLAS,
    iconNameMap: SJNW_ICON_NAME_MAP,
    stages,
  };
}
