<template>
  <div class="fkseven-view">
    <div class="fkseven-topline">
      <div class="fkseven-metrics">
        <div class="fkseven-metric">
          <span class="fkseven-metric-label">单注</span>
          <span class="fkseven-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="fkseven-metric">
          <span class="fkseven-metric-label">倍数</span>
          <span class="fkseven-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="fkseven-metric">
          <span class="fkseven-metric-label">总投注</span>
          <span class="fkseven-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="fkseven-metric">
          <span class="fkseven-metric-label">总输赢</span>
          <span class="fkseven-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="fkseven-status">
        <div class="fkseven-status-title">{{ view.hasWin ? "已中奖" : "未中奖" }}</div>
        <div class="fkseven-status-sub">
          <span>主盘 4 列</span>
          <span>特殊列 {{ view.specialLabel || "-" }}</span>
        </div>
      </div>
    </div>

    <div class="fkseven-stage">
      <div class="fkseven-board-panel">
        <div class="fkseven-board">
          <div
            v-for="column in view.columns"
            :key="column.columnIndex"
            class="fkseven-column"
            :class="{ 'is-single': isSingleColumn(column) }"
          >
            <div
              v-for="(iconId, rowIndex) in column.rows"
              :key="`${column.columnIndex}-${rowIndex}`"
              class="fkseven-slot"
              :class="{
                'is-empty': !iconId,
                'is-main': rowIndex === 1,
                'is-side': rowIndex !== 1,
                'is-top': rowIndex === 0,
                'is-middle': rowIndex === 1,
                'is-bottom': rowIndex === 2,
              }"
            >
              <div v-if="iconId" class="fkseven-sprite-wrap">
                <atlas-sprite
                  :atlas="spriteAtlas(column, rowIndex, iconId)"
                  :frame-key="iconId"
                  :max-width="60"
                  :max-height="46"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="fkseven-sidebar">
        <div class="fkseven-panel">
          <div class="fkseven-panel-title">特殊列</div>
          <div class="fkseven-special">
            <atlas-sprite
              v-if="view.specialIconId"
              :atlas="view.iconAtlas"
              :frame-key="view.specialIconId"
              :max-width="72"
              :max-height="56"
            />
            <span class="fkseven-special-label">{{ view.specialLabel || "-" }}</span>
          </div>
        </div>

        <div class="fkseven-panel">
          <div class="fkseven-panel-title">当前中奖明细</div>
          <div class="fkseven-detail-row">
            <div class="fkseven-chip">
              <span class="fkseven-chip-label">区域</span>
              <span class="fkseven-chip-value">{{ view.rewardItem.betAreaId || "-" }}</span>
            </div>
            <div class="fkseven-chip">
              <span class="fkseven-chip-label">中奖</span>
              <span class="fkseven-chip-value">+{{ formatMoney(view.rewardItem.winLoseGold) }}</span>
            </div>
            <div class="fkseven-chip fkseven-chip-wide">
              <span class="fkseven-chip-label">公式</span>
              <span class="fkseven-chip-value">{{ view.rewardItem.formula || "-" }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";
import AtlasSprite from "./AtlasSprite.vue";

export default {
  name: "FksevenRecordView",
  components: {
    AtlasSprite,
  },
  props: {
    view: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatMoney(value) {
      return toMoney(value || 0);
    },
    isSingleColumn(column) {
      const rows = Array.isArray(column && column.rows) ? column.rows : [];
      return !!rows[1] && !rows[0] && !rows[2];
    },
    spriteAtlas(column, rowIndex, iconId) {
      if (!iconId) return this.view.iconAtlas;
      if (this.isSingleColumn(column) && rowIndex !== 1) {
        return this.view.fuzzyAtlas || this.view.iconAtlas;
      }
      return this.view.iconAtlas;
    },
  },
};
</script>

<style scoped>
.fkseven-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fkseven-topline,
.fkseven-board-panel,
.fkseven-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.fkseven-topline {
  display: flex;
  gap: 8px;
}

.fkseven-metrics {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
}

.fkseven-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.fkseven-metric-label,
.fkseven-chip-label {
  color: #64748b;
  font-size: 11px;
}

.fkseven-metric-value,
.fkseven-chip-value {
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
}

.fkseven-status {
  width: 220px;
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.fkseven-status-title {
  font-size: 12px;
  font-weight: 700;
}

.fkseven-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
}

.fkseven-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.fkseven-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.9fr);
  gap: 10px;
}

.fkseven-board {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  gap: 10px;
  justify-content: center;
}

.fkseven-column {
  display: grid;
  grid-template-rows: 24px 58px 24px;
  gap: 4px;
  width: 100px;
  min-height: 140px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
}

.fkseven-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 58px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.92);
  overflow: hidden;
}

.fkseven-sprite-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 46px;
  transition: transform 0.2s ease;
}

.fkseven-slot.is-top,
.fkseven-slot.is-bottom {
  height: 24px;
}

.fkseven-slot.is-top .fkseven-sprite-wrap {
  align-items: flex-start;
  transform: translateY(-11px);
}

.fkseven-slot.is-middle .fkseven-sprite-wrap {
  transform: translateY(0);
}

.fkseven-slot.is-bottom .fkseven-sprite-wrap {
  align-items: flex-end;
  transform: translateY(11px);
}

.fkseven-slot.is-side {
  background: rgba(248, 250, 252, 0.92);
}

.fkseven-slot.is-main {
  background: rgba(255, 237, 213, 0.88);
}

.fkseven-slot.is-empty {
  background: rgba(241, 245, 249, 0.72);
}

.fkseven-column.is-single .fkseven-slot.is-side {
  opacity: 0.56;
}

.fkseven-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fkseven-panel-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.fkseven-special {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fkseven-special-label {
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.fkseven-detail-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
}

.fkseven-chip {
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

.fkseven-chip-wide {
  min-width: 240px;
}

@media (max-width: 1080px) {
  .fkseven-topline {
    flex-direction: column;
  }

  .fkseven-stage {
    grid-template-columns: 1fr;
  }

  .fkseven-metrics {
    grid-template-columns: repeat(2, minmax(110px, 1fr));
  }

  .fkseven-status {
    width: auto;
    flex: 1 1 auto;
  }
}
</style>
