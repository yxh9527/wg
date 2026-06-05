<template>
  <div class="cjwp-view">
    <div class="cjwp-topline">
      <div class="cjwp-metrics">
        <div class="cjwp-metric">
          <span class="cjwp-metric-label">单注</span>
          <span class="cjwp-metric-value">{{ money(view.betSingle) }}</span>
        </div>
        <div class="cjwp-metric">
          <span class="cjwp-metric-label">倍数</span>
          <span class="cjwp-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="cjwp-metric">
          <span class="cjwp-metric-label">总投注</span>
          <span class="cjwp-metric-value">{{ money(view.totalBetGold) }}</span>
        </div>
        <div class="cjwp-metric">
          <span class="cjwp-metric-label">总输赢</span>
          <span class="cjwp-metric-value">{{ money(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="cjwp-status">
        <div class="cjwp-status-title">{{ currentStage.label }}</div>
        <div class="cjwp-status-sub">
          <span>盘面 5x4</span>
          <span>{{ currentPage.roundLabel }}</span>
          <span>{{ formattedRoundTime }}</span>
        </div>
      </div>
    </div>

    <div class="cjwp-toolbar">
      <div class="cjwp-stage-strip">
        <button
          v-for="(stage, index) in view.stages"
          :key="stage.key"
          type="button"
          class="cjwp-stage-chip"
          :class="{ 'is-active': stageIndex === index }"
          @click="stageIndex = index"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ money(stage.totalWinLoseGold) }}</strong>
        </button>
      </div>

      <div class="cjwp-page-nav">
        <button type="button" class="cjwp-nav" :disabled="!canPrev" @click="goPrev">&lt;</button>
        <div class="cjwp-page-info">
          <span>{{ currentPage.roundLabel }}</span>
          <strong>x{{ currentPage.rewardMultiplier || 1 }}</strong>
        </div>
        <button type="button" class="cjwp-nav" :disabled="!canNext" @click="goNext">&gt;</button>
      </div>
    </div>

    <div class="cjwp-stage-layout">
      <div class="cjwp-board-panel">
        <div class="cjwp-board-shell">
          <div class="cjwp-board">
            <div v-for="columnIndex in 5" :key="`column-${columnIndex - 1}`" class="cjwp-column">
              <div
                v-for="cell in columnCells(columnIndex - 1)"
                :key="cell.key"
                class="cjwp-cell"
                :class="{
                  'is-highlight': isHighlighted(cell),
                  'is-dimmed': hasHighlight && !isHighlighted(cell),
                }"
              >
                <atlas-sprite
                  v-if="cellFrameKey(cell)"
                  class="cjwp-cell-icon"
                  :atlas="view.iconAtlas"
                  :frame-key="cellFrameKey(cell)"
                  :max-width="58"
                  :max-height="74"
                />
                <span v-else class="cjwp-fallback">{{ iconLabel(cell.icon) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="cjwp-sidebar">
        <div class="cjwp-panel">
          <div class="cjwp-panel-title">中奖线</div>
          <div v-if="currentWinAreas.length" class="cjwp-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${currentPage.key}-${index}`"
              type="button"
              class="cjwp-line-item"
              :class="{ 'is-active': lineIndex === index }"
              @click="lineIndex = index"
            >
              <span class="cjwp-line-id">{{ formatLineId(area.lineNo) }}</span>
              <span v-if="hasAtlasFrame(view.iconAtlas, area.iconId)" class="cjwp-line-icon">
                <atlas-sprite :atlas="view.iconAtlas" :frame-key="area.iconId" :max-width="20" :max-height="24" />
              </span>
              <span class="cjwp-line-count">x{{ area.num || 0 }}</span>
              <strong class="cjwp-line-win">+{{ money(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="cjwp-empty">当前回合没有中奖线</div>
        </div>

        <div class="cjwp-panel">
          <div class="cjwp-panel-title">当前中奖明细</div>
          <div class="cjwp-detail-row">
            <template v-if="activeArea">
              <div class="cjwp-detail-chip">
                <span class="cjwp-detail-label">图标</span>
                <span v-if="hasAtlasFrame(view.iconAtlas, activeArea.iconId)" class="cjwp-detail-icon">
                  <atlas-sprite :atlas="view.iconAtlas" :frame-key="activeArea.iconId" :max-width="20" :max-height="24" />
                </span>
                <span class="cjwp-detail-value">{{ iconLabel(activeArea.iconId) }}</span>
              </div>
              <div class="cjwp-detail-chip">
                <span class="cjwp-detail-label">数量</span>
                <span class="cjwp-detail-value">{{ activeArea.num || "-" }}</span>
              </div>
              <div class="cjwp-detail-chip">
                <span class="cjwp-detail-label">中奖</span>
                <span class="cjwp-detail-value">+{{ money(activeArea.winLoseGold) }}</span>
              </div>
              <div class="cjwp-detail-chip cjwp-detail-chip-wide">
                <span class="cjwp-detail-label">公式</span>
                <span class="cjwp-detail-value">{{ activeArea.formula || "-" }}</span>
              </div>
            </template>
            <div v-else class="cjwp-empty">当前回合没有中奖明细</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AtlasSprite from "./AtlasSprite.vue";
import { formatUnixDateTime, toMoney } from "./settlementHelpers";

export default {
  name: "CjwpRecordView",
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
      stageIndex: 0,
      pageIndex: 0,
      lineIndex: 0,
    };
  },
  computed: {
    currentStage() {
      return this.view.stages[this.stageIndex] || {
        label: "普通旋转",
        pages: [],
      };
    },
    currentPage() {
      return this.currentStage.pages[this.pageIndex] || {
        key: "empty",
        roundLabel: "第1回合",
        roundTime: "",
        rewardMultiplier: 1,
        cells: [],
        winAreas: [],
      };
    },
    currentWinAreas() {
      return Array.isArray(this.currentPage.winAreas) ? this.currentPage.winAreas : [];
    },
    activeArea() {
      return this.currentWinAreas[this.lineIndex] || null;
    },
    hasHighlight() {
      return !!(this.activeArea && Array.isArray(this.activeArea.highlightKeys) && this.activeArea.highlightKeys.length);
    },
    canPrev() {
      return this.pageIndex > 0;
    },
    canNext() {
      return this.pageIndex < this.currentStage.pages.length - 1;
    },
    formattedRoundTime() {
      return this.currentPage.roundTime ? formatUnixDateTime(this.currentPage.roundTime) : "--";
    },
  },
  watch: {
    stageIndex() {
      this.pageIndex = 0;
      this.lineIndex = 0;
    },
    pageIndex() {
      this.lineIndex = 0;
    },
  },
  methods: {
    money(value) {
      return toMoney(value || 0);
    },
    hasAtlasFrame(atlas, frameKey) {
      return !!(atlas && atlas.frames && atlas.frames[String(frameKey)]);
    },
    iconLabel(iconId) {
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, iconId)) {
        return this.view.iconNameMap[iconId];
      }
      return String(iconId || "-");
    },
    columnCells(columnIndex) {
      return (Array.isArray(this.currentPage.cells) ? this.currentPage.cells : [])
        .filter((cell) => Number(cell.column) === columnIndex)
        .sort((left, right) => Number(left.row) - Number(right.row));
    },
    isHighlighted(cell) {
      return !!(
        cell &&
        this.activeArea &&
        Array.isArray(this.activeArea.highlightKeys) &&
        this.activeArea.highlightKeys.includes(cell.coordKey)
      );
    },
    cellFrameKey(cell) {
      if (!cell) return "";
      return this.hasAtlasFrame(this.view.iconAtlas, cell.icon) ? cell.icon : "";
    },
    formatLineId(lineId) {
      const value = Number(lineId);
      if (!Number.isFinite(value) || value <= 0) return "--:";
      return value < 10 ? `0${value}:` : `${value}:`;
    },
    goPrev() {
      if (!this.canPrev) return;
      this.pageIndex -= 1;
    },
    goNext() {
      if (!this.canNext) return;
      this.pageIndex += 1;
    },
  },
};
</script>

<style scoped>
.cjwp-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cjwp-topline,
.cjwp-toolbar,
.cjwp-board-panel,
.cjwp-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.cjwp-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.cjwp-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
}

