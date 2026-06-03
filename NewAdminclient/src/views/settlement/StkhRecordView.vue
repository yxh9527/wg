<template>
  <div class="stkh-view">
    <div class="stkh-topline">
      <div class="stkh-metrics">
        <div class="stkh-metric">
          <span class="stkh-metric-label">单注</span>
          <span class="stkh-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="stkh-metric">
          <span class="stkh-metric-label">倍数</span>
          <span class="stkh-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="stkh-metric">
          <span class="stkh-metric-label">总投注</span>
          <span class="stkh-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="stkh-metric">
          <span class="stkh-metric-label">总输赢</span>
          <span class="stkh-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="stkh-status">
        <div class="stkh-status-title">{{ currentRound.label }}</div>
        <div class="stkh-status-sub">
          <span>盘面 {{ currentRound.boards.length > 1 ? "双 5x3" : "5x3" }}</span>
          <span v-if="currentRound.pageLabel">页 {{ currentRound.pageLabel }}</span>
          <span>中奖线 {{ currentWinAreas.length }}</span>
          <span>Scatter {{ currentRound.scatterCount || 0 }}</span>
        </div>
      </div>
    </div>

    <div class="stkh-toolbar">
      <button type="button" class="stkh-nav" :disabled="roundIndex === 0" @click="roundIndex -= 1">&lt;</button>
      <div class="stkh-round-strip">
        <button
          v-for="(round, index) in view.rounds"
          :key="`${round.label}-${index}`"
          type="button"
          class="stkh-round-chip"
          :class="{ 'is-active': index === roundIndex }"
          @click="roundIndex = index"
        >
          <span>{{ round.label }}</span>
          <strong>{{ formatMoney(round.winLoseGold || 0) }}</strong>
        </button>
      </div>
      <button type="button" class="stkh-nav" :disabled="roundIndex >= view.rounds.length - 1" @click="roundIndex += 1">&gt;</button>
    </div>

    <div class="stkh-stage">
      <div class="stkh-board-panel">
        <div class="stkh-free-banner" :class="{ 'is-active': currentRound.isFreeRound || currentRound.isTriggerRound }">
          <template v-if="currentRound.isFreeRound">
            <span class="stkh-free-tag">免费页</span>
            <strong>{{ currentRound.pageLabel }}</strong>
          </template>
          <template v-else-if="currentRound.isTriggerRound">
            <span class="stkh-free-tag">触发免费</span>
            <strong>x{{ currentRound.freeTriggerCount || 0 }}</strong>
          </template>
          <template v-else>
            <span class="stkh-free-tag">普通模式</span>
            <strong>主盘</strong>
          </template>
        </div>

        <div class="stkh-board-stack" :class="{ 'is-double': currentRound.boards.length > 1 }">
          <div
            v-for="(board, boardIndex) in currentRound.boards"
            :key="`board-${roundIndex}-${boardIndex}`"
            class="stkh-board-wrap"
          >
            <div v-if="currentRound.boards.length > 1" class="stkh-board-tag">
              {{ boardIndex === 0 ? "上" : "下" }}
            </div>
            <div class="stkh-board">
              <div
                v-for="cell in boardCells(boardIndex)"
                :key="`${roundIndex}-${cell.index}`"
                class="stkh-cell"
                :class="{
                  'is-highlight': activeArea && activeArea.highlightKeys.includes(`${cell.row}-${cell.column}`),
                  'is-dimmed': hasHighlight && !(activeArea && activeArea.highlightKeys.includes(`${cell.row}-${cell.column}`)),
                }"
              >
                <atlas-sprite
                  v-if="cellAtlas(cell) && cell.icon !== ''"
                  class="stkh-cell-icon"
                  :atlas="cellAtlas(cell)"
                  :frame-key="cell.icon"
                  :max-width="54"
                  :max-height="54"
                />
                <span v-else class="stkh-fallback">{{ iconLabel(cell.icon) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="stkh-sidebar">
        <div class="stkh-panel">
          <div class="stkh-panel-title">中奖线</div>
          <div v-if="currentWinAreas.length" class="stkh-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${roundIndex}-${area.betAreaId}-${index}`"
              type="button"
              class="stkh-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span class="stkh-line-side" v-if="area.side">{{ area.side }}</span>
              <span class="stkh-line-id">线 {{ area.lineNo || area.betAreaId }}</span>
              <span v-if="hasIconAsset(area.iconId)" class="stkh-line-icon">
                <atlas-sprite :atlas="view.iconAtlas" :frame-key="area.iconId" :max-width="22" :max-height="22" />
              </span>
              <span class="stkh-line-count">x{{ area.num || 0 }}</span>
              <strong class="stkh-line-win">+{{ formatMoney(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="stkh-empty">当前页没有中奖线</div>
        </div>

        <div class="stkh-panel">
          <div class="stkh-panel-title">当前中奖明细</div>
          <div v-if="activeArea" class="stkh-detail-row">
            <div class="stkh-detail-chip">
              <span class="stkh-detail-label">图标</span>
              <span v-if="hasIconAsset(activeArea.iconId)" class="stkh-detail-icon">
                <atlas-sprite :atlas="view.iconAtlas" :frame-key="activeArea.iconId" :max-width="22" :max-height="22" />
              </span>
              <span class="stkh-detail-value">{{ iconLabel(activeArea.iconId) }}</span>
            </div>
            <div class="stkh-detail-chip">
              <span class="stkh-detail-label">中奖</span>
              <span class="stkh-detail-value">+{{ formatMoney(activeArea.winLoseGold) }}</span>
            </div>
            <div class="stkh-detail-chip stkh-detail-chip-wide">
              <span class="stkh-detail-label">公式</span>
              <span class="stkh-detail-value">{{ activeArea.formula || "-" }}</span>
            </div>
          </div>
          <div v-else class="stkh-empty">当前页没有中奖明细</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";
import AtlasSprite from "./AtlasSprite.vue";

export default {
  name: "StkhRecordView",
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
      return (
        this.view.rounds[this.roundIndex] || {
          label: "主盘",
          boards: [],
          cells: [],
          winAreas: [],
          scatterCount: 0,
        }
      );
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
      return !!(this.view && this.view.iconAtlas && this.view.iconAtlas.frames && this.view.iconAtlas.frames[String(icon)]);
    },
    iconLabel(icon) {
      if (icon === null || icon === undefined || icon === "") return "-";
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, icon)) {
        return this.view.iconNameMap[icon];
      }
      return String(icon);
    },
    boardCells(boardIndex) {
      return (this.currentRound.cells || [])
        .filter((cell) => Number(cell.boardIndex) === Number(boardIndex))
        .sort((left, right) => {
          if (left.row !== right.row) return left.row - right.row;
          return left.column - right.column;
        });
    },
    cellAtlas(cell) {
      if (!cell || !this.hasIconAsset(cell.icon)) return null;
      const isHighlighted = !!(this.activeArea && this.activeArea.highlightKeys.includes(`${cell.row}-${cell.column}`));
      if (!this.hasHighlight || isHighlighted || !this.view.fuzzyAtlas) return this.view.iconAtlas;
      return this.view.fuzzyAtlas;
    },
  },
};
</script>

<style scoped>
.stkh-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stkh-topline,
.stkh-toolbar,
.stkh-board-panel,
.stkh-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.stkh-topline {
  display: flex;
  gap: 8px;
}

.stkh-metrics {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
}

.stkh-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.stkh-metric-label,
.stkh-detail-label {
  color: #64748b;
  font-size: 11px;
}

.stkh-metric-value,
.stkh-status-title,
.stkh-detail-value {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.stkh-status {
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

.stkh-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: #92400e;
  font-size: 11px;
}

.stkh-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stkh-nav {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.stkh-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stkh-round-strip {
  flex: 1 1 auto;
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.stkh-round-chip {
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

.stkh-round-chip.is-active {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(255, 237, 213, 0.95);
  color: #9a3412;
}

.stkh-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
  gap: 10px;
}

.stkh-free-banner {
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

.stkh-free-banner.is-active {
  border-color: rgba(249, 115, 22, 0.28);
  background: linear-gradient(90deg, rgba(255, 237, 213, 0.95), rgba(255, 247, 237, 0.95));
}

.stkh-free-tag {
  font-size: 11px;
  color: #64748b;
}

.stkh-board-stack {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.stkh-board-wrap {
  position: relative;
}

.stkh-board-tag {
  position: absolute;
  top: -8px;
  left: 10px;
  z-index: 1;
  padding: 2px 8px;
  border-radius: 999px;
  background: #fff7ed;
  color: #c2410c;
  font-size: 11px;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.stkh-board {
  display: grid;
  grid-template-columns: repeat(5, 58px);
  gap: 4px;
  justify-content: center;
  padding: 10px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.stkh-cell {
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

.stkh-cell.is-highlight {
  border-color: rgba(249, 115, 22, 0.45);
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.14), 0 8px 16px rgba(249, 115, 22, 0.12);
}

.stkh-cell.is-dimmed {
  opacity: 0.38;
}

.stkh-cell-icon {
  display: block;
}

.stkh-fallback {
  font-size: 11px;
  color: #475569;
}

.stkh-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stkh-panel-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.stkh-line-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stkh-line-item {
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

.stkh-line-item.is-active {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(255, 237, 213, 0.96);
  color: #9a3412;
}

.stkh-line-side {
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.1);
  color: #c2410c;
  font-size: 11px;
}

.stkh-line-id,
.stkh-line-count {
  font-size: 11px;
}

.stkh-line-win {
  font-size: 12px;
  color: #15803d;
}

.stkh-detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stkh-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.95);
}

.stkh-detail-chip-wide {
  min-width: 220px;
}

.stkh-empty {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 1080px) {
  .stkh-topline,
  .stkh-stage {
    grid-template-columns: 1fr;
    display: block;
  }

  .stkh-topline {
    display: flex;
    flex-direction: column;
  }

  .stkh-status {
    width: auto;
    flex: 1 1 auto;
  }

  .stkh-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stkh-stage {
    display: flex;
    flex-direction: column;
  }
}
</style>
