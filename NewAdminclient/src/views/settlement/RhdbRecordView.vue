<template>
  <div class="rhdb-view">
    <div class="rhdb-topline">
      <div class="rhdb-metrics">
        <div class="rhdb-metric">
          <span class="rhdb-metric-label">单注</span>
          <span class="rhdb-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="rhdb-metric">
          <span class="rhdb-metric-label">倍数</span>
          <span class="rhdb-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="rhdb-metric">
          <span class="rhdb-metric-label">总投注</span>
          <span class="rhdb-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="rhdb-metric">
          <span class="rhdb-metric-label">总输赢</span>
          <span class="rhdb-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="rhdb-status">
        <div class="rhdb-status-title">{{ currentRound.label }}</div>
        <div class="rhdb-status-sub">
          <span>盘面 5x3</span>
          <span>中奖线 {{ currentWinAreas.length }}</span>
          <span v-if="currentRound.pageLabel">页 {{ currentRound.pageLabel }}</span>
          <span v-else-if="currentRound.isTriggerRound">免费 x{{ currentRound.freeTriggerCount }}</span>
        </div>
      </div>
    </div>

    <div class="rhdb-toolbar">
      <button
        type="button"
        class="rhdb-nav"
        :disabled="roundIndex === 0"
        @click="roundIndex -= 1"
      >
        &lt;
      </button>
      <div class="rhdb-round-strip">
        <button
          v-for="(round, index) in view.rounds"
          :key="`${round.label}-${index}`"
          type="button"
          class="rhdb-round-chip"
          :class="{ 'is-active': index === roundIndex }"
          @click="roundIndex = index"
        >
          <span>{{ round.label }}</span>
          <strong>{{ formatMoney(round.winLoseGold || 0) }}</strong>
        </button>
      </div>
      <button
        type="button"
        class="rhdb-nav"
        :disabled="roundIndex >= view.rounds.length - 1"
        @click="roundIndex += 1"
      >
        &gt;
      </button>
    </div>

    <div class="rhdb-stage">
      <div class="rhdb-board-panel">
        <div class="rhdb-free-panel" :class="{ 'is-active': currentRound.isFreeRound || currentRound.isTriggerRound }">
          <template v-if="currentRound.isFreeRound">
            <span class="rhdb-free-tag">免费页</span>
            <strong>{{ currentRound.pageLabel || "-" }}</strong>
            <span>倍数 {{ currentRound.jewelMultiple || 0 }}</span>
          </template>
          <template v-else-if="currentRound.isTriggerRound">
            <span class="rhdb-free-tag">触发免费</span>
            <strong>{{ currentRound.scatterCount || 0 }} Scatter</strong>
            <span>x{{ currentRound.freeTriggerCount || 0 }}</span>
          </template>
          <template v-else>
            <span class="rhdb-free-tag">普通模式</span>
            <strong>Scatter {{ currentRound.scatterCount || 0 }}</strong>
            <span>中奖线 {{ currentWinAreas.length }}</span>
          </template>
        </div>

        <div class="rhdb-board-shell">
          <div class="rhdb-board">
            <div
              v-for="cell in currentRound.cells"
              :key="`${roundIndex}-${cell.index}`"
              class="rhdb-cell"
              :class="{
                'is-highlight': activeArea && activeArea.highlightKeys.includes(`${cell.column}-${cell.row}`),
                'is-dimmed': hasHighlight && !(activeArea && activeArea.highlightKeys.includes(`${cell.column}-${cell.row}`)),
              }"
            >
              <atlas-sprite
                v-if="cellAtlas(cell) && cell.icon !== ''"
                class="rhdb-cell-icon"
                :atlas="cellAtlas(cell)"
                :frame-key="cell.icon"
                :max-width="66"
                :max-height="66"
              />
              <span v-else class="rhdb-fallback">{{ iconLabel(cell.icon) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rhdb-sidebar">
        <div class="rhdb-panel">
          <div class="rhdb-panel-title">中奖线</div>
          <div v-if="currentWinAreas.length" class="rhdb-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${roundIndex}-${area.betAreaId}-${index}`"
              type="button"
              class="rhdb-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span class="rhdb-line-icon" v-if="hasIconAsset(area.iconId)">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="area.iconId"
                  :max-width="24"
                  :max-height="24"
                />
              </span>
              <span class="rhdb-line-id">线 {{ area.betAreaId }}</span>
              <span class="rhdb-line-count">{{ area.lineCount || 1 }} 组</span>
              <strong class="rhdb-line-win">+{{ formatMoney(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="rhdb-empty">当前页没有中奖线</div>
        </div>

        <div class="rhdb-panel rhdb-detail-panel">
          <div class="rhdb-panel-title">当前中奖明细</div>
          <div v-if="activeArea" class="rhdb-detail-row">
            <div class="rhdb-detail-chip">
              <span class="rhdb-detail-label">图标</span>
              <span class="rhdb-detail-icon" v-if="hasIconAsset(activeArea.iconId)">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="activeArea.iconId"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="rhdb-detail-value">{{ iconLabel(activeArea.iconId) }}</span>
            </div>
            <div class="rhdb-detail-chip">
              <span class="rhdb-detail-label">中奖</span>
              <span class="rhdb-detail-value">+{{ formatMoney(activeArea.winLoseGold) }}</span>
            </div>
            <div class="rhdb-detail-chip">
              <span class="rhdb-detail-label">公式</span>
              <span class="rhdb-detail-value">{{ activeArea.formula || "-" }}</span>
            </div>
            <div class="rhdb-detail-chip rhdb-detail-chip-wide">
              <span class="rhdb-detail-label">位置</span>
              <span class="rhdb-detail-value">{{ activeArea.linePosText || "-" }}</span>
            </div>
          </div>
          <div v-else class="rhdb-empty">当前页没有中奖明细</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";
import AtlasSprite from "./AtlasSprite.vue";

export default {
  name: "RhdbRecordView",
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
        label: "主盘",
        cells: [],
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
  },
  watch: {
    roundIndex() {
      this.activeLineIndex = 0;
    },
  },
  methods: {
    formatMoney(value) {
      return toMoney(value || 0);
    },
    hasIconAsset(icon) {
      return !!(
        this.view &&
        this.view.iconAtlas &&
        this.view.iconAtlas.frames &&
        this.view.iconAtlas.frames[String(icon)]
      );
    },
    cellAtlas(cell) {
      if (!cell || !this.hasIconAsset(cell.icon)) return null;
      const isHighlighted = !!(this.activeArea && this.activeArea.highlightKeys.includes(`${cell.column}-${cell.row}`));
      if (!this.hasHighlight || isHighlighted || !this.view.fuzzyAtlas) return this.view.iconAtlas;
      return this.view.fuzzyAtlas;
    },
    iconLabel(icon) {
      if (icon === null || icon === undefined || icon === "") return "-";
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, icon)) {
        return this.view.iconNameMap[icon];
      }
      return String(icon);
    },
  },
};
</script>

<style scoped>
.rhdb-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rhdb-topline,
.rhdb-toolbar,
.rhdb-panel,
.rhdb-board-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.rhdb-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.rhdb-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
}

.rhdb-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.rhdb-metric-label,
.rhdb-detail-label {
  color: #64748b;
  font-size: 11px;
}

.rhdb-metric-value,
.rhdb-detail-value {
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
}

.rhdb-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.rhdb-status-title {
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(180, 83, 9, 0.08);
  font-size: 12px;
  font-weight: 700;
  line-height: 30px;
  white-space: nowrap;
}

.rhdb-status-sub {
  display: flex;
  gap: 6px;
  color: #9a3412;
  font-size: 11px;
  flex-wrap: wrap;
}

.rhdb-status-sub span,
.rhdb-free-panel span,
.rhdb-free-panel strong {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.rhdb-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rhdb-nav {
  width: 30px;
  height: 30px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.rhdb-nav:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.rhdb-round-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  flex: 1 1 auto;
}

.rhdb-round-chip {
  min-width: 88px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  background: #fff;
  color: #475569;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.rhdb-round-chip.is-active {
  border-color: rgba(249, 115, 22, 0.4);
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  color: #9a3412;
}

.rhdb-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: 10px;
}

.rhdb-board-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rhdb-free-panel {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.rhdb-free-panel.is-active .rhdb-free-tag {
  background: rgba(249, 115, 22, 0.16);
  color: #9a3412;
}

.rhdb-board-shell {
  padding: 10px;
  border-radius: 12px;
  background: radial-gradient(circle at top, rgba(255, 247, 237, 0.92), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(245, 158, 11, 0.16);
}

.rhdb-board {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.rhdb-cell {
  position: relative;
  min-height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  overflow: hidden;
}

.rhdb-cell::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.rhdb-cell.is-highlight {
  border-color: rgba(249, 115, 22, 0.75);
  background: linear-gradient(180deg, #fff7ed, #ffedd5 72%, #ffffff);
  box-shadow: 0 10px 24px rgba(249, 115, 22, 0.22);
  transform: translateY(-1px);
}

.rhdb-cell.is-highlight::after {
  opacity: 1;
  box-shadow: inset 0 0 0 2px rgba(251, 146, 60, 0.95), inset 0 0 18px rgba(251, 146, 60, 0.2);
}

.rhdb-cell.is-dimmed {
  opacity: 0.28;
  filter: grayscale(0.12);
}

.rhdb-cell-icon {
  display: block;
}

.rhdb-fallback {
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.rhdb-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rhdb-panel-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.rhdb-line-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.rhdb-line-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: auto;
  min-width: 128px;
  max-width: 180px;
  padding: 6px 8px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  background: #fff;
  color: #334155;
  cursor: pointer;
  text-align: left;
}

.rhdb-line-item.is-active {
  border-color: rgba(249, 115, 22, 0.42);
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  color: #9a3412;
}

.rhdb-line-id,
.rhdb-line-count {
  white-space: nowrap;
  font-size: 11px;
}

.rhdb-line-win {
  margin-left: 2px;
  font-size: 12px;
}

.rhdb-detail-panel {
  min-height: 136px;
}

.rhdb-detail-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.rhdb-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 999px;
  background: #fff;
}

.rhdb-detail-chip-wide {
  width: 100%;
  border-radius: 12px;
  align-items: flex-start;
  padding: 8px 10px;
}

.rhdb-detail-icon,
.rhdb-line-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.rhdb-empty {
  min-height: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 960px) {
  .rhdb-topline,
  .rhdb-stage {
    display: flex;
    flex-direction: column;
  }

  .rhdb-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
