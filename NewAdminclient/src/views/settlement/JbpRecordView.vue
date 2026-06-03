<template>
  <div class="jbp-view">
    <div class="jbp-topline">
      <div class="jbp-metrics">
        <div class="jbp-metric">
          <span class="jbp-metric-label">{{ uiText.betSingle }}</span>
          <span class="jbp-metric-value">{{ money(view.betSingle) }}</span>
        </div>
        <div class="jbp-metric">
          <span class="jbp-metric-label">{{ uiText.betTimes }}</span>
          <span class="jbp-metric-value">{{ view.betTimes }}</span>
        </div>
        <div class="jbp-metric">
          <span class="jbp-metric-label">{{ uiText.totalBet }}</span>
          <span class="jbp-metric-value">{{ money(view.totalBetGold) }}</span>
        </div>
        <div class="jbp-metric">
          <span class="jbp-metric-label">{{ uiText.totalWin }}</span>
          <span class="jbp-metric-value">{{ money(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="jbp-status">
        <div class="jbp-status-title">{{ currentPage.label }}</div>
        <div class="jbp-status-sub">
          <span>{{ uiText.boardSize }} 3x3</span>
          <span>{{ uiText.totalScore }} {{ currentPage.totalScore || 0 }}</span>
          <span>{{ uiText.bgMode }} {{ view.bgMode }}</span>
        </div>
      </div>
    </div>

    <div class="jbp-toolbar">
      <button type="button" class="jbp-nav" :disabled="pageIndex === 0" @click="pageIndex -= 1">&lt;</button>
      <div class="jbp-round-strip">
        <button
          v-for="page in view.pages"
          :key="page.pageIndex"
          type="button"
          class="jbp-round-chip"
          :class="{ 'is-active': page.pageIndex === pageIndex }"
          @click="pageIndex = page.pageIndex"
        >
          <span>{{ page.label }}</span>
          <strong>{{ money(page.winLoseGold) }}</strong>
        </button>
      </div>
      <button
        type="button"
        class="jbp-nav"
        :disabled="pageIndex >= view.pages.length - 1"
        @click="pageIndex += 1"
      >
        &gt;
      </button>
    </div>

    <div class="jbp-stage">
      <div class="jbp-board-panel">
        <div class="jbp-page-banner" :class="{ 'is-active': currentPage.pageIndex > 0 }">
          <span class="jbp-page-tag">{{ currentPage.pageType === 'main' ? uiText.mainMode : uiText.stageMode }}</span>
          <strong>{{ currentPage.label }}</strong>
        </div>

        <div class="jbp-board">
          <div
            v-for="cell in currentPage.cells"
            :key="cell.key"
            class="jbp-cell"
            :class="cellCropClass(cell)"
            :style="cellStyle(cell)"
          >
            <div class="jbp-cell-content">
              <atlas-sprite
                v-if="cellAtlas(cell)"
                class="jbp-cell-icon"
                :atlas="cellAtlas(cell)"
                :frame-key="cell.icon"
                :max-width="54"
                :max-height="54"
              />
              <span v-else-if="cell.icon" class="jbp-fallback">{{ cell.icon }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="jbp-sidebar">
        <div class="jbp-panel">
          <div class="jbp-panel-title">{{ uiText.pageInfo }}</div>
          <div class="jbp-detail-row">
            <div class="jbp-detail-chip">
              <span class="jbp-detail-label">{{ uiText.totalScore }}</span>
              <span class="jbp-detail-value">{{ currentPage.totalScore || 0 }}</span>
            </div>
            <div class="jbp-detail-chip">
              <span class="jbp-detail-label">{{ uiText.pageWin }}</span>
              <span class="jbp-detail-value">+{{ money(currentPage.winLoseGold) }}</span>
            </div>
            <div class="jbp-detail-chip">
              <span class="jbp-detail-label">{{ uiText.detailCount }}</span>
              <span class="jbp-detail-value">{{ currentPage.detailItems.length }}</span>
            </div>
          </div>
        </div>

        <div class="jbp-panel">
          <div class="jbp-panel-title">{{ uiText.winDetail }}</div>
          <div v-if="currentPage.detailItems.length" class="jbp-line-list">
            <div v-for="item in currentPage.detailItems" :key="item.key" class="jbp-line-item">
              <span v-if="hasAtlasFrame(view.iconAtlas, item.icon)" class="jbp-line-icon">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="item.icon"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="jbp-line-id">x{{ item.amount || 1 }}</span>
              <span class="jbp-line-count">{{ item.formula }}</span>
              <strong class="jbp-line-win">{{ item.score }}</strong>
            </div>
          </div>
          <div v-else class="jbp-empty">{{ uiText.emptyDetail }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AtlasSprite from "./AtlasSprite.vue";
import { toMoney } from "./settlementHelpers";

export default {
  name: "JbpRecordView",
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
    };
  },
  computed: {
    uiText() {
      return {
        betSingle: "\u5355\u6ce8",
        betTimes: "\u500d\u6570",
        totalBet: "\u603b\u6295\u6ce8",
        totalWin: "\u603b\u8f93\u8d62",
        bgMode: "\u80cc\u666f",
        boardSize: "\u76d8\u9762",
        pageInfo: "\u5f53\u524d\u9875\u4fe1\u606f",
        totalScore: "\u603b\u5206",
        pageWin: "\u4e2d\u5956",
        detailCount: "\u660e\u7ec6\u6570",
        winDetail: "\u4e2d\u5956\u660e\u7ec6",
        emptyDetail: "\u5f53\u524d\u9875\u6ca1\u6709\u660e\u7ec6",
        mainMode: "\u4e3b\u76d8",
        stageMode: "\u9636\u6bb5",
      };
    },
    currentPage() {
      return this.view.pages[this.pageIndex] || {
        pageIndex: 0,
        label: "\u4e3b\u76d8",
        pageType: "main",
        cells: [],
        detailItems: [],
        highlightKeys: [],
        totalScore: 0,
        winLoseGold: 0,
      };
    },
    hasHighlight() {
      return Array.isArray(this.currentPage.highlightKeys) && this.currentPage.highlightKeys.length > 0;
    },
  },
  methods: {
    money(value) {
      return toMoney(value || 0);
    },
    cellCropClass(cell) {
      const highlighted = this.currentPage.highlightKeys.includes(`${cell.column}-${cell.row}`);
      return {
        "is-top-crop": Number(cell && cell.row) === 0,
        "is-center-crop": Number(cell && cell.row) === 1,
        "is-bottom-crop": Number(cell && cell.row) === 2,
        "is-highlight": highlighted,
        "is-dimmed": this.hasHighlight && !highlighted,
      };
    },
    hasAtlasFrame(atlas, frameKey) {
      return !!(atlas && atlas.frames && atlas.frames[String(frameKey)]);
    },
    cellAtlas(cell) {
      if (!cell || !cell.icon || !this.hasAtlasFrame(this.view.iconAtlas, cell.icon)) return null;
      const highlighted = this.currentPage.highlightKeys.includes(`${cell.column}-${cell.row}`);
      if (!this.hasHighlight || highlighted) return this.view.iconAtlas;
      return this.view.fuzzyAtlas || this.view.iconAtlas;
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
.jbp-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jbp-topline,
.jbp-toolbar,
.jbp-board-panel,
.jbp-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.jbp-topline {
  display: flex;
  gap: 8px;
}

.jbp-metrics {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
}

.jbp-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.jbp-metric-label,
.jbp-detail-label {
  color: #64748b;
  font-size: 11px;
}

.jbp-metric-value,
.jbp-status-title,
.jbp-detail-value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.jbp-status {
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

.jbp-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: #92400e;
  font-size: 11px;
}

.jbp-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.jbp-nav {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.jbp-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.jbp-round-strip {
  flex: 1 1 auto;
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.jbp-round-chip {
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

.jbp-round-chip.is-active {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(255, 237, 213, 0.95);
  color: #9a3412;
}

.jbp-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
  gap: 10px;
}

.jbp-page-banner {
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

.jbp-page-banner.is-active {
  border-color: rgba(249, 115, 22, 0.28);
  background: linear-gradient(90deg, rgba(255, 237, 213, 0.95), rgba(255, 247, 237, 0.95));
}

.jbp-page-tag {
  font-size: 11px;
  color: #64748b;
}

.jbp-board {
  display: grid;
  grid-template-columns: repeat(3, 58px);
  grid-template-rows: 29px 58px 29px;
  gap: 4px;
  justify-content: center;
  padding: 10px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.jbp-cell {
  width: 58px;
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.96);
  transition: opacity 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.jbp-cell-content {
  position: absolute;
  left: 0;
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jbp-cell.is-top-crop .jbp-cell-content {
  top: calc(100% - 58px);
}

.jbp-cell.is-center-crop .jbp-cell-content,
.jbp-cell.is-bottom-crop .jbp-cell-content {
  top: 0;
}

.jbp-cell.is-highlight {
  border-color: rgba(249, 115, 22, 0.45);
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.14), 0 8px 16px rgba(249, 115, 22, 0.12);
}

.jbp-cell.is-dimmed {
  opacity: 0.38;
}

.jbp-cell-icon {
  display: block;
}

.jbp-fallback {
  font-size: 11px;
  color: #475569;
}

.jbp-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jbp-panel-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.jbp-line-list,
.jbp-detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.jbp-line-item,
.jbp-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
}

.jbp-line-icon,
.jbp-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.jbp-line-id,
.jbp-line-count {
  font-size: 11px;
}

.jbp-line-win {
  font-size: 12px;
  color: #15803d;
}

.jbp-empty {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 1080px) {
  .jbp-topline,
  .jbp-stage {
    grid-template-columns: 1fr;
    display: block;
  }

  .jbp-topline {
    display: flex;
    flex-direction: column;
  }

  .jbp-status {
    width: auto;
    flex: 1 1 auto;
  }

  .jbp-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .jbp-stage {
    display: flex;
    flex-direction: column;
  }
}
</style>
