const JBP_ICON_ATLAS = {
  url: "/jbp-rollers-bg.webp",
  frames: {
    1: { x: 482, y: 1346, width: 478, height: 446, rotated: false, originalWidth: 478, originalHeight: 446, offset: { x: 0, y: 0 } },
    2: { x: 482, y: 898, width: 478, height: 446, rotated: false, originalWidth: 478, originalHeight: 446, offset: { x: 0, y: 0 } },
    3: { x: 482, y: 450, width: 478, height: 446, rotated: false, originalWidth: 478, originalHeight: 446, offset: { x: 0, y: 0 } },
    4: { x: 482, y: 2, width: 478, height: 446, rotated: false, originalWidth: 478, originalHeight: 446, offset: { x: 0, y: 0 } },
    5: { x: 2, y: 2, width: 478, height: 446, rotated: false, originalWidth: 478, originalHeight: 446, offset: { x: 0, y: 0 } },
    10: { x: 2, y: 1346, width: 478, height: 446, rotated: false, originalWidth: 478, originalHeight: 446, offset: { x: 0, y: 0 } },
    21: { x: 2, y: 898, width: 478, height: 446, rotated: false, originalWidth: 478, originalHeight: 446, offset: { x: 0, y: 0 } },
    31: { x: 2, y: 450, width: 478, height: 446, rotated: false, originalWidth: 478, originalHeight: 446, offset: { x: 0, y: 0 } },
  },
};

const JBP_FUZZY_ATLAS = {
  url: "/jbp-fuzzy-bg.webp",
  frames: {
    1: { x: 504, y: 1508, width: 500, height: 500, rotated: false, originalWidth: 500, originalHeight: 500, offset: { x: 0, y: 0 } },
    2: { x: 504, y: 1006, width: 500, height: 500, rotated: false, originalWidth: 500, originalHeight: 500, offset: { x: 0, y: 0 } },
    3: { x: 504, y: 504, width: 500, height: 500, rotated: false, originalWidth: 500, originalHeight: 500, offset: { x: 0, y: 0 } },
    4: { x: 504, y: 2, width: 500, height: 500, rotated: false, originalWidth: 500, originalHeight: 500, offset: { x: 0, y: 0 } },
    5: { x: 2, y: 2, width: 500, height: 500, rotated: false, originalWidth: 500, originalHeight: 500, offset: { x: 0, y: 0 } },
    10: { x: 2, y: 1508, width: 500, height: 500, rotated: false, originalWidth: 500, originalHeight: 500, offset: { x: 0, y: 0 } },
    21: { x: 2, y: 1006, width: 500, height: 500, rotated: false, originalWidth: 500, originalHeight: 500, offset: { x: 0, y: 0 } },
    31: { x: 2, y: 504, width: 500, height: 500, rotated: false, originalWidth: 500, originalHeight: 500, offset: { x: 0, y: 0 } },
  },
};

function safeJsonParse(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function buildBoard(screen) {
  const cells = [];
  const columns = toArray(screen);
  columns.slice(0, 3).forEach((columnValues, columnIndex) => {
    toArray(columnValues)
      .slice(0, 3)
      .forEach((icon, rowIndex) => {
        cells.push({
          key: `${columnIndex}-${rowIndex}`,
          column: columnIndex,
          row: rowIndex,
          icon: toNumber(icon, 0),
        });
      });
  });
  return cells;
}

function normalizeHighlightPos(pos) {
  if (Array.isArray(pos) && pos.length >= 2) {
    return `${toNumber(pos[0], 0)}-${toNumber(pos[1], 0)}`;
  }
  const numeric = toNumber(pos, -1);
  if (numeric < 0) return "";
  return `${numeric % 3}-${Math.floor(numeric / 3)}`;
}

function buildPageWin(singleBet, betMulti, pageInfo, fallbackWin) {
  const info = pageInfo || {};
  const detailIcons = Array.isArray(info.icon) ? info.icon : [];
  const detailWin = detailIcons.reduce(
    (total, item) =>
      total +
      singleBet *
        betMulti *
        toNumber(item && item.score, 0) *
        Math.max(toNumber(item && item.amount, 1), 1),
    0
  );
  if (detailWin > 0) return detailWin;
  const totalScore = toNumber(info.total_score, 0);
  if (totalScore > 0) return singleBet * betMulti * totalScore;
  return toNumber(fallbackWin, 0);
}

function buildPageHighlights(pageInfo) {
  const detailIcons = Array.isArray(pageInfo && pageInfo.icon) ? pageInfo.icon : [];
  return detailIcons.reduce((result, item) => {
    toArray(item && item.pos)
      .map(normalizeHighlightPos)
      .filter(Boolean)
      .forEach((value) => result.add(value));
    return result;
  }, new Set());
}

export function buildJbpViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const specialInfo =
    safeJsonParse(connection.specialInfoStr) ||
    safeJsonParse(betRecord.specialInfoStr) ||
    safeJsonParse(source.specialInfoStr) ||
    {};

  const singleBet = toNumber(specialInfo.single_bet ?? mergedSource.betSingle, 0);
  const betMulti = toNumber(specialInfo.bet_multi ?? mergedSource.betTimes, 0);
  const screens = toArray(specialInfo.Screen);
  const totalWinLoseGold = toNumber(
    specialInfo.win ?? mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold,
    0
  );

  const pages = screens.map((page, index) => {
    const pageInfo = page && page.info ? page.info : {};
    const cells = buildBoard(page && page.screen);
    const highlightKeys = Array.from(buildPageHighlights(pageInfo));
    const detailItems = Array.isArray(pageInfo.icon) ? pageInfo.icon : [];
    return {
      pageIndex: index,
      label: index === 0 ? "\u4e3b\u76d8" : `\u9636\u6bb5 ${index}`,
      pageType:
        index === 0
          ? "main"
          : Array.isArray(page && page.screen) && page.screen.length === 1
            ? "settlement"
            : "bonus",
      cells,
      detailItems: detailItems.map((item, itemIndex) => ({
        key: `${index}-${itemIndex}`,
        icon: toNumber(item && item.icon, 0),
        score: toNumber(item && item.score, 0),
        amount: toNumber(item && item.amount, 0),
        formula: `${singleBet} x ${betMulti} x ${toNumber(item && item.score, 0)}`,
      })),
      totalScore: toNumber(pageInfo.total_score, 0),
      winLoseGold: buildPageWin(singleBet, betMulti, pageInfo, index === 0 ? totalWinLoseGold : 0),
      highlightKeys,
    };
  });

  return {
    mode: "jbp",
    confName: "jbp",
    betSingle: singleBet,
    betTimes: betMulti,
    totalBetGold: toNumber(mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold,
    bgMode: toNumber(specialInfo.bg_mode, 0),
    iconAtlas: JBP_ICON_ATLAS,
    fuzzyAtlas: JBP_FUZZY_ATLAS,
    pages: pages.length
      ? pages
      : [
          {
            pageIndex: 0,
            label: "\u4e3b\u76d8",
            pageType: "main",
            cells: [],
            detailItems: [],
            totalScore: 0,
            winLoseGold: totalWinLoseGold,
            highlightKeys: [],
          },
        ],
  };
}
