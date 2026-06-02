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
          <span class="slot-metric-label">总投注</span>
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
          <span v-if="currentRound.timestamp">{{ formatDate(currentRound.timestamp) }}</span>
          <span>图标 {{ currentRound.icons.length }}</span>
          <span>中奖线 {{ currentWinAreas.length }}</span>
        </div>
      </div>
    </div>

    <div class="slot-toolbar">
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
          <strong>{{ formatMoney(round.winLoseGold || 0) }}</strong>
        </button>
      </div>

      <div class="slot-round-brief">
        <div class="slot-round-brief-title">{{ currentRound.label }}</div>
        <div class="slot-round-brief-meta">
          <span>盘面 {{ currentRound.columns }}x{{ currentRound.rows }}</span>
          <span>图标 {{ currentRound.icons.length }}</span>
          <span>中奖线 {{ currentWinAreas.length }}</span>
        </div>
      </div>
    </div>

    <div class="slot-stage">
      <div class="slot-board-shell">
        <div class="slot-board" :style="boardStyle">
          <div
            v-for="cell in boardCells"
            :key="cell.key"
            class="slot-cell"
            :class="{
              'is-highlight': activeArea && activeArea.highlightKeys.includes(cell.coordKey),
              'is-dimmed': hasHighlight && !(activeArea && activeArea.highlightKeys.includes(cell.coordKey)),
            }"
          >
            <atlas-sprite
              v-if="hasIconAsset(cell.icon)"
              class="slot-cell-icon"
              :atlas="view.iconAtlas"
              :frame-key="cell.icon"
              :max-width="46"
              :max-height="46"
            />
            <span v-else>{{ iconLabel(cell.icon) }}</span>
          </div>
        </div>
      </div>

      <div class="slot-sidebar">
        <div class="slot-panel">
          <div class="slot-panel-title">中奖线</div>
          <div v-if="currentWinAreas.length" class="slot-line-list">
            <button
              v-for="(area, index) in currentWinAreas"
              :key="`${roundIndex}-${area.betAreaId}-${index}`"
              type="button"
              class="slot-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span v-if="hasIconAsset(area.iconId)" class="slot-line-icon">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="area.iconId"
                  :max-width="24"
                  :max-height="24"
                />
              </span>
              <span class="slot-line-index">{{ index + 1 }}</span>
              <span>{{ buildAreaTitle(area) }}</span>
              <span class="slot-line-count">x{{ area.num || "-" }}</span>
              <strong class="slot-line-win">+{{ formatMoney(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="slot-empty">当前回合没有中奖线</div>
        </div>
      </div>
    </div>

    <div class="slot-panel slot-detail-panel">
      <div class="slot-panel-title">当前中奖明细</div>
      <div v-if="activeArea" class="slot-detail-row">
        <div class="slot-detail-chip">
          <span class="slot-detail-label">区域</span>
          <span class="slot-detail-value">{{ activeArea.betAreaId || "-" }}</span>
        </div>
        <div class="slot-detail-chip">
          <span v-if="hasIconAsset(activeArea.iconId)" class="slot-detail-icon">
            <atlas-sprite
              :atlas="view.iconAtlas"
              :frame-key="activeArea.iconId"
              :max-width="24"
              :max-height="24"
            />
          </span>
          <span class="slot-detail-label">图标</span>
          <span class="slot-detail-value">{{ hasIconAsset(activeArea.iconId) ? "" : iconLabel(activeArea.iconId) }}</span>
        </div>
        <div class="slot-detail-chip">
          <span class="slot-detail-label">数量</span>
          <span class="slot-detail-value">{{ activeArea.num || "-" }}</span>
        </div>
        <div class="slot-detail-chip">
          <span class="slot-detail-label">线倍数</span>
          <span class="slot-detail-value">{{ activeArea.betMultiple || "-" }}</span>
        </div>
        <div class="slot-detail-chip">
          <span class="slot-detail-label">图标倍数</span>
          <span class="slot-detail-value">{{ activeArea.iconMultiple || "-" }}</span>
        </div>
        <div class="slot-detail-chip">
          <span class="slot-detail-label">中奖</span>
          <span class="slot-detail-value">+{{ formatMoney(activeArea.winLoseGold) }}</span>
        </div>
        <div class="slot-detail-chip slot-detail-chip-wide">
          <span class="slot-detail-label">线位</span>
          <span class="slot-detail-value">{{ activeArea.linePosText || "-" }}</span>
        </div>
      </div>
      <div v-else class="slot-empty slot-detail-empty">当前回合没有中奖明细</div>
    </div>
  </div>
</template>

<script>
import { formatUnixDateTime, toMoney } from "./settlementHelpers";
import AtlasSprite from "./AtlasSprite.vue";

export default {
  name: "SlotRecordView",
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
      return this.view.rounds[this.roundIndex] || {
        icons: [],
        raw: "",
        label: "第 1 回合",
        columns: 5,
        rows: 3,
        winAreas: [],
      };
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
    boardStyle() {
      return {
        gridTemplateColumns: `repeat(${this.currentRound.columns || 5}, 64px)`,
      };
    },
    boardCells() {
      const icons = Array.isArray(this.currentRound.icons) ? this.currentRound.icons : [];
      const columns = Number(this.currentRound.columns || 5);
      return icons.map((icon, index) => ({
        key: `${this.roundIndex}-${index}`,
        icon,
        coordKey: `${Math.floor(index / columns)}-${index % columns}`,
      }));
    },
  },
  watch: {
    roundIndex() {
      this.activeLineIndex = 0;
    },
  },
  methods: {
    hasIconAsset(icon) {
      return !!(
        this.view &&
        this.view.iconAtlas &&
        this.view.iconAtlas.frames &&
        this.view.iconAtlas.frames[String(icon)]
      );
    },
    formatMoney(value) {
      return toMoney(value || 0);
    },
    formatDate(value) {
      return formatUnixDateTime(value);
    },
    iconLabel(icon) {
      if (icon === null || icon === undefined || icon === "") return "-";
      if (this.view.iconNameMap && Object.prototype.hasOwnProperty.call(this.view.iconNameMap, icon)) {
        return this.view.iconNameMap[icon];
      }
      const value = Number(icon);
      if (Number.isNaN(value)) return String(icon);
      return value > 40 ? `${value - 40}+` : String(value);
    },
    buildAreaTitle(area) {
      if (!area) return "-";
      if (area.betAreaId !== "" && area.betAreaId !== null && area.betAreaId !== undefined) {
        return `线 ${area.betAreaId}`;
      }
      return `图标 ${this.iconLabel(area.iconId)}`;
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
.slot-toolbar,
.slot-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.slot-topline {
  display: flex;
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
  line-height: 1.35;
  font-weight: 700;
  word-break: break-all;
}

.slot-status {
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

.slot-status-title {
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

.slot-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.slot-round-strip {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
}

.slot-round-chip,
.slot-line-item {
  border: 0;
  cursor: pointer;
}

.slot-round-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 58px;
  padding: 8px 8px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  text-align: left;
  font-size: 11px;
  white-space: nowrap;
  flex: 0 0 auto;
}

.slot-round-chip strong {
  color: #0f172a;
  font-size: 12px;
}

.slot-round-chip.is-active {
  background: #0f172a;
  color: #cbd5e1;
}

.slot-round-chip.is-active strong {
  color: #f8fafc;
}

.slot-round-brief {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.08);
  white-space: nowrap;
  flex: 0 0 auto;
}

.slot-round-brief-title {
  color: #7c2d12;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.slot-round-brief-meta {
  display: flex;
  gap: 6px;
  color: #9a3412;
  font-size: 10px;
  line-height: 1;
}

.slot-round-brief-meta span {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
}

.slot-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 290px;
  gap: 10px;
  align-items: start;
}

.slot-board-shell {
  position: relative;
  width: 100%;
  padding: 12px;
  border-radius: 16px;
  background: radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.08), transparent 38%),
    linear-gradient(135deg, #0b1525, #15263f 62%, #203452);
  overflow: hidden;
}

.slot-board {
  display: grid;
  gap: 8px;
  width: max-content;
}

.slot-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  min-height: 64px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03));
  color: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
}

