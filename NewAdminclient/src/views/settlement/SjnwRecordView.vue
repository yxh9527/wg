<template>
  <div class="sjnw-view">
    <div class="sjnw-topline">
      <div class="sjnw-metrics">
        <div class="sjnw-metric">
          <span class="sjnw-metric-label">单注</span>
          <span class="sjnw-metric-value">{{ money(view.betSingle) }}</span>
        </div>
        <div class="sjnw-metric">
          <span class="sjnw-metric-label">倍数</span>
          <span class="sjnw-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="sjnw-metric">
          <span class="sjnw-metric-label">总投注</span>
          <span class="sjnw-metric-value">{{ money(view.totalBetGold) }}</span>
        </div>
        <div class="sjnw-metric">
          <span class="sjnw-metric-label">总输赢</span>
          <span class="sjnw-metric-value">{{ money(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="sjnw-status">
        <div class="sjnw-status-title">{{ currentStage.label }}</div>
        <div class="sjnw-status-sub">
          <span>盘面 5x3</span>
          <span>回合 {{ currentPage.roundIndex + 1 }}/{{ currentStage.pages.length || 1 }}</span>
          <span>本页 {{ money(currentPage.winLoseGold) }}</span>
        </div>
      </div>
    </div>

    <div class="sjnw-toolbar">
      <div class="sjnw-stage-strip">
        <button
          v-for="(stage, index) in view.stages"
          :key="stage.key"
          type="button"
          class="sjnw-stage-chip"
          :class="{ 'is-active': stageIndex === index }"
          @click="stageIndex = index"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ money(stage.totalWinLoseGold) }}</strong>
        </button>
      </div>

      <div class="sjnw-page-nav">
        <button type="button" class="sjnw-nav" :disabled="!canPrev" @click="goPrev">&lt;</button>
        <div class="sjnw-page-info">
          <span>{{ currentPage.roundLabel }}</span>
          <strong>{{ formattedRoundTime }}</strong>
        </div>
        <button type="button" class="sjnw-nav" :disabled="!canNext" @click="goNext">&gt;</button>
      </div>
    </div>

    <div class="sjnw-round-meta">
      <div class="sjnw-multi-strip">
        <span
          v-for="value in currentPage.multiplierValues"
          :key="`multi-${value}`"
          class="sjnw-multi-chip"
          :class="{ 'is-active': value === currentPage.multiplierActive }"
        >
          x{{ value }}
        </span>
      </div>

      <div class="sjnw-round-tags">
        <span class="sjnw-round-tag">中奖线 {{ currentPage.lineCount || 0 }}</span>
        <span class="sjnw-round-tag">自动 {{ currentPage.auto || 0 }}</span>
        <span v-if="currentPage.showFreeTrigger" class="sjnw-round-tag is-accent">触发免费</span>
      </div>
    </div>

    <div class="sjnw-stage-layout">
      <div class="sjnw-board-panel">
        <div class="sjnw-board-shell">
          <div class="sjnw-board">
            <div v-for="columnIndex in 5" :key="`column-${columnIndex - 1}`" class="sjnw-column">
              <div
                v-for="cell in columnCells(columnIndex - 1)"
                :key="cell.key"
                class="sjnw-cell"
                :class="{
                  'is-highlight': isHighlighted(cell),
                  'is-dimmed': hasHighlight && !isHighlighted(cell),
                }"
              >
                <atlas-sprite
                  v-if="cellFrameKey(cell)"
                  class="sjnw-cell-icon"
                  :atlas="cellAtlas(cell)"
                  :frame-key="cellFrameKey(cell)"
                  :max-width="58"
                  :max-height="58"
                />
                <span v-else class="sjnw-fallback">{{ iconLabel(cell.icon) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sjnw-sidebar">
        <div class="sjnw-panel">
          <div class="sjnw-panel-title">中奖线</div>
          <div v-if="currentWinAreas.length" class="sjnw-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${currentPage.key}-${index}`"
              type="button"
              class="sjnw-line-item"
              :class="{ 'is-active': lineIndex === index }"
              @click="lineIndex = index"
            >
              <span class="sjnw-line-id">{{ formatLineId(area.lineId) }}</span>
              <span v-if="hasAtlasFrame(view.iconAtlas, normalizedIconKey(area.iconId))" class="sjnw-line-icon">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="normalizedIconKey(area.iconId)"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="sjnw-line-count">x{{ area.num || 0 }}</span>
              <strong class="sjnw-line-win">+{{ money(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="sjnw-empty">当前回合没有中奖线</div>
        </div>

        <div class="sjnw-panel">
          <div class="sjnw-panel-title">当前中奖明细</div>
          <div class="sjnw-detail-row">
            <template v-if="activeArea">
              <div class="sjnw-detail-chip">
                <span class="sjnw-detail-label">图标</span>
                <span v-if="hasAtlasFrame(view.iconAtlas, normalizedIconKey(activeArea.iconId))" class="sjnw-detail-icon">
                  <atlas-sprite
                    :atlas="view.iconAtlas"
                    :frame-key="normalizedIconKey(activeArea.iconId)"
                    :max-width="22"
                    :max-height="22"
                  />
                </span>
                <span class="sjnw-detail-value">{{ iconLabel(activeArea.iconId) }}</span>
              </div>

              <div class="sjnw-detail-chip">
                <span class="sjnw-detail-label">中奖</span>
                <span class="sjnw-detail-value">+{{ money(activeArea.winLoseGold) }}</span>
              </div>

              <div class="sjnw-detail-chip">
                <span class="sjnw-detail-label">坐标</span>
                <span class="sjnw-detail-value">{{ activeArea.highlightKeys.join(", ") || "-" }}</span>
              </div>

              <div class="sjnw-detail-chip sjnw-detail-chip-wide">
                <span class="sjnw-detail-label">公式</span>
                <span class="sjnw-detail-value">{{ activeArea.formula || "-" }}</span>
              </div>
            </template>
            <div v-else class="sjnw-empty">当前回合没有中奖明细</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";

import AtlasSprite from "./AtlasSprite.vue";
import { toMoney } from "./settlementHelpers";

function toNumberSafe(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : "";
}

export default {
  name: "SjnwRecordView",
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
        label: "普通模式",
        pages: [],
      };
    },
    currentPage() {
      return this.currentStage.pages[this.pageIndex] || {
        key: "empty",
        roundIndex: 0,
        roundLabel: "第1回合",
        roundTime: "",
        multiplierValues: [1, 2, 3, 5],
        multiplierActive: 1,
        cells: [],
        lineCount: 0,
        winAreas: [],
        winLoseGold: 0,
        auto: 0,
        showFreeTrigger: false,
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
      const value = Number(this.currentPage.roundTime || 0);
      if (!Number.isFinite(value) || value <= 0) return "--";
      return dayjs(value * 1000).format("YYYY-MM-DD HH:mm:ss");
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
    normalizedIconKey(iconId) {
      if (iconId === 21 || iconId === 31) return String(iconId);
      return toNumberSafe(iconId);
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
        this.activeArea.highlightKeys.includes(`${cell.column}-${cell.row}`)
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
    iconLabel(iconId) {
      if (iconId === null || iconId === undefined || iconId === "") return "-";
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, iconId)) {
        return this.view.iconNameMap[iconId];
      }
      return String(iconId);
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
.sjnw-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sjnw-topline,
.sjnw-toolbar,
.sjnw-round-meta,
.sjnw-board-panel,
.sjnw-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.sjnw-topline {
  display: flex;
  gap: 8px;
}

.sjnw-metrics {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
}

.sjnw-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.sjnw-metric-label,
.sjnw-detail-label {
  color: #64748b;
  font-size: 11px;
}

.sjnw-metric-value,
.sjnw-status-title,
.sjnw-detail-value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.sjnw-status {
  width: 260px;
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.sjnw-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: #92400e;
  font-size: 11px;
}

.sjnw-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 8px;
  align-items: center;
}

.sjnw-stage-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.sjnw-stage-chip {
  flex: 0 0 auto;
  min-width: 104px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  background: #fff;
  color: #334155;
  cursor: pointer;
}

.sjnw-stage-chip.is-active {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(255, 237, 213, 0.96);
  color: #9a3412;
}

.sjnw-page-nav {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sjnw-page-info {
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
}

.sjnw-page-info span,
.sjnw-page-info strong {
  white-space: nowrap;
}

.sjnw-page-info strong {
  justify-self: start;
}

.sjnw-nav {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.sjnw-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sjnw-round-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.sjnw-multi-strip,
.sjnw-round-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sjnw-multi-chip,
.sjnw-round-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.sjnw-multi-chip.is-active {
  background: #fff7ed;
  color: #c2410c;
}

.sjnw-round-tag.is-accent {
  background: #fef3c7;
  color: #92400e;
}

.sjnw-stage-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.92fr);
  gap: 10px;
  align-items: start;
}

.sjnw-board-shell {
  display: flex;
  justify-content: center;
  padding: 14px 12px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
}

.sjnw-board {
  display: flex;
  gap: 8px;
}

.sjnw-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sjnw-cell {
  width: 74px;
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  border: 1px solid rgba(226, 232, 240, 0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.sjnw-cell.is-highlight {
  background: linear-gradient(180deg, #fff8cc, #ffe7a3);
  border-color: rgba(245, 158, 11, 0.92);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.35), 0 10px 18px rgba(245, 158, 11, 0.18);
  transform: translateY(-1px) scale(1.02);
}

.sjnw-cell.is-dimmed {
  opacity: 0.28;
  filter: saturate(0.68) brightness(0.9);
}

.sjnw-cell-icon {
  display: block;
}

.sjnw-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sjnw-panel-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.sjnw-line-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sjnw-line-item {
  min-width: 140px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
}

.sjnw-line-item.is-active {
  border-color: rgba(245, 158, 11, 0.3);
  background: #fff7ed;
}

.sjnw-line-id,
.sjnw-line-count {
  color: #475569;
  font-size: 12px;
}

.sjnw-line-win {
  color: #15803d;
  font-size: 12px;
}

.sjnw-detail-row {
  min-height: 56px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: stretch;
}

.sjnw-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.sjnw-detail-chip-wide {
  flex: 1 1 220px;
}

.sjnw-empty,
.sjnw-fallback {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 980px) {
  .sjnw-topline,
  .sjnw-stage-layout {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .sjnw-toolbar {
    grid-template-columns: 1fr;
  }

  .sjnw-status {
    width: 100%;
    flex-basis: auto;
  }

  .sjnw-metrics {
    grid-template-columns: repeat(2, minmax(110px, 1fr));
  }
}
</style>
