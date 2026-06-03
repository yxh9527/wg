import { toMoney } from "./settlementHelpers";

const BDYDS_ICON_ATLAS = {
  url: "/bdyds-game-ui.webp",
  frames: {
    1: {
      x: 242,
      y: 533,
      width: 76,
      height: 29,
      rotated: true,
      originalWidth: 106,
      originalHeight: 89,
      offset: { x: 0, y: 0 },
    },
    2: {
      x: 410,
      y: 619,
      width: 68,
      height: 35,
      rotated: true,
      originalWidth: 106,
      originalHeight: 89,
      offset: { x: 0, y: 2 },
    },
    3: {
      x: 424,
      y: 548,
      width: 46,
      height: 57,
      rotated: true,
      originalWidth: 106,
      originalHeight: 89,
      offset: { x: 0, y: 0 },
    },
    4: {
      x: 361,
      y: 619,
      width: 66,
      height: 45,
      rotated: true,
      originalWidth: 106,
      originalHeight: 89,
      offset: { x: -1, y: 0 },
    },
    5: {
      x: 275,
      y: 580,
      width: 80,
      height: 39,
      rotated: false,
      originalWidth: 106,
      originalHeight: 89,
      offset: { x: -1, y: 1 },
    },
    6: {
      x: 354,
      y: 236,
      width: 92,
      height: 41,
      rotated: true,
      originalWidth: 106,
      originalHeight: 89,
      offset: { x: -1, y: 0 },
    },
    7: {
      x: 309,
      y: 236,
      width: 102,
      height: 41,
      rotated: true,
      originalWidth: 106,
      originalHeight: 89,
      offset: { x: 0, y: 0 },
    },
  },
};

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseIconItems(rawIcons) {
  return String(rawIcons || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => {
      const [iconId, rate] = item.split(",");
      return {
        index,
        iconId: toNumber(iconId, 0),
        rate: toNumber(rate, 0),
      };
    });
}

export function buildBdydsViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const items = parseIconItems(mergedSource.icons);
  const totalRate = items.reduce((total, item) => total + item.rate, 0);
  const pageSize = 8;
  const pages = [];

  for (let index = 0; index < items.length; index += pageSize) {
    const pageItems = items.slice(index, index + pageSize);
    pages.push({
      pageIndex: pages.length,
      label: `第 ${pages.length + 1} 页`,
      items: pageItems,
      totalRate: pageItems.reduce((total, item) => total + item.rate, 0),
    });
  }

  return {
    mode: "bdyds",
    confName: "bdyds",
    totalBetGold: toNumber(mergedSource.betSum ?? mergedSource.totalBetGold ?? betRecord.totalBetGold, 0),
    totalWinLoseGold: toNumber(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold, 0),
    totalRate,
    itemCount: items.length,
    iconAtlas: BDYDS_ICON_ATLAS,
    pages: pages.length
      ? pages
      : [
          {
            pageIndex: 0,
            label: "第 1 页",
            items: [],
            totalRate: 0,
          },
        ],
    tags: [`总倍率 ${toMoney(totalRate)}`, `图标数 ${items.length}`],
  };
}
