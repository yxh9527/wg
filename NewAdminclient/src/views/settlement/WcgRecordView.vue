<template>
  <div class="wcg-view">
    <div class="wcg-topline">
      <div class="wcg-metrics">
        <div class="wcg-metric">
          <span class="wcg-metric-label">单注</span>
          <span class="wcg-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="wcg-metric">
          <span class="wcg-metric-label">倍数</span>
          <span class="wcg-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="wcg-metric">
          <span class="wcg-metric-label">总投注</span>
          <span class="wcg-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="wcg-metric">
          <span class="wcg-metric-label">总输赢</span>
          <span class="wcg-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="wcg-status">
        <div class="wcg-status-title">当前回合</div>
        <div class="wcg-status-sub">
          <span>{{ currentRound.label }}</span>
          <span>卡列 {{ boardColumns.length }}</span>
          <span>中奖 {{ currentWinAreas.length }}</span>
        </div>
      </div>
    </div>

    <div v-if="view.rounds.length > 1" class="wcg-toolbar">
      <div class="wcg-round-strip">
        <button
          v-for="(round, index) in view.rounds"
          :key="`${round.label}-${index}`"
          type="button"
          class="wcg-round-chip"
          :class="{ 'is-active': index === roundIndex }"
          @click="roundIndex = index"
        >
          <span>{{ round.label }}</span>
          <strong>{{ formatMoney(round.winLoseGold || 0) }}</strong>
        </button>
      </div>
    </div>

    <div class="wcg-stage">
      <div class="wcg-board-shell">
        <div class="wcg-board">
          <div
            v-for="(column, columnIndex) in boardColumns"
            :key="column.key || `col-${columnIndex}`"
            class="wcg-column"
            :class="{ 'is-single': column.single, 'is-dimmed': hasHighlight && !columnMatched(columnIndex) }"
          >
            <div class="wcg-card wcg-card-main" :class="{ 'is-highlight': columnMatched(columnIndex) }">
              <atlas-sprite
                v-if="hasIconAsset(column.primaryIconId)"
                :atlas="boardAtlas(columnIndex)"
                :frame-key="column.primaryIconId"
                :max-width="column.single ? 138 : 112"
                :max-height="column.single ? 138 : 112"
              />
              <span v-else class="wcg-fallback">{{ iconLabel(column.primaryIconId) }}</span>
            </div>

            <div
              v-if="!column.single"
              class="wcg-card wcg-card-sub"
              :class="{ 'is-highlight': columnMatched(columnIndex) }"
            >
              <atlas-sprite
                v-if="hasIconAsset(column.secondaryIconId)"
                :atlas="boardAtlas(columnIndex)"
                :frame-key="column.secondaryIconId"
                :max-width="94"
                :max-height="94"
              />
              <span v-else class="wcg-fallback">{{ iconLabel(column.secondaryIconId) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="wcg-sidebar">
        <div class="wcg-panel">
          <div class="wcg-panel-title">中奖区域</div>
          <div v-if="currentWinAreas.length" class="wcg-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${roundIndex}-${area.betAreaId}-${index}`"
              type="button"
              class="wcg-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span class="wcg-line-id">{{ padAreaId(area.betAreaId) }}</span>
              <span class="wcg-line-icon" v-if="hasIconAsset(area.iconId)">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="area.iconId"
                  :max-width="26"
                  :max-height="26"
                />
              </span>
              <span class="wcg-line-name">{{ iconLabel(area.iconId) }}</span>
              <strong class="wcg-line-win">+{{ formatMoney(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="wcg-empty">当前回合没有中奖</div>
        </div>
      </div>
    </div>

    <div class="wcg-panel">
      <div class="wcg-panel-title">当前中奖明细</div>
      <div v-if="activeArea" class="wcg-detail-row">
        <div class="wcg-detail-chip">
          <span class="wcg-detail-label">区域</span>
          <span class="wcg-detail-value">{{ padAreaId(activeArea.betAreaId) }}</span>
        </div>
        <div class="wcg-detail-chip">
          <span class="wcg-detail-label">图标</span>
          <span class="wcg-detail-icon" v-if="hasIconAsset(activeArea.iconId)">
            <atlas-sprite
              :atlas="view.iconAtlas"
              :frame-key="activeArea.iconId"
              :max-width="24"
              :max-height="24"
            />
          </span>
          <span class="wcg-detail-value">{{ iconLabel(activeArea.iconId) }}</span>
        </div>
        <div class="wcg-detail-chip">
          <span class="wcg-detail-label">中奖</span>
          <span class="wcg-detail-value">+{{ formatMoney(activeArea.winLoseGold) }}</span>
        </div>
        <div class="wcg-detail-chip wcg-detail-chip-wide">
          <span class="wcg-detail-label">公式</span>
          <span class="wcg-detail-value">{{ areaFormula(activeArea) }}</span>
        </div>
      </div>
      <div v-else class="wcg-empty wcg-detail-empty">当前回合没有中奖明细</div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";
import AtlasSprite from "./AtlasSprite.vue";

export default {
  name: "WcgRecordView",
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
        label: "第 1 回合",
        iconColumns: [],
        winAreas: [],
        exTimes: 0,
        bonusTimes: 0,
      };
    },
    boardColumns() {
      return Array.isArray(this.currentRound.iconColumns) ? this.currentRound.iconColumns : [];
    },
    currentWinAreas() {
      return Array.isArray(this.currentRound.winAreas) ? this.currentRound.winAreas : [];
    },
    activeArea() {
      return this.currentWinAreas[this.activeLineIndex] || null;
    },
    hasHighlight() {
      return !!(
        this.activeArea &&
        Array.isArray(this.activeArea.linePos) &&
        this.activeArea.linePos.length
      );
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
    boardAtlas(columnIndex) {
      if (!this.hasHighlight || this.columnMatched(columnIndex) || !this.view.fuzzyAtlas) {
        return this.view.iconAtlas;
      }
      return this.view.fuzzyAtlas;
    },
    columnMatched(columnIndex) {
      if (!this.hasHighlight) return false;
      return this.activeArea.linePos.some((item) => Array.isArray(item) && Number(item[1]) === Number(columnIndex));
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
    padAreaId(value) {
      const num = Number(value);
      if (!Number.isFinite(num)) return "--";
      return num > 9 ? String(num) : `0${num}`;
    },
    areaFormula(area) {
      if (!area) return "-";
      const base = `${this.formatMoney(area.betGold)} x ${area.betMultiple || 0} x ${area.iconMultiple || 0}`;
      if (Number(this.currentRound.exTimes || 0) > 0) {
        return `${base} x ${this.currentRound.exTimes}`;
      }
      if (Number(this.currentRound.bonusTimes || 0) > 0) {
        return `${base} x ${this.currentRound.bonusTimes}`;
      }
      return base;
    },
  },
};
</script>

<style scoped>
.wcg-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wcg-topline,
.wcg-toolbar,
.wcg-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.wcg-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.wcg-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
}

.wcg-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.wcg-metric-label,
.wcg-detail-label {
  color: #64748b;
  font-size: 11px;
}

.wcg-metric-value,
.wcg-detail-value {
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
}

.wcg-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.wcg-status-title {
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(180, 83, 9, 0.08);
  font-size: 12px;
  font-weight: 700;
  line-height: 30px;
}

.wcg-status-sub {
  display: flex;
  gap: 6px;
  color: #9a3412;
  font-size: 11px;
  flex-wrap: wrap;
}

.wcg-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.wcg-toolbar {
  overflow-x: auto;
}

.wcg-round-strip {
  display: flex;
  gap: 6px;
}

.wcg-round-chip,
.wcg-line-item {
  border: 0;
  cursor: pointer;
}

.wcg-round-chip {
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

.wcg-round-chip strong {
  color: #0f172a;
  font-size: 12px;
}

.wcg-round-chip.is-active {
  background: #0f172a;
  color: #cbd5e1;
}

.wcg-round-chip.is-active strong {
  color: #f8fafc;
}

.wcg-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 10px;
  align-items: start;
}

.wcg-board-shell {
  padding: 14px;
  border-radius: 16px;
  background: radial-gradient(circle at 50% 28%, rgba(250, 204, 21, 0.18), transparent 36%),
    linear-gradient(180deg, #29160a, #4b260f 52%, #6d3311);
}

.wcg-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.wcg-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 276px;
  transition: opacity 0.2s ease;
}

.wcg-column.is-single {
  justify-content: center;
}

.wcg-column.is-dimmed {
  opacity: 0.34;
}

.wcg-card {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 8px 16px rgba(17, 24, 39, 0.1);
}

.wcg-card-main {
  min-height: 164px;
  padding: 12px;
}

.wcg-card-sub {
  min-height: 96px;
  padding: 8px;
}

.wcg-card.is-highlight {
  border-color: rgba(249, 115, 22, 0.65);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 0 0 2px rgba(249, 115, 22, 0.2), 0 10px 18px rgba(124, 45, 18, 0.24);
}

.wcg-fallback {
  color: #7c2d12;
  font-size: 13px;
  font-weight: 700;
}

.wcg-sidebar {
  display: flex;
  flex-direction: column;
}

.wcg-panel-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.wcg-line-list,
.wcg-detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.wcg-detail-row {
  flex-wrap: nowrap;
  overflow-x: auto;
}

.wcg-line-item,
.wcg-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.96);
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.wcg-line-item.is-active {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(255, 237, 213, 0.96);
  color: #9a3412;
}

.wcg-line-id {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 20px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  font-size: 10px;
  font-weight: 700;
}

.wcg-line-item.is-active .wcg-line-id {
  background: rgba(255, 255, 255, 0.18);
}

.wcg-line-icon,
.wcg-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.wcg-line-name {
  max-width: 92px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wcg-line-win {
  color: inherit;
}

.wcg-detail-chip-wide {
  min-width: 240px;
}

.wcg-empty {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 6px;
}

.wcg-detail-empty {
  display: flex;
  align-items: center;
  min-height: 44px;
}

@media (max-width: 1100px) {
  .wcg-stage {
    grid-template-columns: 1fr;
  }

  .wcg-topline {
    display: block;
  }

  .wcg-status {
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .wcg-metrics {
    grid-template-columns: 1fr;
  }

  .wcg-board {
    grid-template-columns: 1fr;
  }

  .wcg-column {
    min-height: 0;
  }
}
</style>
