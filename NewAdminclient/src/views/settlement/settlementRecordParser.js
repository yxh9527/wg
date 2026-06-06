import { formatUnixDateTime, toMoney } from "./settlementHelpers";

import { buildBdydsViewModel } from "./bdydsRecordParser";
import { buildJbpViewModel } from "./jbpRecordParser";
import { buildDwwgViewModel } from "./dwwgRecordParser";
import { buildJlbzViewModel } from "./jlbzRecordParser";
import { buildHdbzViewModel } from "./hdbzRecordParser";
import { buildHshwkViewModel } from "./hshwkRecordParser";
import { buildFksevenViewModel } from "./fksevenRecordParser";
import { buildMjhlViewModel } from "./mjhlRecordParser";
import { buildSbjnViewModel } from "./sbjnRecordParser";
import { buildJqtViewModel } from "./jqtRecordParser";
import { buildSjnwViewModel } from "./sjnwRecordParser";
import { buildJszcViewModel } from "./jszcRecordParser";
import { buildXmwljViewModel } from "./xmwljRecordParser";
import { buildCjwpViewModel } from "./cjwpRecordParser";

export const SUPPORTED_SETTLEMENT_DETAIL_GAME_IDS = new Set([
  1035,
  3001, 3002, 3003, 3004, 3005, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3022,
  3023, 3024, 3025, 3026, 3028, 3029, 3030, 3031, 3032, 3033, 3035, 3036, 3037, 3038, 3039, 3040, 3042, 3051, 5001,
  5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009, 5010, 5011, 5012, 5013, 5014, 5015, 5016, 5017, 5018,
]);

const GAME_CONF_NAME_MAP = {
  1035: "roulette",
  3001: "cjsgj",
  3002: "shz",
  3003: "lhdb",
  3004: "tgpd",
  3005: "dfdc",
  3008: "jfn",
  3009: "xldb",
  3010: "jqb",
  3011: "hgxs",
  3012: "worldcup",
  3013: "wcg",
  3014: "lzhd",
  3015: "rhdb",
  3016: "sbwh",
  3017: "cfmm",
  3018: "stkh",
  3019: "jbp",
  3020: "dwwg",
  3022: "bdyds",
  3023: "jlbz",
  3024: "hdbz",
  3025: "hshwk",
  3026: "fkseven",
  3028: "xldb2",
  3029: "mjhl",
  3030: "cjsgj2",
  3031: "hhsc",
  3032: "mjhl2",
  3033: "sbjn",
  3035: "jqt",
  3036: "sjnw",
  3037: "sjddj",
  3038: "jszc",
  3039: "xmwlj",
  3040: "cjwp",
  3042: "ssff",
  3051: "jlbs",
  5001: "yfct",
  5002: "ld",
  5003: "double",
  5004: "dice",
  5005: "bxsl",
  5006: "hilo",
  5007: "circle",
  5008: "plinko",
  5009: "keno",
  5010: "limbo",
  5011: "tower",
  5012: "slide",
  5013: "coin",
  5014: "spiritParty",
  5015: "bbjl",
  5016: "roulette",
  5017: "bhjk",
  5018: "baviator",
};

export function getSettlementConfName(gameId) {
  return GAME_CONF_NAME_MAP[Number(gameId)] || "";
}

const SLOT_GAME_CONF_NAMES = new Set([
  "cjsgj",
  "shz",
  "lhdb",
  "tgpd",
  "dfdc",
  "jfn",
  "xldb",
  "jqb",
  "hgxs",
  "worldcup",
  "wcg",
  "lzhd",
  "rhdb",
  "sbwh",
  "cfmm",
  "stkh",
  "jbp",
  "dwwg",
  "bdyds",
  "jlbz",
  "hdbz",
  "hshwk",
  "fkseven",
  "xldb2",
  "mjhl",
  "cjsgj2",
  "hhsc",
  "mjhl2",
  "sbjn",
  "jqt",
  "sjnw",
  "sjddj",
  "jszc",
  "xmwlj",
  "cjwp",
  "ssff",
  "jlbs",
]);

const QKLS_GAME_CONF_NAMES = new Set([
  "yfct",
  "ld",
  "double",
  "dice",
  "bxsl",
  "hilo",
  "circle",
  "plinko",
  "keno",
  "limbo",
  "tower",
  "slide",
  "coin",
  "spiritParty",
  "bbjl",
  "roulette",
  "bhjk",
  "baviator",
]);

const BBJL_AREA_LABELS = {
  1: "庄",
  2: "闲",
  3: "和",
};

const DICE_AREA_LABELS = {
  1: "大",
  2: "小",
};

const COIN_AREA_LABELS = {
  1: "金",
  2: "银",
};

const DOUBLE_AREA_LABELS = {
  1: "红",
  2: "黑",
};

const LD_AREA_LABELS = {
  1: "8-12",
  2: "2-6",
  3: "7",
};

const CIRCLE_DIFFICULTY_LABELS = {
  1: "低级",
  2: "中级",
  3: "高级",
};

const CIRCLE_SEGMENT_LABELS = {
  1: "10分段",
  2: "20分段",
  3: "30分段",
  4: "40分段",
  5: "50分段",
};

const CIRCLE_COLOR_LABELS = {
  1: "白色",
  2: "蓝色",
  3: "黄色",
  4: "绿色",
  5: "红色",
};

