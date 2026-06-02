import { formatUnixDateTime, toMoney } from "./settlementHelpers";

export const SUPPORTED_SETTLEMENT_DETAIL_GAME_IDS = new Set([
  3001, 3002, 3003, 3004, 3005, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3022,
  3023, 3024, 3025, 3026, 3028, 3029, 3030, 3031, 3032, 3033, 3035, 3036, 3037, 3038, 3039, 3040, 3042, 3051, 5001,
  5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009, 5010, 5011, 5012, 5013, 5014, 5015, 5016, 5017, 5018,
]);

const GAME_CONF_NAME_MAP = {
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

const COLOR_LABELS = {
  1: "缁胯壊",
  2: "钃濊壊",
  3: "绾㈣壊",
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
  pushEntry(summary, "娓告垙ID", row.gameId);
  pushEntry(summary, "局号", row.roundID);
  pushEntry(summary, "鐜╁", row.account);
  pushEntry(summary, "鐢ㄦ埛ID", row.userId);
  pushEntry(summary, "涓嬫敞", parsed.betRecord.totalBetGold || row.bet, (value) => toMoney(value));
  pushEntry(summary, "杈撹耽", parsed.commonRecord.dispatchRewardGold !== undefined ? parsed.commonRecord.dispatchRewardGold : row.win, (value) => toMoney(value));
  pushEntry(summary, "鏃堕棿", row.playedDate, formatUnixDateTime);
  return summary;
}

function buildCommonBlocks(parsed) {
  const blocks = [];
  const commonEntries = [];
  pushEntry(commonEntries, "Record ID", parsed.commonRecord.recordId);
  pushEntry(commonEntries, "票据号", parsed.commonRecord.porderId);
  pushEntry(commonEntries, "绉嶅瓙", parsed.commonRecord.seed);
  pushEntry(commonEntries, "缁撶畻鏃堕棿", parsed.commonRecord.settlementTimestamp, formatUnixDateTime);
  pushEntry(commonEntries, "限红命中", parsed.commonRecord.IsLimit, (value) => (value ? "是" : "否"));
  blocks.push(createEntriesBlock("閫氱敤淇℃伅", commonEntries));

  const betEntries = [];
  pushEntry(betEntries, "总下注", parsed.betRecord.totalBetGold, (value) => toMoney(value));
  pushEntry(betEntries, "缁撴灉鎻忚堪", parsed.betRecord.resultDesc);
  pushEntry(betEntries, "鏂扮増缁撴灉", parsed.betRecord.newResultDesc);
  pushEntry(betEntries, "开奖明细", parsed.betRecord.areaResult);
  blocks.push(createEntriesBlock("娉ㄥ崟鏁版嵁", betEntries));

  const betAreas = toArray(parsed.betRecord.betAreas).map((area) => ({
    betAreaId: area.betAreaId,
    betGold: area.betGold !== undefined ? toMoney(area.betGold) : "",
    winLoseGold: area.winLoseGold !== undefined ? toMoney(area.winLoseGold) : "",
    odds: area.num !== undefined ? area.num : "",
    multiple: area.betMultiple !== undefined ? area.betMultiple : "",
  }));
  blocks.push(
    createTableBlock(
      "涓嬫敞鍖哄煙",
      [
        { key: "betAreaId", label: "鍖哄煙ID" },
        { key: "betGold", label: "涓嬫敞" },
        { key: "winLoseGold", label: "杈撹耽" },
        { key: "odds", label: "璧旂巼/鍙傛暟" },
        { key: "multiple", label: "鍊嶆暟" },
      ],
      betAreas
    )
  );

  if (parsed.betRecord.resultDescParsed) {
    blocks.push(createJsonBlock("缁撴灉鎻忚堪瑙ｆ瀽", parsed.betRecord.resultDescParsed));
  }
  if (parsed.betRecord.newResultDescParsed) {
    blocks.push(createJsonBlock("鏂扮増缁撴灉瑙ｆ瀽", parsed.betRecord.newResultDescParsed));
  }
  if (parsed.betRecord.specialInfoStrParsed) {
    blocks.push(createJsonBlock("鐗规畩濂栧姳瑙ｆ瀽", parsed.betRecord.specialInfoStrParsed));
  }
  const specialInfo = parsed.betRecord.specialInfoStrParsed;
  if (specialInfo && Array.isArray(specialInfo.trigger_details)) {
    blocks.push(
      createTableBlock(
        "鍏嶈垂娓告垙瑙﹀彂",
        [
          { key: "lineId", label: "绾胯矾" },
          { key: "indexes", label: "鍛戒腑浣嶇疆" },
          { key: "multiplier", label: "鍊嶇巼/璇存槑" },
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
        "鍏嶈垂娓告垙鍥炲悎",
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
        "鍏嶈垂娓告垙鏄庣粏",
        [
          { key: "set", label: "组" },
          { key: "round", label: "鍥炲悎" },
          { key: "outerIncome", label: "澶栧湀鏀剁泭" },
          { key: "innerIncome", label: "鍐呭湀鏀剁泭" },
          { key: "outerOdds", label: "澶栧湀璧旂巼" },
          { key: "innerOdds", label: "鍐呭湀璧旂巼" },
        ],
        specialRounds
      )
    );
  }

  if (typeof parsed.source.icons === "string" && parsed.source.icons.includes(";")) {
    blocks.push(
      createTableBlock(
        "澶氳疆鍥炬爣缁撴灉",
        [
          { key: "round", label: "杞" },
          { key: "icons", label: "鍥炬爣搴忓垪" },
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
  pushEntry(entries, "鍗曠嚎涓嬫敞", parsed.source.betSingle, (value) => toMoney(value));
  pushEntry(entries, "涓嬫敞鍊嶆暟", parsed.source.betTimes);
  pushEntry(entries, "小游戏输赢", parsed.source.battleWinLoseGold, (value) => toMoney(value));
  blocks.push(createEntriesBlock("Slot 鍩虹淇℃伅", entries));

  if (parsed.source.icons) {
    blocks.push(createTagsBlock("Icon 缁撴灉", String(parsed.source.icons).split(",")));
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
      "涓绾胯矾/鍖哄煙",
      [
        { key: "betAreaId", label: "鍖哄煙ID" },
        { key: "iconId", label: "鍥炬爣ID" },
        { key: "num", label: "鏁伴噺" },
        { key: "betMultiple", label: "绾垮€嶆暟" },
        { key: "iconMultiple", label: "鍥炬爣鍊嶆暟" },
        { key: "winLoseGold", label: "涓" },
      ],
      winAreas
    )
  );
  return blocks.filter(Boolean);
}

function buildDoubleBlocks(parsed) {
  const area = toArray(parsed.betRecord.betAreas)[0] || {};
  return [
    createEntriesBlock("猜红黑详情", [
      { label: "缁撴灉", value: stringifyValue(parsed.betRecord.newResultDesc || parsed.betRecord.resultDesc) },
      { label: "涓嬫敞鍖哄煙", value: area.betAreaId !== undefined ? `鍖哄煙 ${area.betAreaId}` : "" },
    ]),
  ].filter(Boolean);
}

function buildDiceBlocks(parsed) {
  const area = toArray(parsed.betRecord.betAreas)[0] || {};
  return [
    createEntriesBlock("猜数字详情", [
      { label: "开奖结果", value: stringifyValue(parsed.betRecord.areaResult) },
      { label: "涓嬫敞绫诲瀷", value: area.betAreaId ? DICE_AREA_LABELS[area.betAreaId] || `鍖哄煙 ${area.betAreaId}` : "" },
      { label: "涓嬫敞鍙傛暟", value: area.num !== undefined ? stringifyValue(area.num) : "" },
    ]),
  ].filter(Boolean);
}

function buildPlinkoBlocks(parsed) {
  const parts = String(parsed.betRecord.resultDesc || "").split("|");
  return [
    createEntriesBlock("普林科详情", [
      { label: "琛屾暟", value: parts[0] || "" },
      { label: "棰滆壊", value: COLOR_LABELS[Number(parts[1])] || parts[1] || "" },
      { label: "鍊嶇巼", value: parts[2] || "" },
    ]),
  ].filter(Boolean);
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
      "楂樹綆绾哥墝杩囩▼",
      [
        { key: "round", label: "杞" },
        { key: "card", label: "鐗岄潰" },
        { key: "betArea", label: "涓嬫敞鍖哄煙" },
        { key: "ratio", label: "鍊嶇巼" },
        { key: "skipped", label: "璺宠繃" },
      ],
      rounds
    ),
  ].filter(Boolean);
}

function buildCircleBlocks(parsed) {
  const detail = parsed.betRecord.newResultDescParsed || {};
  return [
    createEntriesBlock("骞歌繍杞洏璇︽儏", [
      { label: "闅惧害", value: detail.bet_difficulty !== undefined ? stringifyValue(detail.bet_difficulty) : "" },
      { label: "鎵囧尯", value: detail.bet_section !== undefined ? String(Number(detail.bet_section) * 10) : "" },
      { label: "涓嬫敞", value: detail.bet_gold !== undefined ? toMoney(detail.bet_gold) : "" },
      { label: "鍊嶇巼", value: detail.odds !== undefined ? `${detail.odds}x` : "" },
      { label: "缁撴灉棰滆壊", value: detail.result_color !== undefined ? stringifyValue(detail.result_color) : "" },
    ]),
  ].filter(Boolean);
}

function buildCoinBlocks(parsed) {
  const detail = parsed.betRecord.newResultDescParsed || {};
  const rounds = toArray(detail.coin_bet_rsp_list).map((item, index) => ({
    round: index + 1,
    result: item.result === 1 ? "金" : item.result === 2 ? "银" : stringifyValue(item.result),
  }));
  return [
    createEntriesBlock("骞歌繍纭竵璇︽儏", [
      { label: "鎶曟敞绾у埆", value: detail.coin_bet_rsp_list ? detail.coin_bet_rsp_list.length : "" },
      { label: "涓嬫敞鍖哄煙", value: COIN_AREA_LABELS[detail.bet_area] || "" },
      { label: "璧旂巼", value: detail.odds !== undefined ? `${detail.odds}x` : "" },
      { label: "下注额", value: detail.bet_gold !== undefined ? toMoney(detail.bet_gold) : "" },
    ]),
    createTableBlock(
      "缈诲竵缁撴灉",
      [
        { key: "round", label: "杞" },
        { key: "result", label: "缁撴灉" },
      ],
      rounds
    ),
  ].filter(Boolean);
}

function buildKenoBlocks(parsed) {
  const detail = parsed.betRecord.resultDescParsed || {};
  return [
    createTagsBlock("鎶曟敞鍙风爜", detail.bet),
    createTagsBlock("开奖号码", detail.open),
    createTagsBlock("鍛戒腑鍙风爜", detail.hit),
  ].filter(Boolean);
}

function buildSpiritPartyBlocks(parsed) {
  const parts = String(parsed.betRecord.areaResult || "").split("|");
  return [
    createEntriesBlock("浜＄伒娲惧璇︽儏", [
      { label: "鍊嶇巼", value: parsed.betRecord.newResultDesc ? `${parsed.betRecord.newResultDesc}x` : "" },
    ]),
    createTagsBlock("缁撴灉鍥炬爣", parts[0] ? parts[0].split(",") : []),
  ].filter(Boolean);
}

function buildBBJLBlocks(parsed) {
  const detail = parsed.betRecord.resultDescParsed || {};
  const result = detail.result || {};
  return [
    createEntriesBlock("百家樂结果", [
      { label: "鑾疯儨鍖哄煙", value: result.area_id ? BBJL_AREA_LABELS[result.area_id] || `鍖哄煙 ${result.area_id}` : "" },
    ]),
    createTagsBlock("搴勫鐗岄潰", toArray((detail.banker || {}).cards)),
    createTagsBlock("闂插鐗岄潰", toArray((detail.player || {}).cards)),
    createTableBlock(
      "涓嬫敞鏄庣粏",
      [
        { key: "area", label: "鍖哄煙" },
        { key: "bet", label: "涓嬫敞" },
      ],
      toArray(detail.bet).map((item) => ({
        area: BBJL_AREA_LABELS[item.area_id] || `鍖哄煙 ${item.area_id}`,
        bet: item.bet !== undefined ? toMoney(item.bet) : "",
      }))
    ),
  ].filter(Boolean);
}

function buildRouletteBlocks(parsed) {
  const betAreas = toArray(parsed.betRecord.betAreas).map((item) => ({
    betAreaId: item.betAreaId,
    betGold: item.betGold !== undefined ? toMoney(item.betGold) : "",
    winLoseGold: item.winLoseGold !== undefined ? toMoney(item.winLoseGold) : "",
  }));
  return [
    createEntriesBlock("杞洏缁撴灉", [
      { label: "开奖号码", value: stringifyValue(parsed.betRecord.newResultDesc || parsed.betRecord.resultDesc) },
    ]),
    createTableBlock(
      "杞洏涓嬫敞",
      [
        { key: "betAreaId", label: "鍖哄煙ID" },
        { key: "betGold", label: "涓嬫敞" },
        { key: "winLoseGold", label: "杈撹耽" },
      ],
      betAreas
    ),
  ].filter(Boolean);
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
      { label: "淇濋櫓閲戦", value: settlement.insurance_gold !== undefined ? toMoney(settlement.insurance_gold) : "" },
      { label: "淇濋櫓璧斾粯", value: settlement.insurance_payout !== undefined ? toMoney(settlement.insurance_payout) : "" },
    ]),
    createTagsBlock("搴勫鐗岄潰", toArray((((detail.black_jack_player_state_info || {}).black_jack_dealer) || {}).black_jack_cards)),
    createTableBlock(
      "鐜╁鐗岄潰",
      [
        { key: "seat", label: "浣嶇疆" },
        { key: "cards", label: "鐗岄潰" },
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
      { label: "绉嶅瓙", value: parsed.commonRecord.seed || "" },
      { label: "寮€鍑哄€嶇巼", value: parsed.betRecord.resultDesc || "" },
    ]),
    createTableBlock(
      "涓嬫敞鍖哄煙",
      [
        { key: "betAreaId", label: "鍖哄煙ID" },
        { key: "betGold", label: "涓嬫敞" },
        { key: "winLoseGold", label: "杈撹耽" },
        { key: "rate", label: "璧旂巼" },
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
      "骞歌繍楠板瓙璇︽儏",
      [
        { key: "dice", label: "楠板瓙" },
        { key: "range", label: "缁撴灉鍖洪棿" },
        { key: "odds", label: "鍊嶇巼" },
      ],
      areas
    ),
  ].filter(Boolean);
}

function buildSlideBlocks(parsed) {
  return [
    createEntriesBlock("骞歌繍婊戣璇︽儏", [
      { label: "缁撴灉鍊嶇巼", value: parsed.betRecord.resultDesc ? `${parsed.betRecord.resultDesc}x` : "" },
    ]),
    createTableBlock(
      "婊戣涓嬫敞",
      [
        { key: "betGold", label: "涓嬫敞" },
        { key: "betMultiple", label: "鐩爣鍊嶆暟" },
        { key: "winLoseGold", label: "杈撹耽" },
      ],
      toArray(parsed.betRecord.betAreas).map((item) => ({
        betGold: item.betGold !== undefined ? toMoney(item.betGold) : "",
        betMultiple: item.betMultiple !== undefined ? `${item.betMultiple}x` : "",
        winLoseGold: item.winLoseGold !== undefined ? toMoney(item.winLoseGold) : "",
      }))
    ),
  ].filter(Boolean);
}

function buildYFCTBlocks(parsed) {
  return [
    createEntriesBlock("一飞冲天详情", [
      { label: "寮€濂栧€嶇巼", value: parsed.betRecord.areaResult || "" },
    ]),
  ].filter(Boolean);
}

function buildLimboBlocks(parsed) {
  const parts = String(parsed.betRecord.areaResult || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return [
    createEntriesBlock("火箭鸟详情", [
      { label: "寮€鍑哄€嶇巼", value: parts[0] ? `${parts[0]}x` : "" },
      { label: "鐩爣鍊嶇巼", value: parts[1] ? `${parts[1]}x` : "" },
      { label: "涓嬫敞閲戦", value: parsed.betRecord.totalBetGold !== undefined ? toMoney(parsed.betRecord.totalBetGold) : "" },
    ]),
  ].filter(Boolean);
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
    createEntriesBlock("鐜涢泤绁炴璇︽儏", [
      { label: "闅惧害", value: Number.isNaN(diffType) ? "" : String(diffType + 1) },
      { label: "结果", value: parsed.betRecord.bankerLoseRatio === 0 ? "未中奖" : parsed.betRecord.bankerLoseRatio ? `${parsed.betRecord.bankerLoseRatio}x` : "" },
    ]),
    createTableBlock(
      "灞傜骇璧旂巼",
      [
        { key: "level", label: "灞傜骇" },
        { key: "odds", label: "璧旂巼" },
      ],
      odds
    ),
    createTableBlock(
      "开格过程",
      [
        { key: "row", label: "行" },
        { key: "cells", label: "鏍煎瓙鏁版嵁" },
        { key: "opened", label: "鎵撳紑浣嶇疆" },
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
  const board = detailParts[4]
    ? detailParts[4].split("|").map((item, index) => ({
        index: index + 1,
        type: item === "2" ? "瀹濈煶" : "鍦伴浄",
        opened: opened.includes(String(index)) ? "是" : "否",
      }))
    : [];

  return [
    createEntriesBlock("鎵浄璇︽儏", [
      { label: "缁撴灉璧旂巼", value: detailParts[2] ? `${detailParts[2]}x` : "" },
      { label: "宸插紑鏍煎瓙", value: opened.length ? opened.map((value) => Number(value) + 1).join(", ") : "" },
    ]),
    createTableBlock(
      "妫嬬洏缁撴灉",
      [
        { key: "index", label: "浣嶇疆" },
        { key: "type", label: "绫诲瀷" },
        { key: "opened", label: "宸叉墦寮€" },
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

const GENERIC_SLOT_ICON_ATLAS_MAP = {
  cjsgj: {
    url: "/cjsgj-icons-atlas.webp",
    width: 435,
    height: 502,
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

function buildGenericSlotViewModel(parsed, confName) {
  const source = parsed.source || {};
  const connection = parsed.connectionRecord || {};
  const betRecord = parsed.betRecord || {};
  const mergedSource = {
    ...betRecord,
    ...connection,
    ...source,
  };

  const allWinAreas = toArray(mergedSource.betAreas || betRecord.betAreas).map((area, index) => {
    const linePos = resolveSlotLinePos(area);
    const highlightKeys = linePos.map(([x, y]) => `${x}-${y}`);
    return {
      index,
      betAreaId: area && area.betAreaId !== undefined ? area.betAreaId : "",
      iconId: area && area.iconId !== undefined ? area.iconId : "",
      num: area && area.num !== undefined ? area.num : "",
      betMultiple: area && area.betMultiple !== undefined ? area.betMultiple : "",
      iconMultiple: area && area.iconMultiple !== undefined ? area.iconMultiple : "",
      betGold: Number((area && area.betGold) || 0),
      winLoseGold: Number((area && area.winLoseGold) || 0),
      linePos,
      highlightKeys,
      linePosText: linePos.length ? stringifySlotLinePos(linePos) : area && (area.linePos || area.pos) ? stringifyValue(area.linePos || area.pos) : "",
    };
  });

  const timestampList = source.timestampList || connection.timestampList || betRecord.timestampList || [];
  const rawIcons = String(mergedSource.icons || "");
  const rounds = splitGenericSlotRounds(rawIcons, allWinAreas, timestampList);
  const normalizedRounds = (rounds.length ? rounds : [{ roundIndex: 0, label: "第 1 回合", icons: [], raw: "", winAreas: [] }]).map(
    (round) => {
      const winAreas = round.winAreas && round.winAreas.length ? round.winAreas : rounds.length <= 1 ? allWinAreas : [];
      const grid = inferSlotGrid((round.icons || []).length, winAreas);
      return {
        ...round,
        winAreas,
        columns: grid.columns,
        rows: grid.rows,
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

  const mainAreas = toArray(mergedSource.betAreas || betRecord.betAreas).map(normalizeArea);
  const roundSource = specialInfo.length
    ? specialInfo
    : [{ icons: mergedSource.icons || "", betAreas: mergedSource.betAreas || betRecord.betAreas || [], winLoseGold: mergedSource.winLoseGold }];
  const rounds = roundSource.map((item, roundIndex) => {
    const icons = parseLhdbIcons(item && item.icons, stage);
    return {
      roundIndex,
      label: `第${roundIndex + 1}页`,
      icons,
      raw: item && item.icons ? String(item.icons) : "",
      timestamp: "",
      columns: grid.columns,
      rows: grid.rows,
      winAreas: toArray(item && item.betAreas).map(normalizeArea),
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

const SLOT_CUSTOM_VIEW_CONF_NAMES = new Set(["sjddj", "shz", "lhdb"]);

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
  const confName = GAME_CONF_NAME_MAP[gameId] || "";
  const supported = SUPPORTED_SETTLEMENT_DETAIL_GAME_IDS.has(gameId);

  try {
    const parsed = normalizeRecordLog(row ? row.log : "");
    const customView =
      confName === "sjddj"
        ? buildSjddjViewModelClient(parsed)
        : confName === "shz"
        ? buildShzViewModel(parsed)
        : confName === "lhdb"
        ? buildLhdbViewModel(parsed)
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
      summary: buildSummary(row || {}, parsed, confName),
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
