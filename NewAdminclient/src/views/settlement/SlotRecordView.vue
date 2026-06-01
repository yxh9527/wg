<template>
  <div class="slot-view">
    <div class="slot-topline">
      <div class="slot-metrics">
        <div class="slot-metric">
          <span class="slot-metric-label">单注</span>
          <span class="slot-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="slot-metric">
          <span class="slot-metric-label">倍数</span>
          <span class="slot-metric-value">{{ view.betTimes }}</span>
        </div>
        <div class="slot-metric">
          <span class="slot-metric-label">总下注</span>
          <span class="slot-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="slot-metric">
          <span class="slot-metric-label">总输赢</span>
          <span class="slot-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="slot-status">
        <div class="slot-status-title">当前回合</div>
        <div class="slot-status-sub">
          <span>{{ currentRound.label }}</span>
          <span>图标 {{ currentRound.icons.length }}</span>
          <span>中奖线 {{ view.winAreas.length }}</span>
        </div>
      </div>
    </div>

    <div v-if="view.rounds.length > 1" class="slot-round-strip">
      <button
        v-for="(round, index) in view.rounds"
        :key="`${round.label}-${index}`"
        type="button"
        class="slot-round-chip"
        :class="{ 'is-active': index === roundIndex }"
        @click="roundIndex = index"
      >
        <span>{{ round.label }}</span>
        <strong>{{ round.icons.length }}</strong>
      </button>
    </div>

    <div class="slot-stage">
      <div class="slot-board-shell">
        <div class="slot-board" :style="boardStyle">
          <div
            v-for="cell in boardCells"
            :key="cell.key"
            class="slot-cell"
            :class="{ 'is-match': activeArea && String(activeArea.iconId) === String(cell.icon) }"
          >
            <span>{{ iconLabel(cell.icon) }}</span>
          </div>
        </div>
      </div>

      <div class="slot-panel">
        <div class="slot-panel-title">当前回合</div>
        <div class="slot-side-item">
          <span>图标数</span>
          <strong>{{ currentRound.icons.length }}</strong>
        </div>
        <div class="slot-side-item">
          <span>中奖线</span>
          <strong>{{ view.winAreas.length }}</strong>
        </div>
        <div v-if="currentRound.raw" class="slot-side-raw">{{ currentRound.raw }}</div>
      </div>
    </div>

    <div class="slot-panel">
      <div class="slot-panel-title">中奖线</div>
      <div v-if="view.winAreas.length" class="slot-line-list">
        <button
          v-for="(area, index) in view.winAreas"
          :key="`${area.betAreaId}-${index}`"
          type="button"
          class="slot-line-item"
          :class="{ 'is-active': index === activeLineIndex }"
          @click="activeLineIndex = index"
        >
          <span>#{{ index + 1 }}</span>
          <span>{{ iconLabel(area.iconId) }}</span>
          <strong>{{ formatMoney(area.winLoseGold) }}</strong>
        </button>
      </div>
      <div v-else class="slot-empty">当前注单无中奖线</div>
    </div>

    <div v-if="activeArea" class="slot-panel">
      <div class="slot-panel-title">当前中奖线明细</div>
      <div class="slot-detail-grid">
        <div class="slot-detail-item">
          <span class="slot-detail-label">区域ID</span>
          <span class="slot-detail-value">{{ activeArea.betAreaId }}</span>
        </div>
        <div class="slot-detail-item">
          <span class="slot-detail-label">图标ID</span>
          <span class="slot-detail-value">{{ activeArea.iconId }}</span>
        </div>
        <div class="slot-detail-item">
          <span class="slot-detail-label">数量</span>
          <span class="slot-detail-value">{{ activeArea.num }}</span>
        </div>
        <div class="slot-detail-item">
          <span class="slot-detail-label">线倍数</span>
          <span class="slot-detail-value">{{ activeArea.betMultiple }}</span>
        </div>
        <div class="slot-detail-item">
          <span class="slot-detail-label">图标倍数</span>
          <span class="slot-detail-value">{{ activeArea.iconMultiple }}</span>
        </div>
        <div class="slot-detail-item">
          <span class="slot-detail-label">输赢</span>
          <span class="slot-detail-value">{{ formatMoney(activeArea.winLoseGold) }}</span>
        </div>
        <div class="slot-detail-item is-wide">
          <span class="slot-detail-label">线位</span>
          <span class="slot-detail-value">{{ activeArea.linePosText || "-" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";

const GRID_COLUMNS_BY_COUNT = {
  9: 3,
  12: 4,
  15: 5,
  18: 6,
  20: 5,
  24: 6,
  25: 5,
  30: 6,
};

export default {
  name: "SlotRecordView",
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
      return this.view.rounds[this.roundIndex] || { icons: [], raw: "", label: "第 1 回合" };
    },
    activeArea() {
      return this.view.winAreas[this.activeLineIndex] || null;
    },
    boardColumns() {
      const count = this.currentRound.icons.length;
      if (GRID_COLUMNS_BY_COUNT[count]) return GRID_COLUMNS_BY_COUNT[count];
      if (count <= 12) return 4;
      if (count <= 20) return 5;
      return 6;
    },
    boardStyle() {
      return {
        gridTemplateColumns: `repeat(${this.boardColumns}, minmax(0, 1fr))`,
      };
    },
    boardCells() {
      return (this.currentRound.icons || []).map((icon, index) => ({
        key: `${this.roundIndex}-${index}`,
        icon,
      }));
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
    iconLabel(icon) {
      if (icon === null || icon === undefined || icon === "") return "-";
      const value = Number(icon);
      if (Number.isNaN(value)) return String(icon);
      return value > 40 ? `${value - 40}+` : String(value);
    },
  },
};
</script>

<style scoped>
.slot-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slot-topline,
.slot-round-strip,
.slot-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.slot-topline {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: stretch;
  overflow-x: auto;
}

.slot-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
  min-width: 520px;
}