const COLOR_LABELS = {
  1: "绿色",
  2: "蓝色",
  3: "红色",
};

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function safeJsonParse(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function parseLooseStringArray(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
  const result = [];
  let current = "";
  let inString = false;
  let escape = false;

  for (let index = 1; index < trimmed.length - 1; index += 1) {
    const char = trimmed[index];

    if (!inString) {
      if (char === '"') {
        inString = true;
        current = "";
      }
      continue;
    }

    if (escape) {
      current += char;
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === '"') {
      const nextChar = trimmed[index + 1];
      if (nextChar === "," || nextChar === "]") {
        result.push(current);
        current = "";
        inString = false;
        continue;
      }
    }

    current += char;
  }

  return result.length ? result : null;
}

function unwrapJsonValue(value, depth = 0) {
  if (depth > 4) return value;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  const parsed = safeJsonParse(trimmed);
  if (parsed === null) return value;
  return unwrapJsonValue(parsed, depth + 1);
}

function stringifyValue(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

function pushEntry(entries, label, value, formatter) {
  if (value === null || value === undefined || value === "") return;
  entries.push({
    label,
    value: formatter ? formatter(value) : stringifyValue(value),
  });
}

function createEntriesBlock(title, entries) {
  const filtered = (entries || []).filter((entry) => entry && entry.value !== "");
  if (!filtered.length) return null;
  return {
    type: "entries",
    title,
    entries: filtered,
  };
}

function createTagsBlock(title, items) {
  const tags = (items || []).filter((item) => item !== null && item !== undefined && item !== "");
  if (!tags.length) return null;
  return {
    type: "tags",
    title,
    items: tags.map((item) => stringifyValue(item)),
  };
}

function createTableBlock(title, columns, rows) {
  const data = Array.isArray(rows) ? rows.filter((row) => row && Object.keys(row).length) : [];
  if (!data.length) return null;
  return {
    type: "table",
    title,
    columns,
    rows: data,
  };
}

function createJsonBlock(title, value) {
  if (value === null || value === undefined || value === "") return null;
  return {
    type: "json",
    title,
    value: stringifyValue(value),
  };
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

const ROULETTE_RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const ROULETTE_AREA_LABELS = {
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "11",
  12: "12",
  13: "13",
  14: "14",
  15: "15",
  16: "16",
  17: "17",
  18: "18",
  19: "19",
  20: "20",
  21: "21",
  22: "22",
  23: "23",
  24: "24",
  25: "25",
  26: "26",
  27: "27",
  28: "28",
  29: "29",
  30: "30",
  31: "31",
  32: "32",
  33: "33",
  34: "34",
  35: "35",
  36: "36",
  // broulette client mapping: clientv3/assets/broulette/index.18cc5.js -> BET_GAME_AREATEXT
  37: "\u7b2c1\u5217",
  38: "\u7b2c2\u5217",
  39: "\u7b2c3\u5217",
  40: "1-12",
  41: "13-24",
  42: "25-36",
  43: "\u5c0f",
  44: "\u53cc",
  45: "\u7ea2",
  46: "\u9ed1",
  47: "\u5355",
  48: "\u5927",
  6001: "\u7b2c1\u5217",
  6002: "\u7b2c2\u5217",
  6003: "\u7b2c3\u5217",
  7001: "1-12",
  7002: "13-24",
  7003: "25-36",
  8001: "\u5c0f",
  9001: "\u5927",
  10001: "\u53cc",
  11001: "\u5355",
  12001: "\u7ea2",
  13001: "\u9ed1",
  14001: "Tiers",
  15001: "Orphelins",
  16001: "Voisins",
  17001: "Zero",
};

const ROULETTE_COMBO_LABELS = {
  2001: "0\u30011",
  2002: "0\u30012",
  2003: "0\u30013",
  2004: "1\u30012",
  2005: "2\u30013",
  2006: "4\u30015",
  2007: "5\u30016",
  2008: "7\u30018",
  2009: "8\u30019",
  2010: "10\u300111",
  2011: "11\u300112",
  2012: "13\u300114",
  2013: "14\u300115",
  2014: "16\u300117",
  2015: "17\u300118",
  2016: "19\u300120",
  2017: "20\u300121",
  2018: "22\u300123",
  2019: "23\u300124",
  2020: "25\u300126",
  2021: "26\u300127",
  2022: "28\u300129",
  2023: "29\u300130",
  2024: "31\u300132",
  2025: "32\u300133",
  2026: "34\u300135",
  2027: "35\u300136",
  2028: "1\u30014",
  2029: "2\u30015",
  2030: "3\u30016",
  2031: "4\u30017",
  2032: "5\u30018",
  2033: "6\u30019",
  2034: "7\u300110",
  2035: "8\u300111",
  2036: "9\u300112",
  2037: "10\u300113",
  2038: "11\u300114",
  2039: "12\u300115",
  2040: "13\u300116",
  2041: "14\u300117",
  2042: "15\u300118",
  2043: "16\u300119",
  2044: "17\u300120",
  2045: "18\u300121",
  2046: "19\u300122",
  2047: "20\u300123",
  2048: "21\u300124",
  2049: "22\u300125",
  2050: "23\u300126",
  2051: "24\u300127",
  2052: "25\u300128",
  2053: "26\u300129",
  2054: "27\u300130",
  2055: "28\u300131",
  2056: "29\u300132",
  2057: "30\u300133",
  2058: "31\u300134",
  2059: "32\u300135",
  2060: "33\u300136",
  3001: "0\u30011\u30012",
  3002: "0\u30012\u30013",
  3003: "1\u30012\u30013",
  3004: "4\u30015\u30016",
  3005: "7\u30018\u30019",
  3006: "10\u300111\u300112",
  3007: "13\u300114\u300115",
  3008: "16\u300117\u300118",
  3009: "19\u300120\u300121",
  3010: "22\u300123\u300124",
  3011: "25\u300126\u300127",
  3012: "28\u300129\u300130",
  3013: "31\u300132\u300133",
  3014: "34\u300135\u300136",
  4001: "0\u30011\u30012\u30013",
  4002: "1\u30012\u30014\u30015",
  4003: "2\u30013\u30015\u30016",
  4004: "4\u30015\u30017\u30018",
  4005: "5\u30016\u30018\u30019",
  4006: "7\u30018\u300110\u300111",
  4007: "8\u30019\u300111\u300112",
  4008: "10\u300111\u300113\u300114",
  4009: "11\u300112\u300114\u300115",
  4010: "13\u300114\u300116\u300117",
  4011: "14\u300115\u300117\u300118",
  4012: "16\u300117\u300119\u300120",
  4013: "17\u300118\u300120\u300121",
  4014: "19\u300120\u300122\u300123",
  4015: "20\u300121\u300123\u300124",
  4016: "22\u300123\u300125\u300126",
  4017: "23\u300124\u300126\u300127",
  4018: "25\u300126\u300128\u300129",
  4019: "26\u300127\u300129\u300130",
  4020: "28\u300129\u300131\u300132",
  4021: "29\u300130\u300132\u300133",
  4022: "31\u300132\u300134\u300135",
  4023: "32\u300133\u300135\u300136",
  5001: "1\u30012\u30013\u30014\u30015\u30016",
  5002: "4\u30015\u30016\u30017\u30018\u30019",
  5003: "7\u30018\u30019\u300110\u300111\u300112",
  5004: "10\u300111\u300112\u300113\u300114\u300115",
  5005: "13\u300114\u300115\u300116\u300117\u300118",
  5006: "16\u300117\u300118\u300119\u300120\u300121",
  5007: "19\u300120\u300121\u300122\u300123\u300124",
  5008: "22\u300123\u300124\u300125\u300126\u300127",
  5009: "25\u300126\u300127\u300128\u300129\u300130",
  5010: "28\u300129\u300130\u300131\u300132\u300133",
  5011: "31\u300132\u300133\u300134\u300135\u300136",
};

function getRouletteAreaLabel(areaId) {
  const numericAreaId = Number(areaId);
  if (!Number.isFinite(numericAreaId)) return stringifyValue(areaId);
  if (numericAreaId >= 1000 && numericAreaId <= 1036) {
    return String(numericAreaId - 1000);
  }
  if (ROULETTE_AREA_LABELS[numericAreaId]) {
    return ROULETTE_AREA_LABELS[numericAreaId];
  }
  if (ROULETTE_COMBO_LABELS[numericAreaId]) {
    return ROULETTE_COMBO_LABELS[numericAreaId];
  }
  return String(numericAreaId);
}

function parseRouletteOpenNumber(value) {
  if (typeof value === "number" && value >= 0 && value <= 36) return value;
  const source = String(value === undefined || value === null ? "" : value).trim();
  if (!source) return null;
  const matched = source.match(/(^|[^0-9])([0-9]{1,2})(?![0-9])/);
  if (!matched) return null;
  const numeric = Number(matched[2]);
  return numeric >= 0 && numeric <= 36 ? numeric : null;
}

function buildRouletteResultEntries(rawValue) {
  const openNumber = parseRouletteOpenNumber(rawValue);
  const entries = [
    { label: "\u5f00\u5956\u53f7\u7801", value: stringifyValue(rawValue) },
  ];
  if (openNumber === null) return entries;

  const color = openNumber === 0 ? "\u7eff" : ROULETTE_RED_NUMBERS.has(openNumber) ? "\u7ea2" : "\u9ed1";
  entries.push({ label: "\u989c\u8272", value: color });

  if (openNumber !== 0) {
    entries.push(
      { label: "\u5927\u5c0f", value: openNumber >= 19 ? "\u5927" : "\u5c0f" },
      { label: "\u5355\u53cc", value: openNumber % 2 === 0 ? "\u53cc" : "\u5355" },
      {
        label: "\u5206\u6bb5",
        value: openNumber <= 12 ? "1-12" : openNumber <= 24 ? "13-24" : "25-36",
      },
      {
        label: "\u5217",
        value: `\u7b2c${((openNumber - 1) % 3) + 1}\u5217`,
      }
    );
  }
  return entries;
}

function parseStructuredField(value) {
  const unwrapped = unwrapJsonValue(value);
  if (isObject(unwrapped) || Array.isArray(unwrapped)) return unwrapped;
  if (typeof unwrapped === "string") {
    const looseArray = parseLooseStringArray(unwrapped);
    if (looseArray) return looseArray;
  }
  return null;
}

function normalizeRecordLog(log) {
  const raw = unwrapJsonValue(log);
  if (isObject(raw) && (raw.commonRecord || raw.betRecord || raw.connectionRecord)) {
    return finalizeRecord(raw, raw);
  }

  if (isObject(raw) && (raw.cr || raw.CR || raw.sr || raw.SR)) {
    const commonRecord = unwrapJsonValue(raw.cr || raw.CR) || {};
    const settlementRecord = unwrapJsonValue(raw.sr || raw.SR) || {};
    if (isObject(settlementRecord) && (settlementRecord.commonRecord || settlementRecord.betRecord || settlementRecord.connectionRecord)) {
      return finalizeRecord(settlementRecord, raw, commonRecord);
    }
    return finalizeRecord(
      {
        commonRecord,
        betRecord: isObject(settlementRecord) ? settlementRecord : {},
      },
      raw
    );
  }

  if (isObject(raw) && raw.log) {
    return normalizeRecordLog(raw.log);
  }

  if (isObject(raw)) {
    return finalizeRecord(
      {
        commonRecord: raw.commonRecord || {},
        betRecord: raw.betRecord || raw,
        connectionRecord: raw.connectionRecord || {},
      },
      raw
    );
  }

  return finalizeRecord(
    {
      commonRecord: {},
      betRecord: {},
      connectionRecord: {},
    },
    raw
  );
}

function finalizeRecord(record, raw, commonOverride) {
  const commonRecord = isObject(commonOverride) ? { ...commonOverride } : isObject(record.commonRecord) ? { ...record.commonRecord } : {};
  const betRecord = isObject(record.betRecord) ? { ...record.betRecord } : {};
  const connectionRecord = isObject(record.connectionRecord) ? { ...record.connectionRecord } : {};

  const structuredFields = ["resultDesc", "newResultDesc", "areaResult", "specialInfoStr"];
  [betRecord, connectionRecord].forEach((target) => {
    structuredFields.forEach((field) => {
      if (typeof target[field] === "string") {
        const parsed = parseStructuredField(target[field]);
        if (parsed !== null) {
          target[`${field}Parsed`] = parsed;
        }
      }
    });
  });

  return {
    raw,
    rawRecord: isObject(record) ? record : {},
    commonRecord,
    betRecord,
    connectionRecord,
    source: {
      ...(isObject(record) ? record : {}),
      ...connectionRecord,
      ...betRecord,
    },
  };
}

function buildSummary(row, parsed, confName) {
  const summary = [];
  pushEntry(summary, "游戏ID", row.gameId);
  pushEntry(summary, "局号", row.roundID);
  pushEntry(summary, "玩家", row.account);
  pushEntry(summary, "用户ID", row.userId);
  pushEntry(summary, "投注", parsed.betRecord.totalBetGold || row.bet, (value) => toMoney(value));
  pushEntry(summary, "输赢", parsed.commonRecord.dispatchRewardGold !== undefined ? parsed.commonRecord.dispatchRewardGold : row.win, (value) => toMoney(value));
  pushEntry(summary, "时间", row.playedDate, formatUnixDateTime);
  return summary;
}

function createHighlight(label, value, tone = "neutral") {
  if (value === null || value === undefined || value === "") return null;
  return {
    label,
    value: stringifyValue(value),
    tone,
  };
}

function getDoubleAreaLabel(betAreaId) {
  const id = Number(betAreaId);
  return DOUBLE_AREA_LABELS[id] || (betAreaId !== undefined && betAreaId !== null && betAreaId !== "" ? `区域 ${betAreaId}` : "");
}

function getDoubleResultLabel(result) {
  if (result === null || result === undefined || result === "") return "";
  const raw = typeof result === "string" ? result.trim() : String(result);
  return DOUBLE_AREA_LABELS[Number(raw)] || raw;
}

function getLdAreaLabel(betAreaId) {
  const id = Number(betAreaId);
  return LD_AREA_LABELS[id] || (betAreaId !== undefined && betAreaId !== null && betAreaId !== "" ? `区域 ${betAreaId}` : "");
}

function getLimboAreaLabel(betAreaId) {
  const id = Number(betAreaId);
  if (!Number.isFinite(id) || id <= 0) return "";
  return "获胜目标";
}

function buildQklsHighlights(parsed, confName) {
  const betAreas = toArray(parsed.betRecord.betAreas);

  switch (confName) {
    case "double": {
      const area = betAreas[0] || {};
      return [
        createHighlight("结果", getDoubleResultLabel(parsed.betRecord.newResultDesc || parsed.betRecord.resultDesc), "result"),
        createHighlight("下注区域", getDoubleAreaLabel(area.betAreaId), "accent"),
      ].filter(Boolean);
    }
    case "dice": {
      const area = betAreas[0] || {};
      return [
        createHighlight("开奖结果", parsed.betRecord.areaResult, "result"),
        createHighlight("下注类型", area.betAreaId ? DICE_AREA_LABELS[area.betAreaId] || `区域 ${area.betAreaId}` : "", "accent"),
        createHighlight("下注参数", area.num, "neutral"),
      ].filter(Boolean);
    }
    case "plinko": {
      const parts = String(parsed.betRecord.resultDesc || "").split("|");
      return [
        createHighlight("行数", parts[0] || "", "neutral"),
        createHighlight("颜色", COLOR_LABELS[Number(parts[1])] || parts[1] || "", "accent"),
        createHighlight("倍率", parts[2] ? `${parts[2]}x` : "", "result"),
      ].filter(Boolean);
    }
    case "circle": {
      const detail = parsed.betRecord.newResultDescParsed || {};
      return [
        createHighlight("扇区", CIRCLE_SEGMENT_LABELS[Number(detail.bet_section)] || "", "neutral"),
        createHighlight("难度", CIRCLE_DIFFICULTY_LABELS[Number(detail.bet_difficulty)] || "", "accent"),
        createHighlight("倍率", detail.odds !== undefined ? `${detail.odds}x` : "", "result"),
        createHighlight("结果颜色", CIRCLE_COLOR_LABELS[Number(detail.result_color)] || "", "accent"),
      ].filter(Boolean);
    }
    case "coin": {
      const detail = parsed.betRecord.newResultDescParsed || {};
      const roundSummary = toArray(detail.coin_bet_rsp_list)
        .map((item, index) => `第${index + 1}轮 ${item.result === 1 ? "金" : item.result === 2 ? "银" : stringifyValue(item.result)}`)
        .join(" / ");
      return [
        createHighlight("下注区域", COIN_AREA_LABELS[detail.bet_area] || "", "accent"),
        createHighlight("赔率", detail.odds !== undefined ? `${detail.odds}x` : "", "result"),
        createHighlight("轮次", toArray(detail.coin_bet_rsp_list).length, "neutral"),
        createHighlight("翻币结果", roundSummary, "accent"),
      ].filter(Boolean);
    }
    case "keno": {
      const detail = parsed.betRecord.resultDescParsed || {};
      return [
        createHighlight("投注数", toArray(detail.bet).length, "neutral"),
        createHighlight("开号数", toArray(detail.open).length, "accent"),
        createHighlight("命中数", toArray(detail.hit).length, "result"),
      ].filter(Boolean);
    }
    case "spiritParty": {
      const parts = String(parsed.betRecord.areaResult || "").split("|");
      const icons = parts[0] ? parts[0].split(",").filter(Boolean) : [];
      return [
        createHighlight("倍率", parsed.betRecord.newResultDesc ? `${parsed.betRecord.newResultDesc}x` : "", "result"),
        createHighlight("结果图标数", icons.length, "accent"),
      ].filter(Boolean);
    }
    case "bbjl": {
      const detail = parsed.betRecord.resultDescParsed || {};
      const result = detail.result || {};
      const betSummary = toArray(detail.bet)
        .map((item) => {
          const area = BBJL_AREA_LABELS[item.area_id] || `区域 ${item.area_id}`;
          const bet = item.bet !== undefined ? toMoney(item.bet) : "";
          return area && bet ? `${area} ${bet}` : area || bet;
        })
        .filter(Boolean)
        .join(" / ");
      return [
        createHighlight("获胜区域", result.area_id ? BBJL_AREA_LABELS[result.area_id] || `区域 ${result.area_id}` : "", "result"),
        createHighlight("下注明细", betSummary, "accent"),
      ].filter(Boolean);
    }
    case "roulette": {
      const resultValue = parsed.betRecord.newResultDesc || parsed.betRecord.resultDesc;
      const openNumber = parseRouletteOpenNumber(resultValue);
      const color = openNumber === null ? "" : openNumber === 0 ? "绿" : ROULETTE_RED_NUMBERS.has(openNumber) ? "红" : "黑";
      return [
        createHighlight("开奖号码", resultValue, "result"),
        createHighlight("颜色", color, color === "红" ? "accent" : color === "黑" ? "neutral" : "result"),
        createHighlight("大小", openNumber !== null && openNumber !== 0 ? (openNumber >= 19 ? "大" : "小") : "", "accent"),
        createHighlight("单双", openNumber !== null && openNumber !== 0 ? (openNumber % 2 === 0 ? "双" : "单") : "", "neutral"),
        createHighlight("分段", openNumber !== null && openNumber !== 0 ? (openNumber <= 12 ? "1-12" : openNumber <= 24 ? "13-24" : "25-36") : "", "neutral"),
        createHighlight("列", openNumber !== null && openNumber !== 0 ? `第${((openNumber - 1) % 3) + 1}列` : "", "neutral"),
      ].filter(Boolean);
    }
    case "bhjk": {
      const detail = parsed.betRecord.newResultDescParsed || {};
      const settlement = (((detail.black_jack_player_state_info || {}).settlement_info) || {});
      return [
        createHighlight("保险决策", getBhjkInsuranceDecision(detail.black_jack_player_state_info || {}, toArray((detail.black_jack_player_state_info || {}).black_jack_player)), "accent"),
        createHighlight("玩家手牌数", toArray((detail.black_jack_player_state_info || {}).black_jack_player).length, "neutral"),
      ].filter(Boolean);
    }
    case "baviator": {
      return [
        createHighlight("开出倍率", parsed.betRecord.resultDesc || "", "result"),
        createHighlight("下注区域数", betAreas.length, "neutral"),
        createHighlight("种子", parsed.commonRecord.seed || "", "accent"),
      ].filter(Boolean);
    }
    case "ld": {
      const areas = String(parsed.betRecord.areaResult || "")
        .split(",")
        .filter(Boolean);
      return [
        createHighlight("结果组数", areas.length, "neutral"),
        createHighlight("首组结果", areas[0] || "", "accent"),
      ].filter(Boolean);
    }
    case "slide": {
      return [
        createHighlight("结果倍率", parsed.betRecord.resultDesc ? `${parsed.betRecord.resultDesc}x` : "", "result"),
        createHighlight("目标数", betAreas.length, "neutral"),
      ].filter(Boolean);
    }
    case "yfct": {
      return [
        createHighlight("开奖倍率", parsed.betRecord.areaResult || "", "result"),
      ].filter(Boolean);
    }
    case "limbo": {
      const parts = String(parsed.betRecord.areaResult || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return [
        createHighlight("开出倍率", parts[0] ? `${parts[0]}x` : "", "result"),
        createHighlight("目标倍率", parts[1] ? `${parts[1]}x` : "", "accent"),
      ].filter(Boolean);
    }
    case "tower": {
      const resultParts = String(parsed.betRecord.resultDesc || "").split(";");
      const diffType = Number(resultParts[0] || 0);
      return [
        createHighlight("难度", Number.isNaN(diffType) ? "" : String(diffType + 1), "neutral"),
        createHighlight(
          "结果",
          parsed.betRecord.bankerLoseRatio === 0 ? "未中奖" : parsed.betRecord.bankerLoseRatio ? `${parsed.betRecord.bankerLoseRatio}x` : "",
          "result"
        ),
      ].filter(Boolean);
    }
    case "bxsl": {
      const detailParts = String(parsed.betRecord.newResultDesc || "")
        .split(",")
        .map((item) => item.trim());
      const opened = detailParts[3] ? detailParts[3].split("|").filter(Boolean) : [];
      return [
        createHighlight("结果赔率", detailParts[2] ? `${detailParts[2]}x` : "", "result"),
        createHighlight("已开格数", opened.length, "neutral"),
      ].filter(Boolean);
    }
    default:
      return [];
  }
}

function buildQklsViewModel(parsed, confName, row, summary) {
  return {
    mode: "qkls",
    confName,
    summary: Array.isArray(summary) ? summary : buildSummary(row || {}, parsed, confName),
    highlights: buildQklsHighlights(parsed, confName),
    blocks: []
      .concat(buildSpecialBlocks(confName, parsed))
      .concat(buildCommonBlocks(parsed, confName))
      .filter(Boolean),
  };
}

const BHJK_ACTION_LABELS = {
  1: "下注",
  2: "加倍",
  3: "要牌",
  4: "停牌",
  5: "分牌",
  6: "买保险",
  7: "不买保险",
  8: "爆牌",
};

const BHJK_RESULT_LABELS = {
  1: "赢",
  2: "输",
  3: "平",
};

function getBhjkDetail(parsed) {
  const detail = parsed.betRecord.newResultDescParsed || parsed.betRecord.resultDescParsed || {};
  return detail.black_jack_player_state_info || detail.blackJackPlayerStateInfo || detail || {};
}

function getBhjkHandRecord(entry) {
  return (entry && (entry.blackJackCards || entry.black_jack_cards)) || entry || {};
}

function getBhjkActionList(hand) {
  return toArray(hand && (hand.blackJackActions || hand.black_jack_actions));
}

function hasBhjkAction(hand, actionId) {
  return getBhjkActionList(hand).some((item) => Number(item && item.actions) === Number(actionId));
}

function getBhjkInsuranceDecision(detail, players) {
  const insuranceGold = Number(detail && detail.insuranceGold);
  const allHands = toArray(players).map((entry) => getBhjkHandRecord(entry));
  if (allHands.some((hand) => hasBhjkAction(hand, 6)) || insuranceGold > 0) return "买保险";
  if (allHands.some((hand) => hasBhjkAction(hand, 7))) return "不买保险";
  return "";
}

function getBhjkHandResultLabel(hand) {
  const playerResult = Number(hand && (hand.playerResult ?? hand.player_result));
  if (BHJK_RESULT_LABELS[playerResult]) return BHJK_RESULT_LABELS[playerResult];
  if (hasBhjkAction(hand, 8) || Number(hand && hand.value) > 21) return "爆牌";
  return "";
}

function getBhjkHandTone(hand) {
  const playerResult = Number(hand && (hand.playerResult ?? hand.player_result));
  if (playerResult === 1) return "win";
  if (playerResult === 2) return "lose";
  if (playerResult === 3) return "draw";
  if (hasBhjkAction(hand, 8) || Number(hand && hand.value) > 21) return "lose";
  if (Number(hand && hand.value) === 21 && toArray(hand && hand.cards).length === 2) return "accent";
  return "neutral";
}

function normalizeBhjkHand(entry, index, totalPlayers) {
  const hand = getBhjkHandRecord(entry);
  const cards = toArray(hand.cards).map((item) => stringifyValue(item));
  const actions = getBhjkActionList(hand).map((item) => ({
    id: Number(item && item.actions),
    label: BHJK_ACTION_LABELS[Number(item && item.actions)] || `操作 ${item && item.actions}`,
  }));
  const value = hand && hand.value !== undefined && hand.value !== null ? String(hand.value) : "";
  const result = getBhjkHandResultLabel(hand);
  const total = Number((hand && hand.betGold) || 0);
  const isSplit = totalPlayers > 1 && index > 0;
  const title = totalPlayers > 1 ? `玩家${index + 1}` : "玩家";
  const badges = [];

  if (Number(value) === 21 && cards.length === 2 && !isSplit) badges.push("Blackjack");
  if (hasBhjkAction(hand, 2)) badges.push("加倍");
  if (hasBhjkAction(hand, 5) || isSplit) badges.push("分牌");
  if (hasBhjkAction(hand, 8) || Number(value) > 21) badges.push("爆牌");
  if (hasBhjkAction(hand, 4)) badges.push("停牌");

  return {
    key: `player-${index}`,
    title,
    subtitle: isSplit ? "分牌手" : "",
    cards,
    value,
    result,
    tone: getBhjkHandTone(hand),
    betGold: total > 0 ? toMoney(total) : "",
    badges,
    actions,
  };
}

function normalizeBhjkDealer(detail) {
  const dealerRecord = (detail && (detail.black_jack_dealer || detail.blackJackDealer)) || {};
  const hand = getBhjkHandRecord(dealerRecord);
  const cards = toArray(hand.cards).map((item) => stringifyValue(item));
  const actions = getBhjkActionList(hand).map((item) => ({
    id: Number(item && item.actions),
    label: BHJK_ACTION_LABELS[Number(item && item.actions)] || `操作 ${item && item.actions}`,
  }));
  const value = hand && hand.value !== undefined && hand.value !== null ? String(hand.value) : "";
  const badges = [];

  if (Number(value) === 21 && cards.length === 2) badges.push("Blackjack");
  if (hasBhjkAction(hand, 8) || Number(value) > 21) badges.push("爆牌");

  return {
    title: "庄家",
    cards,
    value,
    badges,
    actions,
  };
}

function buildBhjkViewModel(parsed, row, summary) {
  const detail = getBhjkDetail(parsed);
  const players = toArray(detail.black_jack_player || detail.blackJackPlayer);
  const dealer = normalizeBhjkDealer(detail);
  const hands = players.map((entry, index) => normalizeBhjkHand(entry, index, players.length));
  const insuranceDecision = getBhjkInsuranceDecision(detail, players);
  const settlement = detail.settlement_info || detail.settlementInfo || {};
  const commonSummary = Array.isArray(summary) ? summary : buildSummary(row || {}, parsed, "bhjk");
  const infoEntries = [];
  const metaEntries = [];

  pushEntry(infoEntries, "Record ID", parsed.commonRecord.recordId);
  pushEntry(infoEntries, "票据号", parsed.commonRecord.porderId);
  pushEntry(infoEntries, "局号", row && row.roundID);
  pushEntry(infoEntries, "结算时间", parsed.commonRecord.settlementTimestamp, formatUnixDateTime);

  pushEntry(metaEntries, "保险决策", insuranceDecision);
  pushEntry(metaEntries, "保险金额", detail.insuranceGold ?? settlement.insurance_gold, (value) => toMoney(value));
  pushEntry(metaEntries, "保险赔付", settlement.insurance_payout, (value) => toMoney(value));
  pushEntry(metaEntries, "手牌数", hands.length);
  pushEntry(metaEntries, "状态", detail.active === false ? "已结算" : detail.active === true ? "进行中" : "");

  return {
    mode: "bhjk",
    confName: "bhjk",
    summary: commonSummary,
    infoEntries,
    metaEntries,
    dealer,
    hands,
    totalBetGold: toMoney(parsed.betRecord.totalBetGold || 0),
    totalWinLoseGold: toMoney(parsed.commonRecord.dispatchRewardGold || 0),
  };
}

function buildBaviatorViewModel(parsed, row, summary) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const betAreas = toArray(mergedSource.betAreas || betRecord.betAreas).map((item, index) => {
    const rateNumber = Number(item && item.num);
    return {
      key: `area-${index}`,
      label: item && item.betAreaId !== undefined ? `区域 ${item.betAreaId}` : `下注 ${index + 1}`,
      betGold: item && item.betGold !== undefined ? toMoney(item.betGold) : "",
      winLoseGold: item && item.winLoseGold !== undefined ? toMoney(item.winLoseGold) : "",
      rate: Number.isFinite(rateNumber) && rateNumber > 0 ? `${rateNumber / 100}x` : "",
    };
  });

  const infoEntries = [];
  pushEntry(infoEntries, "票据号", commonRecord.porderId);
  pushEntry(infoEntries, "局号", row && row.roundID);
  pushEntry(infoEntries, "结算时间", commonRecord.settlementTimestamp, formatUnixDateTime);
  pushEntry(infoEntries, "种子", commonRecord.seed);

  return {
    mode: "baviator",
    confName: "baviator",
    summary: Array.isArray(summary) ? summary : buildSummary(row || {}, parsed, "baviator"),
    infoEntries,
    resultRate: mergedSource.resultDesc ? String(mergedSource.resultDesc) : "",
    totalBetGold: toMoney(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: toMoney(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold ?? 0),
    betAreas,
  };
}

function buildCommonBlocks(parsed, confName = "") {
  const blocks = [];
  const commonEntries = [];
  pushEntry(commonEntries, "Record ID", parsed.commonRecord.recordId);
  pushEntry(commonEntries, "票据号", parsed.commonRecord.porderId);
  pushEntry(commonEntries, "种子", parsed.commonRecord.seed);
  pushEntry(commonEntries, "结算时间", parsed.commonRecord.settlementTimestamp, formatUnixDateTime);
  pushEntry(commonEntries, "限红命中", parsed.commonRecord.IsLimit, (value) => (value ? "是" : "否"));
  blocks.push(createEntriesBlock("通用信息", commonEntries));

  if (
    confName !== "yfct" &&
    confName !== "double" &&
    confName !== "ld" &&
    confName !== "dice" &&
    confName !== "bxsl" &&
    confName !== "hilo" &&
    confName !== "circle" &&
    confName !== "plinko" &&
    confName !== "tower" &&
    confName !== "slide" &&
    confName !== "coin" &&
    confName !== "bbjl" &&
    confName !== "roulette" &&
    confName !== "limbo"
  ) {
    const betEntries = [];
    pushEntry(betEntries, "总下注", parsed.betRecord.totalBetGold, (value) => toMoney(value));
    pushEntry(betEntries, "结果描述", parsed.betRecord.resultDesc);
    pushEntry(betEntries, "新版结果", parsed.betRecord.newResultDesc);
    pushEntry(betEntries, "开奖明细", parsed.betRecord.areaResult);
    blocks.push(createEntriesBlock("注单数据", betEntries));
  }

  const betAreas = toArray(parsed.betRecord.betAreas).map((area) => ({
    betAreaId:
      confName === "double"
        ? getDoubleAreaLabel(area.betAreaId)
        : confName === "ld"
        ? getLdAreaLabel(area.betAreaId)
        : confName === "limbo"
        ? getLimboAreaLabel(area.betAreaId)
        : confName === "roulette"
        ? getRouletteAreaLabel(area.betAreaId)
        : area.betAreaId,
    betGold: area.betGold !== undefined ? toMoney(area.betGold) : "",
    winLoseGold: area.winLoseGold !== undefined ? toMoney(area.winLoseGold) : "",
    odds: confName === "double" ? (Number(area.num) > 0 ? area.num : "") : area.num !== undefined ? area.num : "",
    multiple: area.betMultiple !== undefined ? area.betMultiple : "",
  }));
  const betAreaColumns = [
    { key: "betAreaId", label: confName === "double" || confName === "ld" || confName === "limbo" || confName === "roulette" ? "区域" : "区域ID" },
    { key: "betGold", label: "下注" },
    { key: "winLoseGold", label: "输赢" },
    { key: "odds", label: "赔率/参数" },
    { key: "multiple", label: "倍数" },
  ].filter((column) => {
    if (confName === "yfct" && column.key === "multiple") {
      return false;
    }
    if (column.key === "odds" || column.key === "multiple") {
      return betAreas.some((item) => item && item[column.key] !== "" && item[column.key] !== null && item[column.key] !== undefined);
    }
    return true;
  });
  if (confName !== "limbo" && confName !== "bbjl") {
    blocks.push(
      createTableBlock(
        "下注区域",
        betAreaColumns,
        betAreas
      )
    );
  }

  if (parsed.betRecord.resultDescParsed && confName !== "bbjl") {
    blocks.push(createJsonBlock("结果描述解析", parsed.betRecord.resultDescParsed));
  }
  if (parsed.betRecord.newResultDescParsed && confName !== "circle" && confName !== "coin") {
    blocks.push(createJsonBlock("新版结果解析", parsed.betRecord.newResultDescParsed));
  }
  if (parsed.betRecord.specialInfoStrParsed) {
    blocks.push(createJsonBlock("特殊奖励解析", parsed.betRecord.specialInfoStrParsed));
  }
  const specialInfo = parsed.betRecord.specialInfoStrParsed;
  if (specialInfo && Array.isArray(specialInfo.trigger_details)) {
    blocks.push(
      createTableBlock(
        "免费游戏触发",
        [
          { key: "lineId", label: "线路" },
          { key: "indexes", label: "命中位置" },
          { key: "multiplier", label: "倍率/说明" },
        ],
        specialInfo.trigger_details.map((item) => ({
          lineId: item.lineId !== undefined ? item.lineId : "",
          indexes: Array.isArray(item.indexes) ? item.indexes.join(", ") : "",
          multiplier: item.indexes ? `x${Math.max((item.indexes || []).length - 2, 0)}` : "",
        }))
      )
    );
  }

  if (specialInfo && Array.isArray(specialInfo.open_details)) {
    blocks.push(
      createTableBlock(
        "免费游戏回合",
        [
          { key: "set", label: "组" },
          { key: "rounds", label: "回合数" },
        ],
        specialInfo.open_details.map((item, index) => ({
          set: index + 1,
          rounds: Array.isArray(item.round_details) ? item.round_details.length : 0,
        }))
      )
    );

    const specialRounds = [];
    specialInfo.open_details.forEach((group, groupIndex) => {
      (group.round_details || []).forEach((round, roundIndex) => {
        specialRounds.push({
          set: groupIndex + 1,
          round: roundIndex + 1,
          outerIncome: round.outer_income !== undefined ? toMoney(round.outer_income) : "",
          innerIncome: round.inner_income !== undefined ? toMoney(round.inner_income) : "",
          outerOdds: round.outer_odds !== undefined ? round.outer_odds : "",
          innerOdds: round.inner_odds !== undefined ? round.inner_odds : "",
        });
      });
    });
    blocks.push(
      createTableBlock(
        "免费游戏明细",
        [
          { key: "set", label: "组" },
          { key: "round", label: "回合" },
          { key: "outerIncome", label: "外圈收益" },
          { key: "innerIncome", label: "内圈收益" },
          { key: "outerOdds", label: "外圈赔率" },
          { key: "innerOdds", label: "内圈赔率" },
        ],
        specialRounds
      )
    );
  }

  if (typeof parsed.source.icons === "string" && parsed.source.icons.includes(";")) {
    blocks.push(
      createTableBlock(
        "多轮图标结果",
        [
          { key: "round", label: "轮次" },
          { key: "icons", label: "图标序列" },
        ],
        parsed.source.icons.split(";").map((item, index) => ({
          round: index + 1,
          icons: item,
        }))
      )
    );
  }

  return blocks.filter(Boolean);
}

function buildSlotBlocks(parsed) {
  const blocks = [];
  const entries = [];
  pushEntry(entries, "单线下注", parsed.source.betSingle, (value) => toMoney(value));
  pushEntry(entries, "下注倍数", parsed.source.betTimes);
  pushEntry(entries, "小游戏输赢", parsed.source.battleWinLoseGold, (value) => toMoney(value));
  blocks.push(createEntriesBlock("Slot 基础信息", entries));

  if (parsed.source.icons) {
    blocks.push(createTagsBlock("Icon 结果", String(parsed.source.icons).split(",")));
  }

  const winAreas = toArray(parsed.source.betAreas || parsed.betRecord.betAreas).map((area) => ({
    betAreaId: area.betAreaId,
    iconId: area.iconId !== undefined ? area.iconId : "",
    num: area.num !== undefined ? area.num : "",
    betMultiple: area.betMultiple !== undefined ? area.betMultiple : "",
    iconMultiple: area.iconMultiple !== undefined ? area.iconMultiple : "",
    winLoseGold: area.winLoseGold !== undefined ? toMoney(area.winLoseGold) : "",
  }));
  blocks.push(
    createTableBlock(
      "中奖线路/区域",
      [
        { key: "betAreaId", label: "区域ID" },
        { key: "iconId", label: "图标ID" },
        { key: "num", label: "数量" },
        { key: "betMultiple", label: "线倍数" },
        { key: "iconMultiple", label: "图标倍数" },
        { key: "winLoseGold", label: "中奖" },
      ],
      winAreas
    )
  );
  return blocks.filter(Boolean);
}

function buildDoubleBlocks(parsed) {
  return [];
}

function buildDiceBlocks(parsed) {
  const area = toArray(parsed.betRecord.betAreas)[0] || {};
  return [
    createEntriesBlock("猜数字详情", [
      { label: "开奖结果", value: stringifyValue(parsed.betRecord.areaResult) },
      { label: "下注类型", value: area.betAreaId ? DICE_AREA_LABELS[area.betAreaId] || `区域 ${area.betAreaId}` : "" },
      { label: "下注参数", value: area.num !== undefined ? stringifyValue(area.num) : "" },
    ]),
  ].filter(Boolean);
}

function buildPlinkoBlocks(parsed) {
  return [];
}

function buildHiloBlocks(parsed) {
  const rounds = String(parsed.betRecord.areaResult || "")
    .split("|")
    .filter(Boolean)
    .map((item, index) => {
      const parts = item.split(",");
      return {
        round: index + 1,
        card: parts[0] || "",
        betArea: parts[1] || "",
        ratio: parts[2] || "",
        skipped: parts[3] === "1" ? "是" : "否",
      };
    });
  return [
    createTableBlock(
      "高低纸牌过程",
      [
        { key: "round", label: "轮次" },
        { key: "card", label: "牌面" },
        { key: "betArea", label: "下注区域" },
        { key: "ratio", label: "倍率" },
        { key: "skipped", label: "跳过" },
      ],
      rounds
    ),
  ].filter(Boolean);
}

function buildCircleBlocks(parsed) {
  const detail = parsed.betRecord.newResultDescParsed || {};
  return [
    createEntriesBlock("幸运转盘详情", [
      { label: "难度", value: CIRCLE_DIFFICULTY_LABELS[Number(detail.bet_difficulty)] || "" },
      { label: "扇区", value: CIRCLE_SEGMENT_LABELS[Number(detail.bet_section)] || "" },
      { label: "倍率", value: detail.odds !== undefined ? `${detail.odds}x` : "" },
      { label: "结果颜色", value: CIRCLE_COLOR_LABELS[Number(detail.result_color)] || "" },
    ]),
  ].filter(Boolean);
}

function buildCoinBlocks(parsed) {
  return [];
}

function buildKenoBlocks(parsed) {
  const detail = parsed.betRecord.resultDescParsed || {};
  return [
    createTagsBlock("投注号码", detail.bet),
    createTagsBlock("开奖号码", detail.open),
    createTagsBlock("命中号码", detail.hit),
  ].filter(Boolean);
}

function buildSpiritPartyBlocks(parsed) {
  const parts = String(parsed.betRecord.areaResult || "").split("|");
  return [
    createEntriesBlock("精灵派对详情", [
      { label: "倍率", value: parsed.betRecord.newResultDesc ? `${parsed.betRecord.newResultDesc}x` : "" },
    ]),
    createTagsBlock("结果图标", parts[0] ? parts[0].split(",") : []),
  ].filter(Boolean);
}

function buildBBJLBlocks(parsed) {
  const detail = parsed.betRecord.resultDescParsed || {};
  return [
    createTagsBlock("庄家牌面", toArray((detail.banker || {}).cards)),
    createTagsBlock("玩家牌面", toArray((detail.player || {}).cards)),
  ].filter(Boolean);
}

function buildRouletteBlocks(parsed) {
  return [];
}

function buildBHJKBlocks(parsed) {
  const detail = parsed.betRecord.newResultDescParsed || {};
  const settlement = (((detail.black_jack_player_state_info || {}).settlement_info) || {});
  const players = toArray((detail.black_jack_player_state_info || {}).black_jack_player).map((item, index) => ({
    seat: index + 1,
    cards: toArray(item.black_jack_cards).join(", "),
  }));
  return [
    createEntriesBlock("21点详情", [
      { label: "保险下注", value: settlement.is_insurance ? "是" : "否" },
      { label: "保险金额", value: settlement.insurance_gold !== undefined ? toMoney(settlement.insurance_gold) : "" },
      { label: "保险赔付", value: settlement.insurance_payout !== undefined ? toMoney(settlement.insurance_payout) : "" },
    ]),
    createTagsBlock("庄家牌面", toArray((((detail.black_jack_player_state_info || {}).black_jack_dealer) || {}).black_jack_cards)),
    createTableBlock(
      "玩家牌面",
      [
        { key: "seat", label: "位置" },
        { key: "cards", label: "牌面" },
      ],
      players
    ),
  ].filter(Boolean);
}

function buildBaviatorBlocks(parsed) {
  const betAreas = toArray(parsed.betRecord.betAreas).map((item) => ({
    betAreaId: item.betAreaId,
    betGold: item.betGold !== undefined ? toMoney(item.betGold) : "",
    winLoseGold: item.winLoseGold !== undefined ? toMoney(item.winLoseGold) : "",
    rate: item.num !== undefined ? `${Number(item.num) / 100}x` : "",
  }));
  return [
    createEntriesBlock("飞行员详情", [
      { label: "种子", value: parsed.commonRecord.seed || "" },
      { label: "开出倍率", value: parsed.betRecord.resultDesc || "" },
    ]),
    createTableBlock(
      "下注区域",
      [
        { key: "betAreaId", label: "区域ID" },
        { key: "betGold", label: "下注" },
        { key: "winLoseGold", label: "输赢" },
        { key: "rate", label: "赔率" },
      ],
      betAreas
    ),
  ].filter(Boolean);
}

function buildLDBlocks(parsed) {
  const areas = String(parsed.betRecord.areaResult || "")
    .split(",")
    .filter(Boolean)
    .map((segment) => {
      const [dicePart, ratioPart] = segment.split("|");
      const [dice1, dice2] = String(dicePart || "").split("*");
      const [rangeType, odds] = String(ratioPart || "").split("x");
      return {
        dice: `${dice1 || ""}, ${dice2 || ""}`,
        range: rangeType === "1 " ? "8-12" : rangeType === "2 " ? "2-6" : "7",
        odds: odds || "",
      };
    });
  return [
    createTableBlock(
      "幸运两点详情",
      [
        { key: "dice", label: "骰子" },
        { key: "range", label: "结果区间" },
        { key: "odds", label: "倍率" },
      ],
      areas
    ),
  ].filter(Boolean);
}

function buildSlideBlocks(parsed) {
  return [];
}

function buildYFCTBlocks(parsed) {
  return [
    createEntriesBlock("一飞冲天详情", [
      { label: "开奖倍率", value: parsed.betRecord.areaResult || "" },
    ]),
  ].filter(Boolean);
}

function buildLimboBlocks(parsed) {
  return [];
}

function buildTowerBlocks(parsed) {
  const resultParts = String(parsed.betRecord.resultDesc || "").split(";");
  const diffType = Number(resultParts[0] || 0);
  const odds = String(resultParts[1] || "")
    .split("|")
    .filter(Boolean)
    .map((value, index) => ({
      level: index + 1,
      odds: `${value}x`,
    }));
  const board = String(parsed.betRecord.areaResult || "")
    .split("|")
    .filter(Boolean)
    .map((item, rowIndex) => {
      const parts = item.split(",");
      const cells = String(parts[0] || "").split("");
      const openIndex = Number(parts[1] || -1);
      return {
        row: rowIndex + 1,
        cells: cells.join(", "),
        opened: openIndex >= 0 ? openIndex + 1 : "",
      };
    });

  return [
    createTableBlock(
      "层级赔率",
      [
        { key: "level", label: "层级" },
        { key: "odds", label: "赔率" },
      ],
      odds
    ),
    createTableBlock(
      "开格过程",
      [
        { key: "row", label: "行" },
        { key: "cells", label: "格子数据" },
        { key: "opened", label: "打开位置" },
      ],
      board
    ),
  ].filter(Boolean);
}

function buildBxslBlocks(parsed) {
  const detailParts = String(parsed.betRecord.newResultDesc || "")
    .split(",")
    .map((item) => item.trim());
  const opened = detailParts[3] ? detailParts[3].split("|").filter(Boolean) : [];
  const hasExplicitOpened = opened.length > 0;
  const board = detailParts[4]
    ? detailParts[4].split("|").map((item, index) => ({
        index: index + 1,
        type: item === "2" ? "宝石" : "地雷",
        kind: item === "2" ? "gem" : "mine",
        opened: hasExplicitOpened ? opened.includes(String(index)) : item !== "2",
      }))
    : [];

  return [
    createTableBlock(
      "棋盘结果",
      [
        { key: "index", label: "位置" },
      ],
      board
    ),
  ].filter(Boolean);
}

function buildSjddjBlocks(parsed) {
  const parseSpecial = (special) => {
    const parts = String(special || "").split("#");
    const betAreaCount = Number(parts[0] || 0);
    const rawAreas = parts[1] ? safeJsonParse(parts[1]) || [] : [];
    return {
      betAreaCount,
      winLoseGold: Number(parts[2] || 0),
      icons: parts[3] || "",
      betAreas: rawAreas.map((entry) => {
        const values = String(entry).split(",");
        const linePos = [];
        for (let index = 7; index < values.length; index += 2) {
          linePos.push(`${values[index]}-${values[index + 1]}`);
        }
        return {
          betAreaId: Number(values[0] || 0),
          betGold: Number(values[1] || 0),
          winLoseGold: Number(values[2] || 0),
          num: Number(values[3] || 0),
          betMultiple: Number(values[4] || 0),
          iconMultiple: Number(values[5] || 0),
          iconId: values[6] || "",
          linePos: linePos.join(" / "),
        };
      }),
    };
  };

  const specialInfo = Array.isArray(parsed.betRecord.specialInfoStrParsed)
    ? parsed.betRecord.specialInfoStrParsed.map(parseSpecial)
    : [];
  const innings = [parsed.source].concat(specialInfo);

  const inningRows = innings.map((item, index) => {
    const rounds = String(item.icons || "")
      .split(";")
      .filter(Boolean);
    return {
      inning: index,
      type: index === 0 ? "普通" : `免费 ${index}`,
      rounds: rounds.length,
      winLoseGold: item.winLoseGold !== undefined ? toMoney(item.winLoseGold) : "",
    };
  });

  const roundRows = [];
  innings.forEach((item, inningIndex) => {
    const iconRounds = String(item.icons || "")
      .split(";")
      .filter(Boolean)
      .map((segment) => segment.split(","));
    let offset = 0;
    iconRounds.forEach((roundIcons, roundIndex) => {
      const areaCount = Number(roundIcons.at(-2) || 0);
      const timeKey = roundIcons.at(-1);
      const areaSlice = toArray(item.betAreas).slice(offset, offset + areaCount);
      offset += areaCount;
      roundRows.push({
        inning: inningIndex,
        round: roundIndex + 1,
        multiplier: 1 << (roundIndex + (inningIndex > 0 ? 3 : 0)),
        icons: roundIcons.slice(0, Math.max(roundIcons.length - 2, 0)).join(", "),
        areas: areaSlice.length,
        timestamp: Array.isArray(parsed.source.timestampList) && timeKey !== undefined ? stringifyValue(parsed.source.timestampList[Number(timeKey)]) : "",
      });
    });
  });

  const betAreaRows = [];
  innings.forEach((item, inningIndex) => {
    toArray(item.betAreas).forEach((area, index) => {
      betAreaRows.push({
        inning: inningIndex,
        index: index + 1,
        betAreaId: area.betAreaId,
        betGold: area.betGold !== undefined ? toMoney(area.betGold) : "",
        winLoseGold: area.winLoseGold !== undefined ? toMoney(area.winLoseGold) : "",
        betMultiple: area.betMultiple !== undefined ? area.betMultiple : "",
        iconMultiple: area.iconMultiple !== undefined ? area.iconMultiple : "",
        iconId: area.iconId || "",
        linePos: area.linePos || "",
      });
    });
  });

  return [
    createEntriesBlock("赏金大对决详情", [
      { label: "鍗曟敞", value: parsed.source.betSingle !== undefined ? toMoney(parsed.source.betSingle) : "" },
      { label: "鍊嶆暟", value: parsed.source.betTimes !== undefined ? stringifyValue(parsed.source.betTimes) : "" },
    ]),
    createTableBlock(
      "局段信息",
      [
        { key: "inning", label: "段" },
        { key: "type", label: "绫诲瀷" },
        { key: "rounds", label: "回合数" },
        { key: "winLoseGold", label: "杈撹耽" },
      ],
      inningRows
    ),
    createTableBlock(
      "鍥炲悎鏄庣粏",
      [
        { key: "inning", label: "段" },
        { key: "round", label: "鍥炲悎" },
        { key: "multiplier", label: "濂栧姳鍊嶆暟" },
        { key: "icons", label: "鍥炬爣" },
        { key: "areas", label: "涓绾挎暟" },
        { key: "timestamp", label: "鏃堕棿绱㈠紩" },
      ],
      roundRows
    ),
    createTableBlock(
      "中奖线明细",
      [
        { key: "inning", label: "段" },
        { key: "index", label: "搴忓彿" },
        { key: "betAreaId", label: "鍖哄煙ID" },
        { key: "betGold", label: "涓嬫敞" },
        { key: "winLoseGold", label: "杈撹耽" },
        { key: "betMultiple", label: "涓嬫敞鍊嶆暟" },
        { key: "iconMultiple", label: "鍥炬爣鍊嶆暟" },
        { key: "iconId", label: "鍥炬爣ID" },
        { key: "linePos", label: "绾夸綅" },
      ],
      betAreaRows
    ),
  ].filter(Boolean);
}

function buildSjddjViewModel(parsed) {
  const parseSpecial = (special) => {
    const parts = String(special || "").split("#");
    const rawAreas = parts[1] ? safeJsonParse(parts[1]) || [] : [];
    return {
      winLoseGold: Number(parts[2] || 0),
      icons: parts[3] || "",
      betAreas: rawAreas.map((entry) => {
        const values = String(entry).split(",");
        const linePos = [];
        for (let index = 7; index < values.length; index += 2) {
          linePos.push([Number(values[index] || 0), Number(values[index + 1] || 0)]);
        }
        return {
          betAreaId: Number(values[0] || 0),
          betGold: Number(values[1] || 0),
          winLoseGold: Number(values[2] || 0),
          num: Number(values[3] || 0),
          betMultiple: Number(values[4] || 0),
          iconMultiple: Number(values[5] || 0),
          iconId: values[6] || "",
          linePos,
        };
      }),
    };
  };

  const specialInfo = Array.isArray(parsed.betRecord.specialInfoStrParsed)
    ? parsed.betRecord.specialInfoStrParsed.map(parseSpecial)
    : [];
  const innings = [parsed.source].concat(specialInfo).map((item, inningIndex) => {
    const rounds = String(item.icons || "")
      .split(";")
      .filter(Boolean)
      .map((segment) => segment.split(","));
    let offset = 0;
    return {
      inningIndex,
      label: inningIndex === 0 ? "普通下注" : `免费下注 ${inningIndex}`,
      winLoseGold: item.winLoseGold !== undefined ? item.winLoseGold : parsed.commonRecord.dispatchRewardGold,
      rounds: rounds.map((roundIcons, roundIndex) => {
        const areaCount = Number(roundIcons.at(-2) || 0);
        const timeKey = roundIcons.at(-1);
        const betAreas = toArray(item.betAreas).slice(offset, offset + areaCount);
        offset += areaCount;
        return {
          roundIndex,
          label: `绗?${roundIndex + 1} 鍥炲悎`,
          multiplier: 1 << (roundIndex + (inningIndex > 0 ? 3 : 0)),
          icons: roundIcons.slice(0, Math.max(roundIcons.length - 2, 0)),
          timeKey,
          timestamp: Array.isArray(parsed.source.timestampList) && timeKey !== undefined ? parsed.source.timestampList[Number(timeKey)] : "",
          betAreas,
        };
      }),
    };
  });

  return {
    mode: "sjddj",
    betSingle: parsed.source.betSingle || 0,
    betTimes: parsed.source.betTimes || 0,
    innings,
  };
}

function buildSjddjViewModelClient(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSpecialInfo =
    connection.specialInfoStrParsed || betRecord.specialInfoStrParsed || parsed.betRecord.specialInfoStrParsed || [];

  const normalizeLinePos = (linePos) =>
    toArray(linePos)
      .map((item) => {
        if (Array.isArray(item)) return [Number(item[0] || 0), Number(item[1] || 0)];
        if (item && Array.isArray(item.pos)) return [Number(item.pos[0] || 0), Number(item.pos[1] || 0)];
        return null;
      })
      .filter(Boolean);

  const normalizeBetArea = (area) => ({
    ...area,
    betAreaId: Number(area && area.betAreaId || 0),
    betGold: Number(area && area.betGold || 0),
    winLoseGold: Number(area && area.winLoseGold || 0),
    num: Number(area && area.num || 0),
    betMultiple: Number(area && area.betMultiple || 0),
    iconMultiple: Number(area && area.iconMultiple || 0),
    iconId: area && area.iconId !== undefined ? area.iconId : "",
    linePos: normalizeLinePos(area && area.linePos),
  });

  const parseSpecial = (special) => {
    const parts = String(special || "").split("#");
    const rawAreas = parts[1] ? safeJsonParse(parts[1]) || [] : [];
    return {
      betAreaCount: Number(parts[0] || 0),
      winLoseGold: Number(parts[2] || 0),
      icons: parts[3] || "",
      betAreas: rawAreas.map((entry) => {
        const values = String(entry).split(",");
        const linePos = [];
        for (let index = 7; index < values.length; index += 2) {
          linePos.push([Number(values[index] || 0), Number(values[index + 1] || 0)]);
        }
        return normalizeBetArea({
          betAreaId: Number(values[0] || 0),
          betGold: Number(values[1] || 0),
          winLoseGold: Number(values[2] || 0),
          num: Number(values[3] || 0),
          betMultiple: Number(values[4] || 0),
          iconMultiple: Number(values[5] || 0),
          iconId: values[6] || "",
          linePos,
        });
      }),
    };
  };

  const specialInfo = Array.isArray(mergedSpecialInfo)
    ? mergedSpecialInfo.map(parseSpecial)
    : [];
  const baseSource = {
    icons: source.icons || connection.icons || betRecord.icons || "",
    betAreas: toArray(source.betAreas || connection.betAreas || betRecord.betAreas).map(normalizeBetArea),
    winLoseGold: Number(source.winLoseGold ?? connection.winLoseGold ?? betRecord.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
  };
  const totalWinLoseGold = baseSource.winLoseGold;
  const freeGameWin = Number(source.freeGameWin ?? connection.freeGameWin ?? betRecord.freeGameWin ?? 0);
  const ordinaryWinLoseGold = totalWinLoseGold - freeGameWin;

  const innings = [baseSource].concat(specialInfo).map((item, inningIndex) => {
    const rounds = String(item.icons || "")
      .split(";")
      .filter(Boolean)
      .map((segment) => segment.split(","));
    let offset = 0;
    const rawWinLoseGold = Number(item.winLoseGold || 0);
    const displayWinLoseGold = inningIndex === 0 && specialInfo.length ? ordinaryWinLoseGold : rawWinLoseGold;
    return {
      inningIndex,
      kind: inningIndex === 0 ? "ordinary" : "free",
      label: inningIndex === 0 ? "普通下注" : `免费下注 ${inningIndex}`,
      rawWinLoseGold,
      displayWinLoseGold,
      freeGameWin: inningIndex === 0 ? freeGameWin : 0,
      rounds: rounds.map((roundIcons, roundIndex) => {
        const areaCount = Number(roundIcons.at(-2) || 0);
        const timeKey = roundIcons.at(-1);
        const betAreas = toArray(item.betAreas).slice(offset, offset + areaCount);
        offset += areaCount;
        return {
          roundIndex,
          label: `第 ${roundIndex + 1} 回合`,
          multiplier: 1 << (roundIndex + (inningIndex > 0 ? 3 : 0)),
          icons: roundIcons.slice(0, Math.max(roundIcons.length - 2, 0)),
          timestampIndex: timeKey === undefined ? null : Number(timeKey),
          timestamp:
            Array.isArray(source.timestampList) && timeKey !== undefined
              ? source.timestampList[Number(timeKey)]
              : Array.isArray(connection.timestampList) && timeKey !== undefined
              ? connection.timestampList[Number(timeKey)]
              : "",
          betAreas,
        };
      }),
    };
  });

  return {
    mode: "sjddj",
    betSingle: Number(source.betSingle ?? connection.betSingle ?? betRecord.betSingle ?? 0),
    betTimes: Number(source.betTimes ?? connection.betTimes ?? betRecord.betTimes ?? 0),
    totalWinLoseGold,
    freeGameWin,
    ordinaryWinLoseGold,
    hasFreeGame: specialInfo.length > 0,
    innings,
  };
}

function buildShzViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };
  const specialInfo =
    connection.specialInfoStrParsed ||
    betRecord.specialInfoStrParsed ||
    (typeof mergedSource.specialInfoStr === "string" ? safeJsonParse(mergedSource.specialInfoStr) : null) ||
    null;

  const iconNameMap = {
    0: "替天行道",
    1: "忠义堂",
    2: "水浒传",
    3: "宋江",
    4: "鲁智深",
    5: "林冲",
    6: "刀",
    7: "枪",
    8: "斧",
    9: "小玛丽",
  };

  const normalizeMainIconId = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : -1;
  };

  const mainIcons = String(mergedSource.icons || "")
    .split(",")
    .map((item) => normalizeMainIconId(item))
    .filter((item) => item >= 0);

  const linePatternMap = {
    1: ["0-1", "1-1", "2-1", "3-1", "4-1"],
    2: ["0-0", "1-0", "2-0", "3-0", "4-0"],
    3: ["0-2", "1-2", "2-2", "3-2", "4-2"],
    4: ["0-0", "1-1", "2-2", "3-1", "4-0"],
    5: ["0-2", "1-1", "2-0", "3-1", "4-2"],
    6: ["0-1", "1-0", "2-0", "3-0", "4-1"],
    7: ["0-1", "1-2", "2-2", "3-2", "4-1"],
    8: ["0-0", "1-0", "2-1", "3-2", "4-2"],
    9: ["0-2", "1-2", "2-1", "3-0", "4-0"],
  };

  const normalizeLinePattern = (betAreaId) => {
    const line = Number(betAreaId);
    return linePatternMap[line] ? linePatternMap[line].slice() : [];
  };

  const fullBoardPattern = Array.from({ length: 5 }, (_, column) =>
    Array.from({ length: 3 }, (_, row) => `${column}-${row}`)
  ).flat();

  const winAreas = toArray(mergedSource.betAreas || betRecord.betAreas).map((area, index) => {
    const iconId = Number(area && area.iconId);
    const num = Number(area && area.num);
    const betAreaId = Number(area && area.betAreaId);
    const formulaParts = [toMoney(area && area.betGold), area && area.betMultiple, area && area.iconMultiple].filter(
      (item) => item !== undefined && item !== null && item !== ""
    );

    const isFullScreen = num === 15 || betAreaId >= 10;
    const pattern = isFullScreen ? fullBoardPattern.slice() : normalizeLinePattern(betAreaId);
    const highlightPattern =
      num >= pattern.length
        ? pattern.slice()
        : (area && area.leftRight ? pattern.slice(0, num) : pattern.slice(Math.max(pattern.length - num, 0)));

    return {
      index,
      betAreaId,
      iconId,
      iconName: iconNameMap[iconId] || `图标${iconId}`,
      num,
      leftRight: !!(area && area.leftRight),
      betMultiple: Number(area && area.betMultiple || 0),
      iconMultiple: Number(area && area.iconMultiple || 0),
      betGold: Number(area && area.betGold || 0),
      winLoseGold: Number(area && area.winLoseGold || 0),
      isFullScreen,
      formula: formulaParts.join(" x "),
      pattern,
      highlightPattern,
    };
  });

  const triggerDetails = specialInfo && Array.isArray(specialInfo.trigger_details)
    ? specialInfo.trigger_details.map((item, index) => ({
        index,
        lineId: Number(item && item.lineId || 0),
        indexes: toArray(item && item.indexes).map((value) => Number(value)),
        rewardTimes: Math.max(toArray(item && item.indexes).length - 2, 0),
      }))
    : [];

  const freeRounds = [];
  const openDetails = specialInfo && Array.isArray(specialInfo.open_details) ? specialInfo.open_details : [];
  openDetails.forEach((group, groupIndex) => {
    toArray(group && group.round_details).forEach((round, roundIndex) => {
      const innerIcons = toArray(round && round.inner_icons).map((item) => Number(item));
      const outerIcon = Number(round && round.outer_icon);
      const allIcons = innerIcons.concat(Number.isFinite(outerIcon) ? [outerIcon] : []);
      const matchedIndexes = [];
      if (innerIcons.length >= 3 && innerIcons[0] === innerIcons[1] && innerIcons[1] === innerIcons[2]) {
        matchedIndexes.push(0, 1, 2);
        if (innerIcons[2] === innerIcons[3]) matchedIndexes.push(3);
      } else if (innerIcons.length >= 4 && innerIcons[1] === innerIcons[2] && innerIcons[2] === innerIcons[3]) {
        matchedIndexes.push(1, 2, 3);
      }

      freeRounds.push({
        key: `${groupIndex}-${roundIndex}`,
        setIndex: groupIndex,
        roundIndex,
        label: `第${groupIndex + 1}组 第${roundIndex + 1}回合`,
        innerIcons,
        outerIcon,
        allIcons,
        matchedIndexes,
        outerIncome: Number(round && round.outer_income || 0),
        innerIncome: Number(round && round.inner_income || 0),
        outerOdds: Number(round && round.outer_odds || 0),
        innerOdds: Number(round && round.inner_odds || 0),
        singleBet: Number(round && round.single_bet || mergedSource.betSingle || 0),
        multi: Number(round && round.multi || mergedSource.betTimes || 0),
      });
    });
  });

  const activeFreeRound = freeRounds[0] || null;

  return {
    mode: "shz",
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
    battleWinLoseGold: Number(mergedSource.battleWinLoseGold || 0),
    mainIcons,
    winAreas,
    triggerDetails,
    freeRounds,
    freeSetCount: Number(specialInfo && specialInfo.total_set || openDetails.length || 0),
    hasFreeGame: freeRounds.length > 0,
    activeFreeRound,
    iconNameMap,
  };
}

const SLOT_GRID_BY_COUNT = {
  9: { columns: 3, rows: 3 },
  12: { columns: 4, rows: 3 },
  15: { columns: 5, rows: 3 },
  18: { columns: 6, rows: 3 },
  20: { columns: 5, rows: 4 },
  24: { columns: 6, rows: 4 },
  25: { columns: 5, rows: 5 },
  30: { columns: 6, rows: 5 },
};

const GENERIC_SLOT_ICON_NAME_MAP = {};

const TGPD_JEWEL_TYPE = {
  BOOM_CANDY: 1,
  BAI_YU: 97,
  BI_YU: 98,
  MO_YU: 99,
  MA_NAO: 100,
  HU_PO: 101,
  ZU_MU_LV: 102,
  MAO_YAN_SHI: 103,
  ZI_SHUI_JING: 104,
  FEI_CUI: 105,
  ZHEN_ZHU: 106,
  HONG_BAO_SHI: 107,
  LV_BAO_SHI: 108,
  HUANG_BAO_SHI: 109,
  LAN_BAO_SHI: 110,
  ZUAN_SHI: 111,
};

const TGPD_CHAR_TO_TYPE = {
  x: TGPD_JEWEL_TYPE.BOOM_CANDY,
  a: TGPD_JEWEL_TYPE.BAI_YU,
  b: TGPD_JEWEL_TYPE.BI_YU,
  c: TGPD_JEWEL_TYPE.MO_YU,
  d: TGPD_JEWEL_TYPE.MA_NAO,
  e: TGPD_JEWEL_TYPE.HU_PO,
  f: TGPD_JEWEL_TYPE.ZU_MU_LV,
  g: TGPD_JEWEL_TYPE.MAO_YAN_SHI,
  h: TGPD_JEWEL_TYPE.ZI_SHUI_JING,
  i: TGPD_JEWEL_TYPE.FEI_CUI,
  j: TGPD_JEWEL_TYPE.ZHEN_ZHU,
  k: TGPD_JEWEL_TYPE.HONG_BAO_SHI,
  l: TGPD_JEWEL_TYPE.LV_BAO_SHI,
  m: TGPD_JEWEL_TYPE.HUANG_BAO_SHI,
  n: TGPD_JEWEL_TYPE.LAN_BAO_SHI,
  o: TGPD_JEWEL_TYPE.ZUAN_SHI,
};

const TGPD_IMAGE_MAP = {
  [TGPD_JEWEL_TYPE.BOOM_CANDY]: 1,
  [TGPD_JEWEL_TYPE.BAI_YU]: 11,
  [TGPD_JEWEL_TYPE.BI_YU]: 12,
  [TGPD_JEWEL_TYPE.MO_YU]: 13,
  [TGPD_JEWEL_TYPE.MA_NAO]: 14,
  [TGPD_JEWEL_TYPE.HU_PO]: 15,
  [TGPD_JEWEL_TYPE.ZU_MU_LV]: 21,
  [TGPD_JEWEL_TYPE.MAO_YAN_SHI]: 22,
  [TGPD_JEWEL_TYPE.ZI_SHUI_JING]: 23,
  [TGPD_JEWEL_TYPE.FEI_CUI]: 24,
  [TGPD_JEWEL_TYPE.ZHEN_ZHU]: 25,
  [TGPD_JEWEL_TYPE.HONG_BAO_SHI]: 31,
  [TGPD_JEWEL_TYPE.LV_BAO_SHI]: 32,
  [TGPD_JEWEL_TYPE.HUANG_BAO_SHI]: 33,
  [TGPD_JEWEL_TYPE.LAN_BAO_SHI]: 34,
  [TGPD_JEWEL_TYPE.ZUAN_SHI]: 35,
};

GENERIC_SLOT_ICON_NAME_MAP.tgpd = {
  1: "炸弹糖",
  11: "白玉",
  12: "碧玉",
  13: "墨玉",
  14: "玛瑙",
  15: "琥珀",
  21: "祖母绿",
  22: "猫眼石",
  23: "紫水晶",
  24: "翡翠",
  25: "珍珠",
  31: "红宝石",
  32: "绿宝石",
  33: "黄宝石",
  34: "蓝宝石",
  35: "钻石",
};

GENERIC_SLOT_ICON_NAME_MAP.xldb = {
  1: "龙眼",
  2: "A",
  3: "K",
  11: "Q",
  12: "J",
  13: "10",
  21: "Wild",
  100: "绿奖",
  200: "蓝奖",
  500: "红奖",
  666: "空位",
};

GENERIC_SLOT_ICON_NAME_MAP.jqb = {
  1: "鹰鹉",
  2: "鳄鱼",
  3: "豹",
  11: "蛇",
  12: "青蛙",
  13: "10",
  21: "Wild",
  100: "绿奖",
  200: "蓝奖",
  500: "红奖",
  666: "空位",
};

GENERIC_SLOT_ICON_NAME_MAP.hgxs = {
  1: "蝴蝶鱼",
  2: "燕鱼",
  3: "小丑鱼",
  11: "水母",
  12: "海星",
  13: "海螺",
  21: "海龟",
};

GENERIC_SLOT_ICON_NAME_MAP.cjsgj2 = {
  1: "BAR",
  2: "铃铛",
  3: "樱桃",
  11: "柠檬",
  12: "荔枝",
  13: "橙子",
  14: "西瓜",
  15: "葡萄",
  16: "苹果",
  17: "星星",
  21: "Wild",
  31: "Scatter",
};

GENERIC_SLOT_ICON_NAME_MAP.worldcup = {
  1: "姆巴佩",
  2: "哈兰德",
  3: "C罗",
  4: "内马尔",
  5: "梅西",
  11: "A",
  12: "K",
  13: "Q",
  14: "J",
  15: "10",
  21: "SCATTER",
  31: "WILD",
};

GENERIC_SLOT_ICON_NAME_MAP.wcg = {
  1: "骨头",
  2: "项圈",
  3: "狗屋",
  11: "A",
  12: "K",
  13: "Q",
  14: "任意图",
  15: "ANY",
  21: "Wild1",
  22: "Wild2",
  23: "Wild3",
  24: "Wild4",
};

GENERIC_SLOT_ICON_NAME_MAP.lzhd = {
  1: "龙金",
  2: "龙蓝",
  3: "龙爪",
  4: "虎金",
  5: "虎白",
  6: "虎爪",
};

GENERIC_SLOT_ICON_NAME_MAP.rhdb = {
  1: "A",
  2: "K",
  3: "Q",
  4: "J",
  11: "巴西莓",
  12: "百香果",
  13: "火龙果",
  14: "香蕉",
  21: "Wild",
  31: "Scatter",
};

GENERIC_SLOT_ICON_NAME_MAP.sbwh = {
  1: "A",
  2: "K",
  3: "Q",
  11: "J",
  12: "小提琴",
  13: "手鼓",
  14: "沙锤",
  21: "Wild",
  31: "x2",
  32: "x3",
  33: "x5",
  34: "x10",
  35: "x15",
  36: "x20",
};

GENERIC_SLOT_ICON_NAME_MAP.cfmm = {
  1: "1x",
  2: "2x",
  11: "10x",
  12: "0",
  13: "1",
  21: "蓝倍奖",
  22: "紫倍奖",
  23: "金倍奖",
  31: "RESPIN",
  41: "幸运轮盘",
  42: "高级轮盘",
};

GENERIC_SLOT_ICON_NAME_MAP.stkh = {
  1: "A",
  2: "K",
  3: "Q",
  4: "J",
  5: "草帽",
  6: "玉米",
  7: "火堆",
  8: "灯笼",
  21: "Wild",
  22: "Wild",
  31: "Scatter",
};

GENERIC_SLOT_ICON_NAME_MAP.hhsc = {
  1: "元宝",
  2: "如意",
  3: "福袋",
  11: "红包",
  12: "鞭炮",
  13: "金币",
  21: "Wild",
};

GENERIC_SLOT_ICON_NAME_MAP.jfn = {
  1: "面具",
  2: "咖啡豆",
  3: "羽毛",
  11: "鼓",
  12: "A",
  13: "K",
  21: "Wild",
};

GENERIC_SLOT_ICON_NAME_MAP.jlbs = {
  1: "红宝石",
  2: "蓝宝石",
  3: "绿宝石",
  11: "A",
  12: "K",
  13: "Q",
  14: "J",
  21: "Wild",
  31: "1x",
  32: "2x",
  33: "3x",
  34: "5x",
  35: "10x",
  36: "15x",
};

GENERIC_SLOT_ICON_NAME_MAP.ssff = {
  1: "铜钱",
  2: "花生",
  3: "烟花",
  11: "红包",
  12: "元宝",
  13: "宝箱",
  21: "Wild",
  "21_0": "Wild",
  "21_1": "Wild",
  "21_2": "Wild",
};

const TRANSPARENT_PIXEL_DATA_URI = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const GENERIC_SLOT_ICON_IMAGE_MAP = {
  cjsgj2: {
    0: TRANSPARENT_PIXEL_DATA_URI,
  },
  hhsc: {
    0: TRANSPARENT_PIXEL_DATA_URI,
  },
};

const XLDB_SPECIAL_PIC_MAP = {
  31: 100,
  32: 100,
  33: 100,
  34: 200,
  35: 200,
  36: 200,
  37: 200,
  38: 500,
  39: 500,
};

const XLDB_SPECIAL_MULTI_MAP = {
  31: 0.5,
  32: 1,
  33: 2,
  34: 5,
  35: 10,
  36: 20,
  37: 50,
  38: 100,
  39: 500,
};

const JQB_LINE_ARRAY = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 1, 1],
  [1, 1, 0],
  [1, 1, 1],
  [1, 2, 1],
  [1, 2, 2],
  [2, 2, 1],
  [2, 2, 2],
  [2, 3, 2],
];