.cjwp-metric,
.cjwp-status,
.cjwp-detail-chip {
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.88);
}

.cjwp-metric {
  min-height: 54px;
  padding: 8px 10px;
}

.cjwp-metric-label,
.cjwp-detail-label {
  display: block;
  font-size: 11px;
  color: #64748b;
}

.cjwp-metric-value,
.cjwp-status-title,
.cjwp-detail-value {
  margin-top: 4px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.cjwp-status {
  flex: 0 0 240px;
  padding: 10px 12px;
}

.cjwp-status-sub,
.cjwp-page-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  color: #64748b;
  font-size: 11px;
}

.cjwp-toolbar,
.cjwp-page-nav,
.cjwp-stage-strip,
.cjwp-stage-layout,
.cjwp-line-list,
.cjwp-detail-row {
  display: flex;
  gap: 8px;
}

.cjwp-toolbar {
  justify-content: space-between;
  align-items: center;
}

.cjwp-stage-strip {
  flex-wrap: wrap;
}

.cjwp-stage-chip,
.cjwp-line-item,
.cjwp-nav {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #fff;
  color: #0f172a;
}

.cjwp-stage-chip,
.cjwp-line-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  cursor: pointer;
}

.cjwp-stage-chip.is-active,
.cjwp-line-item.is-active {
  border-color: rgba(245, 158, 11, 0.34);
  background: rgba(255, 247, 237, 0.96);
  color: #9a3412;
}

.cjwp-nav {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  cursor: pointer;
}

.cjwp-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cjwp-stage-layout {
  align-items: stretch;
}

.cjwp-board-panel {
  flex: 1 1 auto;
}

.cjwp-board-shell {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.cjwp-board {
  display: grid;
  grid-template-columns: repeat(5, 60px);
  gap: 8px;
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.14);
}

.cjwp-column {
  display: grid;
  grid-template-rows: repeat(4, 78px);
  gap: 8px;
}

.cjwp-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 0 1px rgba(203, 213, 225, 0.74);
  transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.cjwp-cell.is-highlight {
  background: linear-gradient(180deg, #fef3c7, #fde68a);
  box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.42);
}

.cjwp-cell.is-dimmed {
  opacity: 0.42;
}

.cjwp-sidebar {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cjwp-panel-title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.cjwp-line-list,
.cjwp-detail-row {
  flex-wrap: wrap;
}

.cjwp-line-item {
  min-width: 136px;
  justify-content: flex-start;
  background: rgba(248, 250, 252, 0.96);
}

.cjwp-line-id {
  color: #475569;
  font-weight: 700;
}

.cjwp-line-icon,
.cjwp-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cjwp-line-win {
  color: #b45309;
}

.cjwp-detail-row {
  min-height: 44px;
}

.cjwp-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 10px;
}

.cjwp-detail-chip-wide {
  flex: 1 1 240px;
}

.cjwp-empty,
.cjwp-fallback {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 1080px) {
  .cjwp-stage-layout,
  .cjwp-topline,
  .cjwp-toolbar {
    flex-direction: column;
  }

  .cjwp-sidebar,
  .cjwp-status {
    flex: 1 1 auto;
  }
}
</style>
