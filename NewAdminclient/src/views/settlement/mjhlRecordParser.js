function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseSegmentIcons(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => toNumber(item, 0));
}

function stringifyLinePos(linePos) {
  if (!linePos.length) return "";
  return linePos.map(([column, row]) => `${column}-${row}`).join(" / ");
}

function parseLinePos(rawParts) {
  const result = [];
  for (let index = 0; index < rawParts.length; index += 2) {
    const column = toNumber(rawParts[index], NaN);
    const row = toNumber(rawParts[index + 1], NaN);
    if (Number.isFinite(column) && Number.isFinite(row)) {
      result.push([column, row]);
    }
  }
  return result;
}

function buildMjhlSpecialInfoEntry(raw) {
  const text = String(raw || "");
  if (!text) return null;

  const parts = text.split("#");
  const entry = {
    betAreaCount: toNumber(parts[0], 0),
    betAreas: [],
    winLoseGold: toNumber(parts[2], 0),
    icons: parts[3] || "",
  };

  let areaRows = [];
  try {
    areaRows = parts[1] ? JSON.parse(parts[1]) : [];
  } catch (error) {
    areaRows = [];
  }

  entry.betAreas = toArray(areaRows)
    .map((item) => String(item || ""))
    .filter(Boolean)
    .map((item) => {
      const areaParts = item.split(",");
      const linePos = parseLinePos(areaParts.slice(7));
      return {
        betAreaId: toNumber(areaParts[0], 0),
        betGold: toNumber(areaParts[1], 0),
        winLoseGold: toNumber(areaParts[2], 0),
        num: toNumber(areaParts[3], 0),
        betMultiple: toNumber(areaParts[4], 0),
        iconMultiple: toNumber(areaParts[5], 0),
        iconId: toNumber(areaParts[6], 0),
        linePos,
        highlightKeys: linePos.map(([column, row]) => `${row}-${column}`),
        linePosText: stringifyLinePos(linePos),
      };
    });

  return entry;
}

function parseMjhlSpecialInfo(rawValue) {
  if (Array.isArray(rawValue)) {
    return rawValue.map(buildMjhlSpecialInfoEntry).filter(Boolean);
  }

  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(String(rawValue));
    return toArray(parsed).map(buildMjhlSpecialInfoEntry).filter(Boolean);
  } catch (error) {
    return [];
  }
}

function createRoundAreas(betAreas, areaOffset, count, roundMultiplier) {
  const areaList = toArray(betAreas).slice(areaOffset, areaOffset + count);
  const roundAreas = areaList.map((area, index) => {
    const linePos = toArray(area.linePos)
      .map((item) => {
        if (Array.isArray(item)) return [toNumber(item[0], 0), toNumber(item[1], 0)];
        if (item && Array.isArray(item.pos)) return [toNumber(item.pos[0], 0), toNumber(item.pos[1], 0)];
        return null;
      })
      .filter(Boolean);
    const lineCount = linePos.reduce((total, item) => total * 1, 1) || 1;

    return {
      index,
      betAreaId: toNumber(area.betAreaId, 0),
      iconId: toNumber(area.iconId, 0),
      num: toNumber(area.num, 0),
      betGold: toNumber(area.betGold, 0),
      betMultiple: toNumber(area.betMultiple, 0),
      iconMultiple: toNumber(area.iconMultiple, 0),
      winLoseGold: toNumber(area.winLoseGold, 0),
      linePos,
      highlightKeys: linePos.map(([column, row]) => `${row}-${column}`),
      linePosText: stringifyLinePos(linePos),
      title: `线 ${toNumber(area.betAreaId, 0) || index + 1}`,
      formula: `(${toNumber(area.betGold, 0)} x ${toNumber(area.betMultiple, 0)} x ${lineCount} x ${toNumber(area.iconMultiple, 0)} x ${roundMultiplier})`,
    };
  });

  return roundAreas;
}

function buildItemRounds(item, labelPrefix, mode) {
  const rawRounds = String(item && item.icons ? item.icons : "")
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const betAreas = toArray(item && item.betAreas);
  let areaOffset = 0;

  return rawRounds.map((segment, roundIndex) => {
    const iconTokens = parseSegmentIcons(segment);
    const winLineCount = iconTokens.length ? toNumber(iconTokens[iconTokens.length - 1], 0) : 0;
    const icons = iconTokens.slice(0, Math.max(iconTokens.length - 1, 0));
    const roundMultiplier = mode === "free" ? [2, 4, 6, 10][Math.min(roundIndex, 3)] || 2 : [1, 2, 3, 5][Math.min(roundIndex, 3)] || 1;
    const roundAreas = createRoundAreas(betAreas, areaOffset, winLineCount, roundMultiplier);
    areaOffset += winLineCount;

    return {
      roundIndex,
      label: `${labelPrefix} 第 ${roundIndex + 1} 回合`,
      icons,
      raw: segment,
      timestamp: "",
      columns: 5,
      rows: 4,
      columnMajor: true,
      winAreas: roundAreas,
      winLoseGold: roundAreas.reduce((total, area) => total + toNumber(area.winLoseGold, 0), 0),
      roundMultiplier,
      freeTriggerCount: icons.filter((icon) => icon === 31).length,
    };
  });
}