.slot-cell-icon {
  flex: 0 0 auto;
}

.slot-cell.is-highlight {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #111827;
  box-shadow: 0 6px 14px rgba(249, 115, 22, 0.22);
}

.slot-cell.is-dimmed {
  opacity: 0.28;
}

.slot-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slot-panel-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.slot-line-list,
.slot-detail-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 6px;
  overflow-x: auto;
}

.slot-line-item {
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

.slot-line-item.is-active {
  background: #0f172a;
  color: #f8fafc;
}

.slot-line-index {
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

.slot-line-item.is-active .slot-line-index {
  background: rgba(255, 255, 255, 0.18);
}

.slot-line-icon,
.slot-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.slot-line-count,
.slot-line-win {
  color: inherit;
}

.slot-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.05);
  white-space: nowrap;
  flex: 0 0 auto;
}

.slot-detail-chip-wide {
  min-width: 220px;
}

.slot-detail-chip .slot-detail-label,
.slot-detail-chip .slot-detail-value {
  display: inline;
  margin-top: 0;
}

.slot-empty {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 6px;
}

.slot-detail-panel {
  min-height: 76px;
}

.slot-detail-empty {
  display: flex;
  align-items: center;
  min-height: 44px;
}

@media (max-width: 1100px) {
  .slot-stage {
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

@media (max-width: 768px) {
  .slot-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