const JFN_LINE_ARRAY = [
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
    [1, 3],
    [0, 4],
  ],
  [
    [2, 0],
    [1, 1],
    [0, 2],
    [1, 3],
    [2, 4],
  ],
];

const JLBS_LINE_ARRAY = [
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
    [1, 3],
  ],
  [
    [2, 0],
    [1, 1],
    [0, 2],
    [1, 3],
  ],
];

const SSFF_LINE_ARRAY = [
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
    [1, 3],
    [0, 4],
  ],
  [
    [2, 0],
    [1, 1],
    [0, 2],
    [1, 3],
    [2, 4],
  ],
  [
    [1, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 4],
  ],
  [
    [1, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [1, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 2],
    [2, 3],
    [2, 4],
  ],
  [
    [2, 0],
    [2, 1],
    [1, 2],
    [0, 3],
    [0, 4],
  ],
];

const GENERIC_SLOT_ICON_ATLAS_MAP = {
  cjsgj: {
    url: "/cjsgj-icons-atlas.webp",
    width: 435,
    height: 502,
    swapRotatedSize: true,
    rotateDegrees: -90,
    frames: {
      0: { x: 287, y: 286, width: 132, height: 127, rotated: false, originalWidth: 132, originalHeight: 127 },
      1: { x: 3, y: 131, width: 139, height: 120, rotated: false, originalWidth: 139, originalHeight: 120 },
      2: { x: 146, y: 133, width: 139, height: 117, rotated: false, originalWidth: 139, originalHeight: 117 },
      3: { x: 146, y: 254, width: 121, height: 137, rotated: true, originalWidth: 123, originalHeight: 137 },
      4: { x: 300, y: 3, width: 132, height: 138, rotated: false, originalWidth: 132, originalHeight: 138 },
      5: { x: 154, y: 3, width: 126, height: 142, rotated: true, originalWidth: 128, originalHeight: 142 },
      6: { x: 3, y: 379, width: 120, height: 134, rotated: true, originalWidth: 120, originalHeight: 134 },
      7: { x: 3, y: 3, width: 124, height: 147, rotated: true, originalWidth: 124, originalHeight: 147 },
      8: { x: 289, y: 145, width: 138, height: 137, rotated: false, originalWidth: 138, originalHeight: 137 },
      9: { x: 3, y: 255, width: 129, height: 120, rotated: false, originalWidth: 129, originalHeight: 120 },
      10: { x: 141, y: 379, width: 117, height: 128, rotated: true, originalWidth: 117, originalHeight: 128 },
    },
  },
  dfdc: {
    url: "/dfdc-game-ui1.webp",
    frames: {
      0: { x: 1610, y: 2, width: 190, height: 192, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: -2, y: 1 } },
      1: { x: 1008, y: 406, width: 200, height: 198, rotated: true, originalWidth: 200, originalHeight: 200, offset: { x: 0, y: -1 } },
      2: { x: 1812, y: 800, width: 196, height: 120, rotated: true, originalWidth: 200, originalHeight: 200, offset: { x: 2, y: -3 } },
      3: { x: 1342, y: 604, width: 198, height: 198, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: 1, y: -1 } },
      4: { x: 1008, y: 204, width: 200, height: 198, rotated: true, originalWidth: 200, originalHeight: 200, offset: { x: 0, y: -1 } },
      5: { x: 808, y: 608, width: 200, height: 198, rotated: true, originalWidth: 200, originalHeight: 200, offset: { x: 0, y: -1 } },
      6: { x: 1612, y: 802, width: 198, height: 196, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: 1, y: -1 } },
      7: { x: 808, y: 406, width: 200, height: 198, rotated: true, originalWidth: 200, originalHeight: 200, offset: { x: 0, y: -1 } },
      8: { x: 1126, y: 810, width: 150, height: 166, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: -1, y: 0 } },
      9: { x: 1862, y: 330, width: 136, height: 166, rotated: true, originalWidth: 200, originalHeight: 200, offset: { x: -1, y: 0 } },
      10: { x: 598, y: 810, width: 140, height: 182, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: 0, y: 0 } },
      11: { x: 1934, y: 166, width: 110, height: 162, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: 0, y: 0 } },
      12: { x: 1862, y: 632, width: 162, height: 164, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: -1, y: 0 } },
      13: { x: 1804, y: 164, width: 120, height: 160, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: -1, y: 0 } },
      14: { x: 1410, y: 2, width: 198, height: 198, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: 1, y: -1 } },
      15: { x: 1408, y: 202, width: 198, height: 198, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: 1, y: -1 } },
      16: { x: 1010, y: 2, width: 200, height: 198, rotated: true, originalWidth: 200, originalHeight: 200, offset: { x: 0, y: -1 } },
      17: { x: 608, y: 2, width: 200, height: 200, rotated: false, originalWidth: 200, originalHeight: 200, offset: { x: 0, y: 0 } },
      18: { x: 1606, y: 402, width: 198, height: 196, rotated: true, originalWidth: 200, originalHeight: 200, offset: { x: 1, y: -1 } },
    },
  },
  tgpd: {
    url: "/tgpd-game-ui.webp",
    frames: {
      11: { x: 109, y: 627, width: 102, height: 106, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      12: { x: 757, y: 196, width: 106, height: 106, rotated: false, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      13: { x: 307, y: 438, width: 114, height: 102, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      14: { x: 748, y: 306, width: 106, height: 108, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      15: { x: 297, y: 326, width: 112, height: 108, rotated: false, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      21: { x: 443, y: 672, width: 110, height: 108, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      22: { x: 329, y: 556, width: 112, height: 106, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      23: { x: 525, y: 407, width: 108, height: 104, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: -1, y: -3 } },
      24: { x: 413, y: 326, width: 112, height: 104, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      25: { x: 219, y: 613, width: 114, height: 106, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: -1, y: -3 } },
      31: { x: 439, y: 556, width: 112, height: 108, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      32: { x: 633, y: 408, width: 106, height: 106, rotated: false, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      33: { x: 639, y: 196, width: 114, height: 102, rotated: false, originalWidth: 120, originalHeight: 120, offset: { x: -1, y: -5 } },
      34: { x: 743, y: 416, width: 104, height: 106, rotated: true, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
      35: { x: 413, y: 442, width: 108, height: 110, rotated: false, originalWidth: 120, originalHeight: 120, offset: { x: 0, y: -3 } },
    },
  },
  xldb: {
    url: "/xldb-rollers-bg.webp",
    frames: {
      1: { x: 4, y: 625, width: 284, height: 191, rotated: false, originalWidth: 284, originalHeight: 191, offset: { x: 0, y: 0 } },
      2: { x: 292, y: 568, width: 150, height: 165, rotated: true, originalWidth: 152, originalHeight: 167, offset: { x: 0, y: 0 } },
      3: { x: 311, y: 208, width: 154, height: 168, rotated: false, originalWidth: 154, originalHeight: 168, offset: { x: 0, y: 0 } },
      11: { x: 292, y: 380, width: 157, height: 184, rotated: false, originalWidth: 157, originalHeight: 186, offset: { x: 0, y: 0 } },
      12: { x: 292, y: 722, width: 92, height: 171, rotated: true, originalWidth: 94, originalHeight: 173, offset: { x: 0, y: 0 } },
      13: { x: 290, y: 820, width: 189, height: 175, rotated: true, originalWidth: 191, originalHeight: 177, offset: { x: 0, y: 0 } },
      21: { x: 4, y: 4, width: 303, height: 204, rotated: false, originalWidth: 303, originalHeight: 204, offset: { x: 0, y: 0 } },
      100: { x: 4, y: 820, width: 282, height: 177, rotated: false, originalWidth: 282, originalHeight: 177, offset: { x: 0, y: 0 } },
      200: { x: 4, y: 425, width: 284, height: 196, rotated: false, originalWidth: 284, originalHeight: 196, offset: { x: 0, y: 0 } },
      500: { x: 4, y: 212, width: 284, height: 209, rotated: false, originalWidth: 284, originalHeight: 209, offset: { x: 0, y: 0 } },
      666: { x: 311, y: 4, width: 200, height: 149, rotated: true, originalWidth: 200, originalHeight: 159, offset: { x: 0, y: 0 } },
    },
  },
  jqb: {
    url: "/jqb-game-ui2.webp",
    frames: {
      1: { x: 3, y: 224, width: 220, height: 207, rotated: true, originalWidth: 220, originalHeight: 207, offset: { x: 0, y: 0 } },
      2: { x: 214, y: 386, width: 195, height: 200, rotated: true, originalWidth: 195, originalHeight: 200, offset: { x: 0, y: 0 } },
      3: { x: 224, y: 197, width: 206, height: 185, rotated: false, originalWidth: 206, originalHeight: 185, offset: { x: 0, y: 0 } },
      11: { x: 224, y: 3, width: 215, height: 190, rotated: false, originalWidth: 215, originalHeight: 190, offset: { x: 0, y: 0 } },
      12: { x: 3, y: 448, width: 224, height: 192, rotated: true, originalWidth: 224, originalHeight: 192, offset: { x: 0, y: 0 } },
      13: { x: 199, y: 585, width: 195, height: 175, rotated: false, originalWidth: 195, originalHeight: 175, offset: { x: 0, y: 0 } },
      21: { x: 3, y: 3, width: 217, height: 217, rotated: false, originalWidth: 217, originalHeight: 217, offset: { x: 0, y: 0 } },
      100: { x: 3, y: 3, width: 217, height: 217, rotated: false, originalWidth: 217, originalHeight: 217, offset: { x: 0, y: 0 } },
      200: { x: 3, y: 3, width: 217, height: 217, rotated: false, originalWidth: 217, originalHeight: 217, offset: { x: 0, y: 0 } },
      500: { x: 3, y: 3, width: 217, height: 217, rotated: false, originalWidth: 217, originalHeight: 217, offset: { x: 0, y: 0 } },
      666: { x: 3, y: 3, width: 217, height: 217, rotated: false, originalWidth: 217, originalHeight: 217, offset: { x: 0, y: 0 } },
    },
  },
  hgxs: {
    url: "/hgxs-rollers-bg.webp",
    frames: {
      1: { x: 2, y: 248, width: 258, height: 210, rotated: false, originalWidth: 258, originalHeight: 210, offset: { x: 0, y: 0 } },
      2: { x: 263, y: 2, width: 224, height: 179, rotated: false, originalWidth: 224, originalHeight: 179, offset: { x: 0, y: 0 } },
      3: { x: 2, y: 460, width: 249, height: 163, rotated: false, originalWidth: 249, originalHeight: 163, offset: { x: 0, y: 0 } },
      11: { x: 262, y: 389, width: 216, height: 210, rotated: false, originalWidth: 216, originalHeight: 210, offset: { x: 0, y: 0 } },
      12: { x: 263, y: 183, width: 219, height: 204, rotated: false, originalWidth: 219, originalHeight: 204, offset: { x: 0, y: 0 } },
      13: { x: 253, y: 601, width: 205, height: 160, rotated: false, originalWidth: 207, originalHeight: 160, offset: { x: 1, y: 0 } },
      21: { x: 2, y: 2, width: 259, height: 244, rotated: false, originalWidth: 259, originalHeight: 244, offset: { x: 0, y: 0 } },
    },
  },
  cjsgj2: {
    url: "/cjsgj2-icon-clear.webp",
    width: 504,
    height: 798,
    swapRotatedSize: true,
    rotateDegrees: -90,
    frames: {
      1: { x: 3, y: 467, width: 179, height: 149, rotated: false, originalWidth: 179, originalHeight: 149 },
      2: { x: 183, y: 648, width: 168, height: 145, rotated: false, originalWidth: 168, originalHeight: 145 },
      3: { x: 210, y: 168, width: 147, height: 138, rotated: false, originalWidth: 147, originalHeight: 138 },
      11: { x: 210, y: 310, width: 153, height: 131, rotated: false, originalWidth: 153, originalHeight: 131 },
      12: { x: 361, y: 147, width: 147, height: 137, rotated: true, originalWidth: 147, originalHeight: 137 },
      13: { x: 366, y: 445, width: 141, height: 135, rotated: true, originalWidth: 141, originalHeight: 135 },
      14: { x: 347, y: 3, width: 140, height: 140, rotated: false, originalWidth: 140, originalHeight: 140 },
      15: { x: 355, y: 648, width: 146, height: 141, rotated: false, originalWidth: 146, originalHeight: 141 },
      16: { x: 210, y: 3, width: 161, height: 133, rotated: true, originalWidth: 161, originalHeight: 133 },
      17: { x: 367, y: 298, width: 110, height: 110, rotated: false, originalWidth: 110, originalHeight: 110 },
      21: { x: 3, y: 620, width: 175, height: 176, rotated: true, originalWidth: 177, originalHeight: 176 },
      31: { x: 3, y: 235, width: 228, height: 203, rotated: true, originalWidth: 228, originalHeight: 203 },
    },
  },
  rhdb: {
    url: "/rhdb-icon-clear.webp",
    frames: {
      1: { x: 231, y: 192, width: 199, height: 181, rotated: false, originalWidth: 199, originalHeight: 181 },
      2: { x: 3, y: 217, width: 190, height: 173, rotated: false, originalWidth: 190, originalHeight: 173 },
      3: { x: 197, y: 377, width: 177, height: 167, rotated: false, originalWidth: 177, originalHeight: 167 },
      4: { x: 3, y: 394, width: 170, height: 164, rotated: false, originalWidth: 170, originalHeight: 164 },
      11: { x: 177, y: 548, width: 163, height: 143, rotated: false, originalWidth: 163, originalHeight: 143 },
      12: { x: 3, y: 562, width: 152, height: 141, rotated: false, originalWidth: 152, originalHeight: 141 },
      13: { x: 344, y: 548, width: 153, height: 143, rotated: false, originalWidth: 153, originalHeight: 143 },
      14: { x: 378, y: 377, width: 119, height: 141, rotated: false, originalWidth: 119, originalHeight: 141 },
      21: { x: 231, y: 3, width: 217, height: 185, rotated: false, originalWidth: 217, originalHeight: 185 },
      31: { x: 3, y: 3, width: 210, height: 224, rotated: true, originalWidth: 210, originalHeight: 224 },
    },
  },
  sbwh: {
    url: "/sbwh-rollers-bg.webp",
    width: 994,
    height: 602,
    frames: {
      1: { x: 275, y: 233, width: 245, height: 214, rotated: false, originalWidth: 245, originalHeight: 214 },
      2: { x: 524, y: 421, width: 210, height: 167, rotated: false, originalWidth: 210, originalHeight: 167 },
      3: { x: 3, y: 453, width: 178, height: 154, rotated: false, originalWidth: 178, originalHeight: 154 },
      11: { x: 335, y: 451, width: 164, height: 138, rotated: false, originalWidth: 164, originalHeight: 138 },
      12: { x: 846, y: 417, width: 146, height: 132, rotated: true, originalWidth: 146, originalHeight: 132 },
      13: { x: 185, y: 453, width: 152, height: 146, rotated: true, originalWidth: 152, originalHeight: 146 },
      14: { x: 738, y: 421, width: 104, height: 148, rotated: false, originalWidth: 104, originalHeight: 148 },
      21: { x: 275, y: 3, width: 254, height: 226, rotated: false, originalWidth: 254, originalHeight: 226 },
      31: { x: 788, y: 3, width: 203, height: 203, rotated: false, originalWidth: 203, originalHeight: 203 },
      32: { x: 788, y: 210, width: 203, height: 203, rotated: false, originalWidth: 203, originalHeight: 203 },
      33: { x: 533, y: 3, width: 251, height: 205, rotated: false, originalWidth: 251, originalHeight: 205 },
      34: { x: 533, y: 212, width: 251, height: 205, rotated: false, originalWidth: 251, originalHeight: 205 },
      35: { x: 3, y: 3, width: 268, height: 221, rotated: false, originalWidth: 268, originalHeight: 221 },
      36: { x: 3, y: 228, width: 268, height: 221, rotated: false, originalWidth: 268, originalHeight: 221 },
    },
  },
  cfmm: {
    url: "/cfmm-rollers-bg.webp",
    frames: {
      1: { x: 193, y: 761, width: 174, height: 155, rotated: true, originalWidth: 192, originalHeight: 161, offset: { x: -1, y: 1 } },
      2: { x: 2, y: 564, width: 201, height: 155, rotated: false, originalWidth: 219, originalHeight: 161, offset: { x: 0, y: 1 } },
      11: { x: 246, y: 368, width: 102, height: 155, rotated: false, originalWidth: 104, originalHeight: 161, offset: { x: 0, y: -1 } },
      12: { x: 265, y: 2, width: 86, height: 155, rotated: false, originalWidth: 104, originalHeight: 161, offset: { x: 0, y: 1 } },
      13: { x: 246, y: 211, width: 104, height: 155, rotated: false, originalWidth: 104, originalHeight: 161, offset: { x: 0, y: -1 } },
      21: { x: 2, y: 863, width: 189, height: 140, rotated: false, originalWidth: 189, originalHeight: 140, offset: { x: 0, y: 0 } },
      22: { x: 2, y: 721, width: 189, height: 140, rotated: false, originalWidth: 189, originalHeight: 140, offset: { x: 0, y: 0 } },
      23: { x: 2, y: 399, width: 214, height: 163, rotated: false, originalWidth: 216, originalHeight: 165, offset: { x: 0, y: 1 } },
      31: { x: 205, y: 564, width: 195, height: 144, rotated: true, originalWidth: 195, originalHeight: 144, offset: { x: 0, y: 0 } },
      41: { x: 2, y: 211, width: 242, height: 186, rotated: false, originalWidth: 244, originalHeight: 188, offset: { x: 0, y: 0 } },
      42: { x: 2, y: 2, width: 261, height: 207, rotated: false, originalWidth: 263, originalHeight: 207, offset: { x: 0, y: 0 } },
    },
  },
  stkh: {
    url: "/stkh-rollers-bg.webp",
    frames: {
      1: { x: 3, y: 390, width: 188, height: 190, rotated: false, originalWidth: 188, originalHeight: 190 },
      2: { x: 402, y: 3, width: 188, height: 190, rotated: true, originalWidth: 188, originalHeight: 190 },
      3: { x: 592, y: 195, width: 189, height: 189, rotated: false, originalWidth: 189, originalHeight: 189 },
      4: { x: 596, y: 3, width: 188, height: 190, rotated: true, originalWidth: 188, originalHeight: 190 },
      5: { x: 806, y: 505, width: 133, height: 138, rotated: true, originalWidth: 133, originalHeight: 138 },
      6: { x: 386, y: 534, width: 128, height: 139, rotated: true, originalWidth: 128, originalHeight: 139 },
      7: { x: 529, y: 539, width: 116, height: 140, rotated: true, originalWidth: 116, originalHeight: 140 },
      8: { x: 673, y: 539, width: 100, height: 129, rotated: true, originalWidth: 100, originalHeight: 129 },
      11: { x: 3, y: 197, width: 192, height: 189, rotated: false, originalWidth: 192, originalHeight: 189 },
      12: { x: 204, y: 192, width: 190, height: 185, rotated: false, originalWidth: 190, originalHeight: 185 },
      13: { x: 204, y: 3, width: 194, height: 185, rotated: false, originalWidth: 194, originalHeight: 185 },
      14: { x: 398, y: 195, width: 190, height: 185, rotated: false, originalWidth: 190, originalHeight: 185 },
      15: { x: 790, y: 3, width: 171, height: 147, rotated: false, originalWidth: 171, originalHeight: 147 },
      16: { x: 386, y: 384, width: 159, height: 146, rotated: false, originalWidth: 159, originalHeight: 146 },
      17: { x: 549, y: 388, width: 150, height: 147, rotated: false, originalWidth: 150, originalHeight: 147 },
      18: { x: 790, y: 154, width: 162, height: 146, rotated: false, originalWidth: 162, originalHeight: 146 },
      21: { x: 785, y: 304, width: 175, height: 197, rotated: false, originalWidth: 175, originalHeight: 197 },
      22: { x: 199, y: 381, width: 183, height: 178, rotated: false, originalWidth: 183, originalHeight: 178 },
      31: { x: 3, y: 3, width: 197, height: 190, rotated: false, originalWidth: 197, originalHeight: 190 },
    },
  },
  hhsc: {
    url: "/hhsc-rollers-bg.webp",
    swapRotatedSize: true,
    frames: {
      1: { x: 311, y: 0, width: 291, height: 286, rotated: false, originalWidth: 291, originalHeight: 286 },
      2: { x: 602, y: 0, width: 298, height: 273, rotated: false, originalWidth: 298, originalHeight: 273 },
      3: { x: 602, y: 273, width: 278, height: 257, rotated: false, originalWidth: 278, originalHeight: 257 },
      11: { x: 566, y: 530, width: 240, height: 245, rotated: false, originalWidth: 240, originalHeight: 245 },
      12: { x: 311, y: 523, width: 252, height: 255, rotated: true, originalWidth: 252, originalHeight: 255, rotateDegrees: -90 },
      13: { x: 311, y: 286, width: 288, height: 237, rotated: false, originalWidth: 288, originalHeight: 237 },
      21: { x: 0, y: 341, width: 341, height: 311, rotated: true, originalWidth: 341, originalHeight: 311, rotateDegrees: -90 },
    },
  },
  worldcup: {
    url: "/worldcup-icon-clear.webp",
    frames: {
      1: { x: 2, y: 224, width: 213, height: 225, rotated: false, originalWidth: 217, originalHeight: 225, offset: { x: 0, y: 0 } },
      2: { x: 226, y: 2, width: 205, height: 225, rotated: true, originalWidth: 209, originalHeight: 227, offset: { x: 0, y: 0 } },
      3: { x: 673, y: 2, width: 207, height: 209, rotated: true, originalWidth: 209, originalHeight: 217, offset: { x: -1, y: -2 } },
      4: { x: 226, y: 209, width: 192, height: 209, rotated: true, originalWidth: 196, originalHeight: 211, offset: { x: -1, y: 1 } },
      5: { x: 884, y: 2, width: 190, height: 212, rotated: false, originalWidth: 192, originalHeight: 216, offset: { x: -1, y: 0 } },
      11: { x: 609, y: 362, width: 166, height: 148, rotated: false, originalWidth: 170, originalHeight: 150, offset: { x: 0, y: 0 } },
      12: { x: 437, y: 362, width: 170, height: 148, rotated: false, originalWidth: 172, originalHeight: 150, offset: { x: -1, y: 0 } },
      13: { x: 830, y: 216, width: 161, height: 153, rotated: false, originalWidth: 163, originalHeight: 155, offset: { x: 0, y: 0 } },
      14: { x: 673, y: 211, width: 155, height: 149, rotated: false, originalWidth: 157, originalHeight: 151, offset: { x: 0, y: 0 } },
      15: { x: 437, y: 212, width: 185, height: 148, rotated: false, originalWidth: 187, originalHeight: 150, offset: { x: 0, y: 0 } },
      21: { x: 453, y: 2, width: 208, height: 218, rotated: true, originalWidth: 212, originalHeight: 220, offset: { x: 0, y: 0 } },
      31: { x: 2, y: 2, width: 222, height: 220, rotated: false, originalWidth: 226, originalHeight: 232, offset: { x: 0, y: 5 } },
    },
  },
  wcg: {
    url: "/wcg-rollers-bg.webp",
    frames: {
      1: { x: 243, y: 446, width: 298, height: 242, rotated: false, originalWidth: 298, originalHeight: 242, offset: { x: 0, y: 0 } },
      2: { x: 562, y: 2, width: 217, height: 218, rotated: true, originalWidth: 217, originalHeight: 218, offset: { x: 0, y: 0 } },
      3: { x: 780, y: 2, width: 238, height: 218, rotated: false, originalWidth: 238, originalHeight: 218, offset: { x: 0, y: 0 } },
      11: { x: 2, y: 422, width: 239, height: 234, rotated: false, originalWidth: 239, originalHeight: 234, offset: { x: 0, y: 0 } },
      12: { x: 2, y: 2, width: 277, height: 206, rotated: false, originalWidth: 277, originalHeight: 206, offset: { x: 0, y: 0 } },
      13: { x: 283, y: 212, width: 228, height: 212, rotated: false, originalWidth: 228, originalHeight: 212, offset: { x: 0, y: 0 } },
      14: { x: 1336, y: 58, width: 48, height: 31, rotated: false, originalWidth: 49, originalHeight: 32, offset: { x: 0, y: 0 } },
      15: { x: 1223, y: 10, width: 46, height: 27, rotated: false, originalWidth: 48, originalHeight: 28, offset: { x: 1, y: 0 } },
      21: { x: 522, y: 720, width: 272, height: 244, rotated: true, originalWidth: 272, originalHeight: 244, offset: { x: 0, y: 0 } },
      22: { x: 276, y: 690, width: 272, height: 244, rotated: true, originalWidth: 272, originalHeight: 244, offset: { x: 0, y: 0 } },
      23: { x: 2, y: 690, width: 272, height: 244, rotated: false, originalWidth: 272, originalHeight: 244, offset: { x: 0, y: 0 } },
      24: { x: 543, y: 446, width: 272, height: 244, rotated: true, originalWidth: 272, originalHeight: 244, offset: { x: 0, y: 0 } },
    },
  },
  lzhd: {
    url: "/lzhd-rollers-bg.webp",
    frames: {
      1: { x: 761, y: 383, width: 375, height: 376, rotated: false, originalWidth: 375, originalHeight: 376 },
      2: { x: 382, y: 383, width: 375, height: 376, rotated: false, originalWidth: 375, originalHeight: 376 },
      3: { x: 761, y: 3, width: 375, height: 376, rotated: false, originalWidth: 375, originalHeight: 376 },
      4: { x: 382, y: 3, width: 375, height: 376, rotated: false, originalWidth: 375, originalHeight: 376 },
      5: { x: 3, y: 383, width: 375, height: 376, rotated: false, originalWidth: 375, originalHeight: 376 },
      6: { x: 3, y: 3, width: 375, height: 376, rotated: false, originalWidth: 375, originalHeight: 376 },
    },
  },
  jlbs: {
    url: "/jlbs-rollers-bg.webp",
    swapRotatedSize: true,
    rotateDegrees: -90,
    frames: {
      1: { x: 3, y: 541, width: 250, height: 234, rotated: false, originalWidth: 250, originalHeight: 234, offset: { x: 0, y: 0 } },
      2: { x: 3, y: 779, width: 250, height: 234, rotated: false, originalWidth: 250, originalHeight: 234, offset: { x: 0, y: 0 } },
      3: { x: 3, y: 1017, width: 250, height: 234, rotated: false, originalWidth: 250, originalHeight: 234, offset: { x: 0, y: 0 } },
      11: { x: 3, y: 1255, width: 250, height: 234, rotated: false, originalWidth: 250, originalHeight: 234, offset: { x: 0, y: 0 } },
      12: { x: 3, y: 1493, width: 250, height: 230, rotated: false, originalWidth: 250, originalHeight: 234, offset: { x: 0, y: 0 } },
      13: { x: 257, y: 738, width: 250, height: 230, rotated: false, originalWidth: 250, originalHeight: 234, offset: { x: 0, y: 0 } },
      14: { x: 257, y: 972, width: 250, height: 230, rotated: false, originalWidth: 250, originalHeight: 234, offset: { x: 0, y: 0 } },
      21: { x: 3, y: 3, width: 283, height: 265, rotated: false, originalWidth: 287, originalHeight: 269, offset: { x: -1, y: 0 } },
      22: { x: 3, y: 272, width: 283, height: 265, rotated: false, originalWidth: 287, originalHeight: 269, offset: { x: -1, y: 0 } },
      31: { x: 290, y: 3, width: 241, height: 218, rotated: true, originalWidth: 241, originalHeight: 218, offset: { x: 0, y: 0 } },
      32: { x: 290, y: 248, width: 241, height: 218, rotated: true, originalWidth: 241, originalHeight: 218, offset: { x: 0, y: 0 } },
      33: { x: 290, y: 493, width: 241, height: 218, rotated: true, originalWidth: 241, originalHeight: 218, offset: { x: 0, y: 0 } },
      34: { x: 257, y: 1206, width: 241, height: 218, rotated: false, originalWidth: 241, originalHeight: 218, offset: { x: 0, y: 0 } },
      35: { x: 257, y: 1428, width: 241, height: 218, rotated: false, originalWidth: 241, originalHeight: 218, offset: { x: 0, y: 0 } },
      36: { x: 257, y: 1650, width: 241, height: 218, rotated: false, originalWidth: 241, originalHeight: 218, offset: { x: 0, y: 0 } },
    },
  },
  ssff: {
    url: "/ssff-rollers-bg.webp",
    frames: {
      1: { x: 2, y: 2, width: 315, height: 263, rotated: false, originalWidth: 315, originalHeight: 263, offset: { x: 0, y: 0 } },
      2: { x: 316, y: 316, width: 281, height: 250, rotated: false, originalWidth: 281, originalHeight: 250, offset: { x: 0, y: 0 } },
      3: { x: 237, y: 732, width: 228, height: 239, rotated: false, originalWidth: 228, originalHeight: 239, offset: { x: 0, y: 0 } },
      11: { x: 2, y: 732, width: 233, height: 241, rotated: false, originalWidth: 263, originalHeight: 259, offset: { x: -1, y: -4 } },
      12: { x: 467, y: 732, width: 218, height: 197, rotated: false, originalWidth: 218, originalHeight: 197, offset: { x: 0, y: 0 } },
      13: { x: 316, y: 568, width: 237, height: 162, rotated: false, originalWidth: 237, originalHeight: 162, offset: { x: 0, y: 0 } },
      21: { x: 2, y: 267, width: 312, height: 312, rotated: false, originalWidth: 312, originalHeight: 312, offset: { x: 0, y: 0 } },
      "21_0": { x: 319, y: 2, width: 312, height: 312, rotated: false, originalWidth: 312, originalHeight: 312, offset: { x: 0, y: 0 } },
      "21_1": { x: 633, y: 311, width: 312, height: 307, rotated: false, originalWidth: 312, originalHeight: 307, offset: { x: 0, y: 0 } },
      "21_2": { x: 633, y: 2, width: 312, height: 307, rotated: false, originalWidth: 312, originalHeight: 307, offset: { x: 0, y: 0 } },
    },
  },
  jfn: {
    url: "/jfn-rollers-bg.webp",
    frames: {
      1: { x: 2, y: 288, width: 235, height: 240, rotated: false, originalWidth: 243, originalHeight: 240, offset: { x: 3, y: 0 } },
      2: { x: 2, y: 2, width: 219, height: 284, rotated: false, originalWidth: 219, originalHeight: 284, offset: { x: 0, y: 0 } },
      3: { x: 2, y: 530, width: 219, height: 194, rotated: false, originalWidth: 243, originalHeight: 240, offset: { x: 1, y: 0 } },
      11: { x: 239, y: 241, width: 207, height: 168, rotated: false, originalWidth: 243, originalHeight: 240, offset: { x: 4, y: -9 } },
      12: { x: 223, y: 584, width: 221, height: 152, rotated: false, originalWidth: 243, originalHeight: 240, offset: { x: -1, y: -6 } },
      13: { x: 239, y: 411, width: 171, height: 196, rotated: true, originalWidth: 243, originalHeight: 240, offset: { x: 7, y: 0 } },
      21: { x: 223, y: 2, width: 237, height: 228, rotated: true, originalWidth: 243, originalHeight: 240, offset: { x: 3, y: -2 } },
    },
  },
};

const RHDB_FUZZY_ICON_ATLAS = {
  url: "/rhdb-icon-fuzzy.webp",
  frames: {
    1: { x: 415, y: 3, width: 195, height: 194, rotated: true, originalWidth: 195, originalHeight: 194 },
    2: { x: 613, y: 3, width: 186, height: 186, rotated: false, originalWidth: 186, originalHeight: 186 },
    3: { x: 756, y: 193, width: 173, height: 180, rotated: true, originalWidth: 173, originalHeight: 180 },
    4: { x: 415, y: 202, width: 166, height: 177, rotated: true, originalWidth: 166, originalHeight: 177 },
    11: { x: 596, y: 202, width: 159, height: 156, rotated: true, originalWidth: 159, originalHeight: 156 },
    12: { x: 213, y: 220, width: 148, height: 154, rotated: true, originalWidth: 148, originalHeight: 154 },
    13: { x: 803, y: 3, width: 149, height: 156, rotated: false, originalWidth: 149, originalHeight: 156 },
    14: { x: 3, y: 243, width: 115, height: 154, rotated: true, originalWidth: 115, originalHeight: 154 },
    21: { x: 213, y: 3, width: 213, height: 198, rotated: true, originalWidth: 213, originalHeight: 198 },
    31: { x: 3, y: 3, width: 206, height: 236, rotated: false, originalWidth: 206, originalHeight: 236 },
  },
};

const STKH_FUZZY_ICON_ATLAS = {
  url: "/stkh-fuzzy-bg.webp",
  frames: {
    1: { x: 203, y: 3, width: 188, height: 205, rotated: true, originalWidth: 188, originalHeight: 205 },
    2: { x: 3, y: 418, width: 188, height: 205, rotated: false, originalWidth: 188, originalHeight: 205 },
    3: { x: 621, y: 3, width: 189, height: 204, rotated: true, originalWidth: 189, originalHeight: 204 },
    4: { x: 412, y: 3, width: 188, height: 205, rotated: true, originalWidth: 188, originalHeight: 205 },
    5: { x: 772, y: 393, width: 131, height: 150, rotated: false, originalWidth: 131, originalHeight: 150 },
    6: { x: 677, y: 556, width: 128, height: 151, rotated: false, originalWidth: 128, originalHeight: 151 },
    7: { x: 3, y: 627, width: 116, height: 152, rotated: true, originalWidth: 116, originalHeight: 152 },
    8: { x: 809, y: 547, width: 100, height: 143, rotated: false, originalWidth: 100, originalHeight: 143 },
    11: { x: 3, y: 210, width: 192, height: 204, rotated: false, originalWidth: 192, originalHeight: 204 },
    12: { x: 417, y: 195, width: 190, height: 200, rotated: true, originalWidth: 190, originalHeight: 200 },
    13: { x: 621, y: 196, width: 193, height: 200, rotated: true, originalWidth: 193, originalHeight: 200 },
    14: { x: 199, y: 374, width: 190, height: 200, rotated: true, originalWidth: 190, originalHeight: 200 },
    15: { x: 598, y: 393, width: 170, height: 159, rotated: false, originalWidth: 170, originalHeight: 159 },
    16: { x: 360, y: 576, width: 159, height: 158, rotated: false, originalWidth: 159, originalHeight: 158 },
    17: { x: 523, y: 576, width: 150, height: 159, rotated: false, originalWidth: 150, originalHeight: 159 },
    18: { x: 195, y: 568, width: 161, height: 159, rotated: false, originalWidth: 161, originalHeight: 159 },
    21: { x: 203, y: 195, width: 175, height: 210, rotated: true, originalWidth: 175, originalHeight: 210 },
    22: { x: 403, y: 389, width: 183, height: 191, rotated: true, originalWidth: 183, originalHeight: 191 },
    31: { x: 3, y: 3, width: 196, height: 203, rotated: false, originalWidth: 196, originalHeight: 203 },
  },
};

const STKH_REWARD_LINES = {
  1: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
  2: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  3: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
  4: [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]],
  5: [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]],
  6: [[0, 0], [1, 0], [2, 1], [3, 0], [4, 0]],
  7: [[0, 2], [1, 2], [2, 1], [3, 2], [4, 2]],
  8: [[0, 1], [1, 2], [2, 2], [3, 2], [4, 1]],
  9: [[0, 1], [1, 0], [2, 0], [3, 0], [4, 1]],
  10: [[0, 0], [1, 1], [2, 1], [3, 1], [4, 0]],
  11: [[0, 2], [1, 1], [2, 1], [3, 1], [4, 2]],
  12: [[0, 1], [1, 1], [2, 0], [3, 1], [4, 1]],
  13: [[0, 1], [1, 1], [2, 2], [3, 1], [4, 1]],
  14: [[0, 0], [1, 2], [2, 2], [3, 2], [4, 0]],
  15: [[0, 2], [1, 0], [2, 0], [3, 0], [4, 2]],
  16: [[0, 1], [1, 0], [2, 1], [3, 0], [4, 1]],
  17: [[0, 1], [1, 2], [2, 1], [3, 2], [4, 1]],
  18: [[0, 0], [1, 2], [2, 0], [3, 2], [4, 0]],
  19: [[0, 2], [1, 0], [2, 2], [3, 0], [4, 2]],
  20: [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0]],
  21: [[0, 2], [1, 1], [2, 2], [3, 1], [4, 2]],
  22: [[0, 0], [1, 2], [2, 1], [3, 2], [4, 0]],
  23: [[0, 2], [1, 0], [2, 1], [3, 0], [4, 2]],
  24: [[0, 1], [1, 0], [2, 2], [3, 0], [4, 1]],
  25: [[0, 1], [1, 2], [2, 0], [3, 2], [4, 1]],
  26: [[0, 0], [1, 0], [2, 2], [3, 0], [4, 0]],
  27: [[0, 2], [1, 2], [2, 0], [3, 2], [4, 2]],
  28: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 1]],
  29: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 1]],
  30: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 0]],
};