.slot-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.slot-metric-label,
.slot-detail-label {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.slot-metric-value,
.slot-detail-value {
  display: block;
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-all;
}

.slot-status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  padding: 6px 8px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: 10px;
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.slot-status-title {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(180, 83, 9, 0.08);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.slot-status-sub {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  color: #9a3412;
  font-size: 11px;
  overflow-x: auto;
}

.slot-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.slot-round-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.slot-round-chip,
.slot-line-item {
  border: 0;
  cursor: pointer;
}

.slot-round-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  font-size: 12px;
}

.slot-round-chip strong {
  color: #0f172a;
  font-size: 12px;
}

.slot-round-chip.is-active {
  background: #0f172a;
  color: #e2e8f0;
}

.slot-round-chip.is-active strong {
  color: #fff;
}

.slot-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: 10px;
  align-items: start;
}

.slot-board-shell {
  padding: 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0b1525, #15263f 62%, #203452);
}

.slot-board {
  display: grid;
  gap: 8px;
}

.slot-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03));
  color: #f8fafc;
  font-size: 12px;
  font-weight: 700;
}

.slot-cell.is-match {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #111827;
}

.slot-panel-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.slot-side-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  color: #475569;
  font-size: 12px;
}

.slot-side-item strong {
  color: #0f172a;
  font-size: 13px;
}

.slot-side-raw {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 10px;
  line-height: 1.4;
  word-break: break-all;
}

.slot-line-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 6px;
  margin-top: 8px;
}

.slot-line-item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  text-align: left;
  font-size: 11px;
}

.slot-line-item strong {
  color: #0f172a;
}

.slot-line-item.is-active {
  background: #0f172a;
  color: #f8fafc;
}

.slot-line-item.is-active strong {
  color: #fff;
}

.slot-detail-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.slot-detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.slot-detail-item.is-wide {
  grid-column: 1 / -1;
}

.slot-empty {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 900px) {
  .slot-metrics,
  .slot-stage,
  .slot-detail-grid {
    grid-template-columns: 1fr;
  }

  .slot-topline {
    display: block;
  }

  .slot-metrics {
    min-width: 0;
  }

  .slot-status {
    margin-top: 8px;
  }
}
</style>
