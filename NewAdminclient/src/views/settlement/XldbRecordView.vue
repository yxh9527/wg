<template>
  <div class="xldb-view">
    <div class="xldb-topline">
      <div class="xldb-metrics">
        <div class="xldb-metric">
          <span class="xldb-metric-label">单注</span>
          <span class="xldb-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="xldb-metric">
          <span class="xldb-metric-label">倍数</span>
          <span class="xldb-metric-value">{{ view.betTimes }}</span>
        </div>
        <div class="xldb-metric">
          <span class="xldb-metric-label">总投注</span>
          <span class="xldb-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="xldb-metric">
          <span class="xldb-metric-label">总输赢</span>
          <span class="xldb-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="xldb-status">
        <div class="xldb-status-title">当前回合</div>
        <div class="xldb-status-sub">
          <span>{{ currentRound.label }}</span>
          <span>盘面 3-4-3</span>
          <span>图标 {{ currentRound.icons.length }}</span>
          <span>中奖线 {{ currentWinAreas.length }}</span>
        </div>
      </div>
    </div>

    <div class="xldb-toolbar">
      <div class="xldb-round-strip">
        <button
          v-for="(round, index) in view.rounds"
          :key="`${round.label}-${index}`"
          type="button"
          class="xldb-round-chip"
          :class="{ 'is-active': index === roundIndex }"
          @click="roundIndex = index"
        >
          <span>{{ round.label }}</span>
          <strong>{{ formatMoney(round.winLoseGold || 0) }}</strong>
        </button>
      </div>
    </div>

    <div class="xldb-stage">
      <div class="xldb-board-shell">
        <div class="xldb-board">
          <div
            v-for="(column, columnIndex) in boardColumns"
            :key="`col-${columnIndex}`"
            class="xldb-column"
          >
            <div
              v-for="cell in column"
              :key="cell.key"
              class="xldb-cell"
              :class="{
                'is-highlight': activeArea && activeArea.highlightKeys.includes(cell.coordKey),
                'is-dimmed': hasHighlight && !(activeArea && activeArea.highlightKeys.includes(cell.coordKey)),
              }"
            >
              <atlas-sprite
                v-if="hasIconAsset(cell.icon)"
                class="xldb-cell-icon"
                :atlas="view.iconAtlas"
                :frame-key="cell.icon"
                :max-width="60"
                :max-height="60"
              />
              <span v-if="cell.bonusText" class="xldb-bonus-text">{{ cell.bonusText }}</span>
              <span v-else-if="!hasIconAsset(cell.icon)">{{ iconLabel(cell.icon) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="xldb-sidebar">
        <div class="xldb-panel">
          <div class="xldb-panel-title">中奖线</div>
          <div v-if="currentWinAreas.length" class="xldb-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${roundIndex}-${area.betAreaId}-${index}`"
              type="button"
              class="xldb-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span v-if="hasIconAsset(area.iconId)" class="xldb-line-icon">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="area.iconId"
                  :max-width="24"
                  :max-height="24"
                />
              </span>
              <span class="xldb-line-index">{{ index + 1 }}</span>
              <span>线 {{ displayLineNo(area) }}</span>
              <span class="xldb-line-count">x{{ area.num || "-" }}</span>
              <strong class="xldb-line-win">+{{ formatMoney(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="xldb-empty">当前回合没有中奖线</div>
        </div>
      </div>
    </div>

    <div class="xldb-panel xldb-detail-panel">
      <div class="xldb-panel-title">当前中奖明细</div>
      <div v-if="activeArea" class="xldb-detail-row">
        <div class="xldb-detail-chip">
          <span class="xldb-detail-label">线号</span>
          <span class="xldb-detail-value">{{ displayLineNo(activeArea) }}</span>
        </div>
        <div class="xldb-detail-chip">
          <span v-if="hasIconAsset(activeArea.iconId)" class="xldb-detail-icon">
            <atlas-sprite
              :atlas="view.iconAtlas"
              :frame-key="activeArea.iconId"
              :max-width="24"
              :max-height="24"
            />
          </span>
          <span class="xldb-detail-label">图标</span>
          <span class="xldb-detail-value">{{ hasIconAsset(activeArea.iconId) ? "" : iconLabel(activeArea.iconId) }}</span>
        </div>
        <div class="xldb-detail-chip">
          <span class="xldb-detail-label">数量</span>
          <span class="xldb-detail-value">{{ activeArea.num || "-" }}</span>
        </div>
        <div class="xldb-detail-chip">
          <span class="xldb-detail-label">线倍数</span>
          <span class="xldb-detail-value">{{ activeArea.betMultiple || "-" }}</span>
        </div>
        <div class="xldb-detail-chip">
          <span class="xldb-detail-label">图标倍数</span>
          <span class="xldb-detail-value">{{ activeArea.iconMultiple || "-" }}</span>
        </div>
        <div class="xldb-detail-chip">
          <span class="xldb-detail-label">中奖</span>
          <span class="xldb-detail-value">+{{ formatMoney(activeArea.winLoseGold) }}</span>
        </div>
      </div>
      <div v-else class="xldb-empty xldb-detail-empty">当前回合没有中奖明细</div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";
import AtlasSprite from "./AtlasSprite.vue";

const COLUMN_HEIGHTS = [3, 4, 3];
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

export default {
  name: "XldbRecordView",
  components: {
    AtlasSprite,
  },
  props: {
    view: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      roundIndex: 0,
      activeLineIndex: 0,
    };
  },
  computed: {
    currentRound() {
      return this.view.rounds[this.roundIndex] || {
        icons: [],
        label: "第 1 回合",
        winAreas: [],
      };
    },
    currentWinAreas() {
      return Array.isArray(this.currentRound.winAreas) ? this.currentRound.winAreas : [];
    },
    activeArea() {
      return this.currentWinAreas[this.activeLineIndex] || null;
    },
    hasHighlight() {
      return !!(this.activeArea && Array.isArray(this.activeArea.highlightKeys) && this.activeArea.highlightKeys.length);
    },
    boardColumns() {
      const icons = Array.isArray(this.currentRound.icons) ? this.currentRound.icons : [];
      const rawIconTokens = Array.isArray(this.currentRound.rawIconTokens) ? this.currentRound.rawIconTokens : [];
      let cursor = 0;
      return COLUMN_HEIGHTS.map((height, columnIndex) => {
        const cells = [];
        for (let rowIndex = 0; rowIndex < height; rowIndex += 1) {
          const icon = icons[cursor];
          const rawToken = Number(rawIconTokens[cursor]);
          cells.push({
            key: `${this.roundIndex}-${columnIndex}-${rowIndex}`,
            icon,
            coordKey: `${rowIndex}-${columnIndex}`,
            bonusText: this.buildBonusText(rawToken),
          });
          cursor += 1;
        }
        return cells;
      });
    },
  },
  watch: {
    roundIndex() {
      this.activeLineIndex = 0;
    },
  },
  methods: {
    hasIconAsset(icon) {
      return !!(
        this.view &&
        this.view.iconAtlas &&
        this.view.iconAtlas.frames &&
        this.view.iconAtlas.frames[String(icon)]
      );
    },
    formatMoney(value) {
      return toMoney(value || 0);
    },
    iconLabel(icon) {
      if (icon === null || icon === undefined || icon === "") return "-";
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, icon)) {
        return this.view.iconNameMap[icon];
      }
      return String(icon);
    },
    displayLineNo(area) {
      if (!area) return "-";
      if (area.lineNo !== undefined && area.lineNo !== null && area.lineNo !== "") {
        return Number(area.lineNo) + 1;
      }
      if (area.betAreaId !== undefined && area.betAreaId !== null && area.betAreaId !== "") {
        return area.betAreaId;
      }
      return "-";
    },
    buildBonusText(rawToken) {
      if (!Object.prototype.hasOwnProperty.call(XLDB_SPECIAL_MULTI_MAP, rawToken)) return "";
      const value = XLDB_SPECIAL_MULTI_MAP[rawToken] * Number(this.view.totalBetGold || 0);
      return value.toFixed(2);
    },
  },
};
</script>

<style scoped>
.xldb-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.xldb-topline,
.xldb-toolbar,
.xldb-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.xldb-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.xldb-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
}

.xldb-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.xldb-metric-label,
.xldb-detail-label {
  color: #64748b;
  font-size: 11px;
}

.xldb-metric-value,
.xldb-detail-value {
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
}

.xldb-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.xldb-status-title {
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(180, 83, 9, 0.08);
  font-size: 12px;
  font-weight: 700;
  line-height: 30px;
}

.xldb-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: #9a3412;
  font-size: 11px;
}

