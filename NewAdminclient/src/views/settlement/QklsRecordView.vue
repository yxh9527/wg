<template>
  <div class="qkls-view">
    <div class="qkls-hero">
      <div
        v-for="entry in metricEntries"
        :key="`${entry.label}-${entry.value}`"
        class="qkls-metric"
        :class="metricClass(entry.label)"
      >
        <div class="qkls-metric-label">{{ entry.label }}</div>
        <div class="qkls-metric-value">{{ entry.value }}</div>
      </div>
    </div>

    <div v-if="highlightEntries.length" class="qkls-highlight-card">
      <div class="qkls-section-title">本局结果</div>
      <div class="qkls-highlight-list">
        <div
          v-for="item in highlightEntries"
          :key="`${item.label}-${item.value}`"
          class="qkls-highlight-item"
          :class="`is-${item.tone || 'neutral'}`"
        >
          <div class="qkls-highlight-label">{{ item.label }}</div>
          <div class="qkls-highlight-value">{{ item.value }}</div>
        </div>
      </div>
    </div>

    <div v-if="baseEntries.length" class="qkls-base-card">
      <div class="qkls-section-title">基础信息</div>
      <div class="qkls-base-list">
        <div
          v-for="entry in baseEntries"
          :key="`${entry.label}-${entry.value}`"
          class="qkls-base-item"
        >
          <span class="qkls-base-label">{{ entry.label }}</span>
          <span class="qkls-base-value">{{ entry.value }}</span>
        </div>
      </div>
    </div>

    <div class="qkls-block-grid">
      <div
        v-for="block in normalBlocks"
        :key="`${block.type}-${block.title}`"
        class="qkls-block"
        :class="blockClass(block)"
      >
        <div class="qkls-block-head">
          <div class="qkls-block-title">{{ block.title }}</div>
        </div>

        <div v-if="isFancyEntryBlock(block)" class="qkls-fancy-entry-list">
          <div
            v-for="entry in block.entries"
            :key="`${block.title}-${entry.label}`"
            class="qkls-fancy-entry-item"
          >
            <div class="qkls-entry-label">{{ entry.label }}</div>
            <div class="qkls-entry-value">{{ entry.value }}</div>
          </div>
        </div>

        <div v-else-if="isInlineCommonBlock(block)" class="qkls-inline-entry-strip">
          <div
            v-for="entry in block.entries"
            :key="`${block.title}-${entry.label}`"
            class="qkls-inline-entry-item"
          >
            <span class="qkls-inline-entry-label">{{ entry.label }}</span>
            <span class="qkls-inline-entry-value">{{ entry.value }}</span>
          </div>
        </div>

        <div v-else-if="block.type === 'entries'" class="qkls-entry-list">
          <div
            v-for="entry in block.entries"
            :key="`${block.title}-${entry.label}`"
            class="qkls-entry-item"
          >
            <div class="qkls-entry-label">{{ entry.label }}</div>
            <div class="qkls-entry-value">{{ entry.value }}</div>
          </div>
        </div>

        <div v-else-if="isCoinRoundBlock(block)" class="qkls-round-result-list">
          <div
            v-for="row in block.rows || []"
            :key="`${block.title}-${row.round}`"
            class="qkls-round-result-item"
          >
            <span class="qkls-round-index">第{{ row.round }}轮</span>
            <span class="qkls-round-chip" :class="coinTone(row.result)">{{ row.result }}</span>
          </div>
        </div>

        <div v-else-if="isHiloBlock(block)" class="qkls-hilo-flow">
          <div
            v-for="(row, index) in hiloSteps(block)"
            :key="`${block.title}-${row.round}`"
            class="qkls-hilo-step"
          >
            <div class="qkls-hilo-card-wrap">
              <div class="qkls-hilo-card" :class="hiloCardTone(row.card)">
                <template v-if="hiloCardFace(row.card)">
                  <div class="qkls-hilo-corner qkls-hilo-corner--top">
                    <span class="qkls-hilo-rank">{{ hiloCardFace(row.card).rank }}</span>
                    <span class="qkls-hilo-suit">{{ hiloCardFace(row.card).suit }}</span>
                  </div>
                  <div class="qkls-hilo-center">{{ hiloCardFace(row.card).center }}</div>
                  <div class="qkls-hilo-corner qkls-hilo-corner--bottom">
                    <span class="qkls-hilo-rank">{{ hiloCardFace(row.card).rank }}</span>
                    <span class="qkls-hilo-suit">{{ hiloCardFace(row.card).suit }}</span>
                  </div>
                </template>
                <template v-else>
                  {{ hiloCardText(row.card) }}
                </template>
              </div>
              <div class="qkls-hilo-caption" :data-label="hiloStepCaption(index, row)">
                {{ index === 0 ? "起手牌" : hiloArrowLabel(row) }}
              </div>
            </div>
            <div v-if="index < hiloSteps(block).length - 1" class="qkls-hilo-arrow-wrap">
              <div
                class="qkls-hilo-arrow"
                :class="hiloArrowTone(hiloTransitionRow(block, index))"
                :data-symbol="hiloArrowSymbol(hiloTransitionRow(block, index))"
              >
                {{ hiloArrowSymbol(hiloTransitionRow(block, index)) }}
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="isLdBlock(block)" class="qkls-ld-board">
          <div
            v-for="(row, index) in block.rows || []"
            :key="`${block.title}-${index}`"
            class="qkls-ld-card"
          >
            <div class="qkls-ld-card-top">
              <div class="qkls-ld-dice-pair">
                <span class="qkls-ld-dice">{{ splitDice(row.dice)[0] }}</span>
                <span class="qkls-ld-dice">{{ splitDice(row.dice)[1] }}</span>
              </div>
              <div class="qkls-ld-main">
                <div class="qkls-ld-range">{{ row.range }}</div>
                <div class="qkls-ld-odds">{{ row.odds || "-" }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="isBetTableBlock(block)" class="qkls-bet-pill-list">
          <div
            v-for="(row, index) in betPills(block)"
            :key="`${block.title}-${index}`"
            class="qkls-bet-pill"
          >
            <div class="qkls-bet-pill-main">{{ row.main }}</div>
            <div v-if="row.sub" class="qkls-bet-pill-meta">{{ row.sub }}</div>
            <div v-if="row.win" class="qkls-bet-pill-win">{{ row.win }}</div>
          </div>
        </div>

        <div v-else-if="isTowerOddsBlock(block)" class="qkls-odds-list">
          <div
            v-for="row in block.rows || []"
            :key="`${block.title}-${row.level}`"
            class="qkls-odds-chip"
          >
            <span class="qkls-odds-chip-label">第{{ row.level }}层</span>
            <span class="qkls-odds-chip-value">{{ row.odds }}</span>
          </div>
        </div>

        <div v-else-if="isTowerBoardBlock(block)" class="qkls-tower-board">
          <div
            v-for="row in towerRows(block)"
            :key="`${block.title}-${row.row}`"
            class="qkls-tower-row"
          >
            <div class="qkls-tower-row-label">第{{ row.row }}行</div>
            <div class="qkls-tower-row-cells">
              <div
                v-for="(cell, index) in row.cells"
                :key="`${row.row}-${index}`"
                class="qkls-tower-cell"
                :class="{ 'is-opened': row.openedIndex === index }"
              >
                {{ cell }}
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="isMinesBoardBlock(block)" class="qkls-mines-board">
          <div
            v-for="cell in mineCells(block)"
            :key="`${block.title}-${cell.index}`"
            class="qkls-mine-cell"
            :class="[
              cell.opened ? 'is-opened' : '',
              cell.kind === 'gem' ? 'is-gem' : 'is-mine',
            ]"
          >
            <div class="qkls-mine-glow" />
            <div class="qkls-mine-icon">{{ cell.kind === "gem" ? "💎" : "💣" }}</div>
          </div>
        </div>

        <div v-else-if="isHandTableBlock(block)" class="qkls-hand-list">
          <div
            v-for="row in handRows(block)"
            :key="`${block.title}-${row.label}`"
            class="qkls-hand-item"
          >
            <div class="qkls-hand-label">{{ row.label }}</div>
            <div class="qkls-card-list">
              <span
                v-for="(card, index) in row.cards"
                :key="`${row.label}-${index}`"
                class="qkls-card-chip"
              >
                {{ card }}
              </span>
            </div>
          </div>
        </div>

        <div v-else-if="isTagBlock(block)" class="qkls-tag-group">
          <div v-if="isNumberTagBlock(block)" class="qkls-number-grid">
            <span
              v-for="(item, index) in block.items"
              :key="`${block.title}-${index}`"
              class="qkls-number-chip"
              :class="numberChipClass(block.title)"
            >
              {{ item }}
            </span>
          </div>
          <div v-else class="qkls-card-list">
            <span
              v-for="(item, index) in block.items"
              :key="`${block.title}-${index}`"
              class="qkls-card-chip"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <el-table
          v-else-if="block.type === 'table'"
          :data="block.rows"
          border
          size="mini"
          class="qkls-table"
        >
          <el-table-column
            v-for="column in block.columns"
            :key="column.key"
            :prop="column.key"
            :label="column.label"
            min-width="108"
            show-overflow-tooltip
          />
        </el-table>
      </div>
    </div>

    <div
      v-for="block in jsonBlocks"
      :key="`${block.type}-${block.title}`"
      class="qkls-block qkls-block--full"
    >
      <div class="qkls-block-head">
        <div class="qkls-block-title">{{ block.title }}</div>
        <button
          type="button"
          class="qkls-toggle"
          @click="toggleJsonBlock(block.title)"
        >
          {{ isJsonExpanded(block.title) ? "收起" : "展开" }}
        </button>
      </div>
      <pre v-if="isJsonExpanded(block.title)" class="qkls-json">{{ block.value }}</pre>
    </div>
  </div>