const SBWH_FUZZY_ICON_ATLAS = {
  url: "/sbwh-fuzzy-bg.webp",
  width: 774,
  height: 876,
  frames: {
    1: { x: 3, y: 475, width: 245, height: 228, rotated: false, originalWidth: 245, originalHeight: 228 },
    2: { x: 459, y: 465, width: 210, height: 186, rotated: false, originalWidth: 210, originalHeight: 186 },
    3: { x: 485, y: 655, width: 178, height: 175, rotated: false, originalWidth: 178, originalHeight: 175 },
    11: { x: 323, y: 693, width: 164, height: 158, rotated: true, originalWidth: 164, originalHeight: 158 },
    12: { x: 173, y: 707, width: 146, height: 152, rotated: false, originalWidth: 146, originalHeight: 152 },
    13: { x: 3, y: 707, width: 152, height: 166, rotated: true, originalWidth: 152, originalHeight: 166 },
    14: { x: 667, y: 655, width: 104, height: 168, rotated: false, originalWidth: 104, originalHeight: 168 },
    21: { x: 275, y: 3, width: 254, height: 237, rotated: false, originalWidth: 254, originalHeight: 237 },
    31: { x: 530, y: 258, width: 203, height: 214, rotated: true, originalWidth: 203, originalHeight: 214 },
    32: { x: 252, y: 475, width: 203, height: 214, rotated: false, originalWidth: 203, originalHeight: 214 },
    33: { x: 533, y: 3, width: 251, height: 216, rotated: true, originalWidth: 251, originalHeight: 216 },
    34: { x: 275, y: 242, width: 268, height: 232, rotated: false, originalWidth: 268, originalHeight: 232 },
    35: { x: 3, y: 242, width: 268, height: 232, rotated: false, originalWidth: 268, originalHeight: 232 },
    36: { x: 545, y: 3, width: 227, height: 253, rotated: false, originalWidth: 227, originalHeight: 253 },
  },
};

