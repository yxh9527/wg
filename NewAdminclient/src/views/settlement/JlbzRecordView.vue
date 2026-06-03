<template>
  <div class="jlbz-view">
    <div class="jlbz-topline">
      <div class="jlbz-metrics">
        <div class="jlbz-metric">
          <span class="jlbz-metric-label">{{ uiText.betSingle }}</span>
          <span class="jlbz-metric-value">{{ money(view.betSingle) }}</span>
        </div>
        <div class="jlbz-metric">
          <span class="jlbz-metric-label">{{ uiText.betTimes }}</span>
          <span class="jlbz-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="jlbz-metric">
          <span class="jlbz-metric-label">{{ uiText.totalBet }}</span>
          <span class="jlbz-metric-value">{{ money(view.totalBetGold) }}</span>
        </div>
        <div class="jlbz-metric">
          <span class="jlbz-metric-label">{{ uiText.totalWin }}</span>
          <span class="jlbz-metric-value">{{ money(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="jlbz-status">
        <div class="jlbz-status-title">{{ currentPage.label }}</div>
        <div class="jlbz-status-sub">
          <span>{{ uiText.boardSize }} 3x3</span>
          <span>{{ uiText.winLines }} {{ currentWinAreas.length }}</span>
          <span>{{ uiText.pageWin }} {{ money(currentPage.winLoseGold) }}</span>
          <span v-if="currentPage.idxText">{{ uiText.pageIndex }} {{ currentPage.idxText }}</span>
        </div>
      </div>
    </div>

    <div class="jlbz-toolbar">
      <button type="button" class="jlbz-nav" :disabled="pageIndex === 0" @click="pageIndex -= 1">&lt;</button>
      <div class="jlbz-round-strip">
        <button
          v-for="page in view.pages"
          :key="page.pageIndex"
          type="button"
          class="jlbz-round-chip"
          :class="{ 'is-active': page.pageIndex === pageIndex }"
          @click="pageIndex = page.pageIndex"
        >
          <span>{{ page.label }}</span>
          <strong>{{ money(page.winLoseGold) }}</strong>
        </button>
      </div>
      <button
        type="button"
        class="jlbz-nav"
        :disabled="pageIndex >= view.pages.length - 1"
        @click="pageIndex += 1"
      >
        &gt;
      </button>
    </div>

    <div class="jlbz-stage">
      <div class="jlbz-board-panel">
        <div class="jlbz-page-banner" :class="{ 'is-active': currentPage.pageIndex > 0 }">
          <span class="jlbz-page-tag">{{ currentPage.pageIndex === 0 ? uiText.mainMode : uiText.stageMode }}</span>
          <strong>{{ currentPage.idxText || currentPage.label }}</strong>
        </div>

        <div class="jlbz-board-shell">
          <div class="jlbz-board">
            <div
              v-for="(columnCells, columnIndex) in boardColumns"
              :key="`column-${columnIndex}`"
              class="jlbz-column"
            >
              <div
                v-for="cell in columnCells"
                :key="cell.key"
                class="jlbz-cell"
                :class="{
                  'is-highlight': isHighlighted(cell),
                  'is-dimmed': hasHighlight && !isHighlighted(cell),
                }"
              >
                <atlas-sprite
                  v-if="cellAtlas(cell)"
                  class="jlbz-cell-icon"
                  :atlas="cellAtlas(cell)"
                  :frame-key="cell.icon"
                  :max-width="60"
                  :max-height="60"
                />
                <span v-else class="jlbz-fallback">{{ iconLabel(cell.icon) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="jlbz-extra-panel">
          <div class="jlbz-panel-title">{{ currentPage.pageIndex === 0 ? uiText.extraNormal : uiText.extraStage }}</div>
          <div class="jlbz-extra-strip">
            <div v-for="(icon, index) in currentPage.extraIcons" :key="`${currentPage.pageIndex}-${index}`" class="jlbz-extra-item">
              <atlas-sprite
                v-if="hasAtlasFrame(view.iconAtlas, icon)"
                :atlas="view.iconAtlas"
                :frame-key="icon"
                :max-width="40"
                :max-height="28"
              />
              <span v-else class="jlbz-fallback jlbz-extra-fallback">{{ iconLabel(icon) }}</span>
            </div>
            <div v-if="!currentPage.extraIcons.length" class="jlbz-empty jlbz-extra-empty">{{ uiText.emptyExtra }}</div>
          </div>
        </div>
      </div>

      <div class="jlbz-sidebar">
        <div class="jlbz-panel">
          <div class="jlbz-panel-title">{{ uiText.winLines }}</div>
          <div v-if="currentWinAreas.length" class="jlbz-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${currentPage.pageIndex}-${area.betAreaId}-${index}`"
              type="button"
              class="jlbz-line-item"
              :class="{ 'is-active': index === lineIndex }"
              @click="lineIndex = index"
            >
              <span class="jlbz-line-id">{{ uiText.linePrefix }} {{ area.betAreaId }}</span>
              <span v-if="hasAtlasFrame(view.iconAtlas, area.iconId)" class="jlbz-line-icon">
                <atlas-sprite :atlas="view.iconAtlas" :frame-key="area.iconId" :max-width="22" :max-height="22" />
              </span>
              <span class="jlbz-line-count">x{{ area.num || 0 }}</span>
              <strong class="jlbz-line-win">+{{ money(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="jlbz-empty">{{ uiText.emptyWinLines }}</div>
        </div>

        <div class="jlbz-panel">
          <div class="jlbz-panel-title">{{ uiText.currentDetail }}</div>
          <div class="jlbz-detail-row">
            <template v-if="activeArea">
              <div class="jlbz-detail-chip">
                <span class="jlbz-detail-label">{{ uiText.icon }}</span>
                <span v-if="hasAtlasFrame(view.iconAtlas, activeArea.iconId)" class="jlbz-detail-icon">
                  <atlas-sprite :atlas="view.iconAtlas" :frame-key="activeArea.iconId" :max-width="22" :max-height="22" />
                </span>
                <span class="jlbz-detail-value">{{ iconLabel(activeArea.iconId) }}</span>
              </div>
              <div class="jlbz-detail-chip">
                <span class="jlbz-detail-label">{{ uiText.win }}</span>
                <span class="jlbz-detail-value">+{{ money(activeArea.winLoseGold) }}</span>
              </div>
              <div class="jlbz-detail-chip">
                <span class="jlbz-detail-label">{{ uiText.position }}</span>
                <span class="jlbz-detail-value">{{ activeArea.positionText || "-" }}</span>
              </div>
              <div class="jlbz-detail-chip jlbz-detail-chip-wide">
                <span class="jlbz-detail-label">{{ uiText.formula }}</span>
                <span class="jlbz-detail-value">{{ activeArea.formula || "-" }}</span>
              </div>
            </template>
            <div v-else class="jlbz-empty jlbz-detail-empty">{{ uiText.emptyDetail }}</div>
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
  name: "JlbzRecordView",
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
    uiText() {
      return {
        betSingle: "\u5355\u6ce8",
        betTimes: "\u500d\u6570",
        totalBet: "\u603b\u6295\u6ce8",
        totalWin: "\u603b\u8f93\u8d62",
        boardSize: "\u76d8\u9762",
        pageWin: "\u672c\u9875\u4e2d\u5956",
        pageIndex: "\u9875\u7801",
        winLines: "\u4e2d\u5956\u7ebf",
        linePrefix: "\u7ebf",
        currentDetail: "\u5f53\u524d\u4e2d\u5956\u660e\u7ec6",
        icon: "\u56fe\u6807",
        win: "\u4e2d\u5956",
        position: "\u5750\u6807",
        formula: "\u516c\u5f0f",
        extraNormal: "\u989d\u5916\u500d\u7387",
        extraStage: "\u9636\u6bb5\u500d\u7387",
        emptyExtra: "\u65e0\u989d\u5916\u500d\u7387",
        emptyWinLines: "\u5f53\u524d\u9875\u6ca1\u6709\u4e2d\u5956\u7ebf",
        emptyDetail: "\u5f53\u524d\u9875\u6ca1\u6709\u4e2d\u5956\u660e\u7ec6",
        mainMode: "\u666e\u901a\u6a21\u5f0f",
        stageMode: "\u9636\u6bb5\u6a21\u5f0f",
      };
    },
    currentPage() {
      return this.view.pages[this.pageIndex] || {
        pageIndex: 0,
        label: "\u4e3b\u76d8",
        idxText: "",
        cells: [],
        extraIcons: [],
        winAreas: [],
        winLoseGold: 0,
      };
    },
    currentWinAreas() {
      return Array.isArray(this.currentPage.winAreas) ? this.currentPage.winAreas : [];
    },
    boardColumns() {
      const cells = Array.isArray(this.currentPage.cells) ? this.currentPage.cells : [];
      return [0, 1, 2].map((columnIndex) =>
        cells
          .filter((cell) => Number(cell && cell.column) === columnIndex)
          .sort((left, right) => Number(left && left.row) - Number(right && right.row))
      );
    },
    activeArea() {
      return this.currentWinAreas[this.lineIndex] || null;
    },
    hasHighlight() {
      return !!(this.activeArea && Array.isArray(this.activeArea.highlightKeys) && this.activeArea.highlightKeys.length);
    },
  },
  watch: {
    pageIndex() {
      this.lineIndex = 0;
    },
  },
  created() {
    if (this.view && this.view.hasSpecialPages && Array.isArray(this.view.pages) && this.view.pages.length > 1) {
      this.pageIndex = 1;
    }
  },
  methods: {
    money(value) {
      return toMoney(value || 0);
    },
    hasAtlasFrame(atlas, frameKey) {
      return !!(atlas && atlas.frames && atlas.frames[String(frameKey)]);
    },
    iconLabel(icon) {
      if (icon === null || icon === undefined || icon === "") return "-";
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, icon)) {
        return this.view.iconNameMap[icon];
      }
      return String(icon);
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
      if (!cell || !this.hasAtlasFrame(this.view.iconAtlas, cell.icon)) return null;
      return this.view.iconAtlas;
    },
  },
};
</script>

<style scoped>
.jlbz-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jlbz-topline,
.jlbz-toolbar,
.jlbz-board-panel,
.jlbz-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.jlbz-topline {
  display: flex;
  gap: 8px;
}

.jlbz-metrics {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
}

.jlbz-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.jlbz-metric-label,
.jlbz-detail-label {
  color: #64748b;
  font-size: 11px;
}

.jlbz-metric-value,
.jlbz-status-title,
.jlbz-detail-value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.jlbz-status {
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

.jlbz-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: #92400e;
  font-size: 11px;
}

.jlbz-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.jlbz-nav {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.jlbz-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.jlbz-round-strip {
  flex: 1 1 auto;
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.jlbz-round-chip {
  flex: 0 0 auto;
  min-width: 96px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
}

.jlbz-round-chip strong {
  color: #0f172a;
}

.jlbz-round-chip.is-active {
  border-color: rgba(245, 158, 11, 0.32);
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  color: #9a3412;
}

.jlbz-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.9fr);
  gap: 10px;
  align-items: start;
}

.jlbz-board-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jlbz-page-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  background: #fff7ed;
  color: #9a3412;
}

.jlbz-page-banner.is-active {
  background: #ecfccb;
  color: #3f6212;
}

.jlbz-page-tag {
  font-size: 11px;
}

.jlbz-board-shell {
  display: flex;
  justify-content: center;
  padding: 10px 12px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
}

.jlbz-board {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.jlbz-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jlbz-cell {
  position: relative;
  overflow: hidden;
  width: 82px;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  border: 1px solid rgba(226, 232, 240, 0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease,
    border-color 0.18s ease, filter 0.18s ease;
}

.jlbz-cell.is-highlight {
  background: linear-gradient(180deg, #fff8cc, #ffe7a3);
  border-color: rgba(245, 158, 11, 0.92);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.42), 0 10px 18px rgba(245, 158, 11, 0.18),
    inset 0 0 0 1px rgba(255, 255, 255, 0.72);
  transform: translateY(-1px) scale(1.02);
  z-index: 1;
}

.jlbz-cell.is-dimmed {
  opacity: 0.28;
  filter: saturate(0.68) brightness(0.9);
}

.jlbz-cell-icon {
  display: block;
}

.jlbz-extra-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.jlbz-panel-title {
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.jlbz-extra-strip {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.jlbz-extra-item {
  min-width: 44px;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.jlbz-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jlbz-line-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.jlbz-line-item {
  min-width: 128px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
}

.jlbz-line-item.is-active {
  border-color: rgba(245, 158, 11, 0.3);
  background: #fff7ed;
}

.jlbz-line-id,
.jlbz-line-count {
  color: #475569;
  font-size: 12px;
}

.jlbz-line-win {
  color: #b45309;
  font-size: 12px;
}

.jlbz-detail-row {
  min-height: 56px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: stretch;
}

.jlbz-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.jlbz-detail-chip-wide {
  flex: 1 1 220px;
}

.jlbz-empty {
  color: #94a3b8;
  font-size: 12px;
}

.jlbz-detail-empty,
.jlbz-extra-empty {
  display: flex;
  align-items: center;
}

.jlbz-fallback {
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

.jlbz-extra-fallback {
  font-size: 11px;
}

@media (max-width: 900px) {
  .jlbz-topline,
  .jlbz-stage {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .jlbz-status {
    width: 100%;
    flex-basis: auto;
  }

  .jlbz-metrics {
    grid-template-columns: repeat(2, minmax(110px, 1fr));
  }
}
</style>
