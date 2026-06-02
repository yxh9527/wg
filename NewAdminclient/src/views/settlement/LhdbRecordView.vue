<template>
  <div class="lhdb-view">
    <div class="lhdb-topline">
      <div class="lhdb-metrics">
        <div class="lhdb-metric">
          <span class="lhdb-metric-label">单注</span>
          <span class="lhdb-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="lhdb-metric">
          <span class="lhdb-metric-label">倍数</span>
          <span class="lhdb-metric-value">{{ view.betTimes }}</span>
        </div>
        <div class="lhdb-metric">
          <span class="lhdb-metric-label">总投注</span>
          <span class="lhdb-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="lhdb-metric">
          <span class="lhdb-metric-label">总输赢</span>
          <span class="lhdb-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="lhdb-status">
        <div class="lhdb-status-title">当前页</div>
        <div class="lhdb-status-sub">
          <span>{{ currentRound.label }}</span>
          <span>阶段 {{ view.stage }}</span>
          <span>盘面 {{ currentRound.columns }}x{{ currentRound.rows }}</span>
          <span>中奖区 {{ currentWinAreas.length }}</span>
        </div>
      </div>
    </div>

    <div class="lhdb-toolbar">
      <div class="lhdb-round-strip">
        <button
          v-for="(round, index) in view.rounds"
          :key="`${round.label}-${index}`"
          type="button"
          class="lhdb-round-chip"
          :class="{ 'is-active': index === roundIndex }"
          @click="roundIndex = index"
        >
          <span>{{ round.label }}</span>
          <strong>{{ formatMoney(round.winLoseGold) }}</strong>
        </button>
      </div>

      <div class="lhdb-round-brief">
        <div class="lhdb-round-brief-title">{{ currentRound.label }}</div>
        <div class="lhdb-round-brief-meta">
          <span>宝石 {{ boardCells.length }}</span>
          <span>中奖区 {{ currentWinAreas.length }}</span>
        </div>
      </div>
    </div>

    <div class="lhdb-stage">
      <div class="lhdb-board-shell">
        <div class="lhdb-board" :style="boardStyle">
          <div
            v-for="cell in boardCells"
            :key="cell.key"
            class="lhdb-cell"
            :class="{
              'is-empty': !cell.icon,
              'is-highlight': cell.isHighlight,
              'is-dimmed': cell.isDimmed,
              'is-dragon': cell.icon && cell.icon.isDragon,
              'is-key': cell.icon && cell.icon.typeId === 0 && currentRound.hasKeyCells,
            }"
          >
            <div class="lhdb-cell-index">{{ cell.indexKey }}</div>
            <div v-if="cell.sprite" class="lhdb-icon-sprite" :style="cell.sprite.containerStyle">
              <img class="lhdb-icon-image" :src="cell.sprite.src" :alt="cell.icon ? cell.icon.label : ''" />
            </div>
            <div v-else class="lhdb-cell-icon">{{ cell.icon ? cell.icon.shortLabel : "-" }}</div>
            <div class="lhdb-cell-name">{{ cell.icon ? cell.icon.label : "-" }}</div>
          </div>
        </div>
      </div>

      <div class="lhdb-sidebar">
        <div class="lhdb-panel">
          <div class="lhdb-panel-title">中奖区域</div>
          <div v-if="currentWinAreas.length" class="lhdb-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${area.betAreaId}-${index}`"
              type="button"
              class="lhdb-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span v-if="getAreaSprite(area)" class="lhdb-line-icon lhdb-icon-sprite" :style="getAreaSprite(area).containerStyle">
                <img class="lhdb-icon-image" :src="getAreaSprite(area).src" :alt="area.label || ''" />
              </span>
              <span>#{{ index + 1 }}</span>
              <span>{{ area.label || area.betAreaId }}</span>
              <span>x{{ area.num || "-" }}</span>
              <strong>+{{ formatMoney(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="lhdb-empty">当前页没有中奖区域</div>
        </div>
      </div>
    </div>

    <div v-if="activeArea" class="lhdb-panel">
      <div class="lhdb-panel-title">当前中奖明细</div>
      <div class="lhdb-detail-row">
        <div class="lhdb-detail-chip">
          <span v-if="getAreaSprite(activeArea)" class="lhdb-detail-icon lhdb-icon-sprite" :style="getAreaSprite(activeArea).containerStyle">
            <img class="lhdb-icon-image" :src="getAreaSprite(activeArea).src" :alt="activeArea.label || ''" />
          </span>
          <span class="lhdb-detail-label">宝石</span>
          <span class="lhdb-detail-value">{{ activeArea.label || "-" }}</span>
        </div>
        <div class="lhdb-detail-chip">
          <span class="lhdb-detail-label">图标编号</span>
          <span class="lhdb-detail-value">{{ activeArea.imageId || "-" }}</span>
        </div>
        <div class="lhdb-detail-chip">
          <span class="lhdb-detail-label">数量</span>
          <span class="lhdb-detail-value">{{ activeArea.num || "-" }}</span>
        </div>
        <div class="lhdb-detail-chip">
          <span class="lhdb-detail-label">倍率</span>
          <span class="lhdb-detail-value">{{ activeArea.betMultiple || "-" }}</span>
        </div>
        <div class="lhdb-detail-chip">
          <span class="lhdb-detail-label">投注</span>
          <span class="lhdb-detail-value">{{ formatMoney(activeArea.betGold) }}</span>
        </div>
        <div class="lhdb-detail-chip">
          <span class="lhdb-detail-label">输赢</span>
          <span class="lhdb-detail-value">+{{ formatMoney(activeArea.winLoseGold) }}</span>
        </div>
        <div class="lhdb-detail-chip lhdb-detail-chip-wide">
          <span class="lhdb-detail-label">命中位置</span>
          <span class="lhdb-detail-value">{{ activeArea.linePosText || "-" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";

const LHDB_ICON_SRC = Object.freeze({
  0: "/lhdb-icons/0.png",
  1: "/lhdb-icons/1.png",
  11: "/lhdb-icons/11.png",
  12: "/lhdb-icons/12.png",
  13: "/lhdb-icons/13.png",
  14: "/lhdb-icons/14.png",
  15: "/lhdb-icons/15.png",
  21: "/lhdb-icons/21.png",
  22: "/lhdb-icons/22.png",
  23: "/lhdb-icons/23.png",
  24: "/lhdb-icons/24.png",
  25: "/lhdb-icons/25.png",
  31: "/lhdb-icons/31.png",
  32: "/lhdb-icons/32.png",
  33: "/lhdb-icons/33.png",
  34: "/lhdb-icons/34.png",
  35: "/lhdb-icons/35.png",
});

export default {
  name: "LhdbRecordView",
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
        label: "第1页",
        columns: 4,
        rows: 4,
        icons: [],
        winAreas: [],
      };
    },
    currentWinAreas() {
      return Array.isArray(this.currentRound.winAreas) ? this.currentRound.winAreas : [];
    },
    activeArea() {
      return this.currentWinAreas[this.activeLineIndex] || null;
    },
    highlightedCells() {
      const set = new Set();
      this.currentWinAreas.forEach((area) => {
        (Array.isArray(area && area.highlightKeys) ? area.highlightKeys : []).forEach((item) => set.add(String(item)));
      });
      return set;
    },
    hasHighlight() {
      return this.highlightedCells.size > 0;
    },
    boardStyle() {
      return {
        gridTemplateColumns: `repeat(${this.currentRound.columns || 4}, minmax(0, 1fr))`,
      };
    },
    boardCells() {
      const columns = Number(this.currentRound.columns || 0);
      const rows = Number(this.currentRound.rows || 0);
      const total = columns * rows;
      const icons = Array.isArray(this.currentRound.icons) ? this.currentRound.icons : [];
      const hasKeyCells = !!this.currentRound.hasKeyCells;
      return Array.from({ length: total }, (_, displayIndex) => {
        const displayRow = Math.floor(displayIndex / columns);
        const displayColumn = displayIndex % columns;
        const sourceRow = rows - 1 - displayRow;
        const sourceIndex = sourceRow * columns + displayColumn;
        const icon = icons[sourceIndex] || null;
        return {
          key: `${this.roundIndex}-${sourceIndex}`,
          indexKey: String(sourceIndex + 1),
          icon,
          sprite: this.getBoardSprite(icon, hasKeyCells),
          isHighlight: hasKeyCells
            ? Number(icon && icon.typeId) === 0
            : this.highlightedCells.has(String(sourceIndex + 1)),
          isDimmed: hasKeyCells
            ? Number(icon && icon.typeId) !== 0
            : this.hasHighlight && !this.highlightedCells.has(String(sourceIndex + 1)),
        };
      });
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
    getFrame(target) {
      const imageId = target && target.imageId !== undefined && target.imageId !== null ? Number(target.imageId) : null;
      if (!Number.isFinite(imageId)) return null;
      return LHDB_ICON_SRC[imageId] || null;
    },
    getBoardFrame(target, hasKeyCells) {
      if (!target) return null;
      if (hasKeyCells && Number(target.typeId) === 0) {
        return LHDB_ICON_SRC[0] || null;
      }
      return this.getFrame(target);
    },
    buildSprite(src, size) {
      if (!src) return null;
      return {
        containerStyle: {
          width: `${size}px`,
          height: `${size}px`,
        },
        src,
      };
    },
    getSprite(target, size = 38) {
      return this.buildSprite(this.getFrame(target), size);
    },
    getBoardSprite(target, hasKeyCells) {
      const isKey = hasKeyCells && Number(target && target.typeId) === 0;
      return this.buildSprite(this.getBoardFrame(target, hasKeyCells), isKey ? 60 : 50);
    },
    getAreaSprite(area) {
      return this.getSprite(area ? { imageId: area.imageId } : null, 30);
    },
  },
};
</script>

<style scoped>
.lhdb-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lhdb-topline,
.lhdb-toolbar,
.lhdb-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.lhdb-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
  overflow-x: auto;
}

.lhdb-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
  min-width: 520px;
}

.lhdb-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.lhdb-metric-label,
.lhdb-detail-label {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.lhdb-metric-value,
.lhdb-detail-value {
  display: block;
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
  word-break: break-all;
}

.lhdb-status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.lhdb-status-title {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(180, 83, 9, 0.08);
  font-size: 12px;
  font-weight: 700;
}

.lhdb-status-sub {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  color: #9a3412;
  font-size: 11px;
  overflow-x: auto;
}

.lhdb-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.lhdb-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.lhdb-round-strip {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
}

.lhdb-round-chip,
.lhdb-line-item {
  border: 0;
  cursor: pointer;
}

.lhdb-round-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 92px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  text-align: left;
  font-size: 11px;
  white-space: nowrap;
  flex: 0 0 auto;
}

.lhdb-round-chip strong {
  color: #0f172a;
  font-size: 12px;
}

.lhdb-round-chip.is-active {
  background: #0f172a;
  color: #cbd5e1;
}

.lhdb-round-chip.is-active strong {
  color: #f8fafc;
}

.lhdb-round-brief {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.08);
  white-space: nowrap;
  flex: 0 0 auto;
}