const SBWH_LINE_ATLAS = {
  url: "/sbwh-line-bg.webp",
  width: 215,
  height: 215,
  frames: {
    1: { x: 144, y: 2, width: 69, height: 69, rotated: false, originalWidth: 69, originalHeight: 69 },
    2: { x: 73, y: 2, width: 69, height: 69, rotated: false, originalWidth: 69, originalHeight: 69 },
    3: { x: 2, y: 144, width: 69, height: 69, rotated: false, originalWidth: 69, originalHeight: 69 },
    4: { x: 2, y: 73, width: 69, height: 69, rotated: false, originalWidth: 69, originalHeight: 69 },
    5: { x: 2, y: 2, width: 69, height: 69, rotated: false, originalWidth: 69, originalHeight: 69 },
  },
};

const GENERIC_SLOT_FUZZY_ATLAS_MAP = {
  worldcup: {
    url: "/worldcup-icon-fuzzy.webp",
    frames: {
      1: { x: 2, y: 242, width: 211, height: 241, rotated: false, originalWidth: 217, originalHeight: 243, offset: { x: 0, y: 1 } },
      2: { x: 215, y: 242, width: 205, height: 242, rotated: false, originalWidth: 209, originalHeight: 244, offset: { x: 0, y: 0 } },
      3: { x: 422, y: 237, width: 207, height: 228, rotated: false, originalWidth: 209, originalHeight: 228, offset: { x: -1, y: 0 } },
      4: { x: 624, y: 2, width: 190, height: 226, rotated: false, originalWidth: 196, originalHeight: 228, offset: { x: -1, y: 1 } },
      5: { x: 432, y: 2, width: 190, height: 230, rotated: false, originalWidth: 192, originalHeight: 232, offset: { x: 0, y: 0 } },
      11: { x: 798, y: 230, width: 164, height: 165, rotated: false, originalWidth: 168, originalHeight: 165, offset: { x: 0, y: 0 } },
      12: { x: 816, y: 2, width: 166, height: 163, rotated: true, originalWidth: 170, originalHeight: 165, offset: { x: 0, y: 1 } },
      13: { x: 964, y: 170, width: 159, height: 170, rotated: false, originalWidth: 161, originalHeight: 170, offset: { x: 0, y: 0 } },
      14: { x: 964, y: 342, width: 153, height: 166, rotated: false, originalWidth: 155, originalHeight: 166, offset: { x: 0, y: 0 } },
      15: { x: 631, y: 230, width: 183, height: 165, rotated: true, originalWidth: 185, originalHeight: 165, offset: { x: 0, y: 0 } },
      21: { x: 224, y: 2, width: 206, height: 233, rotated: false, originalWidth: 210, originalHeight: 235, offset: { x: -1, y: 1 } },
      31: { x: 2, y: 2, width: 220, height: 238, rotated: false, originalWidth: 226, originalHeight: 240, offset: { x: 1, y: 1 } },
    },
  },
  wcg: {
    url: "/wcg-fuzzy-bg.webp",
    frames: {
      1: { x: 2, y: 2, width: 298, height: 272, rotated: false, originalWidth: 300, originalHeight: 274, offset: { x: -1, y: 1 } },
      2: { x: 792, y: 503, width: 217, height: 231, rotated: false, originalWidth: 227, originalHeight: 257, offset: { x: 1, y: -3 } },
      3: { x: 536, y: 503, width: 254, height: 255, rotated: false, originalWidth: 256, originalHeight: 255, offset: { x: 0, y: 0 } },
      11: { x: 579, y: 263, width: 238, height: 262, rotated: true, originalWidth: 238, originalHeight: 262, offset: { x: 0, y: 0 } },
      12: { x: 302, y: 263, width: 275, height: 233, rotated: false, originalWidth: 275, originalHeight: 233, offset: { x: 0, y: 0 } },
      13: { x: 2, y: 537, width: 227, height: 240, rotated: true, originalWidth: 227, originalHeight: 240, offset: { x: 0, y: 0 } },
      21: { x: 275, y: 498, width: 271, height: 259, rotated: true, originalWidth: 271, originalHeight: 259, offset: { x: 0, y: 0 } },
      22: { x: 575, y: 2, width: 271, height: 259, rotated: false, originalWidth: 271, originalHeight: 259, offset: { x: 0, y: 0 } },
      23: { x: 302, y: 2, width: 271, height: 259, rotated: false, originalWidth: 271, originalHeight: 259, offset: { x: 0, y: 0 } },
      24: { x: 2, y: 276, width: 271, height: 259, rotated: false, originalWidth: 271, originalHeight: 259, offset: { x: 0, y: 0 } },
    },
  },
  jfn: {
    url: "/jfn-fuzzy-bg.webp",
    frames: {
      1: { x: 223, y: 2, width: 234, height: 270, rotated: false, originalWidth: 236, originalHeight: 270, offset: { x: -1, y: 0 } },
      2: { x: 2, y: 2, width: 219, height: 322, rotated: false, originalWidth: 219, originalHeight: 322, offset: { x: 0, y: 0 } },
      3: { x: 700, y: 2, width: 218, height: 224, rotated: false, originalWidth: 218, originalHeight: 224, offset: { x: 0, y: 0 } },
      11: { x: 700, y: 228, width: 206, height: 199, rotated: true, originalWidth: 206, originalHeight: 199, offset: { x: 0, y: 0 } },
      12: { x: 459, y: 260, width: 221, height: 183, rotated: false, originalWidth: 221, originalHeight: 183, offset: { x: 0, y: 0 } },
      13: { x: 223, y: 274, width: 170, height: 226, rotated: true, originalWidth: 170, originalHeight: 226, offset: { x: 0, y: 0 } },
      21: { x: 459, y: 2, width: 239, height: 256, rotated: false, originalWidth: 239, originalHeight: 258, offset: { x: 0, y: 0 } },
    },
  },
  jlbs: {
    url: "/jlbs-fuzzy-bg.webp",
    swapRotatedSize: true,
    rotateDegrees: -90,
    frames: {
      1: { x: 511, y: 492, width: 250, height: 247, rotated: false, originalWidth: 250, originalHeight: 251, offset: { x: 0, y: 0 } },
      2: { x: 765, y: 492, width: 250, height: 251, rotated: true, originalWidth: 250, originalHeight: 251, offset: { x: 0, y: 0 } },
      3: { x: 3, y: 736, width: 250, height: 251, rotated: false, originalWidth: 250, originalHeight: 251, offset: { x: 0, y: 0 } },
      11: { x: 493, y: 245, width: 250, height: 243, rotated: false, originalWidth: 250, originalHeight: 251, offset: { x: 0, y: 0 } },
      12: { x: 3, y: 487, width: 250, height: 245, rotated: false, originalWidth: 250, originalHeight: 251, offset: { x: 0, y: -1 } },
      13: { x: 747, y: 245, width: 250, height: 243, rotated: false, originalWidth: 250, originalHeight: 251, offset: { x: 0, y: 0 } },
      14: { x: 257, y: 492, width: 250, height: 245, rotated: false, originalWidth: 250, originalHeight: 251, offset: { x: 0, y: 0 } },
      21: { x: 257, y: 743, width: 282, height: 283, rotated: true, originalWidth: 282, originalHeight: 283, offset: { x: 0, y: 0 } },
      22: { x: 544, y: 746, width: 282, height: 283, rotated: true, originalWidth: 282, originalHeight: 283, offset: { x: 0, y: 0 } },
      31: { x: 3, y: 3, width: 241, height: 238, rotated: false, originalWidth: 241, originalHeight: 238, offset: { x: 0, y: 0 } },
      32: { x: 248, y: 3, width: 241, height: 238, rotated: false, originalWidth: 241, originalHeight: 238, offset: { x: 0, y: 0 } },
      33: { x: 493, y: 3, width: 241, height: 238, rotated: false, originalWidth: 241, originalHeight: 238, offset: { x: 0, y: 0 } },
      34: { x: 738, y: 3, width: 241, height: 238, rotated: false, originalWidth: 241, originalHeight: 238, offset: { x: 0, y: 0 } },
      35: { x: 3, y: 245, width: 241, height: 238, rotated: false, originalWidth: 241, originalHeight: 238, offset: { x: 0, y: 0 } },
      36: { x: 248, y: 245, width: 241, height: 238, rotated: false, originalWidth: 241, originalHeight: 238, offset: { x: 0, y: 0 } },
    },
  },
  ssff: {
    url: "/ssff-fuzzy-bg.webp",
    swapRotatedSize: true,
    rotateDegrees: -90,
    frames: {
      1: { x: 2, y: 702, width: 314, height: 291, rotated: true, originalWidth: 314, originalHeight: 291, offset: { x: 0, y: 0 } },
      2: { x: 316, y: 2, width: 281, height: 278, rotated: false, originalWidth: 281, originalHeight: 278, offset: { x: 0, y: 0 } },
      3: { x: 316, y: 282, width: 227, height: 266, rotated: true, originalWidth: 227, originalHeight: 266, offset: { x: 0, y: 0 } },
      11: { x: 584, y: 316, width: 233, height: 259, rotated: false, originalWidth: 263, originalHeight: 259, offset: { x: -1, y: 0 } },
      12: { x: 633, y: 577, width: 217, height: 225, rotated: true, originalWidth: 217, originalHeight: 225, offset: { x: 0, y: 0 } },
      13: { x: 819, y: 316, width: 235, height: 190, rotated: true, originalWidth: 235, originalHeight: 190, offset: { x: 0, y: 0 } },
      21: { x: 295, y: 702, width: 312, height: 336, rotated: true, originalWidth: 312, originalHeight: 336, offset: { x: 0, y: 0 } },
      "21_0": { x: 2, y: 364, width: 312, height: 336, rotated: false, originalWidth: 312, originalHeight: 336, offset: { x: 0, y: 0 } },
      "21_1": { x: 633, y: 2, width: 312, height: 332, rotated: true, originalWidth: 312, originalHeight: 332, offset: { x: 0, y: 0 } },
      "21_2": { x: 2, y: 2, width: 312, height: 360, rotated: false, originalWidth: 312, originalHeight: 360, offset: { x: 0, y: 0 } },
    },
  },
  hhsc: {
    url: "/hhsc-fuzzy-bg.webp",
    swapRotatedSize: true,
    frames: {
      1: { x: 2, y: 2, width: 287, height: 312, rotated: false, originalWidth: 291, originalHeight: 312, offset: { x: -1, y: 0 } },
      2: { x: 291, y: 2, width: 295, height: 299, rotated: false, originalWidth: 297, originalHeight: 301, offset: { x: -1, y: 1 } },
      3: { x: 588, y: 266, width: 269, height: 281, rotated: false, originalWidth: 275, originalHeight: 283, offset: { x: 0, y: 1 } },
      11: { x: 2, y: 316, width: 236, height: 270, rotated: true, originalWidth: 238, originalHeight: 272, offset: { x: 0, y: 0 } },
      12: { x: 291, y: 303, width: 246, height: 277, rotated: true, originalWidth: 250, originalHeight: 279, offset: { x: -1, y: 1 }, rotateDegrees: -90 },
      13: { x: 588, y: 2, width: 286, height: 262, rotated: false, originalWidth: 288, originalHeight: 264, offset: { x: -1, y: 1 } },
    },
  },
  cjsgj2: {
    url: "/cjsgj2-icon-fuzzy.webp",
    width: 919,
    height: 466,
    swapRotatedSize: true,
    rotateDegrees: -90,
    frames: {
      1: { x: 416, y: 3, width: 179, height: 162, rotated: false, originalWidth: 179, originalHeight: 162 },
      2: { x: 599, y: 3, width: 168, height: 157, rotated: false, originalWidth: 168, originalHeight: 157 },
      3: { x: 578, y: 169, width: 147, height: 150, rotated: false, originalWidth: 147, originalHeight: 150 },
      11: { x: 412, y: 319, width: 153, height: 142, rotated: false, originalWidth: 153, originalHeight: 142 },
      12: { x: 729, y: 164, width: 147, height: 148, rotated: false, originalWidth: 147, originalHeight: 148 },
      13: { x: 729, y: 316, width: 141, height: 147, rotated: false, originalWidth: 141, originalHeight: 147 },
      14: { x: 569, y: 323, width: 140, height: 152, rotated: true, originalWidth: 140, originalHeight: 152 },
      15: { x: 771, y: 3, width: 145, height: 153, rotated: false, originalWidth: 145, originalHeight: 153 },
      16: { x: 416, y: 169, width: 158, height: 146, rotated: false, originalWidth: 158, originalHeight: 146 },
      21: { x: 235, y: 196, width: 173, height: 186, rotated: false, originalWidth: 173, originalHeight: 186 },
      31: { x: 3, y: 211, width: 228, height: 204, rotated: false, originalWidth: 228, originalHeight: 204 },
    },
  },
};

function isFiniteNumberLike(value) {
  if (value === null || value === undefined || value === "") return false;
  const num = Number(value);
  return Number.isFinite(num);
}

function normalizeSlotLinePos(linePos) {
  return toArray(linePos)
    .map((point) => {
      if (Array.isArray(point)) return [Number(point[0] || 0), Number(point[1] || 0)];
      if (point && Array.isArray(point.pos)) return [Number(point.pos[0] || 0), Number(point.pos[1] || 0)];
      return null;
    })
    .filter(Boolean);
}

function resolveSlotLinePos(area) {
  return normalizeSlotLinePos((area && (area.linePos || area.pos)) || []);
}

function stringifySlotLinePos(linePos) {
  const normalized = normalizeSlotLinePos(linePos);
  if (!normalized.length) return "";
  return normalized.map(([x, y]) => `${x}-${y}`).join(" / ");
}

function inferSlotGrid(iconCount, winAreas) {
  const knownGrid = SLOT_GRID_BY_COUNT[iconCount];
  if (knownGrid) return knownGrid;

  let maxColumn = 0;
  let maxRow = 0;
  toArray(winAreas).forEach((area) => {
    normalizeSlotLinePos(area && area.linePos).forEach(([x, y]) => {
      maxColumn = Math.max(maxColumn, Number(x || 0));
      maxRow = Math.max(maxRow, Number(y || 0));
    });
  });

  const columnsFromLine = maxColumn + 1;
  const rowsFromLine = maxRow + 1;
  if (columnsFromLine > 1 && rowsFromLine > 1 && columnsFromLine * rowsFromLine >= iconCount) {
    return { columns: columnsFromLine, rows: rowsFromLine };
  }

  if (iconCount <= 9) return { columns: 3, rows: Math.max(Math.ceil(iconCount / 3), 1) };
  if (iconCount <= 12) return { columns: 4, rows: Math.max(Math.ceil(iconCount / 4), 1) };
  if (iconCount <= 20) return { columns: 5, rows: Math.max(Math.ceil(iconCount / 5), 1) };
  return { columns: 6, rows: Math.max(Math.ceil(iconCount / 6), 1) };
}

function splitGenericSlotRounds(rawIcons, allAreas, timestampList) {
  const segments = String(rawIcons || "")
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const rounds = [];
  let areaOffset = 0;

  segments.forEach((segment, roundIndex) => {
    const tokens = segment
      .split(",")
      .map((item) => String(item).trim())
      .filter((item) => item !== "");

    let icons = tokens.slice();
    let areaCount = null;
    let timestampIndex = null;
    const tailTwoCount = tokens.length - 2;
    const tailOneCount = tokens.length - 1;

    if (
      tailTwoCount > 0 &&
      SLOT_GRID_BY_COUNT[tailTwoCount] &&
      isFiniteNumberLike(tokens.at(-2)) &&
      isFiniteNumberLike(tokens.at(-1))
    ) {
      icons = tokens.slice(0, -2);
      areaCount = Number(tokens.at(-2));
      timestampIndex = Number(tokens.at(-1));
    } else if (tailOneCount > 0 && SLOT_GRID_BY_COUNT[tailOneCount] && isFiniteNumberLike(tokens.at(-1))) {
      icons = tokens.slice(0, -1);
      areaCount = Number(tokens.at(-1));
    }

    const roundAreas =
      areaCount !== null && areaCount >= 0
        ? toArray(allAreas).slice(areaOffset, areaOffset + areaCount)
        : segments.length === 1
        ? toArray(allAreas)
        : [];
    if (areaCount !== null && areaCount >= 0) {
      areaOffset += areaCount;
    }

    rounds.push({
      roundIndex,
      label: `第 ${roundIndex + 1} 回合`,
      icons,
      raw: segment,
      timestampIndex,
      timestamp:
        Array.isArray(timestampList) && timestampIndex !== null && timestampIndex >= 0 ? timestampList[timestampIndex] : "",
      winAreas: roundAreas,
    });
  });

  return rounds;
}

function parseSlotIconTokens(rawIcons) {
  return String(rawIcons || "")
    .split(",")
    .map((item) => String(item).trim())
    .filter((item) => item !== "");
}

function normalizeSsffIconValue(value) {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (raw === "21") return "21_0";
  return /^-?\d+$/.test(raw) ? Number(raw) : raw;
}

function parseTgpdIconTokens(rawIcons) {
  const value = String(rawIcons || "").trim();
  if (!value) return [];
  if (value.includes(",")) {
    return value
      .split(",")
      .map((item) => String(item).trim())
      .filter((item) => item !== "");
  }
  return value.split("").filter((item) => item !== " ");
}

function normalizeTgpdIconValue(value) {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value).trim();
  if (!raw) return "";

  if (/^-?\d+$/.test(raw)) {
    const numericValue = Number(raw);
    if (Object.prototype.hasOwnProperty.call(TGPD_IMAGE_MAP, numericValue)) {
      return TGPD_IMAGE_MAP[numericValue];
    }
    return numericValue;
  }

  const lower = raw.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(TGPD_CHAR_TO_TYPE, lower)) {
    return TGPD_IMAGE_MAP[TGPD_CHAR_TO_TYPE[lower]] || "";
  }

  return raw;
}

function normalizeTgpdArea(area) {
  const normalizedArea = {
    ...(area || {}),
  };
  const areaKey = normalizedArea.betAreaId !== undefined ? normalizedArea.betAreaId : normalizedArea.iconId;
  const normalizedIconId = normalizeTgpdIconValue(areaKey);
  if (normalizedIconId !== "") {
    normalizedArea.iconId = normalizedIconId;
  }
  return normalizedArea;
}

function normalizeXldbIconValue(value) {
  if (value === null || value === undefined || value === "") return "";
  const normalizedValue =
    typeof value === "string"
      ? String(value)
          .replace(/[^0-9.-]/g, "")
          .trim()
      : value;
  if (normalizedValue === "") return "";
  const numericValue = Number(normalizedValue);
  if (!Number.isFinite(numericValue)) return value;
  if (numericValue === 0) return 666;
  if (Object.prototype.hasOwnProperty.call(XLDB_SPECIAL_PIC_MAP, numericValue)) {
    return XLDB_SPECIAL_PIC_MAP[numericValue];
  }
  return numericValue;
}

function normalizeXldbArea(area) {
  const normalizedArea = {
    ...(area || {}),
  };
  const normalizedIconId = normalizeXldbIconValue(
    normalizedArea.iconId !== undefined ? normalizedArea.iconId : normalizedArea.betAreaId
  );
  if (normalizedIconId !== "") {
    normalizedArea.iconId = normalizedIconId;
  }
  return normalizedArea;
}

