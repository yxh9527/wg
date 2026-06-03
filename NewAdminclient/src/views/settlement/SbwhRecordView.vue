<template>
  <div class="sbwh-view">
    <div class="sbwh-topline">
      <div class="sbwh-metrics">
        <div class="sbwh-metric">
          <span class="sbwh-metric-label">单注</span>
          <span class="sbwh-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="sbwh-metric">
          <span class="sbwh-metric-label">倍数</span>
          <span class="sbwh-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="sbwh-metric">
          <span class="sbwh-metric-label">总投注</span>
          <span class="sbwh-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="sbwh-metric">
          <span class="sbwh-metric-label">总输赢</span>
          <span class="sbwh-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="sbwh-status">
        <div class="sbwh-status-title">固定 4x3 盘面</div>
        <div class="sbwh-status-sub">
          <span>图标 {{ view.cells.length }}</span>
          <span>中奖线 {{ view.winAreas.length }}</span>
        </div>
      </div>
    </div>

    <div class="sbwh-stage">
      <div class="sbwh-board-panel">
        <div class="sbwh-board">
          <div
            v-for="cell in view.cells"
            :key="cell.index"
            class="sbwh-cell"
            :class="{
              'is-highlight': activeArea && activeArea.highlightKeys && activeArea.highlightKeys.includes(`${cell.column}-${cell.row}`),
              'is-dimmed': hasHighlight && !(activeArea && activeArea.highlightKeys && activeArea.highlightKeys.includes(`${cell.column}-${cell.row}`)),
            }"
          >
            <atlas-sprite
              v-if="cellAtlas(cell)"
              class="sbwh-cell-icon"
              :atlas="cellAtlas(cell)"
              :frame-key="cell.icon"
              :max-width="78"
              :max-height="78"
            />
            <span v-else class="sbwh-fallback">{{ iconLabel(cell.icon) }}</span>
          </div>
        </div>
      </div>

      <div class="sbwh-sidebar">
        <div class="sbwh-panel">
          <div class="sbwh-panel-title">中奖线</div>
          <div v-if="view.winAreas.length" class="sbwh-line-list">
            <button
              v-for="(area, index) in view.winAreas"
              :key="`${area.betAreaId}-${index}`"
              type="button"
              class="sbwh-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span class="sbwh-line-id">{{ formatLineId(area.betAreaId) }}</span>
              <span class="sbwh-line-frame">
                <atlas-sprite
                  v-if="hasLineAsset(area.betAreaId)"
                  :atlas="view.lineAtlas"
                  :frame-key="area.betAreaId"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="sbwh-line-icon">
                <atlas-sprite
                  v-if="hasIconAsset(area.iconId)"
                  :atlas="view.iconAtlas"
                  :frame-key="area.iconId"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <strong class="sbwh-line-win">+{{ formatMoney(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="sbwh-empty">当前牌局没有中奖组合</div>
        </div>

        <div class="sbwh-panel">
          <div class="sbwh-panel-title">当前中奖明细</div>
          <div v-if="activeArea" class="sbwh-detail-list">
            <div class="sbwh-detail-chip">
              <span class="sbwh-detail-label">线号</span>
              <span class="sbwh-detail-value">{{ formatLineId(activeArea.betAreaId) }}</span>
            </div>
            <div class="sbwh-detail-chip">
              <span class="sbwh-detail-label">图标</span>
              <span class="sbwh-detail-icon">
                <atlas-sprite
                  v-if="hasIconAsset(activeArea.iconId)"
                  :atlas="view.iconAtlas"
                  :frame-key="activeArea.iconId"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="sbwh-detail-value">{{ iconLabel(activeArea.iconId) }}</span>
            </div>
            <div class="sbwh-detail-chip">
              <span class="sbwh-detail-label">数量</span>
              <span class="sbwh-detail-value">{{ activeArea.num || 0 }}</span>
            </div>
            <div class="sbwh-detail-chip">
              <span class="sbwh-detail-label">中奖</span>
              <span class="sbwh-detail-value">+{{ formatMoney(activeArea.winLoseGold) }}</span>
            </div>
            <div class="sbwh-detail-chip sbwh-detail-chip-wide">
              <span class="sbwh-detail-label">公式</span>
              <span class="sbwh-detail-value">{{ activeArea.formula }}</span>
            </div>
          </div>
          <div v-else class="sbwh-empty">当前牌局没有中奖明细</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";
import AtlasSprite from "./AtlasSprite.vue";

export default {
  name: "SbwhRecordView",
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
      activeLineIndex: 0,
    };
  },
  computed: {
    activeArea() {
      return this.view.winAreas[this.activeLineIndex] || null;
    },
    hasHighlight() {
      return !!(this.activeArea && Array.isArray(this.activeArea.highlightKeys) && this.activeArea.highlightKeys.length);
    },
  },
  methods: {
    formatMoney(value) {
      return toMoney(value || 0);
    },
    hasIconAsset(icon) {
      return !!(this.view && this.view.iconAtlas && this.view.iconAtlas.frames && this.view.iconAtlas.frames[String(icon)]);
    },
    hasLineAsset(lineId) {
      return !!(this.view && this.view.lineAtlas && this.view.lineAtlas.frames && this.view.lineAtlas.frames[String(lineId)]);
    },
    cellAtlas(cell) {
      if (!cell || !this.hasIconAsset(cell.icon)) return null;
      const highlighted =
        this.activeArea &&
        Array.isArray(this.activeArea.highlightKeys) &&
        this.activeArea.highlightKeys.includes(`${cell.column}-${cell.row}`);
      if (!this.hasHighlight || highlighted) return this.view.iconAtlas;
      return this.view.fuzzyAtlas || this.view.iconAtlas;
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
      if (!Number.isFinite(value)) return "--";
      return value < 10 ? `0${value}:` : `${value}:`;
    },
  },
};
</script>

<style scoped>
.sbwh-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sbwh-topline,
.sbwh-board-panel,
.sbwh-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.sbwh-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.sbwh-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
}