.lhdb-round-brief-title {
  color: #7c2d12;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.lhdb-round-brief-meta {
  display: flex;
  gap: 6px;
  color: #9a3412;
  font-size: 10px;
  line-height: 1;
}

.lhdb-round-brief-meta span {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
}

.lhdb-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 290px;
  gap: 10px;
  align-items: start;
}

.lhdb-board-shell {
  position: relative;
  width: 100%;
  padding: 12px;
  border-radius: 16px;
  background: radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.08), transparent 38%),
    linear-gradient(135deg, #3b1808, #5b2410 60%, #733013);
  overflow: hidden;
}

.lhdb-board {
  display: grid;
  gap: 8px;
}

.lhdb-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 88px;
  padding: 8px 6px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04));
  color: #fff7ed;
  text-align: center;
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
}

.lhdb-cell.is-empty {
  opacity: 0.16;
}

.lhdb-cell.is-dragon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.42), rgba(180, 83, 9, 0.36));
}

.lhdb-cell.is-key {
  background: linear-gradient(135deg, rgba(253, 230, 138, 0.95), rgba(249, 115, 22, 0.88));
}

.lhdb-cell.is-highlight {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #111827;
  box-shadow: 0 6px 14px rgba(249, 115, 22, 0.22);
}

.lhdb-cell.is-dimmed {
  opacity: 0.28;
}

