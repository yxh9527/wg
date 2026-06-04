<template>
  <div class="jqt-view">
    <div class="jqt-topline">
      <div class="jqt-metrics">
        <div class="jqt-metric">
          <span class="jqt-metric-label">单注</span>
          <span class="jqt-metric-value">{{ money(view.betSingle) }}</span>
        </div>
        <div class="jqt-metric">
          <span class="jqt-metric-label">倍数</span>
          <span class="jqt-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="jqt-metric">
          <span class="jqt-metric-label">总投注</span>
          <span class="jqt-metric-value">{{ money(view.totalBetGold) }}</span>
        </div>
        <div class="jqt-metric">
          <span class="jqt-metric-label">总输赢</span>
          <span class="jqt-metric-value">{{ money(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="jqt-status">
        <div class="jqt-status-title">{{ currentPage.label }}</div>
        <div class="jqt-status-sub">
          <span>盘面 3-4-3</span>
          <span>中奖线 {{ currentWinAreas.length }}</span>
          <span>本页 {{ money(currentPage.winLoseGold) }}</span>
          <span v-if="currentPage.idxText">页码 {{ currentPage.idxText }}</span>
        </div>
      </div>
    </div>

    <div class="jqt-toolbar">
      <button type="button" class="jqt-nav" :disabled="pageIndex === 0" @click="pageIndex -= 1">&lt;</button>
      <div class="jqt-round-strip">
        <button
          v-for="page in view.pages"
          :key="page.pageIndex"
          type="button"
          class="jqt-round-chip"
          :class="{ 'is-active': page.pageIndex === pageIndex }"
          @click="pageIndex = page.pageIndex"
        >
          <span>{{ page.label }}</span>
          <strong>{{ money(page.winLoseGold) }}</strong>
        </button>
      </div>
      <button type="button" class="jqt-nav" :disabled="pageIndex >= view.pages.length - 1" @click="pageIndex += 1">&gt;</button>
    </div>

    <div class="jqt-stage">
      <div class="jqt-board-panel">
        <div class="jqt-board-shell">
          <div class="jqt-board">
            <div
              v-for="(columnCells, columnIndex) in boardColumns"
              :key="`column-${columnIndex}`"
              class="jqt-column"
              :class="{ 'is-center': columnIndex === 1 }"
            >
              <div
                v-for="cell in columnCells"
                :key="cell.key"
                class="jqt-cell"
                :class="{
                  'is-highlight': isHighlighted(cell),
                  'is-dimmed': hasHighlight && !isHighlighted(cell),
                }"
              >
                <atlas-sprite
                  v-if="displayAtlasForCell(cell) && displayFrameForCell(cell)"
                  class="jqt-cell-icon"
                  :atlas="displayAtlasForCell(cell)"
                  :frame-key="displayFrameForCell(cell)"
                  :max-width="62"
                  :max-height="62"
                />
                <span v-else class="jqt-fallback">{{ iconLabel(cell.sourceIcon) }}</span>
                <span v-if="cell.cashText" class="jqt-cash-text">{{ cell.cashText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="jqt-sidebar">
        <div class="jqt-panel">
          <div class="jqt-panel-title">中奖线</div>
          <div v-if="currentWinAreas.length" class="jqt-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${currentPage.pageIndex}-${area.betAreaId}-${index}`"
              type="button"
              class="jqt-line-item"
              :class="{ 'is-active': lineIndex === index }"
              @click="lineIndex = index"
            >
              <span class="jqt-line-no-text">{{ formatLineId(area.betAreaId) }}</span>
              <span v-if="area.displayIconId && hasAtlasFrame(view.iconAtlas, area.displayIconId)" class="jqt-line-icon">
                <atlas-sprite :atlas="view.iconAtlas" :frame-key="area.displayIconId" :max-width="24" :max-height="24" />
              </span>
              <span v-if="area.cashText" class="jqt-line-badge">{{ area.cashText }}</span>
              <span class="jqt-line-count">x{{ area.num || 0 }}</span>
              <strong class="jqt-line-win">+{{ money(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="jqt-empty">当前页没有中奖线</div>
        </div>

        <div class="jqt-panel">
          <div class="jqt-panel-title">当前中奖明细</div>
          <div class="jqt-detail-row">
            <template v-if="activeArea">
              <div class="jqt-detail-chip">
                <span class="jqt-detail-label">图标</span>
                <span v-if="activeArea.displayIconId && hasAtlasFrame(view.iconAtlas, activeArea.displayIconId)" class="jqt-detail-icon">
                  <atlas-sprite :atlas="view.iconAtlas" :frame-key="activeArea.displayIconId" :max-width="22" :max-height="22" />
                </span>
                <span v-else class="jqt-detail-value">{{ iconLabel(activeArea.iconId) }}</span>
              </div>
              <div class="jqt-detail-chip" v-if="activeArea.cashText">
                <span class="jqt-detail-label">现金</span>
                <span class="jqt-detail-value">{{ activeArea.cashText }}</span>
              </div>
              <div class="jqt-detail-chip">
                <span class="jqt-detail-label">中奖</span>
                <span class="jqt-detail-value">+{{ money(activeArea.winLoseGold) }}</span>
              </div>
              <div class="jqt-detail-chip">
                <span class="jqt-detail-label">位置</span>
                <span class="jqt-detail-value">{{ activeArea.highlightKeys.join(", ") }}</span>
              </div>
              <div class="jqt-detail-chip jqt-detail-chip-wide">
                <span class="jqt-detail-label">公式</span>
                <span class="jqt-detail-value">{{ activeArea.formula || "-" }}</span>
              </div>
            </template>
            <div v-else class="jqt-empty">当前页没有中奖明细</div>
          </div>
        </div>

        <div class="jqt-panel">
          <div class="jqt-panel-title">现金图标</div>
          <div class="jqt-cash-row">
            <span v-if="currentPage.freeCashValues.length" class="jqt-cash-summary">{{ currentPage.freeCashValues.join(" + ") }}</span>
            <span v-else class="jqt-empty">当前页没有现金图标</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AtlasSprite from "./AtlasSprite.vue";
import { toMoney } from "./settlementHelpers";

export default {
  name: "JqtRecordView",
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
      pageIndex: 0,
      lineIndex: 0,
    };
  },
  computed: {
    currentPage() {
      return this.view.pages[this.pageIndex] || {
        pageIndex: 0,
        label: "主盘",
        idxText: "",
        cells: [],
        winAreas: [],
        winLoseGold: 0,
        freeCashValues: [],
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
    boardColumns() {
      const cells = Array.isArray(this.currentPage.cells) ? this.currentPage.cells : [];
      return [0, 1, 2].map((columnIndex) =>
        cells
          .filter((cell) => Number(cell.column) === columnIndex)
          .sort((left, right) => Number(left.row) - Number(right.row))
      );
    },
  },
  watch: {
    pageIndex() {
      this.lineIndex = 0;
    },
  },
  created() {
    if (this.view && this.view.hasSpecialPages && Array.isArray(this.view.pages) && this.view.pages.length > 1) {
      this.pageIndex = 0;
    }
  },
  methods: {
    money(value) {
      return toMoney(value || 0);
    },
    hasAtlasFrame(atlas, frameKey) {
      return !!(atlas && atlas.frames && atlas.frames[String(frameKey)]);
    },
    isHighlighted(cell) {
      return !!(
        cell &&
        this.activeArea &&
        Array.isArray(this.activeArea.highlightKeys) &&
        this.activeArea.highlightKeys.includes(`${cell.column}-${cell.row}`)
      );
    },
    displayAtlasForCell(cell) {
      if (!cell) return null;
      if (this.hasHighlight && !this.isHighlighted(cell)) return this.view.fuzzyAtlas;
      return this.view.iconAtlas;
    },
    displayFrameForCell(cell) {
      if (!cell) return "";
      const atlas = this.displayAtlasForCell(cell);
      return this.hasAtlasFrame(atlas, cell.icon) ? cell.icon : "";
    },
    iconLabel(icon) {
      if (icon === null || icon === undefined || icon === "") return "-";
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, icon)) {
        return this.view.iconNameMap[icon];
      }
      return String(icon);
    },
    formatLineId(lineId) {
      const value = Number(lineId);
      if (!Number.isFinite(value) || value <= 0) return "--:";
      return value < 10 ? `0${value}:` : `${value}:`;
    },
  },
};
</script>

<style scoped>
.jqt-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jqt-topline,
.jqt-toolbar,
.jqt-board-panel,
.jqt-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.jqt-topline {
  display: flex;
  gap: 8px;
}

.jqt-metrics {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
}

.jqt-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.jqt-metric-label,
.jqt-detail-label {
  color: #64748b;
  font-size: 11px;
}

.jqt-metric-value,
.jqt-status-title,
.jqt-detail-value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.jqt-status {
  width: 230px;
  flex: 0 0 230px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.jqt-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: #92400e;
  font-size: 11px;
}

.jqt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.jqt-nav {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.jqt-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.jqt-round-strip {
  flex: 1 1 auto;
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.jqt-round-chip {
  flex: 0 0 auto;
  min-width: 96px;
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

.jqt-round-chip.is-active {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(255, 237, 213, 0.96);
  color: #9a3412;
}

.jqt-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.92fr);
  gap: 10px;
  align-items: start;
}

.jqt-board-shell {
  display: flex;
  justify-content: center;
  padding: 12px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
}

.jqt-board {
  display: flex;
  align-items: center;
  gap: 10px;
}

.jqt-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jqt-column.is-center {
  gap: 7px;
}

.jqt-cell {
  position: relative;
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  border: 1px solid rgba(226, 232, 240, 0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.jqt-cell.is-highlight {
  background: linear-gradient(180deg, #fff8cc, #ffe7a3);
  border-color: rgba(245, 158, 11, 0.92);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.35), 0 10px 18px rgba(245, 158, 11, 0.18);
  transform: translateY(-1px) scale(1.02);
}

.jqt-cell.is-dimmed {
  opacity: 0.28;
  filter: saturate(0.68) brightness(0.9);
}

.jqt-cell-icon {
  display: block;
}

.jqt-cash-text {
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

.jqt-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jqt-panel-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.jqt-line-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.jqt-line-item {
  min-width: 136px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
}

.jqt-line-item.is-active {
  border-color: rgba(245, 158, 11, 0.3);
  background: #fff7ed;
}

.jqt-line-no-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  color: #9a3412;
  font-size: 12px;
  font-weight: 700;
}

.jqt-line-icon,
.jqt-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.jqt-line-badge {
  min-width: 42px;
  height: 24px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  font-size: 11px;
  font-weight: 700;
}

.jqt-line-count {
  color: #475569;
  font-size: 12px;
}

.jqt-line-win {
  color: #15803d;
  font-size: 12px;
}

.jqt-detail-row {
  min-height: 56px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: stretch;
}

.jqt-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.jqt-detail-chip-wide {
  flex: 1 1 220px;
}

.jqt-cash-row {
  min-height: 36px;
  display: flex;
  align-items: center;
}

.jqt-cash-summary {
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.jqt-empty,
.jqt-fallback {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 900px) {
  .jqt-topline {
    flex-direction: column;
  }

  .jqt-status {
    width: 100%;
    flex-basis: auto;
  }

  .jqt-metrics {
    grid-template-columns: repeat(2, minmax(110px, 1fr));
  }

  .jqt-stage {
    grid-template-columns: 1fr;
  }
}
</style>
