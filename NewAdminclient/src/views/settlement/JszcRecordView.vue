<template>
  <div class="jszc-view">
    <div class="jszc-topline">
      <div class="jszc-metrics">
        <div class="jszc-metric">
          <span class="jszc-metric-label">单注</span>
          <span class="jszc-metric-value">{{ money(view.betSingle) }}</span>
        </div>
        <div class="jszc-metric">
          <span class="jszc-metric-label">倍数</span>
          <span class="jszc-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="jszc-metric">
          <span class="jszc-metric-label">总投注</span>
          <span class="jszc-metric-value">{{ money(view.totalBetGold) }}</span>
        </div>
        <div class="jszc-metric">
          <span class="jszc-metric-label">总输赢</span>
          <span class="jszc-metric-value">{{ money(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="jszc-status">
        <div class="jszc-status-title">{{ currentPage.label }}</div>
        <div class="jszc-status-sub">
          <span>盘面 3-4-3</span>
          <span>中奖线 {{ currentWinAreas.length }}</span>
          <span>本页 {{ money(currentPage.winLoseGold) }}</span>
        </div>
      </div>
    </div>

    <div class="jszc-toolbar">
      <div class="jszc-round-strip">
        <button
          v-for="(page, index) in view.pages"
          :key="`${page.label}-${index}`"
          type="button"
          class="jszc-round-chip"
          :class="{ 'is-active': pageIndex === index }"
          @click="pageIndex = index"
        >
          <span>{{ page.label }}</span>
          <strong>{{ money(page.winLoseGold) }}</strong>
        </button>
      </div>

      <div class="jszc-page-info">
        <span>{{ currentPage.label }}</span>
        <strong>{{ formattedTime }}</strong>
      </div>
    </div>

    <div class="jszc-stage">
      <div class="jszc-board-panel">
        <div class="jszc-board-shell">
          <div class="jszc-board">
            <div class="jszc-column is-side">
              <div
                v-for="cell in sideColumnCells(0)"
                :key="cell.key"
                class="jszc-cell"
                :class="cellClass(cell)"
              >
                <atlas-sprite
                  v-if="cellFrameKey(cell)"
                  class="jszc-cell-icon"
                  :atlas="cellAtlas(cell)"
                  :frame-key="cellFrameKey(cell)"
                  :max-width="66"
                  :max-height="66"
                />
                <span v-else class="jszc-fallback">{{ iconLabel(cell.icon) }}</span>
              </div>
            </div>

            <div class="jszc-column is-center">
              <template v-if="currentPage.isBigWild">
                <div
                  class="jszc-big-wild"
                  :class="{
                    'is-highlight': bigWildHighlighted,
                    'is-dimmed': hasHighlight && !bigWildHighlighted,
                  }"
                >
                  <atlas-sprite
                    v-if="hasAtlasFrame(bigWildAtlas, bigWildFrameKey)"
                    class="jszc-big-wild-icon"
                    :atlas="bigWildAtlas"
                    :frame-key="bigWildFrameKey"
                    :max-width="128"
                    :max-height="258"
                  />
                  <span v-else class="jszc-fallback">大百搭</span>
                </div>
              </template>

              <template v-else>
                <div
                  v-for="cell in centerColumnCells"
                  :key="cell.key"
                  class="jszc-cell"
                  :class="cellClass(cell)"
                >
                  <atlas-sprite
                    v-if="cellFrameKey(cell)"
                    class="jszc-cell-icon"
                    :atlas="cellAtlas(cell)"
                    :frame-key="cellFrameKey(cell)"
                    :max-width="66"
                    :max-height="66"
                  />
                  <span v-else class="jszc-fallback">{{ iconLabel(cell.icon) }}</span>
                </div>
              </template>
            </div>

            <div class="jszc-column is-side">
              <div
                v-for="cell in sideColumnCells(2)"
                :key="cell.key"
                class="jszc-cell"
                :class="cellClass(cell)"
              >
                <atlas-sprite
                  v-if="cellFrameKey(cell)"
                  class="jszc-cell-icon"
                  :atlas="cellAtlas(cell)"
                  :frame-key="cellFrameKey(cell)"
                  :max-width="66"
                  :max-height="66"
                />
                <span v-else class="jszc-fallback">{{ iconLabel(cell.icon) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="jszc-sidebar">
        <div class="jszc-panel">
          <div class="jszc-panel-title">中奖线</div>
          <div v-if="currentWinAreas.length" class="jszc-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${currentPage.pageIndex}-${area.lineNo}-${index}`"
              type="button"
              class="jszc-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span class="jszc-line-index">{{ index + 1 }}</span>
              <span>线 {{ area.lineNo }}</span>
              <span v-if="hasAtlasFrame(view.iconAtlas, normalizedIconKey(area.iconId))" class="jszc-line-icon">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="normalizedIconKey(area.iconId)"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="jszc-line-count">x{{ area.num || 0 }}</span>
              <strong class="jszc-line-win">+{{ money(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="jszc-empty">当前回合没有中奖线</div>
        </div>
      </div>
    </div>

    <div class="jszc-panel jszc-detail-panel">
      <div class="jszc-panel-title">当前中奖明细</div>
      <div class="jszc-detail-row">
        <template v-if="activeArea">
          <div class="jszc-detail-chip">
            <span class="jszc-detail-label">线号</span>
            <span class="jszc-detail-value">{{ activeArea.lineNo }}</span>
          </div>
          <div class="jszc-detail-chip">
            <span v-if="hasAtlasFrame(view.iconAtlas, normalizedIconKey(activeArea.iconId))" class="jszc-detail-icon">
              <atlas-sprite
                :atlas="view.iconAtlas"
                :frame-key="normalizedIconKey(activeArea.iconId)"
                :max-width="22"
                :max-height="22"
              />
            </span>
            <span class="jszc-detail-label">图标</span>
            <span class="jszc-detail-value">{{ hasAtlasFrame(view.iconAtlas, normalizedIconKey(activeArea.iconId)) ? "" : iconLabel(activeArea.iconId) }}</span>
          </div>
          <div class="jszc-detail-chip">
            <span class="jszc-detail-label">数量</span>
            <span class="jszc-detail-value">{{ activeArea.num || "-" }}</span>
          </div>
          <div class="jszc-detail-chip">
            <span class="jszc-detail-label">中奖</span>
            <span class="jszc-detail-value">+{{ money(activeArea.winLoseGold) }}</span>
          </div>
          <div class="jszc-detail-chip jszc-detail-chip-wide">
            <span class="jszc-detail-label">公式</span>
            <span class="jszc-detail-value">{{ activeArea.formula || "-" }}</span>
          </div>
        </template>
        <div v-else class="jszc-empty">当前回合没有中奖明细</div>
      </div>
    </div>
  </div>
</template>

<script>
import AtlasSprite from "./AtlasSprite.vue";
import { formatUnixDateTime, toMoney } from "./settlementHelpers";

export default {
  name: "JszcRecordView",
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
      activeLineIndex: 0,
    };
  },
  computed: {
    currentPage() {
      return this.view.pages[this.pageIndex] || {
        label: "普通模式",
        pageIndex: 0,
        timestamp: "",
        cells: [],
        winAreas: [],
        isBigWild: false,
        winLoseGold: 0,
      };
    },
    currentWinAreas() {
      return Array.isArray(this.currentPage.winAreas) ? this.currentPage.winAreas : [];
    },
    activeArea() {
      return this.currentWinAreas[this.activeLineIndex] || null;
    },
    hasHighlight() {
      return !!(this.activeArea && Array.isArray(this.activeArea.highlightKeys) && this.activeArea.highlightKeys.length);
    },
    centerColumnCells() {
      return this.columnCells(1);
    },
    bigWildHighlighted() {
      return !!(
        this.activeArea &&
        Array.isArray(this.activeArea.highlightKeys) &&
        this.activeArea.highlightKeys.some((item) => String(item).startsWith("1-"))
      );
    },
    bigWildAtlas() {
      if (this.hasHighlight && !this.bigWildHighlighted) return this.view.fuzzyAtlas;
      return this.view.iconAtlas;
    },
    bigWildFrameKey() {
      const icon = this.centerColumnCells[0] && this.centerColumnCells[0].icon ? this.centerColumnCells[0].icon : 21;
      return this.normalizedIconKey(icon);
    },
    formattedTime() {
      return this.currentPage.timestamp ? formatUnixDateTime(this.currentPage.timestamp) : "--";
    },
  },
  watch: {
    pageIndex() {
      this.activeLineIndex = 0;
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
      return String(iconId);
    },
    iconLabel(iconId) {
      if (iconId === null || iconId === undefined || iconId === "") return "-";
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, iconId)) {
        return this.view.iconNameMap[iconId];
      }
      return String(iconId);
    },
    columnCells(columnIndex) {
      return (Array.isArray(this.currentPage.cells) ? this.currentPage.cells : [])
        .filter((cell) => Number(cell.column) === columnIndex)
        .sort((left, right) => Number(left.row) - Number(right.row));
    },
    sideColumnCells(columnIndex) {
      return this.columnCells(columnIndex);
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
      return this.hasAtlasFrame(this.cellAtlas(cell), frameKey) ? frameKey : "";
    },
    cellClass(cell) {
      return {
        "is-highlight": this.isHighlighted(cell),
        "is-dimmed": this.hasHighlight && !this.isHighlighted(cell),
      };
    },
  },
};
</script>

<style scoped>
.jszc-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jszc-topline,
.jszc-toolbar,
.jszc-board-panel,
.jszc-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.jszc-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.jszc-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
}

.jszc-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.jszc-metric-label,
.jszc-detail-label {
  color: #64748b;
  font-size: 11px;
}

.jszc-metric-value,
.jszc-status-title,
.jszc-detail-value {
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
}

.jszc-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.jszc-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: #9a3412;
  font-size: 11px;
}

.jszc-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.jszc-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 270px;
  gap: 8px;
  align-items: center;
}