function mapXldbIndexToCoord(index) {
  const columnHeights = [3, 4, 3];
  let offset = 0;
  for (let columnIndex = 0; columnIndex < columnHeights.length; columnIndex += 1) {
    const height = columnHeights[columnIndex];
    if (index < offset + height) {
      return [index - offset, columnIndex];
    }
    offset += height;
  }
  return null;
}

function buildXldbAreaHighlight(area, icons) {
  const normalizedTarget = normalizeXldbIconValue(area && area.iconId);
  const hitIndexes = toArray(icons).reduce((result, icon, index) => {
    if (normalizeXldbIconValue(icon) === normalizedTarget) {
      result.push(index);
    }
    return result;
  }, []);
  const linePos = hitIndexes
    .map((index) => mapXldbIndexToCoord(index))
    .filter(Boolean);
  return {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: linePos.length ? stringifySlotLinePos(linePos) : "",
  };
}

function buildJqbAreaHighlight(area) {
  const lineIndex = Number(area && area.betAreaId) - 1;
  const lineTemplate = JQB_LINE_ARRAY[lineIndex];
  if (!Array.isArray(lineTemplate) || lineTemplate.length !== 3) {
    return {
      linePos: [],
      highlightKeys: [],
      linePosText: "",
    };
  }
  const linePos = lineTemplate.map((rowIndex, columnIndex) => [Number(rowIndex), columnIndex]);
  return {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: stringifySlotLinePos(linePos),
  };
}

function normalizeJfnIcons(rawIcons) {
  const icons = toArray(rawIcons);
  if (icons.length !== 15) return icons;
  const rows = 3;
  const columns = 5;
  const ordered = [];
  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const sourceIndex = columnIndex * rows + rowIndex;
      ordered.push(icons[sourceIndex]);
    }
  }
  return ordered;
}

function normalizeCjsgjIcons(rawIcons) {
  const icons = toArray(rawIcons)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
  if (icons.length !== 15) return icons;

  const ordered = [];
  for (let columnIndex = 0; columnIndex < 5; columnIndex += 1) {
    ordered.push(...icons.slice(columnIndex * 3, columnIndex * 3 + 3).reverse());
  }
  return ordered;
}

function buildJfnAreaHighlight(area) {
  const lineTemplate = JFN_LINE_ARRAY[Number(area && area.betAreaId) - 1];
  if (!Array.isArray(lineTemplate) || !lineTemplate.length) {
    return {
      linePos: [],
      highlightKeys: [],
      linePosText: "",
    };
  }

  const hitCount = Math.min(
    Math.max(Number(area && area.num) || lineTemplate.length, 0),
    lineTemplate.length
  );
  const linePos = lineTemplate.slice(0, hitCount);
  return {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: stringifySlotLinePos(linePos),
  };
}

function buildJlbsAreaHighlight(area) {
  const lineTemplate = JLBS_LINE_ARRAY[Number(area && area.betAreaId) - 1];
  if (!Array.isArray(lineTemplate) || !lineTemplate.length) {
    return {
      linePos: [],
      highlightKeys: [],
      linePosText: "",
      title: "",
      formula: "",
      exMultiple: Number(area && area.exMultiple) || 1,
    };
  }

  const hitCount = Math.min(
    Math.max(Number(area && area.num) || lineTemplate.length, 0),
    lineTemplate.length
  );
  const linePos = lineTemplate.slice(0, hitCount);
  const betAreaId = Number(area && area.betAreaId);
  const exMultiple = Number(area && area.exMultiple) || 1;
  return {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: stringifySlotLinePos(linePos),
    title: Number.isFinite(betAreaId) && betAreaId > 0 ? `线 ${String(betAreaId).padStart(2, "0")}` : "",
    formula:
      area && area.betGold !== undefined
        ? `(${toMoney(area.betGold)} x ${toMoney(area.betMultiple || 1)} x ${toMoney(area.iconMultiple || 1)} x ${toMoney(exMultiple)})`
        : "",
    exMultiple,
  };
}

function buildSsffAreaHighlight(area) {
  const betAreaId = Number(area && area.betAreaId);
  const num = Number(area && area.num);
  const iconId = Number(area && area.iconId);
  const isFullScreen = num === 15 || betAreaId === 6 || betAreaId >= 10;

  const linePos = isFullScreen
    ? Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 5 }, (_, column) => [row, column])
      ).flat()
    : Array.isArray(SSFF_LINE_ARRAY[betAreaId - 1])
    ? SSFF_LINE_ARRAY[betAreaId - 1].slice(0, Math.max(0, Math.min(num || 5, 5)))
    : [];

  return {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: stringifySlotLinePos(linePos),
    iconId: iconId === 21 ? "21_0" : iconId,
    title: isFullScreen ? "满屏奖" : "",
    formula:
      isFullScreen && area && area.betGold !== undefined
        ? `(${toMoney(area.betGold)} x 1000)`
        : "",
  };
}

const HGXS_LINE_ARRAY = [
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  [
    [2, 0],
    [1, 1],
    [0, 2],
  ],
];

const HHSC_LINE_ARRAY = [
  [
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  [
    [0, 2],
    [1, 1],
    [2, 0],
  ],
];

function buildHhscAreaHighlight(area, icons = []) {
  const lineTemplate = HHSC_LINE_ARRAY[Number(area && area.betAreaId) - 1];
  if (!Array.isArray(lineTemplate) || !lineTemplate.length) {
    return {
      linePos: [],
      highlightKeys: [],
      linePosText: "",
    };
  }

  const hitCount = Math.min(Math.max(Number(area && area.num) || 0, 0), lineTemplate.length);
  const finalCount = Math.min(Math.max(hitCount || lineTemplate.length, 0), lineTemplate.length);
  const linePos = lineTemplate.slice(0, finalCount);
  return {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: stringifySlotLinePos(linePos),
  };
}

function buildHgxsAreaHighlight(area, isFullScreenGame) {
  if (isFullScreenGame) {
    const linePos = [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ];
    return {
      linePos,
      highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
      linePosText: stringifySlotLinePos(linePos),
    };
  }

  const lineTemplate = HGXS_LINE_ARRAY[Number(area && area.betAreaId) - 1];
  if (!Array.isArray(lineTemplate) || !lineTemplate.length) {
    return {
      linePos: [],
      highlightKeys: [],
      linePosText: "",
    };
  }

  const hitCount = Math.min(
    Math.max(Number(area && area.num) || lineTemplate.length, 0),
    lineTemplate.length
  );
  const linePos = lineTemplate.slice(0, hitCount);
  return {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: stringifySlotLinePos(linePos),
  };
}

function parseWorldcupLinePos(area) {
  const rawLinePos = toArray(area && area.linePos);
  const linePos = [];
  rawLinePos.forEach((columnEntry, columnIndex) => {
    const values = toArray(columnEntry && columnEntry.pos);
    values.forEach((rowValue) => {
      const rowIndex = Number(rowValue);
      if (Number.isFinite(rowIndex)) {
        linePos.push([rowIndex, columnIndex]);
      }
    });
  });
  return linePos;
}

function createWorldcupArea(area, index) {
  const linePos = parseWorldcupLinePos(area);
  return createSlotWinArea(area, index, {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: stringifySlotLinePos(linePos),
  });
}

function parseWorldcupRawIcons(rawIcons) {
  return String(rawIcons || "")
    .split(",")
    .map((item) => Number(String(item).trim()))
    .filter((item) => Number.isFinite(item));
}

function applyWorldcupBlessConversion(rawIcons, blessPrizeType) {
  const values = parseWorldcupRawIcons(rawIcons);
  if (!blessPrizeType || values.length <= 8) return values;
  const targetIcon = Number(values[8]);
  if (!Number.isFinite(targetIcon)) return values;
  return values.map((iconValue) => {
    if (iconValue <= 5 && iconValue !== targetIcon) {
      return targetIcon;
    }
    return iconValue;
  });
}

function normalizeWorldcupIcons(rawIcons, blessPrizeType) {
  const values = applyWorldcupBlessConversion(rawIcons, blessPrizeType);
  if (values.length !== 20) return values;
  const rows = 4;
  const columns = 5;
  const ordered = [];
  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const sourceIndex = columnIndex * rows + rowIndex;
      ordered.push(values[sourceIndex]);
    }
  }
  return ordered;
}

function parseWorldcupSpecialRound(rawValue) {
  if (typeof rawValue !== "string" || !rawValue.trim()) return null;
  const parts = rawValue.split("#");
  if (!parts.length) return null;

  const round = {
    icons: parts[1] || "",
    betAreas: [],
    winLoseGold: 0,
  };

  const areaSource = parts[0] || "";
  const firstSplit = areaSource.split("$");
  const areasRaw = firstSplit[0] || "";
  round.winLoseGold = Number(firstSplit[1] || 0);

  if (!areasRaw) return round;

  areasRaw.split("*").forEach((segment) => {
    if (!segment) return;
    const values = segment.split(",");
    if (values.length < 8) return;
    const area = {
      betAreaId: Number(values[0]),
      betGold: Number(values[1]),
      betMultiple: Number(values[2]),
      winLoseGold: Number(values[3]),
      num: Number(values[4]),
      iconMultiple: Number(values[5]),
      iconId: Number(values[6]),
      leftRight: String(values[7] || ""),
      linePos: [],
    };
    const lineRaw = String(values[7] || "");
    for (let columnIndex = 0; columnIndex < lineRaw.length; columnIndex += 1) {
      const rowValue = Number(lineRaw.charAt(columnIndex));
      if (Number.isFinite(rowValue)) {
        area.linePos.push({ pos: [rowValue] });
      }
    }
    round.betAreas.push(area);
  });

  return round;
}

function buildWorldcupViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const specialInfoSource =
    toArray(mergedSource.specialInfo || connection.specialInfo || betRecord.specialInfo).length
      ? toArray(mergedSource.specialInfo || connection.specialInfo || betRecord.specialInfo)
      : typeof mergedSource.specialInfoStr === "string" && mergedSource.specialInfoStr.trim()
      ? mergedSource.specialInfoStr
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const rawSpecialInfo = toArray(specialInfoSource);
  const specialRounds = rawSpecialInfo
    .map((item) => (typeof item === "string" ? parseWorldcupSpecialRound(item) : item))
    .filter(Boolean);

  const baseRound = {
    icons: mergedSource.icons || "",
    betAreas: toArray(mergedSource.betAreas || betRecord.betAreas),
    winLoseGold: Number(mergedSource.winLoseGold || 0),
    blessPrizeType: mergedSource.blessPrizeType,
    exTimes: mergedSource.exTimes,
  };

  const roundSource = [baseRound].concat(specialRounds);
  const rounds = roundSource.map((item, roundIndex) => {
    const winAreas = toArray(item && item.betAreas).map((area, index) => createWorldcupArea(area, index));
    return {
      roundIndex,
      label: `第 ${roundIndex + 1} 回合`,
      icons: normalizeWorldcupIcons(item && item.icons, item && item.blessPrizeType),
      raw: item && item.icons ? String(item.icons) : "",
      timestamp: "",
      winAreas,
      columns: 5,
      rows: 4,
      winLoseGold: Number((item && item.winLoseGold) || 0),
      fuzzyAtlas: GENERIC_SLOT_FUZZY_ATLAS_MAP.worldcup,
      boardOrder: "row-major",
    };
  });

  return {
    mode: "slot",
    confName: "worldcup",
    betGold: Number(mergedSource.betGold || 0),
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
    rounds,
    winAreas: rounds[0] ? rounds[0].winAreas : [],
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.worldcup || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.worldcup || null,
    fuzzyAtlas: GENERIC_SLOT_FUZZY_ATLAS_MAP.worldcup || null,
  };
}

function parseWcgIcons(rawIcons) {
  const parsed = safeJsonParse(typeof rawIcons === "string" ? rawIcons : "");
  if (Array.isArray(parsed)) {
    return parsed
      .map((column) =>
        toArray(column)
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value))
      )
      .filter((column) => column.length);
  }

  const tokens = parseSlotIconTokens(rawIcons).map((value) => Number(value)).filter((value) => Number.isFinite(value));
  if (!tokens.length) return [];
  return [tokens];
}

function normalizeWcgArea(area, index) {
  const normalized = createSlotWinArea(area, index);
  const iconId = Number(area && area.iconId);
  return {
    ...normalized,
    iconId: Number.isFinite(iconId) ? iconId : normalized.iconId,
    betAreaId: area && area.betAreaId !== undefined ? area.betAreaId : normalized.betAreaId,
  };
}

function createWcgColumn(column, columnIndex) {
  const values = toArray(column).map((value) => Number(value));
  const mergedIconId = Number(values[2] || 0);
  if (mergedIconId) {
    return {
      key: `wcg-col-${columnIndex}`,
      single: true,
      primaryIconId: mergedIconId,
      secondaryIconId: null,
      raw: values,
    };
  }

  return {
    key: `wcg-col-${columnIndex}`,
    single: false,
    primaryIconId: Number(values[1] || 0),
    secondaryIconId: Number(values[3] || 0),
    raw: values,
  };
}

function shouldUseWcgAnyIcon(winAreas) {
  return toArray(winAreas).some((area) => Number(area && area.iconId) === 14);
}

function buildWcgViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const specialRounds = toArray(mergedSource.specialInfo || connection.specialInfo || betRecord.specialInfo);
  const roundSources = specialRounds.length
    ? specialRounds
    : [
        {
          icons: mergedSource.icons || "",
          betAreas: mergedSource.betAreas || betRecord.betAreas || [],
          winLoseGold: mergedSource.winLoseGold,
          betSingle: mergedSource.betSingle,
          betTimes: mergedSource.betTimes,
          exTimes: mergedSource.exTimes,
        },
      ];

  const rounds = roundSources.map((item, roundIndex) => {
    const columns = parseWcgIcons(item && item.icons);
    const rawWinAreas = toArray(item && item.betAreas)
      .slice()
      .sort((left, right) => Number(left && left.betAreaId) - Number(right && right.betAreaId))
      .map((area, index) => normalizeWcgArea(area, index));
    const useAnyIcon = shouldUseWcgAnyIcon(rawWinAreas);
    const winAreas = rawWinAreas.map((area) => ({
      ...area,
      iconId: useAnyIcon ? 14 : area.iconId,
    }));

    return {
      roundIndex,
      label: `第 ${roundIndex + 1} 回合`,
      icons: [],
      iconColumns: columns.map((column, columnIndex) => createWcgColumn(column, columnIndex)),
      raw: item && item.icons ? String(item.icons) : "",
      timestamp: "",
      winAreas,
      columns: 3,
      rows: 1,
      winLoseGold: Number((item && item.winLoseGold) || 0),
      exTimes: Number((item && item.exTimes) || mergedSource.exTimes || 0),
      bonusTimes: winAreas.length === 5 ? 10 : 0,
    };
  });

  if (!rounds.length) return null;

  return {
    mode: "wcg",
    confName: "wcg",
    betGold: Number(mergedSource.betGold || 0),
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
    rounds,
    winAreas: rounds[0].winAreas,
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.wcg || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.wcg || null,
    fuzzyAtlas: GENERIC_SLOT_FUZZY_ATLAS_MAP.wcg || null,
    hideLinePosChip: true,
    wcgLayout: true,
  };
}

function buildXldbTemplateAreaHighlight(area) {
  const lineIndexSource =
    area && area.lineNo !== undefined && area.lineNo !== null && area.lineNo !== ""
      ? Number(area.lineNo)
      : Number(area && area.betAreaId) - 1;
  const lineIndex = Number(lineIndexSource);
  const lineTemplate = JQB_LINE_ARRAY[lineIndex];
  if (!Array.isArray(lineTemplate) || lineTemplate.length !== 3) {
    return null;
  }
  const linePos = lineTemplate.map((rowIndex, columnIndex) => [Number(rowIndex), columnIndex]);
  return {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: stringifySlotLinePos(linePos),
  };
}

function buildXldbViewModel(parsed, confName) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const allAreas = toArray(mergedSource.betAreas || betRecord.betAreas).map(normalizeXldbArea);
  const rawRounds = String(mergedSource.icons || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  const rounds = (rawRounds.length ? rawRounds : [String(mergedSource.icons || "")]).map((segment, roundIndex) => {
    const rawIconTokens = String(segment || "")
      .split(",")
      .map((item) => String(item).trim())
      .filter((item) => item !== "");
    const icons = rawIconTokens.map(normalizeXldbIconValue);

    let roundAreas = [];
    if (rawRounds.length > 1) {
      const matchedArea = allAreas.find((area) => Number(area && area.lineNo) === roundIndex);
      roundAreas = matchedArea
        ? [
            {
              ...createSlotWinArea(
                matchedArea,
                0,
                confName === "jqb" ? buildJqbAreaHighlight(matchedArea) : buildXldbAreaHighlight(matchedArea, icons)
              ),
              lineNo: matchedArea.lineNo,
            },
          ]
        : [];
    } else {
      roundAreas = allAreas.map((area, index) => {
        const highlight =
          confName === "jqb"
            ? buildJqbAreaHighlight(area)
            : (confName === "xldb" || confName === "xldb2") && buildXldbTemplateAreaHighlight(area)
            ? buildXldbTemplateAreaHighlight(area)
            : buildXldbAreaHighlight(area, icons);
        return {
          ...createSlotWinArea(area, index, highlight),
          lineNo: area.lineNo,
        };
      });
    }

    return {
      roundIndex,
      label: `第 ${roundIndex + 1} 回合`,
      icons,
      rawIconTokens,
      raw: segment,
      timestamp: "",
      winAreas: roundAreas,
      columns: 3,
      rows: 4,
      slotHeights: [3, 4, 3],
      winLoseGold:
        roundAreas.length === 1
          ? Number(roundAreas[0].winLoseGold || 0)
          : roundAreas.reduce((total, area) => total + Number(area && area.winLoseGold || 0), 0),
    };
  });

  if (!rounds.length && !allAreas.length) return null;

  return {
    mode: "xldb",
    confName,
    betGold: Number(mergedSource.betGold || 0),
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
    rounds,
    winAreas: allAreas.map((area, index) => {
      const highlight =
        confName === "jqb"
          ? buildJqbAreaHighlight(area)
          : (confName === "xldb" || confName === "xldb2") && buildXldbTemplateAreaHighlight(area)
          ? buildXldbTemplateAreaHighlight(area)
          : buildXldbAreaHighlight(area, rounds[0] ? rounds[0].icons : []);
      return {
        ...createSlotWinArea(area, index, highlight),
        lineNo: area.lineNo,
      };
    }),
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP[confName] || GENERIC_SLOT_ICON_NAME_MAP.xldb || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP[confName] || GENERIC_SLOT_ICON_ATLAS_MAP.xldb || null,
  };
}

function buildTgpdAreaHighlight(area, columns) {
  const posList = toArray(area && area.pos)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
  const linePos = posList.map((pos) => {
    const zeroBased = pos - 1;
    return [Math.floor(zeroBased / columns), zeroBased % columns];
  });
  return {
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
    linePosText: posList.length ? `[ ${posList.join(", ")} ]` : "",
  };
}

function buildTgpdViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const specialInfo = toArray(connection.specialInfo || betRecord.specialInfo || mergedSource.specialInfo);
  const roundSource = specialInfo.length
    ? specialInfo
    : [
        {
          icons: mergedSource.icons || "",
          betAreas: mergedSource.betAreas || betRecord.betAreas || [],
          winLoseGold: mergedSource.winLoseGold,
        },
      ];

  const rounds = roundSource.map((item, roundIndex) => {
    const icons = parseTgpdIconTokens(item && item.icons).map(normalizeTgpdIconValue);
    const grid = { columns: 4, rows: 4 };
    const winAreas = toArray(item && item.betAreas)
      .filter((area) => Number(area && area.betAreaId) !== 23)
      .map((area, index) => {
        const normalizedArea = normalizeTgpdArea(area);
        const highlight = buildTgpdAreaHighlight(normalizedArea, grid.columns);
        return createSlotWinArea(normalizedArea, index, highlight);
      });
    return {
      roundIndex,
      label: `第 ${roundIndex + 1} 回合`,
      icons,
      raw: item && item.icons ? String(item.icons) : "",
      timestamp: "",
      winAreas,
      columns: grid.columns,
      rows: grid.rows,
      winLoseGold: Number((item && item.winLoseGold) || 0),
    };
  });

  const topLevelWinAreas = toArray(mergedSource.betAreas || betRecord.betAreas)
    .filter((area) => Number(area && area.betAreaId) !== 23)
    .map((area, index) => {
      const normalizedArea = normalizeTgpdArea(area);
      const highlight = buildTgpdAreaHighlight(normalizedArea, 4);
      return createSlotWinArea(normalizedArea, index, highlight);
    });

  if (!rounds.length && !topLevelWinAreas.length) return null;

  return {
    mode: "slot",
    confName: "tgpd",
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
    rounds,
    winAreas: topLevelWinAreas,
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.tgpd || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.tgpd || null,
  };
}

function createSlotWinArea(area, index, overrides = {}) {
  const hasOverride = (key) => Object.prototype.hasOwnProperty.call(overrides, key);
  const linePos = hasOverride("linePos") ? overrides.linePos : resolveSlotLinePos(area);
  const highlightKeys = hasOverride("highlightKeys") ? overrides.highlightKeys : linePos.map(([x, y]) => `${x}-${y}`);
  const rawLinePosValue = area && (area.linePos || area.pos);
  const linePosText = hasOverride("linePosText")
    ? overrides.linePosText
    : linePos.length
    ? stringifySlotLinePos(linePos)
    : rawLinePosValue
    ? stringifyValue(rawLinePosValue)
    : "";

  return {
    index,
    betAreaId: hasOverride("betAreaId") ? overrides.betAreaId : area && area.betAreaId !== undefined ? area.betAreaId : "",
    iconId: hasOverride("iconId") ? overrides.iconId : area && area.iconId !== undefined ? area.iconId : "",
    num: hasOverride("num") ? overrides.num : area && area.num !== undefined ? area.num : "",
    betMultiple: hasOverride("betMultiple") ? overrides.betMultiple : area && area.betMultiple !== undefined ? area.betMultiple : "",
    iconMultiple: hasOverride("iconMultiple") ? overrides.iconMultiple : area && area.iconMultiple !== undefined ? area.iconMultiple : "",
    betGold: hasOverride("betGold") ? overrides.betGold : Number((area && area.betGold) || 0),
    winLoseGold: hasOverride("winLoseGold") ? overrides.winLoseGold : Number((area && area.winLoseGold) || 0),
    linePos,
    highlightKeys,
    linePosText,
    title: hasOverride("title") ? overrides.title : area && area.title ? area.title : "",
    formula: hasOverride("formula") ? overrides.formula : area && area.formula ? area.formula : "",
    exMultiple: hasOverride("exMultiple") ? overrides.exMultiple : area && area.exMultiple !== undefined ? area.exMultiple : "",
    isExMode: hasOverride("isExMode") ? overrides.isExMode : area && area.isExMode !== undefined ? area.isExMode : false,
  };
}

function sumSlotWinAreaGold(winAreas) {
  return toArray(winAreas).reduce((total, area) => total + Number((area && area.winLoseGold) || 0), 0);
}

function buildGenericSlotViewModel(parsed, confName) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const normalizeGenericSlotArea = (area, index) => {
    if (confName === "tgpd") {
      return createSlotWinArea(normalizeTgpdArea(area), index);
    }
    if (confName === "xldb") {
      return createSlotWinArea(normalizeXldbArea(area), index);
    }
    if (confName === "jfn") {
      return createSlotWinArea(area, index, buildJfnAreaHighlight(area));
    }
    if (confName === "jlbs") {
      return createSlotWinArea(area, index, buildJlbsAreaHighlight(area));
    }
    if (confName === "ssff") {
      return createSlotWinArea(area, index, buildSsffAreaHighlight(area));
    }
    if (confName === "hhsc") {
      return createSlotWinArea(area, index, buildHhscAreaHighlight(area));
    }
    return createSlotWinArea(area, index);
  };

  const allWinAreas = toArray(mergedSource.betAreas || betRecord.betAreas).map((area, index) =>
    normalizeGenericSlotArea(area, index)
  );

  const timestampList = source.timestampList || connection.timestampList || betRecord.timestampList || [];
  const specialInfoRounds = toArray(connection.specialInfo || betRecord.specialInfo || mergedSource.specialInfo);
  const lastSpecialInfo = specialInfoRounds.length ? specialInfoRounds[specialInfoRounds.length - 1] : null;
  const rawIcons =
    confName === "hhsc"
      ? specialInfoRounds.length
        ? String((lastSpecialInfo && lastSpecialInfo.icons) || "")
        : String(mergedSource.icons || "")
      : String(mergedSource.icons || "");
  const rounds = splitGenericSlotRounds(rawIcons, allWinAreas, timestampList);
  const normalizedRounds = (rounds.length ? rounds : [{ roundIndex: 0, label: "第 1 回合", icons: [], raw: "", winAreas: [] }]).map(
    (round) => {
      const winAreas = round.winAreas && round.winAreas.length ? round.winAreas : rounds.length <= 1 ? allWinAreas : [];
      const normalizedIcons =
        confName === "tgpd"
          ? (round.icons || []).map(normalizeTgpdIconValue)
          : confName === "xldb"
          ? (round.icons || []).map(normalizeXldbIconValue)
          : confName === "ssff"
          ? (round.icons || []).map(normalizeSsffIconValue)
          : confName === "cjsgj"
          ? normalizeCjsgjIcons(round.icons || [])
          : confName === "jfn"
          ? normalizeJfnIcons(round.icons || [])
          : round.icons || [];
      const normalizedWinAreas =
        confName === "tgpd"
          ? toArray(winAreas).map((area, index) => createSlotWinArea(normalizeTgpdArea(area), index))
          : confName === "xldb"
          ? toArray(winAreas).map((area, index) => createSlotWinArea(normalizeXldbArea(area), index))
          : confName === "jfn"
          ? toArray(winAreas).map((area, index) => createSlotWinArea(area, index, buildJfnAreaHighlight(area)))
          : confName === "jlbs"
          ? toArray(winAreas).map((area, index) => createSlotWinArea(area, index, buildJlbsAreaHighlight(area)))
          : confName === "ssff"
          ? toArray(winAreas).map((area, index) => createSlotWinArea(area, index, buildSsffAreaHighlight(area)))
          : confName === "hhsc"
          ? toArray(winAreas).map((area, index) => createSlotWinArea(area, index, buildHhscAreaHighlight(area, normalizedIcons)))
          : winAreas;
      const grid = inferSlotGrid(normalizedIcons.length, normalizedWinAreas);
      const roundWinLoseGold =
        rounds.length > 1
          ? sumSlotWinAreaGold(normalizedWinAreas)
          : sumSlotWinAreaGold(normalizedWinAreas) || Number(mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0);
      return {
        ...round,
        icons: normalizedIcons,
        winAreas: normalizedWinAreas,
        columns: grid.columns,
        rows: grid.rows,
        columnMajor: confName === "cjsgj" || confName === "hhsc" || confName === "ssff" || confName === "jlbs",
        winLoseGold: roundWinLoseGold,
        isExMode:
          confName === "jlbs"
            ? !!Number(mergedSource.isExMode || mergedSource.exMode || 0)
            : false,
      };
    }
  );

  if (!normalizedRounds.length && !allWinAreas.length) return null;

  return {
    mode: "slot",
    confName,
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
    rounds: normalizedRounds,
    winAreas: allWinAreas,
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP[confName] || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP[confName] || null,
    fuzzyAtlas: confName === "hhsc" ? null : GENERIC_SLOT_FUZZY_ATLAS_MAP[confName] || null,
    iconImageMap: GENERIC_SLOT_ICON_IMAGE_MAP[confName] || null,
  };
}