</template>

<script>
const METRIC_LABELS = new Set(["投注", "输赢", "时间"]);
const NUMBER_TAG_TITLES = new Set(["投注号码", "开奖号码", "命中号码"]);
const FANCY_ENTRY_CONF_NAMES = new Set(["double", "dice", "plinko", "circle", "yfct", "limbo", "spiritParty"]);

const HILO_RECORD_IDS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12".split("");
const HILO_POKER_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
  33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45,
  49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  78, 79,
];
const HILO_SUIT_MAP = {
  0: { suit: "♦", tone: "is-red" },
  1: { suit: "♣", tone: "is-black" },
  2: { suit: "♥", tone: "is-red" },
  3: { suit: "♠", tone: "is-black" },
};
const HILO_RANK_MAP = {
  1: "A",
  11: "J",
  12: "Q",
  13: "K",
};

export default {
  name: "QklsRecordView",
  props: {
    view: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      expandedJsonTitles: [],
    };
  },
  computed: {
    confName() {
      return this.view && this.view.confName ? this.view.confName : "";
    },
    summaryEntries() {
      return Array.isArray(this.view.summary) ? this.view.summary : [];
    },
    highlightEntries() {
      return Array.isArray(this.view.highlights) ? this.view.highlights : [];
    },
    metricEntries() {
      return this.summaryEntries.filter((entry) => METRIC_LABELS.has(entry.label));
    },
    baseEntries() {
      return this.summaryEntries.filter((entry) => !METRIC_LABELS.has(entry.label));
    },
    blocks() {
      return Array.isArray(this.view.blocks) ? this.view.blocks : [];
    },
    jsonBlocks() {
      return this.blocks.filter((block) => block.type === "json");
    },
    normalBlocks() {
      return this.blocks.filter((block) => block.type !== "json");
    },
  },
  watch: {
    view: {
      deep: true,
      handler() {
        this.expandedJsonTitles = [];
      },
    },
  },
  methods: {
    metricClass(label) {
      if (label === "输赢") return "is-winlose";
      if (label === "投注") return "is-bet";
      return "is-neutral";
    },
    blockClass(block) {
      if (block.type === "table") return "qkls-block--full";
      if (this.isInlineCommonBlock(block)) return "qkls-block--full qkls-block--compact";
      if (this.isTowerBoardBlock(block) || this.isMinesBoardBlock(block) || this.isHiloBlock(block)) return "qkls-block--full";
      if (this.isBetTableBlock(block) || this.isLdBlock(block)) return "qkls-block--full";
      if (this.isFancyEntryBlock(block)) return "qkls-block--full";
      if (block.type === "tags" && Array.isArray(block.items) && block.items.length > 10) return "qkls-block--full";
      return "";
    },
    isJsonExpanded(title) {
      return this.expandedJsonTitles.includes(title);
    },
    toggleJsonBlock(title) {
      if (this.isJsonExpanded(title)) {
        this.expandedJsonTitles = this.expandedJsonTitles.filter((item) => item !== title);
        return;
      }
      this.expandedJsonTitles = this.expandedJsonTitles.concat(title);
    },
    isFancyEntryBlock(block) {
      return block.type === "entries" && FANCY_ENTRY_CONF_NAMES.has(this.confName);
    },
    isInlineCommonBlock(block) {
      return ["ld", "bxsl", "hilo"].includes(this.confName) && block.type === "entries" && block.title === "通用信息";
    },
    isTagBlock(block) {
      return block.type === "tags";
    },
    isNumberTagBlock(block) {
      return this.confName === "keno" && NUMBER_TAG_TITLES.has(block.title);
    },
    numberChipClass(title) {
      if (title === "开奖号码") return "is-open";
      if (title === "命中号码") return "is-hit";
      return "is-bet";
    },
    isCoinRoundBlock(block) {
      return this.confName === "coin" && block.type === "table" && block.title === "翻币结果";
    },
    coinTone(result) {
      return result === "金" ? "is-gold" : result === "银" ? "is-silver" : "is-neutral";
    },
    isHiloBlock(block) {
      return this.confName === "hilo" && block.type === "table" && block.title === "高低纸牌过程";
    },
    hiloSteps(block) {
      return Array.isArray(block.rows) ? block.rows : [];
    },
    hiloTransitionRow(block, index) {
      const rows = this.hiloSteps(block);
      return rows[index + 1] || {};
    },
    hiloRecordToPokerId(card) {
      const raw = String(card || "").trim();
      if (!raw) return -1;
      const index = HILO_RECORD_IDS.indexOf(raw.charAt(0));
      return index === -1 ? -1 : HILO_POKER_IDS[index];
    },
    hiloCardFace(card) {
      const pokerId = this.hiloRecordToPokerId(card);
      if (pokerId === -1) return null;
      if (pokerId === 78 || pokerId === 79) {
        return {
          rank: "JOKER",
          suit: pokerId === 78 ? "SJ" : "BJ",
          center: "🃏",
          tone: pokerId === 78 ? "is-black" : "is-red",
        };
      }
      const value = pokerId % 16;
      const color = Math.floor(pokerId / 16);
      const suitMeta = HILO_SUIT_MAP[color] || { suit: "?", tone: "is-black" };
      return {
        rank: HILO_RANK_MAP[value] || String(value),
        suit: suitMeta.suit,
        center: suitMeta.suit,
        tone: suitMeta.tone,
      };
    },
    hiloCardText(card) {
      const face = this.hiloCardFace(card);
      if (face) return `${face.rank}${face.suit}`;
      return String(card || "").trim() || "-";
    },
    hiloStepCaption(index, row) {
      if (Number(index) === 0) return "???";
      const ratio = row && row.ratio !== undefined && row.ratio !== null ? String(row.ratio).trim() : "";
      return ratio ? `${ratio}X` : "--";
    },
    hiloCardTone(card) {
      const face = this.hiloCardFace(card);
      return face ? face.tone : "is-black";
    },
    hiloCardClass(card) {
      const text = String(card || "");
      return /[♥♦]/.test(text) ? "is-red" : "is-black";
    },
    hiloArrowSymbol(row) {
      const area = String(row.betArea || "").toLowerCase();
      const skipped = String(row.skipped || "").trim();
      if (skipped === "\u662f" || skipped === "1" || area.includes("skip")) return "\u21bb";
      if (area === "1" || area === "3" || area.includes("high") || area.includes("big")) return "\u2191";
      if (area === "2" || area === "4" || area.includes("low") || area.includes("small")) return "\u2193";
      if (area === "5" || area.includes("same") || area.includes("equal")) return "=";
      return "\u2194";
    },
    hiloArrowTone(row) {
      const area = String(row.betArea || "").toLowerCase();
      const skipped = String(row.skipped || "").trim();
      if (skipped === "\u662f" || skipped === "1" || area.includes("skip")) return "is-neutral";
      if (area === "1" || area === "3" || area.includes("high") || area.includes("big")) return "is-up";
      if (area === "2" || area === "4" || area.includes("low") || area.includes("small")) return "is-down";
      if (area === "5" || area.includes("same") || area.includes("equal")) return "is-same";
      return "is-neutral";
    },
    hiloArrowLabel(row) {
      const ratio = row && row.ratio !== undefined && row.ratio !== null ? String(row.ratio).trim() : "";
      return ratio ? `${ratio}X` : "--";
    },
    hiloOddsText(row) {
      return row.ratio || "";
    },
    isLdBlock(block) {
      return this.confName === "ld" && block.type === "table" && block.title === "幸运两点详情";
    },
    splitDice(value) {
      const parts = String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return [parts[0] || "-", parts[1] || "-"];
    },
    isBetTableBlock(block) {
      if (block.type !== "table") return false;
      return (
        (this.confName === "roulette" && block.title === "轮盘下注") ||
        (this.confName === "bbjl" && block.title === "下注明细") ||
        (this.confName === "baviator" && block.title === "下注区域") ||
        (this.confName === "slide" && block.title === "滑行下注")
      );
    },
    betPills(block) {
      const rows = Array.isArray(block.rows) ? block.rows : [];
      if (this.confName === "roulette") {
        return rows.map((row) => ({
          main: `区域 ${row.betAreaId}`,
          sub: row.betGold ? `下注 ${row.betGold}` : "",
          win: row.winLoseGold ? `输赢 ${row.winLoseGold}` : "",
        }));
      }
      if (this.confName === "bbjl") {
        return rows.map((row) => ({
          main: row.area || "",
          sub: row.bet ? `下注 ${row.bet}` : "",
          win: "",
        }));
      }
      if (this.confName === "baviator") {
        return rows.map((row) => ({
          main: `区域 ${row.betAreaId}`,
          sub: [row.betGold ? `下注 ${row.betGold}` : "", row.rate ? `赔率 ${row.rate}` : ""].filter(Boolean).join(" / "),
          win: row.winLoseGold ? `输赢 ${row.winLoseGold}` : "",
        }));
      }
      return rows.map((row) => ({
        main: row.betMultiple ? `目标 ${row.betMultiple}` : "滑行下注",
        sub: row.betGold ? `下注 ${row.betGold}` : "",
        win: row.winLoseGold ? `输赢 ${row.winLoseGold}` : "",
      }));
    },
    isTowerOddsBlock(block) {
      return this.confName === "tower" && block.type === "table" && block.title === "层级赔率";
    },
    isTowerBoardBlock(block) {
      return this.confName === "tower" && block.type === "table" && block.title === "开格过程";
    },
    towerRows(block) {
      return (Array.isArray(block.rows) ? block.rows : []).map((row) => ({
        row: row.row,
        openedIndex: Number(row.opened) > 0 ? Number(row.opened) - 1 : -1,
        cells: String(row.cells || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }));
    },
    isMinesBoardBlock(block) {
      return this.confName === "bxsl" && block.type === "table" && block.title === "棋盘结果";
    },
    mineCells(block) {
      return (Array.isArray(block.rows) ? block.rows : []).map((row) => ({
        index: row.index,
        kind: row.kind || (row.type === "宝石" ? "gem" : "mine"),
        opened:
          row.opened === true ||
          row.opened === "是" ||
          row.opened === 1 ||
          row.opened === "1" ||
          String(row.opened).toLowerCase() === "true",
      }));
    },
    isHandTableBlock(block) {
      return this.confName === "bhjk" && block.type === "table" && block.title === "玩家牌面";
    },
    handRows(block) {
      return (Array.isArray(block.rows) ? block.rows : []).map((row) => ({
        label: `位置 ${row.seat}`,
        cards: String(row.cards || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }));
    },
  },
};
</script>

<style scoped>
.qkls-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qkls-hero {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.qkls-metric {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.qkls-metric.is-winlose {
  background: linear-gradient(135deg, #ecfeff, #f8fafc);
  border-color: rgba(14, 165, 233, 0.2);
}

.qkls-metric.is-bet {
  background: linear-gradient(135deg, #fff7ed, #fefce8);
  border-color: rgba(245, 158, 11, 0.18);
}

.qkls-metric-label {
  color: #64748b;
  font-size: 11px;
  line-height: 1.2;
}

.qkls-metric-value {
  margin-top: 4px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-all;
}

.qkls-highlight-card,
.qkls-base-card {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.qkls-section-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.qkls-highlight-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

.qkls-highlight-item {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #f8fafc;
}

.qkls-highlight-item.is-result {
  background: #ecfeff;
  border-color: rgba(14, 165, 233, 0.2);
}

.qkls-highlight-item.is-accent {
  background: #fff7ed;
  border-color: rgba(245, 158, 11, 0.18);
}

.qkls-highlight-label,
.qkls-base-label,
.qkls-entry-label {
  color: #64748b;
  font-size: 11px;
}

.qkls-highlight-value,
.qkls-base-value,
.qkls-entry-value {
  color: #0f172a;
}

.qkls-highlight-value {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-all;
}

.qkls-base-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.qkls-base-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
}

.qkls-base-value {
  font-size: 12px;
  font-weight: 600;
  word-break: break-all;
}

.qkls-block-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.qkls-block {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.qkls-block--full {
  grid-column: 1 / -1;
}

.qkls-block--compact {
  padding-top: 8px;
  padding-bottom: 8px;
}

.qkls-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.qkls-block-title {
  min-width: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.qkls-toggle {
  flex-shrink: 0;
  min-width: 52px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: #fff;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.qkls-fancy-entry-list,
.qkls-entry-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.qkls-inline-entry-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 10px;
}

.qkls-inline-entry-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  min-height: 64px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.qkls-inline-entry-label {
  color: #64748b;
  font-size: 11px;
}

.qkls-inline-entry-value {
  color: #0f172a;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  word-break: break-all;
}

.qkls-fancy-entry-item,
.qkls-entry-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.96);
}

.qkls-fancy-entry-item {
  background: linear-gradient(135deg, #fffaf0, #f8fafc);
  border: 1px solid rgba(245, 158, 11, 0.12);
}

.qkls-entry-value {
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}

.qkls-tag-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qkls-number-grid,
.qkls-card-list,
.qkls-tag-list,
.qkls-round-result-list,
.qkls-odds-list,
.qkls-bet-pill-list,
.qkls-hand-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qkls-number-chip,
.qkls-card-chip,
.qkls-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 999px;
  background: #f8fafc;
  color: #1e293b;
  font-size: 12px;
  font-weight: 600;
}

.qkls-tag.is-muted {
  opacity: 0.7;
}

.qkls-number-chip.is-bet {
  background: #fff7ed;
  border-color: rgba(245, 158, 11, 0.18);
}

.qkls-number-chip.is-open {
  background: #eff6ff;
  border-color: rgba(59, 130, 246, 0.18);
}

.qkls-number-chip.is-hit {
  background: #ecfdf5;
  border-color: rgba(16, 185, 129, 0.2);
}

.qkls-round-result-item,
.qkls-odds-chip,
.qkls-bet-pill,
.qkls-hand-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  background: #f8fafc;
}

.qkls-hand-item,
.qkls-bet-pill {
  flex-direction: column;
  align-items: flex-start;
}

.qkls-round-index,
.qkls-bet-pill-main,
.qkls-odds-chip-label,
.qkls-hand-label {
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.qkls-round-chip,
.qkls-odds-chip-value {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: #e2e8f0;
  color: #0f172a;
}

.qkls-round-chip.is-gold {
  background: #fef3c7;
  color: #92400e;
}

.qkls-round-chip.is-silver {
  background: #e2e8f0;
  color: #334155;
}

.qkls-bet-pill {
  min-width: 128px;
}

.qkls-bet-pill-meta,
.qkls-bet-pill-win {
  color: #475569;
  font-size: 11px;
  line-height: 1.35;
}

.qkls-hilo-flow {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0 2px;
}

.qkls-hilo-step {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.qkls-hilo-card-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.qkls-hilo-card {
  width: 54px;
  height: 72px;
  padding: 5px 4px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  color: #0f172a;
  display: grid;
  grid-template-rows: auto 1fr auto;
  align-items: stretch;
}

.qkls-hilo-card.is-red {
  color: #dc2626;
}

.qkls-hilo-card.is-black {
  color: #111827;
}

.qkls-hilo-corner {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  font-weight: 800;
}

.qkls-hilo-corner--top {
  justify-self: flex-start;
}

.qkls-hilo-corner--bottom {
  justify-self: flex-end;
  transform: rotate(180deg);
}

.qkls-hilo-rank {
  font-size: 11px;
}

.qkls-hilo-suit {
  font-size: 10px;
  margin-top: 1px;
}

.qkls-hilo-center {
  align-self: center;
  justify-self: center;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.qkls-hilo-caption {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.qkls-hilo-arrow-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.qkls-hilo-arrow {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0;
  font-weight: 900;
  color: transparent;
}

.qkls-hilo-arrow::before {
  content: attr(data-symbol);
  font-size: 16px;
  line-height: 1;
  color: #fff;
}

.qkls-hilo-arrow.is-up {
  background: linear-gradient(180deg, #3b82f6, #2563eb);
}

.qkls-hilo-arrow.is-down {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}

.qkls-hilo-arrow.is-same {
  background: linear-gradient(180deg, #10b981, #059669);
}

.qkls-hilo-arrow.is-neutral {
  background: linear-gradient(180deg, #64748b, #475569);
}

.qkls-hilo-odds {
  color: #0f172a;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.qkls-tower-board {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qkls-tower-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f8fafc;
}

.qkls-tower-row-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.qkls-tower-row-cells {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.qkls-ld-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.qkls-ld-card {
  padding: 12px;
  border: 1px solid rgba(14, 165, 233, 0.12);
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc 65%, #ffffff);
}

.qkls-ld-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.qkls-ld-dice-pair {
  display: flex;
  gap: 8px;
}

.qkls-ld-dice {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(59, 130, 246, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  color: #1d4ed8;
  font-size: 18px;
  font-weight: 800;
}

.qkls-ld-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.qkls-ld-range {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.qkls-ld-odds {
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
}

.qkls-tower-cell {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.qkls-tower-cell.is-opened {
  background: #dbeafe;
  border-color: rgba(59, 130, 246, 0.28);
  color: #1d4ed8;
}

.qkls-mines-board {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  width: min(260px, 100%);
  margin: 0 auto;
  gap: 4px;
  padding: 3px;
  border-radius: 12px;
  background:
    radial-gradient(circle at top, rgba(255, 191, 73, 0.16), transparent 45%),
    linear-gradient(180deg, #1b1110, #130c0b);
}

.qkls-mine-cell {
  position: relative;
  aspect-ratio: 1;
  min-width: 0;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(255, 180, 58, 0.28);
  background: linear-gradient(180deg, rgba(57, 35, 20, 0.92), rgba(28, 17, 12, 0.98));
  box-shadow: inset 0 0 0 1px rgba(255, 196, 92, 0.08);
  opacity: 0.82;
  transform: scale(0.98);
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease, border-color 0.18s ease;
}

.qkls-mine-cell.is-opened {
  opacity: 1;
  transform: scale(1);
  box-shadow:
    0 0 0 1px rgba(255, 216, 126, 0.28),
    0 0 14px rgba(255, 189, 84, 0.24);
}

.qkls-mine-cell.is-opened .qkls-mine-glow {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), transparent 40%),
    radial-gradient(circle at center, rgba(255, 223, 141, 0.26), transparent 62%);
}

.qkls-mine-cell.is-opened.is-gem {
  background: linear-gradient(180deg, rgba(113, 77, 10, 0.98), rgba(59, 37, 7, 0.98));
  border-color: rgba(255, 208, 96, 0.72);
  box-shadow:
    0 0 0 1px rgba(255, 219, 129, 0.34),
    0 0 16px rgba(255, 204, 87, 0.34);
}

.qkls-mine-cell.is-opened.is-mine {
  background: linear-gradient(180deg, rgba(95, 22, 34, 0.98), rgba(61, 10, 21, 0.98));
  border-color: rgba(255, 95, 122, 0.66);
  box-shadow:
    0 0 0 1px rgba(255, 123, 146, 0.28),
    0 0 16px rgba(255, 79, 121, 0.28);
}

.qkls-mine-glow {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 40%),
    radial-gradient(circle at center, rgba(255, 214, 119, 0.12), transparent 60%);
}

.qkls-mine-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  filter: saturate(0.95);
}

.qkls-table {
  width: 100%;
}

.qkls-json {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: auto;
}

::v-deep .qkls-table th {
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

::v-deep .qkls-table td {
  padding: 6px 0;
}

::v-deep .qkls-table .cell {
  line-height: 1.35;
}

@media (max-width: 768px) {
  .qkls-hero {
    grid-template-columns: 1fr;
  }

  .qkls-highlight-list,
  .qkls-block-grid,
  .qkls-ld-board {
    grid-template-columns: 1fr;
  }

  .qkls-fancy-entry-list,
  .qkls-entry-list,
  .qkls-inline-entry-strip {
    grid-template-columns: 1fr;
  }

  .qkls-hilo-flow {
    gap: 8px;
  }

  .qkls-ld-card-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .qkls-ld-main {
    align-items: flex-start;
  }
}
</style>