.xldb-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.xldb-toolbar {
  display: flex;
  align-items: center;
  overflow-x: auto;
}

.xldb-round-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.xldb-round-chip,
.xldb-line-item {
  border: 0;
  cursor: pointer;
}

.xldb-round-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 58px;
  padding: 8px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  text-align: left;
  font-size: 11px;
  white-space: nowrap;
}

.xldb-round-chip strong {
  color: #0f172a;
  font-size: 12px;
}

.xldb-round-chip.is-active {
  background: #0f172a;
  color: #cbd5e1;
}

.xldb-round-chip.is-active strong {
  color: #f8fafc;
}

.xldb-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 290px;
  gap: 10px;
  align-items: start;
}

.xldb-board-shell {
  padding: 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0b1525, #15263f 62%, #203452);
}

.xldb-board {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.xldb-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xldb-column:first-child,
.xldb-column:last-child {
  transform: translateY(-36px);
}

.xldb-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  min-height: 64px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03));
  color: #f8fafc;
  font-size: 12px;
  font-weight: 700;
}

.xldb-cell.is-highlight {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #111827;
  box-shadow: 0 6px 14px rgba(249, 115, 22, 0.22);
}

.xldb-cell.is-dimmed {
  opacity: 0.28;
}

.xldb-bonus-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff7ed;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
  pointer-events: none;
}

.xldb-sidebar {
  display: flex;
  flex-direction: column;
}

.xldb-panel-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.xldb-line-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.xldb-line-item {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  gap: 6px;
  white-space: nowrap;
}

.xldb-line-item.is-active {
  background: #0f172a;
  color: #f8fafc;
}

.xldb-line-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  font-size: 10px;
  font-weight: 700;
}

.xldb-line-item.is-active .xldb-line-index {
  background: rgba(255, 255, 255, 0.18);
}

.xldb-line-icon,
.xldb-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.xldb-detail-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 6px;
  overflow-x: auto;
}

.xldb-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.05);
  white-space: nowrap;
}

.xldb-empty {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 6px;
}

.xldb-detail-panel {
  min-height: 76px;
}

.xldb-detail-empty {
  display: flex;
  align-items: center;
  min-height: 44px;
}

@media (max-width: 1100px) {
  .xldb-stage {
    grid-template-columns: 1fr;
  }

  .xldb-topline {
    display: block;
  }

  .xldb-status {
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .xldb-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