.lhdb-cell-index {
  position: absolute;
  left: 6px;
  top: 6px;
  font-size: 10px;
  font-weight: 700;
  opacity: 0.7;
}

.lhdb-cell-icon {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

.lhdb-icon-sprite {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.lhdb-icon-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.lhdb-icon-sprite-inner {
  display: block;
}

.lhdb-cell-name {
  margin-top: 4px;
  font-size: 10px;
  line-height: 1.2;
}

.lhdb-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lhdb-panel-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.lhdb-line-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 6px;
  overflow-x: auto;
}

.lhdb-line-item {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  gap: 6px;
  white-space: nowrap;
  flex: 0 0 auto;
}

.lhdb-line-icon,
.lhdb-detail-icon {
  flex: 0 0 auto;
}

.lhdb-line-item strong {
  margin-left: 2px;
}

.lhdb-line-item.is-active {
  background: #0f172a;
  color: #f8fafc;
}

.lhdb-detail-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 8px;
  overflow-x: auto;
}

.lhdb-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.05);
  white-space: nowrap;
  flex: 0 0 auto;
}

.lhdb-detail-chip-wide {
  min-width: 220px;
}

.lhdb-detail-chip .lhdb-detail-label,
.lhdb-detail-chip .lhdb-detail-value {
  display: inline;
  margin-top: 0;
}

.lhdb-empty {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 6px;
}

@media (max-width: 1100px) {
  .lhdb-stage {
    grid-template-columns: 1fr;
  }

  .lhdb-topline {
    display: block;
  }

  .lhdb-metrics {
    min-width: 0;
  }

  .lhdb-status {
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .lhdb-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