.sbwh-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.sbwh-metric-label,
.sbwh-detail-label {
  color: #64748b;
  font-size: 11px;
}

.sbwh-metric-value,
.sbwh-detail-value {
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
}

.sbwh-status {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 170px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.sbwh-status-title {
  font-size: 12px;
  font-weight: 700;
}

.sbwh-status-sub {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 11px;
}

.sbwh-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.sbwh-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 10px;
}

.sbwh-board {
  display: grid;
  grid-template-columns: repeat(4, 88px);
  gap: 8px 8px;
  justify-content: center;
}

.sbwh-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 12px;
  background: radial-gradient(circle at 50% 36%, rgba(255, 255, 255, 0.95), rgba(241, 245, 249, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.14);
  transition: opacity 0.15s ease, border-color 0.15s ease;
}

.sbwh-cell.is-highlight {
  border-color: rgba(249, 115, 22, 0.36);
  box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.18);
}

.sbwh-cell.is-dimmed {
  opacity: 0.54;
}

.sbwh-fallback {
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.sbwh-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sbwh-panel-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.sbwh-line-list,
.sbwh-detail-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
}

.sbwh-line-item,
.sbwh-detail-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 5px 7px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #ffffff;
  white-space: nowrap;
}

.sbwh-line-item {
  width: auto;
  min-width: 94px;
  color: #334155;
  cursor: pointer;
  text-align: left;
  flex: 0 0 auto;
}

.sbwh-line-item.is-active {
  border-color: rgba(249, 115, 22, 0.35);
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  color: #9a3412;
}

.sbwh-line-id {
  width: 24px;
  font-size: 11px;
  font-weight: 700;
}

.sbwh-line-frame,
.sbwh-line-icon,
.sbwh-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
}

.sbwh-line-win {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
}

.sbwh-detail-chip {
  flex: 0 0 auto;
}

.sbwh-detail-chip-wide {
  min-width: 190px;
}

.sbwh-empty {
  min-height: 36px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px dashed rgba(148, 163, 184, 0.22);
  color: #94a3b8;
  font-size: 12px;
  display: flex;
  align-items: center;
}

@media (max-width: 1080px) {
  .sbwh-topline {
    flex-direction: column;
  }

  .sbwh-stage {
    grid-template-columns: 1fr;
  }

  .sbwh-metrics {
    grid-template-columns: repeat(2, minmax(110px, 1fr));
  }
}
</style>