function parseCjsgj2Info(rawInfo) {
  if (isObject(rawInfo)) return rawInfo;
  if (typeof rawInfo !== "string" || !rawInfo.trim()) return null;
  return safeJsonParse(rawInfo);
}

function parseCjsgj2BattleRows(rawBattle) {
  return toArray(rawBattle)
    .map((item) =>
      String(item || "")
        .split(",")
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
    )
    .filter((row) => row.length);
}

function normalizeCjsgj2Icons(rawIcons) {
  return parseSlotIconTokens(rawIcons)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

function createCjsgj2LinePos(detail) {
  const positions = toArray(detail && detail.linePos)
    .map((item) => {
      const pos = item && item.pos;
      if (!Array.isArray(pos) || pos.length < 2) return null;
      return [Number(pos[1] || 0), Number(pos[0] || 0)];
    })
    .filter(Boolean);
  return {
    linePos: positions,
    highlightKeys: positions.map(([row, column]) => `${row}-${column}`),
    linePosText: stringifySlotLinePos(positions),
  };
}

function buildCjsgj2SpecialArea(rawDetail, index, mergedSource) {
  const detail = String(rawDetail || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
  if (detail.length < 4) return null;

  const lineId = Number(detail[0] || 0);
  const iconId = Number(detail[1] || 0);
  const gold = Number(detail[2] || 0);
  const odds = Number(detail[3] || 0);
  const linePos = detail.slice(4).map((value, columnIndex) => [Number(value || 0), columnIndex]);
  return createSlotWinArea(
    {
      betAreaId: lineId,
      iconId,
      winLoseGold: gold,
      betGold: Number(mergedSource.betSingle || 0),
      betMultiple: Number(mergedSource.betTimes || 0),
      iconMultiple: odds,
      num: linePos.length,
      linePos,
    },
    index,
    {
      title: `线 ${String(lineId).padStart(2, "0")}`,
      linePos,
      highlightKeys: linePos.map(([row, column]) => `${row}-${column}`),
      linePosText: stringifySlotLinePos(linePos),
      formula: [mergedSource.betSingle, mergedSource.betTimes, odds]
        .map((value) => toMoney(Number(value || 0)))
        .join(" x "),
    }
  );
}

function buildCjsgj2BattleRound(info, battleRows, mergedSource) {
  if (!battleRows.length) return null;
  const rows = battleRows.map((row, rowIndex) => {
    const winLoseGold = Number(row[1] || 0);
    const iconSeed = row.slice(2);
    return {
      roundIndex: rowIndex,
      label: `第 ${rowIndex + 1} 关`,
      icons: iconSeed,
      raw: iconSeed.join(","),
      columns: 5,
      rows: 1,
      winAreas: [],
      winLoseGold,
      boardOrder: "row-major",
      boardShellWidth: "100%",
      battleLevel: rowIndex + 1,
    };
  });

  return {
    mode: "slot",
    confName: "cjsgj2",
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? 0),
    totalWinLoseGold: rows.reduce((sum, row) => sum + Number(row.winLoseGold || 0), 0),
    rounds: rows,
    winAreas: [],
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.cjsgj2 || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.cjsgj2 || null,
    fuzzyAtlas: GENERIC_SLOT_FUZZY_ATLAS_MAP.cjsgj2 || null,
    iconImageMap: GENERIC_SLOT_ICON_IMAGE_MAP.cjsgj2 || null,
    boardShellWidth: "100%",
    hideLinePosChip: true,
    defaultActiveLineIndex: -1,
  };
}

function buildCjsgj2ViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const info =
    parseCjsgj2Info(source.specialInfoStr) ||
    parseCjsgj2Info(connection.specialInfoStr) ||
    parseCjsgj2Info(betRecord.specialInfoStr) ||
    source.specialInfoStrParsed ||
    connection.specialInfoStrParsed ||
    betRecord.specialInfoStrParsed ||
    null;

  const mode = Number(info && info.c);
  const roundsSource = toArray(info && info.s);
  const battleRows = parseCjsgj2BattleRows(info && info.f);
  if (mode === 2 && battleRows.length) {
    return buildCjsgj2BattleRound(info, battleRows, mergedSource);
  }

  const iconSegments = String(mergedSource.icons || "")
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const baseIcons = iconSegments.map((segment) => normalizeCjsgj2Icons(segment));
  const rounds = (baseIcons.length ? baseIcons : [normalizeCjsgj2Icons(mergedSource.icons)]).map((icons, roundIndex) => {
    const roundInfo = roundsSource[roundIndex] || {};
    const winAreas = toArray(roundInfo && roundInfo.l)
      .map((detail, detailIndex) => buildCjsgj2SpecialArea(detail, detailIndex, mergedSource))
      .filter(Boolean);
    const scatterCount = icons.filter((icon) => Number(icon) === 31).length;
    const scatterArea =
      scatterCount > 2
        ? createSlotWinArea(
            {
              betAreaId: `scatter-${roundIndex + 1}`,
              iconId: 31,
              winLoseGold: Number(roundInfo && roundInfo.r ? roundInfo.r : 0),
              num: scatterCount,
            },
            winAreas.length,
            {
              title: "Scatter",
              linePos: icons
                .map((icon, index) => (Number(icon) === 31 ? [index % 3, Math.floor(index / 3)] : null))
                .filter(Boolean),
              linePosText: `x${scatterCount}`,
            }
          )
        : null;
    const finalAreas = scatterArea ? winAreas.concat(scatterArea) : winAreas;
    return {
      roundIndex,
      label: mode === 1 && roundIndex > 0 ? `免费 ${roundIndex}` : `第 ${roundIndex + 1} 回合`,
      icons,
      raw: icons.join(","),
      timestamp: "",
      winAreas: finalAreas,
      columns: 5,
      rows: 3,
      columnMajor: true,
      winLoseGold: Number(roundInfo && roundInfo.r !== undefined ? roundInfo.r : finalAreas.reduce((sum, area) => sum + Number(area.winLoseGold || 0), 0)),
    };
  });

  if (!rounds.length) return null;

  return {
    mode: "slot",
    confName: "cjsgj2",
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold ?? 0),
    rounds,
    winAreas: rounds[0] ? rounds[0].winAreas : [],
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.cjsgj2 || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.cjsgj2 || null,
    fuzzyAtlas: GENERIC_SLOT_FUZZY_ATLAS_MAP.cjsgj2 || null,
    iconImageMap: GENERIC_SLOT_ICON_IMAGE_MAP.cjsgj2 || null,
    hideLinePosChip: false,
  };
}

function normalizeCfmmFrameId(value, betTimes) {
  const frameId = Number(value || 0);
  if (frameId === 41 && Number(betTimes || 0) >= 50) return 42;
  return frameId;
}

function normalizeCfmmPages(rawPages, betTimes) {
  return toArray(rawPages).map((page, pageIndex) => ({
    pageIndex,
    columns: toArray(page).map((column, columnIndex) => {
      const values = toArray(column).map((item) => normalizeCfmmFrameId(item, betTimes));
      return {
        columnIndex,
        topIcon: Number(values[0] || 0),
        centerIcon: Number(values[1] || 0),
        bottomIcon: Number(values[2] || 0),
      };
    }),
  }));
}

function parseCfmmIconsPages(...values) {
  for (const value of values) {
    const structured = parseStructuredField(value);
    if (Array.isArray(structured) && structured.length) {
      const first = structured[0];
      if (Array.isArray(first) && first.length && first.every((item) => Array.isArray(item))) {
        return structured;
      }
      if (Array.isArray(first) && first.length) {
        return [structured];
      }
    }

    const unwrapped = unwrapJsonValue(value);
    if (Array.isArray(unwrapped) && unwrapped.length) {
      const first = unwrapped[0];
      if (Array.isArray(first) && first.length && first.every((item) => Array.isArray(item))) {
        return unwrapped;
      }
      if (Array.isArray(first) && first.length) {
        return [unwrapped];
      }
    }
  }
  return [];
}

function buildCfmmDescription(triggerIcon, betTimes, isSpecial) {
  if (isSpecial) return "触发幸运轮盘";
  if (triggerIcon === 31) return Number(betTimes || 0) === 1 ? "触发 RESPIN" : "触发全盘 RESPIN";
  if ([21, 22, 23].includes(Number(triggerIcon || 0))) {
    return Number(betTimes || 0) === 1 ? "触发倍数奖励" : "触发高倍奖励";
  }
  return Number(betTimes || 0) === 1 ? "普通结果" : "倍数模式结果";
}

function buildCfmmRewardFormula(mergedSource, mode, isSpecial) {
  const betSingle = Number(mergedSource.betSingle || 0);
  const normalTimes = Number(mergedSource.normalTimes || 0);
  const exTimes = Number(mergedSource.exTimes || 0);

  if (mode === "lucky") {
    return exTimes > 0 ? `${toMoney(betSingle)} x ${exTimes}` : "";
  }

  if (mode === "respin") {
    return exTimes > 0 ? `${toMoney(betSingle)} x ${exTimes}` : "";
  }

  if (normalTimes > 0) {
    if (exTimes > 0 && !isSpecial) {
      return `${toMoney(betSingle)} x ${normalTimes} x ${exTimes}`;
    }
    return `${toMoney(betSingle)} x ${normalTimes}`;
  }

  if (exTimes > 0) {
    return `${toMoney(betSingle)} x ${exTimes}`;
  }

  return "";
}

function buildCfmmViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const betTimes = Number(mergedSource.betTimes || 0);
  const rawPages = parseCfmmIconsPages(
    mergedSource.icons,
    connection.icons,
    betRecord.icons,
    source.icons,
    source.specialInfoStrParsed,
    connection.specialInfoStrParsed
  );
  const pages = normalizeCfmmPages(rawPages, betTimes);
  const firstRawPage = toArray(rawPages)[0];
  const firstTriggerIcon = Number(toArray(toArray(firstRawPage)[3])[1] || 0);
  const isSpecial = firstTriggerIcon === 41;
  const showPager = (pages.length > 1 || betTimes > 1) && firstTriggerIcon >= 31;
  const rewardItems = toArray(mergedSource.betAreas || betRecord.betAreas).map((area, index) => ({
    index,
    betAreaId: area && area.betAreaId !== undefined ? Number(area.betAreaId) : "",
    iconId: area && area.iconId !== undefined ? normalizeCfmmFrameId(area.iconId, betTimes) : "",
    num: Number((area && area.num) || 0),
    betMultiple: Number((area && area.betMultiple) || 0),
    iconMultiple: Number((area && area.iconMultiple) || 0),
    betGold: Number((area && area.betGold) || 0),
    winLoseGold: Number((area && area.winLoseGold) || 0),
  }));

  const pageViews = [];
  if (pages[0]) {
    pageViews.push({
      pageIndex: 0,
      label: pages.length > 1 ? "触发页" : "结果页",
      type: pages.length > 1 ? "trigger" : "main",
      boardColumns: pages[0].columns,
      showBoard: true,
      lockColumnIndex: betTimes === 1 ? 2 : -1,
      title: pages.length > 1 ? "RESPIN 触发结果" : "主盘结果",
      description: buildCfmmDescription(firstTriggerIcon, betTimes, isSpecial),
      triggerIcon: normalizeCfmmFrameId(firstTriggerIcon, betTimes),
      formula: buildCfmmRewardFormula(mergedSource, "main", isSpecial),
    });
  }

  if (showPager) {
    if (isSpecial && pages.length <= 1) {
      pageViews.push({
        pageIndex: 1,
        label: "幸运轮盘",
        type: "lucky",
        boardColumns: [],
        showBoard: false,
        lockColumnIndex: -1,
        title: "幸运轮盘",
        description: "触发幸运轮盘奖励",
        triggerIcon: normalizeCfmmFrameId(firstTriggerIcon, betTimes),
        formula: buildCfmmRewardFormula(mergedSource, "lucky", true),
      });
    } else if (pages[1]) {
      pageViews.push({
        pageIndex: 1,
        label: "RESPIN",
        type: "respin",
        boardColumns: pages[1].columns,
        showBoard: true,
        lockColumnIndex: -1,
        title: "RESPIN 结果",
        description: "RESPIN 结算页",
        triggerIcon: 31,
        formula: buildCfmmRewardFormula(mergedSource, "respin", false),
      });
    }
  }

  if (!pageViews.length) {
    pageViews.push({
      pageIndex: 0,
      label: "结果页",
      type: "main",
      boardColumns: [],
      showBoard: true,
      lockColumnIndex: -1,
      title: "主盘结果",
      description: "未解析到客户端盘面数据",
      triggerIcon: "",
      formula: buildCfmmRewardFormula(mergedSource, "main", false),
    });
  }

  return {
    mode: "cfmm",
    confName: "cfmm",
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes,
    exTimes: Number(mergedSource.exTimes || 0),
    normalTimes: Number(mergedSource.normalTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold ?? 0),
    description: buildCfmmDescription(firstTriggerIcon, betTimes, isSpecial),
    triggerIcon: normalizeCfmmFrameId(firstTriggerIcon, betTimes),
    rewardItems,
    pages: pageViews,
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.cfmm || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.cfmm || null,
    fuzzyAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.cfmm || null,
  };
}

function parseStkhIcons(rawIcons) {
  return parseSlotIconTokens(rawIcons)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

function splitStkhBoards(icons) {
  const values = Array.isArray(icons) ? icons : [];
  if (!values.length) {
    return [];
  }
  if (values.length <= 15) {
    return [values.slice(0, 15)];
  }
  return [values.slice(0, 15), values.slice(15, 30)];
}

function parseStkhSpecialInfoItem(rawValue) {
  if (typeof rawValue !== "string" || !rawValue.trim()) return null;
  const [head, iconsPart = ""] = rawValue.split("#");
  const [betAreaPart = "", winLoseGoldPart = "0"] = String(head || "").split("$");
  const betAreas = String(betAreaPart || "")
    .split("*")
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) => {
      const parts = item.split(",");
      return {
        betAreaId: Number(parts[0]),
        betGold: Number(parts[1]),
        betMultiple: Number(parts[2]),
        winLoseGold: Number(parts[3]),
        num: Number(parts[4]),
        iconMultiple: Number(parts[5]),
        iconId: Number(parts[6]),
        leftRight: Number(parts[7]),
      };
    });

  return {
    icons: iconsPart,
    winLoseGold: Number(winLoseGoldPart || 0),
    betAreas,
  };
}

function parseStkhSpecialInfo(rawValue) {
  if (Array.isArray(rawValue)) return rawValue;
  if (typeof rawValue !== "string" || !rawValue.trim()) return [];
  return rawValue
    .split("|")
    .map((item) => parseStkhSpecialInfoItem(item))
    .filter(Boolean);
}

function buildStkhLinePos(area) {
  const line = STKH_REWARD_LINES[Number(area && area.betAreaId)];
  if (!Array.isArray(line) || !line.length) {
    return {
      linePos: [],
      highlightKeys: [],
      linePosText: "",
    };
  }
  const boardOffset = Number(area && area.leftRight) === 3 ? 5 : 0;
  const count = Math.min(Math.max(Number(area && area.num) || line.length, 0), line.length);
  const linePos = line.slice(0, count).map(([columnIndex, rowIndex]) => [rowIndex, columnIndex + boardOffset]);
  return {
    linePos,
    highlightKeys: linePos.map(([rowIndex, columnIndex]) => `${rowIndex}-${columnIndex}`),
    linePosText: stringifySlotLinePos(linePos),
  };
}

function buildStkhWinArea(area, index, extra = {}) {
  const highlight = buildStkhLinePos(area);
  const formulaBase = `${toMoney(Number((area && area.betGold) || 0))} x ${Number((area && area.betMultiple) || 0)} x ${Number((area && area.iconMultiple) || 0)}`;
  return createSlotWinArea(area, index, {
    ...highlight,
    side: Number(area && area.leftRight) === 2 ? "上" : Number(area && area.leftRight) === 3 ? "下" : "",
    formula: extra.formula || formulaBase,
    lineNo: area && area.betAreaId !== undefined ? Number(area.betAreaId) : index + 1,
  });
}

function buildStkhRound(roundSource, roundIndex, options = {}) {
  const icons = parseStkhIcons(roundSource && roundSource.icons);
  const boards = splitStkhBoards(icons);
  const cells = [];
  boards.forEach((boardIcons, boardIndex) => {
    boardIcons.forEach((icon, index) => {
      const row = index % 3;
      const column = Math.floor(index / 3) + boardIndex * 5;
      cells.push({
        index: `${boardIndex}-${index}`,
        icon,
        row,
        column,
        boardIndex,
      });
    });
  });

  const winAreas = toArray(roundSource && roundSource.betAreas).map((area, index) =>
    buildStkhWinArea(area, index, {
      formula: options.doubleWin ? `${toMoney(Number((area && area.betGold) || 0))} x ${Number((area && area.betMultiple) || 0)} x ${Number((area && area.iconMultiple) || 0)} x8` : "",
    })
  );
  const winAreaTotal = winAreas.reduce((total, area) => total + Number((area && area.winLoseGold) || 0), 0);
  const sourceWinLoseGold = Number((roundSource && roundSource.winLoseGold) || 0);
  const roundWinLoseGold = sourceWinLoseGold > 0 || winAreaTotal <= 0 ? sourceWinLoseGold : winAreaTotal;

  return {
    roundIndex,
    label: options.label || `第 ${roundIndex + 1} 回合`,
    pageLabel: options.pageLabel || "",
    winLoseGold: roundWinLoseGold,
    icons,
    boards,
    cells,
    winAreas,
    scatterCount: icons.filter((icon) => Number(icon) === 31).length,
    isFreeRound: !!options.isFreeRound,
    isTriggerRound: !!options.isTriggerRound,
    freeTriggerCount: Number(options.freeTriggerCount || 0),
  };
}

function buildStkhViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const rawSpecialInfo =
    connection.specialInfoStr ||
    betRecord.specialInfoStr ||
    source.specialInfoStr ||
    "";
  const specialRounds = parseStkhSpecialInfo(rawSpecialInfo);
  const topRoundWinLoseGold = specialRounds.length
    ? toArray(mergedSource.betAreas).reduce((total, area) => total + Number((area && area.winLoseGold) || 0), 0)
    : Number(mergedSource.winLoseGold || 0);
  const topRound = buildStkhRound(
    {
      icons: mergedSource.icons,
      betAreas: mergedSource.betAreas,
      winLoseGold: topRoundWinLoseGold,
    },
    0,
    {
      label: "主盘",
      isTriggerRound: specialRounds.length > 0,
      freeTriggerCount:
        specialRounds.length > 0 && specialRounds.every((item) => {
          const sides = new Set(toArray(item.betAreas).map((area) => Number(area && area.leftRight)).filter((value) => value > 1));
          return sides.has(2) && sides.has(3);
        })
          ? 8
          : 0,
    }
  );

  const freeRounds = specialRounds.map((item, index) => {
    const sides = new Set(toArray(item.betAreas).map((area) => Number(area && area.leftRight)).filter((value) => value > 1));
    const doubleWin = sides.has(2) && sides.has(3);
    return buildStkhRound(item, index + 1, {
      label: `免费 ${index + 1}`,
      pageLabel: `${index + 1}/${specialRounds.length}`,
      isFreeRound: true,
      doubleWin,
    });
  });

  const rounds = [topRound].concat(freeRounds).filter(Boolean);
  if (!rounds.length) return null;

  return {
    mode: "stkh",
    confName: "stkh",
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold ?? 0),
    rounds,
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.stkh || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.stkh || null,
    fuzzyAtlas: STKH_FUZZY_ICON_ATLAS,
  };
}

function buildHgxsViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const rawIcons = parseSlotIconTokens(mergedSource.icons).map((item) => Number(item));
  const boardOrder = [0, 3, 6, 1, 4, 7, 2, 5, 8];
  const icons =
    rawIcons.length === 9
      ? boardOrder.map((index) => rawIcons[index]).filter((icon) => icon !== undefined)
      : rawIcons;
  const isFullScreenGame =
    toArray(mergedSource.betAreas).length === 5 &&
    toArray(mergedSource.betAreas).every((area) => Number(area && area.iconId) === 21);

  const winAreas = toArray(mergedSource.betAreas)
    .slice()
    .sort((left, right) => Number(left && left.betAreaId) - Number(right && right.betAreaId))
    .map((area, index) => {
      const normalizedArea = {
        ...area,
        iconId: Number(area && area.iconId),
        betAreaId: Number(area && area.betAreaId),
      };
      const isFullScreen = isFullScreenGame && Number(normalizedArea.iconId) === 21;
      const highlight = buildHgxsAreaHighlight(normalizedArea, isFullScreen);
      return createSlotWinArea(normalizedArea, index, {
        ...highlight,
        linePosText: isFullScreen ? "满屏海龟" : highlight.linePosText,
      });
    });

  return {
    mode: "slot",
    confName: "hgxs",
    betGold: Number(mergedSource.betGold || 0),
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
    rounds: [
      {
        roundIndex: 0,
        label: "第 1 回合",
        icons,
        raw: String(mergedSource.icons || ""),
        timestamp: "",
        columns: 3,
        rows: 3,
        winLoseGold: Number(mergedSource.winLoseGold || 0),
        winAreas,
      },
    ],
    winAreas,
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.hgxs,
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.hgxs,
    hideLinePosChip: true,
  };
}

function buildDfdcMaskLinePos(mask, columns) {
  const hitIndexes = toArray(mask).reduce((result, item, index) => {
    if (Number(item)) result.push(index);
    return result;
  }, []);
  const linePos = hitIndexes.map((index) => [Math.floor(index / columns), index % columns]);
  return {
    hitIndexes,
    linePos,
    highlightKeys: linePos.map(([row, col]) => `${row}-${col}`),
  };
}

function buildDfdcDetailWinAreas(detailEntry, roundAreas, icons, betSingle) {
  const detailList = toArray(detailEntry && detailEntry.detail);
  if (!detailList.length) {
    return toArray(roundAreas).map((area, index) => createSlotWinArea(area, index));
  }

  const columns = (SLOT_GRID_BY_COUNT[(icons || []).length] || inferSlotGrid((icons || []).length, [])).columns || 5;
  return detailList.map((detail, index) => {
    const relatedArea = toArray(roundAreas)[index] || {};
    const maskResult = buildDfdcMaskLinePos(detail && detail.pos, columns);
    const count = Number(detail && detail.count);
    const mul = Number(detail && detail.mul);
    const award = Number(detail && detail.award);
    const derivedWinLoseGold =
      Number.isFinite(award) && award > 0
        ? award
        : Number.isFinite(count) && Number.isFinite(mul) && Number.isFinite(Number(betSingle))
        ? count * mul * Number(betSingle)
        : Number((relatedArea && relatedArea.winLoseGold) || 0);

    return createSlotWinArea(relatedArea, index, {
      betAreaId: relatedArea && relatedArea.betAreaId !== undefined ? relatedArea.betAreaId : index + 1,
      iconId: detail && detail.icon !== undefined ? detail.icon : relatedArea && relatedArea.iconId !== undefined ? relatedArea.iconId : "",
      num: Number.isFinite(count) ? count : relatedArea && relatedArea.num !== undefined ? relatedArea.num : "",
      betMultiple: Number.isFinite(mul) ? mul : relatedArea && relatedArea.betMultiple !== undefined ? relatedArea.betMultiple : "",
      iconMultiple:
        Number.isFinite(count) && Number.isFinite(mul)
          ? count * mul
          : relatedArea && relatedArea.iconMultiple !== undefined
          ? relatedArea.iconMultiple
          : "",
      winLoseGold: derivedWinLoseGold,
      linePos: maskResult.linePos,
      highlightKeys: maskResult.highlightKeys,
      linePosText: maskResult.linePos.length ? stringifySlotLinePos(maskResult.linePos) : "",
    });
  });
}

function buildDfdcViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };
  const betSingle = Number(mergedSource.betSingle || 0);
  const topIcons = parseSlotIconTokens(mergedSource.icons);
  const topAreas = toArray(mergedSource.betAreas || betRecord.betAreas);
  const freeRounds = toArray(connection.specialInfo || betRecord.specialInfo || mergedSource.specialInfo);
  const specialInfoDetail =
    connection.specialInfoStrParsed ||
    betRecord.specialInfoStrParsed ||
    mergedSource.specialInfoStrParsed ||
    null;
  const detailRounds = toArray(specialInfoDetail && specialInfoDetail.detail);

  const roundSources = [];
  if (topIcons.length || topAreas.length || detailRounds.length) {
    roundSources.push({
      icons: topIcons,
      raw: String(mergedSource.icons || ""),
      winLoseGold: Number(mergedSource.winLoseGold || 0),
      betAreas: topAreas,
      detailEntry: detailRounds[0] || null,
    });
  }

  freeRounds.forEach((item, index) => {
    roundSources.push({
      icons: parseSlotIconTokens(item && item.icons),
      raw: item && item.icons ? String(item.icons) : "",
      winLoseGold: Number((item && item.winLoseGold) || 0),
      betAreas: toArray(item && item.betAreas),
      detailEntry: detailRounds[index + 1] || null,
    });
  });

  const rounds = roundSources.map((roundSource, roundIndex) => {
    const icons = Array.isArray(roundSource.icons) ? roundSource.icons : [];
    const grid = inferSlotGrid(icons.length, roundSource.betAreas);
    const winAreas = buildDfdcDetailWinAreas(roundSource.detailEntry, roundSource.betAreas, icons, betSingle);
    return {
      roundIndex,
      label: `第 ${roundIndex + 1} 回合`,
      icons,
      raw: roundSource.raw,
      timestamp: "",
      columns: grid.columns,
      rows: grid.rows,
      winLoseGold: Number(roundSource.winLoseGold || 0) || sumSlotWinAreaGold(winAreas),
      winAreas,
    };
  });

  if (!rounds.length) return null;

  const allWinAreas = rounds.reduce((result, round) => result.concat(toArray(round.winAreas)), []);

  return {
    mode: "slot",
    confName: "dfdc",
    betSingle,
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.freeGameWin ?? mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
    rounds,
    winAreas: allWinAreas,
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.dfdc || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.dfdc || null,
    isFreeGame: Number(mergedSource.freeType) === 1,
  };
}

const LHDB_GRID_BY_STAGE = {
  1: { columns: 4, rows: 4 },
  2: { columns: 5, rows: 5 },
  3: { columns: 6, rows: 6 },
};

const LHDB_JEWEL_TYPE = {
  ZUAN_TOU: 0,
  BAI_YU: 97,
  BI_YU: 98,
  MO_YU: 99,
  MA_NAO: 100,
  HU_PO: 101,
};

const LHDB_CHAR_TO_TYPE = {
  x: LHDB_JEWEL_TYPE.ZUAN_TOU,
  a: LHDB_JEWEL_TYPE.BAI_YU,
  b: LHDB_JEWEL_TYPE.BI_YU,
  c: LHDB_JEWEL_TYPE.MO_YU,
  d: LHDB_JEWEL_TYPE.MA_NAO,
  e: LHDB_JEWEL_TYPE.HU_PO,
};