const MJHL_ICON_ATLAS = {
  url: "/mjhl-rollers-bg.webp",
  frames: {
    1: { x: 1084, y: 259, width: 204, height: 245, originalWidth: 204, originalHeight: 245 },
    2: { x: 1091, y: 3, width: 204, height: 245, originalWidth: 204, originalHeight: 245 },
    3: { x: 1292, y: 252, width: 204, height: 245, originalWidth: 204, originalHeight: 245 },
    4: { x: 1299, y: 3, width: 204, height: 245, originalWidth: 204, originalHeight: 245 },
    11: { x: 1500, y: 252, width: 204, height: 245, originalWidth: 204, originalHeight: 245 },
    12: { x: 1507, y: 3, width: 204, height: 245, originalWidth: 204, originalHeight: 245 },
    13: { x: 1708, y: 252, width: 204, height: 245, originalWidth: 204, originalHeight: 245 },
    14: { x: 1715, y: 3, width: 204, height: 245, originalWidth: 204, originalHeight: 245 },
    21: { x: 875, y: 3, width: 212, height: 252, originalWidth: 212, originalHeight: 252 },
    31: { x: 875, y: 259, width: 205, height: 247, originalWidth: 205, originalHeight: 247 },
    41: { x: 3, y: 3, width: 214, height: 250, originalWidth: 214, originalHeight: 250 },
    42: { x: 3, y: 257, width: 214, height: 250, originalWidth: 214, originalHeight: 250 },
    43: { x: 221, y: 3, width: 214, height: 250, originalWidth: 214, originalHeight: 250 },
    44: { x: 221, y: 257, width: 214, height: 250, originalWidth: 214, originalHeight: 250 },
    51: { x: 439, y: 3, width: 214, height: 250, originalWidth: 214, originalHeight: 250 },
    52: { x: 439, y: 257, width: 214, height: 250, originalWidth: 214, originalHeight: 250 },
    53: { x: 657, y: 3, width: 214, height: 250, originalWidth: 214, originalHeight: 250 },
    54: { x: 657, y: 257, width: 214, height: 250, originalWidth: 214, originalHeight: 250 },
  },
};

const MJHL_FUZZY_ATLAS = {
  url: "/mjhl-fuzzy-bg.webp",
  frames: {
    1: { x: 858, y: 420, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    2: { x: 997, y: 420, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    3: { x: 1136, y: 420, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    4: { x: 858, y: 253, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    11: { x: 997, y: 253, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    12: { x: 1136, y: 253, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    13: { x: 997, y: 86, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    14: { x: 1136, y: 86, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    21: { x: 858, y: 86, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    31: { x: 719, y: 253, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    41: { x: 2, y: 2, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    42: { x: 141, y: 2, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    43: { x: 280, y: 2, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    44: { x: 419, y: 2, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    51: { x: 558, y: 2, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    52: { x: 697, y: 2, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    53: { x: 2, y: 169, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
    54: { x: 141, y: 169, width: 135, height: 163, originalWidth: 135, originalHeight: 163 },
  },
};

const MJHL_MAHJONG_ICON_ATLAS = {
  url: "/mjhl-icon-mahjong.webp",
  ignoreRotation: false,
  frames: {
    15: {
      x: 321,
      y: 468,
      width: 40,
      height: 31,
      originalWidth: 306,
      originalHeight: 322,
      offsetX: 139,
      offsetY: 80,
    },
    55: {
      x: 622,
      y: 504,
      width: 40,
      height: 45,
      originalWidth: 306,
      originalHeight: 322,
      offsetX: 139,
      offsetY: 73,
    },
  },
};

export function buildMjhlViewModel(parsed, confName = "mjhl") {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const specialInfo = parseMjhlSpecialInfo(mergedSource.specialInfoStr || connection.specialInfoStr || betRecord.specialInfoStr);
  const normalRounds = buildItemRounds(
    {
      icons: mergedSource.icons || "",
      betAreas: mergedSource.betAreas || betRecord.betAreas || [],
    },
    "普通",
    "normal"
  );
  const freeRounds = specialInfo.flatMap((item, index) => buildItemRounds(item, `免费 ${index + 1}`, "free"));
  const rounds = normalRounds.concat(freeRounds);

  if (!rounds.length) return null;

  return {
    mode: "slot",
    confName,
    betSingle: toNumber(mergedSource.betSingle, 0),
    betTimes: toNumber(mergedSource.betTimes, 0),
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    rounds,
    winAreas: rounds[0].winAreas,
    defaultActiveLineIndex: -1,
    iconAtlas: MJHL_ICON_ATLAS,
    fuzzyAtlas: null,
    iconImageMap: null,
    extraIconAtlases: {
      15: MJHL_MAHJONG_ICON_ATLAS,
      55: MJHL_MAHJONG_ICON_ATLAS,
    },
    stageGridColumns: "minmax(0, 1.12fr) minmax(300px, 0.88fr)",
    boardShellWidth: "100%",
    iconNameMap: {
      1: "二筒",
      2: "五条",
      3: "八万",
      4: "红中",
      11: "发财",
      12: "白板",
      13: "二条",
      14: "二万",
      15: "元宝",
      21: "Wild",
      31: "Scatter",
      41: "蓝",
      42: "蓝",
      43: "蓝",
      44: "蓝",
      51: "黄",
      52: "黄",
      53: "黄",
      54: "黄",
      55: "元宝",
    },
  };
}
