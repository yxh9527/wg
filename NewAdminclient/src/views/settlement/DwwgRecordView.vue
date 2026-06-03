<template>
  <div class="dwwg-view">
    <div class="dwwg-topline">
      <div class="dwwg-metrics">
        <div class="dwwg-metric">
          <span class="dwwg-metric-label">{{ uiText.betSingle }}</span>
          <span class="dwwg-metric-value">{{ money(view.betSingle) }}</span>
        </div>
        <div class="dwwg-metric">
          <span class="dwwg-metric-label">{{ uiText.betTimes }}</span>
          <span class="dwwg-metric-value">{{ view.betTimes }}</span>
        </div>
        <div class="dwwg-metric">
          <span class="dwwg-metric-label">{{ uiText.totalBet }}</span>
          <span class="dwwg-metric-value">{{ money(view.totalBetGold) }}</span>
        </div>
        <div class="dwwg-metric">
          <span class="dwwg-metric-label">{{ uiText.totalWinLose }}</span>
          <span class="dwwg-metric-value">{{ money(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="dwwg-status">
        <div class="dwwg-status-title">{{ currentPage.label }}</div>
        <div class="dwwg-status-sub">
          <span>{{ uiText.boardSize }} 5x3</span>
          <span>{{ uiText.winLines }} {{ currentPage.winAreas.length }}</span>
          <span>{{ uiText.pageWin }} {{ money(currentPage.winLoseGold) }}</span>
        </div>
      </div>
    </div>

    <div class="dwwg-toolbar">
      <button type="button" class="dwwg-nav" :disabled="pageIndex === 0" @click="pageIndex -= 1">&lt;</button>
      <div class="dwwg-round-strip">
        <button
          v-for="page in view.pages"
          :key="page.pageIndex"
          type="button"
          class="dwwg-round-chip"
          :class="{ 'is-active': page.pageIndex === pageIndex }"
          @click="pageIndex = page.pageIndex"
        >
          <span>{{ page.label }}</span>
          <strong>{{ money(page.winLoseGold) }}</strong>
        </button>
      </div>
      <button
        type="button"
        class="dwwg-nav"
        :disabled="pageIndex >= view.pages.length - 1"
        @click="pageIndex += 1"
      >
        &gt;
      </button>
    </div>

    <div class="dwwg-stage">
      <div class="dwwg-board-panel">
        <div class="dwwg-page-banner" :class="{ 'is-active': currentPage.pageIndex > 0 }">
          <span class="dwwg-page-tag">{{ currentPage.pageIndex === 0 ? uiText.mainMode : uiText.stageMode }}</span>
          <strong>{{ currentPage.label }}</strong>
        </div>

        <div class="dwwg-board">
          <div
            v-for="cell in currentPage.cells"
            :key="cell.key"
            class="dwwg-cell"
            :style="cellStyle(cell)"
            :class="{
              'is-highlight': isHighlighted(cell),
              'is-dimmed': hasHighlight && !isHighlighted(cell),
            }"
          >
            <atlas-sprite
              v-if="cellAtlas(cell)"
              class="dwwg-cell-icon"
              :atlas="cellAtlas(cell)"
              :frame-key="cell.icon"
              :max-width="54"
              :max-height="54"
            />
            <span v-else class="dwwg-fallback">{{ cell.icon || "-" }}</span>
          </div>
        </div>
      </div>

      <div class="dwwg-sidebar">
        <div class="dwwg-panel">
          <div class="dwwg-panel-title">{{ uiText.winLines }}</div>
          <div v-if="currentPage.winAreas.length" class="dwwg-line-list">
            <button
              v-for="(area, index) in currentPage.winAreas"
              :key="`${area.betAreaId}-${index}`"
              type="button"
              class="dwwg-line-item"
              :class="{ 'is-active': index === lineIndex }"
              @click="lineIndex = index"
            >
              <span class="dwwg-line-id">{{ uiText.linePrefix }} {{ area.betAreaId }}</span>
              <span v-if="hasAtlasFrame(view.iconAtlas, area.iconId)" class="dwwg-line-icon">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="area.iconId"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="dwwg-line-count">x{{ area.num || 0 }}</span>
              <strong class="dwwg-line-win">+{{ money(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="dwwg-empty">{{ uiText.emptyWinLines }}</div>
        </div>

        <div class="dwwg-panel">
          <div class="dwwg-panel-title">{{ uiText.currentDetail }}</div>
          <div v-if="activeArea" class="dwwg-detail-row">
            <div class="dwwg-detail-chip">
              <span class="dwwg-detail-label">{{ uiText.icon }}</span>
              <span v-if="hasAtlasFrame(view.iconAtlas, activeArea.iconId)" class="dwwg-detail-icon">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="activeArea.iconId"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="dwwg-detail-value">{{ activeArea.iconId || "-" }}</span>
            </div>
            <div class="dwwg-detail-chip">
              <span class="dwwg-detail-label">{{ uiText.count }}</span>
              <span class="dwwg-detail-value">{{ activeArea.num || 0 }}</span>
            </div>
            <div class="dwwg-detail-chip dwwg-detail-chip-wide">
              <span class="dwwg-detail-label">{{ uiText.formula }}</span>
              <span class="dwwg-detail-value">{{ activeArea.formula }}</span>
            </div>
          </div>
          <div v-else class="dwwg-empty">{{ uiText.emptyDetail }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AtlasSprite from "./AtlasSprite.vue";
import { toMoney } from "./settlementHelpers";

export default {
  name: "DwwgRecordView",
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
        totalWinLose: "\u603b\u8f93\u8d62",
        boardSize: "\u76d8\u9762",
        pageWin: "\u672c\u9875\u4e2d\u5956",
        winLines: "\u4e2d\u5956\u7ebf",
        linePrefix: "\u7ebf",
        currentDetail: "\u5f53\u524d\u4e2d\u5956\u660e\u7ec6",
        icon: "\u56fe\u6807",
        count: "\u6570\u91cf",
        formula: "\u516c\u5f0f",
        emptyWinLines: "\u5f53\u524d\u9875\u6ca1\u6709\u4e2d\u5956\u7ebf",
        emptyDetail: "\u5f53\u524d\u9875\u6ca1\u6709\u4e2d\u5956\u660e\u7ec6",
        mainMode: "\u4e3b\u76d8",
        stageMode: "\u9636\u6bb5",
      };
    },
    currentPage() {
      return this.view.pages[this.pageIndex] || {
        pageIndex: 0,
        label: "\u4e3b\u76d8",
        cells: [],
        winAreas: [],
        winLoseGold: 0,
      };
    },
    activeArea() {
      return this.currentPage.winAreas[this.lineIndex] || null;
    },
    hasHighlight() {
      return !!(
        this.activeArea &&
        Array.isArray(this.activeArea.highlightKeys) &&
        this.activeArea.highlightKeys.length
      );
    },
  },
  watch: {
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
    isHighlighted(cell) {
      return !!(
        cell &&
        this.activeArea &&
        this.activeArea.highlightKeys &&
        this.activeArea.highlightKeys.includes(`${cell.row}-${cell.column}`)
      );
    },
    cellAtlas(cell) {
      if (!cell) return null;
      if (this.isHighlighted(cell) && this.hasAtlasFrame(this.view.iconAtlas, cell.icon)) {
        return this.view.iconAtlas;
      }
      if (!this.hasHighlight && this.hasAtlasFrame(this.view.iconAtlas, cell.icon)) {
        return this.view.iconAtlas;
      }
      if (this.hasHighlight && this.hasAtlasFrame(this.view.fuzzyAtlas, cell.icon)) {
        return this.view.fuzzyAtlas;
      }
      return this.hasAtlasFrame(this.view.iconAtlas, cell.icon) ? this.view.iconAtlas : null;
    },
    cellStyle(cell) {
      if (!cell) return null;
      return {
        gridColumn: String((Number(cell.column) || 0) + 1),
        gridRow: String((Number(cell.row) || 0) + 1),
      };
    },
  },
};
</script>

<style scoped>
.dwwg-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dwwg-topline,
.dwwg-toolbar,
.dwwg-board-panel,
.dwwg-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.dwwg-topline {
  display: flex;
  gap: 8px;
}

.dwwg-metrics {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
}

.dwwg-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.dwwg-metric-label,
.dwwg-detail-label {
  color: #64748b;
  font-size: 11px;
}

.dwwg-metric-value,
.dwwg-status-title,
.dwwg-detail-value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.dwwg-status {
  width: 220px;
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.dwwg-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: #92400e;
  font-size: 11px;
}

.dwwg-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dwwg-nav {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.dwwg-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dwwg-round-strip {
  flex: 1 1 auto;
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.dwwg-round-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  background: #fff;
  color: #334155;
  cursor: pointer;
  white-space: nowrap;
}

.dwwg-round-chip.is-active {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(255, 237, 213, 0.95);
  color: #9a3412;
}

.dwwg-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
  gap: 10px;
}

.dwwg-page-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(248, 250, 252, 0.8);
}

.dwwg-page-banner.is-active {
  border-color: rgba(249, 115, 22, 0.28);
  background: linear-gradient(90deg, rgba(255, 237, 213, 0.95), rgba(255, 247, 237, 0.95));
}

.dwwg-page-tag {
  font-size: 11px;
  color: #64748b;
}

.dwwg-board {
  display: grid;
  grid-template-columns: repeat(5, 58px);
  grid-template-rows: repeat(3, 58px);
  gap: 4px;
  justify-content: center;
  padding: 10px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.dwwg-cell {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.96);
  transition: opacity 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.dwwg-cell.is-highlight {
  border-color: rgba(249, 115, 22, 0.45);
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.14), 0 8px 16px rgba(249, 115, 22, 0.12);
}

.dwwg-cell.is-dimmed {
  opacity: 0.38;
}

.dwwg-cell-icon {
  display: block;
}

.dwwg-fallback {
  font-size: 11px;
  color: #475569;
}

.dwwg-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dwwg-panel-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.dwwg-line-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dwwg-line-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 999px;
  background: #fff;
  color: #334155;
  cursor: pointer;
  white-space: nowrap;
}

.dwwg-line-item.is-active {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(255, 237, 213, 0.96);
  color: #9a3412;
}

.dwwg-line-id,
.dwwg-line-count {
  font-size: 11px;
}

.dwwg-line-win {
  font-size: 12px;
  color: #15803d;
}

.dwwg-detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dwwg-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.95);
}

.dwwg-detail-chip-wide {
  min-width: 220px;
}

.dwwg-line-icon,
.dwwg-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dwwg-empty {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 1080px) {
  .dwwg-topline,
  .dwwg-stage {
    grid-template-columns: 1fr;
    display: block;
  }

  .dwwg-topline {
    display: flex;
    flex-direction: column;
  }

  .dwwg-status {
    width: auto;
    flex: 1 1 auto;
  }

  .dwwg-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dwwg-stage {
    display: flex;
    flex-direction: column;
  }
}
</style>
