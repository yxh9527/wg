<template>
  <div class="xmwlj-view">
    <div class="xmwlj-topline">
      <div class="xmwlj-metrics">
        <div class="xmwlj-metric">
          <span class="xmwlj-metric-label">单注</span>
          <span class="xmwlj-metric-value">{{ money(view.betSingle) }}</span>
        </div>
        <div class="xmwlj-metric">
          <span class="xmwlj-metric-label">倍数</span>
          <span class="xmwlj-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="xmwlj-metric">
          <span class="xmwlj-metric-label">总投注</span>
          <span class="xmwlj-metric-value">{{ money(view.totalBetGold) }}</span>
        </div>
        <div class="xmwlj-metric">
          <span class="xmwlj-metric-label">总输赢</span>
          <span class="xmwlj-metric-value">{{ money(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="xmwlj-status">
        <div class="xmwlj-status-title">{{ currentStage.label }}</div>
        <div class="xmwlj-status-sub">
          <span>盘面 5x4</span>
          <span>{{ currentPage.roundLabel }}</span>
          <span>{{ formattedRoundTime }}</span>
        </div>
      </div>
    </div>

    <div class="xmwlj-toolbar">
      <div class="xmwlj-stage-strip">
        <button
          v-for="(stage, index) in view.stages"
          :key="stage.key"
          type="button"
          class="xmwlj-stage-chip"
          :class="{ 'is-active': stageIndex === index }"
          @click="stageIndex = index"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ money(stage.totalWinLoseGold) }}</strong>
        </button>
      </div>

      <div class="xmwlj-page-nav">
        <button type="button" class="xmwlj-nav" :disabled="!canPrev" @click="goPrev">&lt;</button>
        <div class="xmwlj-page-info">
          <span>{{ currentPage.roundLabel }}</span>
          <strong>x{{ currentPage.rewardMultiplier || 1 }}</strong>
        </div>
        <button type="button" class="xmwlj-nav" :disabled="!canNext" @click="goNext">&gt;</button>
      </div>
    </div>

    <div class="xmwlj-stage-layout">
      <div class="xmwlj-board-panel">
        <div class="xmwlj-board-shell">
          <div class="xmwlj-board">
            <div v-for="columnIndex in 5" :key="`column-${columnIndex - 1}`" class="xmwlj-column">
              <div
                v-for="cell in columnCells(columnIndex - 1)"
                :key="cell.key"
                class="xmwlj-cell"
                :class="{
                  'is-highlight': isHighlighted(cell),
                  'is-dimmed': hasHighlight && !isHighlighted(cell),
                }"
              >
                <atlas-sprite
                  v-if="cellFrameKey(cell)"
                  class="xmwlj-cell-icon"
                  :atlas="cellAtlas(cell)"
                  :frame-key="cellFrameKey(cell)"
                  :max-width="62"
                  :max-height="62"
                />
                <span v-else class="xmwlj-fallback">{{ iconLabel(cell.icon) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="xmwlj-sidebar">
        <div class="xmwlj-panel">
          <div class="xmwlj-panel-title">中奖线</div>
          <div v-if="currentWinAreas.length" class="xmwlj-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${currentPage.key}-${index}`"
              type="button"
              class="xmwlj-line-item"
              :class="{ 'is-active': lineIndex === index }"
              @click="lineIndex = index"
            >
              <span class="xmwlj-line-id">{{ formatLineId(area.lineNo) }}</span>
              <span v-if="hasAtlasFrame(view.iconAtlas, normalizedIconKey(area.iconId))" class="xmwlj-line-icon">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="normalizedIconKey(area.iconId)"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="xmwlj-line-count">x{{ area.num || 0 }}</span>
              <strong class="xmwlj-line-win">+{{ money(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="xmwlj-empty">当前回合没有中奖线</div>
        </div>

        <div class="xmwlj-panel">
          <div class="xmwlj-panel-title">当前中奖明细</div>
          <div class="xmwlj-detail-row">
            <template v-if="activeArea">
              <div class="xmwlj-detail-chip">
                <span class="xmwlj-detail-label">图标</span>
                <span v-if="hasAtlasFrame(view.iconAtlas, normalizedIconKey(activeArea.iconId))" class="xmwlj-detail-icon">
                  <atlas-sprite
                    :atlas="view.iconAtlas"
                    :frame-key="normalizedIconKey(activeArea.iconId)"
                    :max-width="22"
                    :max-height="22"
                  />
                </span>
                <span class="xmwlj-detail-value">{{ iconLabel(activeArea.iconId) }}</span>
              </div>

              <div class="xmwlj-detail-chip">
                <span class="xmwlj-detail-label">数量</span>
                <span class="xmwlj-detail-value">{{ activeArea.num || "-" }}</span>
              </div>

              <div class="xmwlj-detail-chip">
                <span class="xmwlj-detail-label">中奖</span>
                <span class="xmwlj-detail-value">+{{ money(activeArea.winLoseGold) }}</span>
              </div>

              <div class="xmwlj-detail-chip xmwlj-detail-chip-wide">
                <span class="xmwlj-detail-label">公式</span>
                <span class="xmwlj-detail-value">{{ activeArea.formula || "-" }}</span>
              </div>
            </template>
            <div v-else class="xmwlj-empty">当前回合没有中奖明细</div>
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
  name: "XmwljRecordView",
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
    normalizedIconKey(iconId) {
      return this.view.iconFrameKey ? this.view.iconFrameKey(iconId) : String(iconId || "");
    },
    hasAtlasFrame(atlas, frameKey) {
      return !!(atlas && atlas.frames && atlas.frames[String(frameKey)]);
    },
    iconLabel(iconId) {
      const key = this.normalizedIconKey(iconId);
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, key)) {
        return this.view.iconNameMap[key];
      }
      return key || "-";
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
    cellAtlas(cell) {
      if (!cell) return null;
      if (this.hasHighlight && !this.isHighlighted(cell)) return this.view.fuzzyAtlas;
      return this.view.iconAtlas;
    },
    cellFrameKey(cell) {
      if (!cell) return "";
      const frameKey = this.normalizedIconKey(cell.icon);
      const atlas = this.cellAtlas(cell);
      return this.hasAtlasFrame(atlas, frameKey) ? frameKey : "";
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
.xmwlj-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.xmwlj-topline,
.xmwlj-toolbar,
.xmwlj-board-panel,
.xmwlj-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.xmwlj-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.xmwlj-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
}

.xmwlj-metric,
.xmwlj-status,
.xmwlj-detail-chip {
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.88);
}

.xmwlj-metric {
  min-height: 54px;
  padding: 8px 10px;
}

.xmwlj-metric-label,
.xmwlj-detail-label {
  display: block;
  font-size: 11px;
  color: #64748b;
}

.xmwlj-metric-value,
.xmwlj-status-title,
.xmwlj-detail-value {
  margin-top: 4px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.xmwlj-status {
  flex: 0 0 240px;
  padding: 10px 12px;
}

.xmwlj-status-sub,
.xmwlj-page-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  color: #64748b;
  font-size: 11px;
}

.xmwlj-toolbar,
.xmwlj-page-nav,
.xmwlj-stage-strip,
.xmwlj-stage-layout,
.xmwlj-line-list,
.xmwlj-detail-row {
  display: flex;
  gap: 8px;
}

.xmwlj-toolbar {
  justify-content: space-between;
  align-items: center;
}

.xmwlj-stage-strip {
  flex-wrap: wrap;
}

.xmwlj-stage-chip,
.xmwlj-line-item,
.xmwlj-nav {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #fff;
  color: #0f172a;
}

.xmwlj-stage-chip,
.xmwlj-line-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  cursor: pointer;
}

.xmwlj-stage-chip.is-active,
.xmwlj-line-item.is-active {
  border-color: rgba(245, 158, 11, 0.34);
  background: rgba(255, 247, 237, 0.96);
  color: #9a3412;
}

.xmwlj-nav {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  cursor: pointer;
}

.xmwlj-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.xmwlj-stage-layout {
  align-items: stretch;
}

.xmwlj-board-panel {
  flex: 1 1 auto;
}

.xmwlj-board-shell {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.xmwlj-board {
  display: grid;
  grid-template-columns: repeat(5, 68px);
  gap: 8px;
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.14);
}

.xmwlj-column {
  display: grid;
  grid-template-rows: repeat(4, 68px);
  gap: 8px;
}

.xmwlj-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 0 1px rgba(203, 213, 225, 0.74);
  transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.xmwlj-cell.is-highlight {
  background: linear-gradient(180deg, #fef3c7, #fde68a);
  box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.42);
}

.xmwlj-cell.is-dimmed {
  opacity: 0.42;
}

.xmwlj-cell-icon {
  image-rendering: auto;
}

.xmwlj-sidebar {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.xmwlj-panel-title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.xmwlj-line-list,
.xmwlj-detail-row {
  flex-wrap: wrap;
}

.xmwlj-line-item {
  min-width: 136px;
  justify-content: flex-start;
  background: rgba(248, 250, 252, 0.96);
}

.xmwlj-line-id {
  color: #475569;
  font-weight: 700;
}

.xmwlj-line-icon,
.xmwlj-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.xmwlj-line-win {
  color: #b45309;
}

.xmwlj-detail-row {
  min-height: 44px;
}

.xmwlj-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 10px;
}

.xmwlj-detail-chip-wide {
  flex: 1 1 240px;
}

.xmwlj-empty,
.xmwlj-fallback {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 1080px) {
  .xmwlj-stage-layout,
  .xmwlj-topline,
  .xmwlj-toolbar {
    flex-direction: column;
  }

  .xmwlj-sidebar,
  .xmwlj-status {
    flex: 1 1 auto;
  }
}
</style>