.jszc-round-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.jszc-round-chip,
.jszc-line-item {
  border: 0;
  cursor: pointer;
}

.jszc-round-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 76px;
  padding: 8px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  text-align: left;
  font-size: 11px;
  white-space: nowrap;
}

.jszc-round-chip strong {
  color: #0f172a;
  font-size: 12px;
}

.jszc-round-chip.is-active {
  background: #0f172a;
  color: #cbd5e1;
}

.jszc-round-chip.is-active strong {
  color: #f8fafc;
}

.jszc-page-info {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
}

.jszc-page-info span,
.jszc-page-info strong {
  white-space: nowrap;
}

.jszc-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 348px;
  gap: 10px;
  align-items: start;
}

.jszc-board-shell {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, #fffdf7, #f8fafc 55%, #fefce8);
}

.jszc-board {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 10px;
}

.jszc-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jszc-column.is-side {
  transform: translateY(-36px);
}

.jszc-cell,
.jszc-big-wild {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  color: #334155;
  transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.jszc-cell {
  width: 72px;
  min-height: 72px;
}

.jszc-big-wild {
  width: 92px;
  min-height: 312px;
  padding: 4px;
}

.jszc-cell.is-highlight,
.jszc-big-wild.is-highlight {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #111827;
  box-shadow: 0 6px 14px rgba(249, 115, 22, 0.22);
}

.jszc-cell.is-dimmed,
.jszc-big-wild.is-dimmed {
  opacity: 0.28;
}

.jszc-cell-icon,
.jszc-big-wild-icon {
  display: block;
}

.jszc-sidebar {
  display: flex;
  flex-direction: column;
}

.jszc-panel-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.jszc-line-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.jszc-line-item {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.96);
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  gap: 6px;
  white-space: nowrap;
}

.jszc-line-item.is-active {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(255, 237, 213, 0.96);
  color: #9a3412;
}

.jszc-line-index {
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

.jszc-line-icon,
.jszc-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.jszc-line-win {
  color: #15803d;
}

.jszc-detail-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 6px;
  overflow-x: auto;
  min-height: 44px;
  align-items: center;
}

.jszc-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.05);
  white-space: nowrap;
}

.jszc-detail-chip-wide {
  flex: 1 1 220px;
}

.jszc-empty,
.jszc-fallback {
  color: #94a3b8;
  font-size: 12px;
}

.jszc-detail-panel {
  min-height: 76px;
}

@media (max-width: 1100px) {
  .jszc-stage {
    grid-template-columns: 1fr;
  }

  .jszc-topline {
    display: block;
  }

  .jszc-status {
    margin-top: 8px;
  }

  .jszc-toolbar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .jszc-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