const LHDB_STAGE_IMAGE_MAP = {
  1: {
    [LHDB_JEWEL_TYPE.ZUAN_TOU]: 1,
    [LHDB_JEWEL_TYPE.BAI_YU]: 11,
    [LHDB_JEWEL_TYPE.BI_YU]: 12,
    [LHDB_JEWEL_TYPE.MO_YU]: 13,
    [LHDB_JEWEL_TYPE.MA_NAO]: 14,
    [LHDB_JEWEL_TYPE.HU_PO]: 15,
  },
  2: {
    [LHDB_JEWEL_TYPE.ZUAN_TOU]: 1,
    [LHDB_JEWEL_TYPE.BAI_YU]: 21,
    [LHDB_JEWEL_TYPE.BI_YU]: 22,
    [LHDB_JEWEL_TYPE.MO_YU]: 23,
    [LHDB_JEWEL_TYPE.MA_NAO]: 24,
    [LHDB_JEWEL_TYPE.HU_PO]: 25,
  },
  3: {
    [LHDB_JEWEL_TYPE.ZUAN_TOU]: 1,
    [LHDB_JEWEL_TYPE.BAI_YU]: 31,
    [LHDB_JEWEL_TYPE.BI_YU]: 32,
    [LHDB_JEWEL_TYPE.MO_YU]: 33,
    [LHDB_JEWEL_TYPE.MA_NAO]: 34,
    [LHDB_JEWEL_TYPE.HU_PO]: 35,
  },
};

const LHDB_STAGE_LABEL_MAP = {
  1: {
    [LHDB_JEWEL_TYPE.ZUAN_TOU]: "龙珠",
    [LHDB_JEWEL_TYPE.BAI_YU]: "绿宝石",
    [LHDB_JEWEL_TYPE.BI_YU]: "蓝宝石",
    [LHDB_JEWEL_TYPE.MO_YU]: "黄宝石",
    [LHDB_JEWEL_TYPE.MA_NAO]: "红宝石",
    [LHDB_JEWEL_TYPE.HU_PO]: "白宝石",
  },
  2: {
    [LHDB_JEWEL_TYPE.ZUAN_TOU]: "龙珠",
    [LHDB_JEWEL_TYPE.BAI_YU]: "碧玉",
    [LHDB_JEWEL_TYPE.BI_YU]: "琥珀",
    [LHDB_JEWEL_TYPE.MO_YU]: "玛瑙",
    [LHDB_JEWEL_TYPE.MA_NAO]: "黑玉",
    [LHDB_JEWEL_TYPE.HU_PO]: "白玉",
  },
  3: {
    [LHDB_JEWEL_TYPE.ZUAN_TOU]: "龙珠",
    [LHDB_JEWEL_TYPE.BAI_YU]: "夜明珠",
    [LHDB_JEWEL_TYPE.BI_YU]: "守财",
    [LHDB_JEWEL_TYPE.MO_YU]: "凤凰",
    [LHDB_JEWEL_TYPE.MA_NAO]: "白龙",
    [LHDB_JEWEL_TYPE.HU_PO]: "传世",
  },
};

const LHDB_STAGE_SHORT_LABEL_MAP = {
  1: {
    [LHDB_JEWEL_TYPE.ZUAN_TOU]: "龙",
    [LHDB_JEWEL_TYPE.BAI_YU]: "绿",
    [LHDB_JEWEL_TYPE.BI_YU]: "蓝",
    [LHDB_JEWEL_TYPE.MO_YU]: "黄",
    [LHDB_JEWEL_TYPE.MA_NAO]: "红",
    [LHDB_JEWEL_TYPE.HU_PO]: "白",
  },
  2: {
    [LHDB_JEWEL_TYPE.ZUAN_TOU]: "龙",
    [LHDB_JEWEL_TYPE.BAI_YU]: "碧",
    [LHDB_JEWEL_TYPE.BI_YU]: "琥",
    [LHDB_JEWEL_TYPE.MO_YU]: "玛",
    [LHDB_JEWEL_TYPE.MA_NAO]: "黑",
    [LHDB_JEWEL_TYPE.HU_PO]: "白",
  },
  3: {
    [LHDB_JEWEL_TYPE.ZUAN_TOU]: "龙",
    [LHDB_JEWEL_TYPE.BAI_YU]: "夜",
    [LHDB_JEWEL_TYPE.BI_YU]: "守",
    [LHDB_JEWEL_TYPE.MO_YU]: "凤",
    [LHDB_JEWEL_TYPE.MA_NAO]: "白",
    [LHDB_JEWEL_TYPE.HU_PO]: "传",
  },
};

const LHDB_SPECIAL_LABEL_MAP = {
  0: "钥匙",
  7: "龙珠探宝",
};

const LHDB_SPECIAL_SHORT_LABEL_MAP = {
  0: "钥",
  7: "探",
};

const LHDB_SKIP_RESULT_AREA_IDS = new Set([23]);

function normalizeLhdbStage(value) {
  const stage = Number(value);
  return LHDB_GRID_BY_STAGE[stage] ? stage : 1;
}

function getLhdbLabel(stage, typeId) {
  if (Object.prototype.hasOwnProperty.call(LHDB_SPECIAL_LABEL_MAP, typeId)) {
    return LHDB_SPECIAL_LABEL_MAP[typeId];
  }
  return (LHDB_STAGE_LABEL_MAP[stage] && LHDB_STAGE_LABEL_MAP[stage][typeId]) || `图标${typeId}`;
}

function getLhdbShortLabel(stage, typeId, label) {
  if (Object.prototype.hasOwnProperty.call(LHDB_SPECIAL_SHORT_LABEL_MAP, typeId)) {
    return LHDB_SPECIAL_SHORT_LABEL_MAP[typeId];
  }
  return (LHDB_STAGE_SHORT_LABEL_MAP[stage] && LHDB_STAGE_SHORT_LABEL_MAP[stage][typeId]) || String(label || "-").slice(0, 1);
}

function decodeLhdbIconToken(token, stage) {
  const raw = String(token || "").trim();
  const normalizedStage = normalizeLhdbStage(stage);
  const typeId = Object.prototype.hasOwnProperty.call(LHDB_CHAR_TO_TYPE, raw)
    ? LHDB_CHAR_TO_TYPE[raw]
    : isFiniteNumberLike(raw)
    ? Number(raw)
    : null;
  const imageId =
    typeId !== null && LHDB_STAGE_IMAGE_MAP[normalizedStage]
      ? LHDB_STAGE_IMAGE_MAP[normalizedStage][typeId] ?? (Number.isFinite(typeId) ? typeId : null)
      : null;
  const label = typeId !== null ? getLhdbLabel(normalizedStage, typeId) : raw || "-";
  const shortLabel = typeId !== null ? getLhdbShortLabel(normalizedStage, typeId, label) : (raw || "-").slice(0, 1);

  return {
    raw,
    typeId,
    imageId,
    label,
    shortLabel,
    isDragon: typeId === LHDB_JEWEL_TYPE.ZUAN_TOU,
  };
}

function parseLhdbIcons(value, stage) {
  const raw = String(value || "").trim();
  if (!raw) return [];

  if (raw.includes(",")) {
    return raw
      .split(",")
      .map((item) => decodeLhdbIconToken(String(item).trim(), stage))
      .filter((item) => item.raw !== "");
  }

  return Array.from(raw).map((token) => decodeLhdbIconToken(token, stage));
}

function buildLhdbViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };
  const specialInfo = toArray(
    connection.specialInfoStrParsed ||
    betRecord.specialInfoStrParsed ||
    mergedSource.specialInfoStrParsed ||
    mergedSource.specialInfo ||
    []
  );

  const stage = normalizeLhdbStage(
    mergedSource.betAreaCount ?? connection.betAreaCount ?? betRecord.betAreaCount ?? source.betAreaCount
  );
  const grid = LHDB_GRID_BY_STAGE[stage] || LHDB_GRID_BY_STAGE[1];

  const normalizeArea = (area, index) => {
    const posList = toArray(area && (area.pos || area.linePos))
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item));
    const betAreaId = Number(area && area.betAreaId);
    const iconMeta = decodeLhdbIconToken(String(betAreaId), stage);
    const label = Number.isFinite(betAreaId) ? getLhdbLabel(stage, betAreaId) : iconMeta.label;
    const shortLabel = Number.isFinite(betAreaId) ? getLhdbShortLabel(stage, betAreaId, label) : iconMeta.shortLabel;

    return {
      index,
      betAreaId: Number.isFinite(betAreaId) ? betAreaId : "",
      iconId: Number.isFinite(betAreaId) ? betAreaId : area && area.iconId !== undefined ? area.iconId : "",
      imageId: iconMeta.imageId,
      label,
      shortLabel,
      num: area && area.num !== undefined ? area.num : "",
      betMultiple: area && area.betMultiple !== undefined ? area.betMultiple : "",
      iconMultiple: area && area.iconMultiple !== undefined ? area.iconMultiple : "",
      betGold: Number((area && area.betGold) || 0),
      winLoseGold: Number((area && area.winLoseGold) || 0),
      posList,
      highlightKeys: posList.map((item) => String(item)),
      linePosText: posList.length ? `[ ${posList.join(", ")} ]` : "",
      formula:
        area && area.betMultiple !== undefined && area.betGold !== undefined
          ? `${toMoney(area.betGold)} x ${area.betMultiple}`
          : toMoney((area && area.betGold) || 0),
    };
  };

  const buildKeyArea = (icons, roundIndex) => {
    const keyPositions = toArray(icons).reduce((result, icon, index) => {
      if (Number(icon && icon.typeId) === LHDB_JEWEL_TYPE.ZUAN_TOU) {
        result.push(index + 1);
      }
      return result;
    }, []);
    if (!keyPositions.length) return null;

    const keyCount =
      roundIndex === 0
        ? Number(
            mergedSource.jewelMultiple ??
            connection.jewelMultiple ??
            betRecord.jewelMultiple ??
            source.jewelMultiple ??
            0
          )
        : 0;

    return {
      index: -1,
      betAreaId: 0,
      iconId: 0,
      imageId: 0,
      label: LHDB_SPECIAL_LABEL_MAP[0],
      shortLabel: LHDB_SPECIAL_SHORT_LABEL_MAP[0],
      num: keyCount || keyPositions.length,
      betMultiple: "",
      iconMultiple: "",
      betGold: 0,
      winLoseGold: 0,
      posList: keyPositions,
      highlightKeys: keyPositions.map((item) => String(item)),
      linePosText: `[ ${keyPositions.join(", ")} ]`,
      formula: "",
      isKeyArea: true,
    };
  };

  const mainAreas = toArray(mergedSource.betAreas || betRecord.betAreas).map(normalizeArea);
  const roundSource = specialInfo.length
    ? specialInfo
    : [{ icons: mergedSource.icons || "", betAreas: mergedSource.betAreas || betRecord.betAreas || [], winLoseGold: mergedSource.winLoseGold }];
  const rounds = roundSource.map((item, roundIndex) => {
    const icons = parseLhdbIcons(item && item.icons, stage);
    const keyArea = buildKeyArea(icons, roundIndex);
    const winAreas = toArray(item && item.betAreas)
      .map(normalizeArea)
      .filter((area) => !LHDB_SKIP_RESULT_AREA_IDS.has(Number(area && area.betAreaId)));
    return {
      roundIndex,
      label: `第${roundIndex + 1}页`,
      icons,
      raw: item && item.icons ? String(item.icons) : "",
      timestamp: "",
      columns: grid.columns,
      rows: grid.rows,
      winAreas: keyArea ? [keyArea].concat(winAreas) : winAreas,
      winLoseGold: Number((item && item.winLoseGold) || 0),
      hasKeyCells: icons.some((icon) => Number(icon && icon.typeId) === LHDB_JEWEL_TYPE.ZUAN_TOU),
    };
  });

  if (!rounds.length) return null;

  return {
    mode: "lhdb",
    confName: "lhdb",
    stage,
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? parsed.commonRecord.dispatchRewardGold ?? 0),
    rounds,
    winAreas: mainAreas,
    iconNameMap: LHDB_STAGE_LABEL_MAP[stage] || {},
    shortLabelMap: LHDB_STAGE_SHORT_LABEL_MAP[stage] || {},
    isFreeGame: !!mergedSource.isFreeGame,
    specialInfo,
  };
}

function parseLzhdSideColumns(value) {
  const parsed = unwrapJsonValue(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.slice(0, 3).map((item, index) => {
    const column = Array.isArray(item) ? item.map((icon) => Number(icon || 0)) : [];
    return {
      index,
      icons: [Number(column[1] || 0), Number(column[2] || 0), Number(column[3] || 0)],
      mergedIconId: Number(column[2] || 0),
      topIconId: Number(column[1] || 0),
      bottomIconId: Number(column[3] || 0),
      isSingle: Number(column[2] || 0) > 0,
      offsetY: Number(column[2] || 0) > 0 ? 0 : 70,
    };
  });
}

function getLzhdSideArea(sideEntry) {
  return toArray(sideEntry && sideEntry.betAreas)[0] || {};
}

function buildLzhdBetInfo(area, side) {
  const betGold = Number((area && area.betGold) || 0);
  const winLoseGold = Number((area && area.winLoseGold) || 0);
  const betMultiple = area && area.betMultiple !== undefined ? area.betMultiple : "";
  const iconMultiple = area && area.iconMultiple !== undefined ? area.iconMultiple : "";
  return {
    side,
    hasBet: betGold > 0,
    betGold,
    winLoseGold,
    betMultiple,
    iconMultiple,
    formula:
      betGold > 0 && iconMultiple
        ? `${toMoney(betGold)} x ${betMultiple || 0} x ${iconMultiple}`
        : "",
  };
}

function buildLzhdViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const specialInfo = toArray(connection.specialInfo || betRecord.specialInfo || mergedSource.specialInfo);
  const dragonEntry = specialInfo[0] || {};
  const tigerEntry = specialInfo[1] || {};
  const dragonArea = getLzhdSideArea(dragonEntry);
  const tigerArea = getLzhdSideArea(tigerEntry);
  const dragonBet = buildLzhdBetInfo(dragonArea, "dragon");
  const tigerBet = buildLzhdBetInfo(tigerArea, "tiger");
  const showDouble = Number(dragonArea && dragonArea.iconMultiple) > 0 && Number(tigerArea && tigerArea.iconMultiple) > 0;

  return {
    mode: "lzhd",
    confName: "lzhd",
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(
      mergedSource.winLoseGold ??
        mergedSource.dispatchRewardGold ??
        parsed.commonRecord.dispatchRewardGold ??
        0
    ),
    lineBetGold: Number(mergedSource.betSingle || 0),
    lineBetTimes: Number(mergedSource.betTimes || 0),
    battleWinLoseGold: Number(mergedSource.battleWinLoseGold || 0),
    showDouble,
    dragon: {
      side: "dragon",
      title: "龙",
      columns: parseLzhdSideColumns(dragonEntry && dragonEntry.icons),
      betInfo: dragonBet,
    },
    tiger: {
      side: "tiger",
      title: "虎",
      columns: parseLzhdSideColumns(tigerEntry && tigerEntry.icons),
      betInfo: tigerBet,
    },
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.lzhd || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.lzhd || null,
  };
}

function buildRhdbRoundWinAreas(areas) {
  return toArray(areas).map((area, index) => {
    const normalizedLinePos = toArray(area && area.linePos)
      .map((item, columnIndex) => ({
        columnIndex,
        pos: toArray(item && item.pos)
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value)),
      }))
      .filter((item) => item.pos.length);
    const linePos = normalizedLinePos.flatMap((item) => item.pos.map((row) => [item.columnIndex, row]));
    const lineCount = normalizedLinePos.reduce((result, item) => result * item.pos.length, 1);
    const exMultiple = Number((area && area.exMultiple) || 0);
    const baseFormula = [
      toMoney(Number((area && area.betGold) || 0)),
      Number((area && area.betMultiple) || 0),
      lineCount,
      Number((area && area.iconMultiple) || 0),
    ].join(" x ");

    return {
      ...createSlotWinArea(area, index, {
        linePos,
        highlightKeys: linePos.map(([col, row]) => `${col}-${row}`),
        linePosText: linePos.length ? stringifySlotLinePos(linePos) : "",
        iconId: area && area.iconId !== undefined ? Number(area.iconId) : "",
        betAreaId: area && area.betAreaId !== undefined ? area.betAreaId : index + 1,
      }),
      lineCount,
      exMultiple,
      formula: exMultiple > 1 ? `(${baseFormula}) x ${exMultiple}` : `(${baseFormula})`,
    };
  });
}

function buildRhdbCardCells(iconList) {
  const icons = toArray(iconList).map((item) => Number(item));
  const cells = [];
  const columns = 5;
  const rows = 3;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const index = column * rows + row;
      cells.push({
        index,
        column,
        row,
        icon: icons[index] !== undefined ? icons[index] : "",
      });
    }
  }
  return cells;
}

function buildSbwhCardCells(iconList) {
  const icons = toArray(iconList).map((item) => Number(item));
  const cells = [];
  const columns = 4;
  const rows = 3;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = column * rows + row;
      cells.push({
        index,
        column,
        row,
        icon: icons[index] !== undefined ? icons[index] : "",
      });
    }
  }
  return cells;
}

function sumRhdbWinAreas(winAreas, fallbackValue) {
  const areas = toArray(winAreas);
  if (!areas.length) return Number(fallbackValue || 0);
  return areas.reduce((result, area) => result + Number((area && area.winLoseGold) || 0), 0);
}

function buildRhdbViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const specialInfo = toArray(connection.specialInfo || betRecord.specialInfo || mergedSource.specialInfo);
  const mainIcons = parseSlotIconTokens(mergedSource.icons).map((item) => Number(item));
  const mainWinAreas = buildRhdbRoundWinAreas(mergedSource.betAreas || betRecord.betAreas);
  const mainScatterCount = mainIcons.filter((icon) => Number(icon) === 31).length;
  const rounds = [
    {
      roundIndex: 0,
      label: "主盘",
      pageLabel: "",
      icons: mainIcons,
      cells: buildRhdbCardCells(mainIcons),
      raw: String(mergedSource.icons || ""),
      timestamp: commonRecord.settlementTimestamp || source.settlementTimestamp || "",
      columns: 5,
      rows: 3,
      winLoseGold: sumRhdbWinAreas(mainWinAreas, mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold ?? 0),
      winAreas: mainWinAreas,
      jewelMultiple: Number(mergedSource.jewelMultiple || 0),
      scatterCount: mainScatterCount,
      freeTriggerCount: specialInfo.length,
      isTriggerRound: mainScatterCount > 2 && specialInfo.length > 0,
      isFreeRound: false,
    },
  ];

  specialInfo.forEach((item, index) => {
    const icons = parseSlotIconTokens(item && item.icons).map((value) => Number(value));
    rounds.push({
      roundIndex: index + 1,
      label: `免费 ${index + 1}`,
      pageLabel: `${index + 1}/${specialInfo.length}`,
      icons,
      cells: buildRhdbCardCells(icons),
      raw: item && item.icons ? String(item.icons) : "",
      timestamp: "",
      columns: 5,
      rows: 3,
      winAreas: buildRhdbRoundWinAreas(item && item.betAreas),
      jewelMultiple: Number((item && item.jewelMultiple) || 0),
      scatterCount: icons.filter((icon) => Number(icon) === 31).length,
      freeTriggerCount: 0,
      isTriggerRound: false,
      isFreeRound: true,
    });
  });

  rounds.forEach((round) => {
    round.winLoseGold = sumRhdbWinAreas(round.winAreas, round.winLoseGold || 0);
  });

  return {
    mode: "rhdb",
    confName: "rhdb",
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold ?? 0),
    rounds,
    winAreas: mainWinAreas,
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.rhdb || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.rhdb || null,
    fuzzyAtlas: RHDB_FUZZY_ICON_ATLAS,
  };
}

function buildSbwhViewModel(parsed) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const commonRecord = parsed.commonRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const icons = parseSlotIconTokens(mergedSource.icons).map((item) => Number(item));
  const linePatternMap = {
    1: [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
    2: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    3: [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
    ],
    4: [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 1],
    ],
    5: [
      [0, 2],
      [1, 1],
      [2, 0],
      [3, 1],
    ],
  };
  const winAreas = toArray(mergedSource.betAreas)
    .slice()
    .sort((left, right) => Number(left && left.betAreaId) - Number(right && right.betAreaId))
    .map((area, index) => {
      const betGold = Number((area && area.betGold) || 0);
      const betMultiple = Number((area && area.betMultiple) || 0);
      const iconMultiple = Number((area && area.iconMultiple) || 0);
      const exMultiple = Number((area && area.exMultiple) || mergedSource.exMultiple || 1);
      const betAreaId = Number(area && area.betAreaId);
      const num = Number((area && area.num) || 0);
      const template = linePatternMap[betAreaId] || [];
      const linePos = template.slice(0, Math.min(num || template.length, template.length));
      return {
        index,
        betAreaId,
        iconId: Number(area && area.iconId),
        betGold,
        betMultiple,
        iconMultiple,
        exMultiple,
        num,
        winLoseGold: Number((area && area.winLoseGold) || 0),
        formula: `(${toMoney(betGold)} x ${betMultiple} x ${iconMultiple} x ${exMultiple})`,
        linePos,
        highlightKeys: linePos.map(([column, row]) => `${column}-${row}`),
      };
    });

  return {
    mode: "sbwh",
    confName: "sbwh",
    betSingle: Number(mergedSource.betSingle || 0),
    betTimes: Number(mergedSource.betTimes || 0),
    totalBetGold: Number(mergedSource.totalBetGold ?? betRecord.totalBetGold ?? 0),
    totalWinLoseGold: Number(mergedSource.winLoseGold ?? commonRecord.dispatchRewardGold ?? 0),
    cells: buildSbwhCardCells(icons),
    winAreas,
    iconNameMap: GENERIC_SLOT_ICON_NAME_MAP.sbwh || {},
    iconAtlas: GENERIC_SLOT_ICON_ATLAS_MAP.sbwh || null,
    fuzzyAtlas: SBWH_FUZZY_ICON_ATLAS,
    lineAtlas: SBWH_LINE_ATLAS,
  };
}

const SLOT_CUSTOM_VIEW_CONF_NAMES = new Set([
  "sjddj",
  "shz",
  "lhdb",
  "dfdc",
  "xldb",
  "jqb",
  "xldb2",
  "worldcup",
  "wcg",
  "lzhd",
  "rhdb",
  "sbwh",
  "cfmm",
  "stkh",
  "bdyds",
  "jbp",
  "dwwg",
  "jlbz",
  "hdbz",
  "hshwk",
  "fkseven",
  "sbjn",
  "jqt",
  "sjnw",
  "jszc",
  "xmwlj",
  "cjwp",
]);

function buildSpecialBlocks(confName, parsed) {
  switch (confName) {
    case "double":
      return buildDoubleBlocks(parsed);
    case "dice":
      return buildDiceBlocks(parsed);
    case "plinko":
      return buildPlinkoBlocks(parsed);
    case "hilo":
      return buildHiloBlocks(parsed);
    case "circle":
      return buildCircleBlocks(parsed);
    case "coin":
      return buildCoinBlocks(parsed);
    case "keno":
      return buildKenoBlocks(parsed);
    case "limbo":
      return buildLimboBlocks(parsed);
    case "tower":
      return buildTowerBlocks(parsed);
    case "bxsl":
      return buildBxslBlocks(parsed);
    case "sjddj":
      return buildSjddjBlocks(parsed);
    case "spiritParty":
      return buildSpiritPartyBlocks(parsed);
    case "bbjl":
      return buildBBJLBlocks(parsed);
    case "roulette":
      return buildRouletteBlocks(parsed);
    case "bhjk":
      return buildBHJKBlocks(parsed);
    case "baviator":
      return buildBaviatorBlocks(parsed);
    case "ld":
      return buildLDBlocks(parsed);
    case "slide":
      return buildSlideBlocks(parsed);
    case "yfct":
      return buildYFCTBlocks(parsed);
    default:
      return [];
  }
}

export function buildSettlementRecordDetail(row) {
  const gameId = Number(row && row.gameId);
  const confName = getSettlementConfName(gameId);
  const supported = SUPPORTED_SETTLEMENT_DETAIL_GAME_IDS.has(gameId);

  try {
    const parsed = normalizeRecordLog(row ? row.log : "");
    const summary = buildSummary(row || {}, parsed, confName);
    const customView =
      QKLS_GAME_CONF_NAMES.has(confName)
        ? confName === "bhjk"
          ? buildBhjkViewModel(parsed, row, summary)
          : confName === "baviator"
          ? buildBaviatorViewModel(parsed, row, summary)
          : buildQklsViewModel(parsed, confName, row, summary)
        : confName === "sjddj"
        ? buildSjddjViewModelClient(parsed)
        : confName === "shz"
        ? buildShzViewModel(parsed)
        : confName === "cjsgj2"
        ? buildCjsgj2ViewModel(parsed)
        : confName === "worldcup"
        ? buildWorldcupViewModel(parsed)
        : confName === "wcg"
        ? buildWcgViewModel(parsed)
        : confName === "lzhd"
        ? buildLzhdViewModel(parsed)
        : confName === "rhdb"
        ? buildRhdbViewModel(parsed)
        : confName === "sbwh"
        ? buildSbwhViewModel(parsed)
        : confName === "cfmm"
        ? buildCfmmViewModel(parsed)
        : confName === "stkh"
        ? buildStkhViewModel(parsed)
        : confName === "bdyds"
        ? buildBdydsViewModel(parsed)
        : confName === "jbp"
        ? buildJbpViewModel(parsed)
        : confName === "dwwg"
        ? buildDwwgViewModel(parsed)
        : confName === "jlbz"
        ? buildJlbzViewModel(parsed)
        : confName === "hdbz"
        ? buildHdbzViewModel(parsed)
        : confName === "hshwk"
        ? buildHshwkViewModel(parsed)
        : confName === "fkseven"
        ? buildFksevenViewModel(parsed)
        : confName === "sbjn"
        ? buildSbjnViewModel(parsed)
        : confName === "jqt"
        ? buildJqtViewModel(parsed)
        : confName === "sjnw"
        ? buildSjnwViewModel(parsed)
        : confName === "jszc"
        ? buildJszcViewModel(parsed)
        : confName === "xmwlj"
        ? buildXmwljViewModel(parsed)
        : confName === "cjwp"
        ? buildCjwpViewModel(parsed)
        : confName === "mjhl" || confName === "mjhl2"
        ? buildMjhlViewModel(parsed, confName)
        : confName === "hgxs"
        ? buildHgxsViewModel(parsed)
        : confName === "dfdc"
        ? buildDfdcViewModel(parsed)
        : confName === "lhdb"
        ? buildLhdbViewModel(parsed)
        : confName === "xldb" || confName === "jqb" || confName === "xldb2"
        ? buildXldbViewModel(parsed, confName)
        : confName === "tgpd"
        ? buildTgpdViewModel(parsed)
        : SLOT_GAME_CONF_NAMES.has(confName)
        ? buildGenericSlotViewModel(parsed, confName)
        : null;
    const blocks = []
      .concat(buildSpecialBlocks(confName, parsed))
      .concat(SLOT_GAME_CONF_NAMES.has(confName) && !SLOT_CUSTOM_VIEW_CONF_NAMES.has(confName) ? buildSlotBlocks(parsed) : [])
      .concat(buildCommonBlocks(parsed));

    const rawJson = stringifyValue(parsed.raw);
    return {
      supported,
      confName,
      summary,
      blocks,
      customView,
      rawJson,
      parseError: "",
    };
  } catch (error) {
    return {
      supported,
      confName,
      summary: buildSummary(row || {}, { commonRecord: {}, betRecord: {} }, confName),
      blocks: [],
      customView: null,
      rawJson: stringifyValue((row || {}).log),
      parseError: error && error.message ? error.message : "unknown parse error",
    };
  }
}
