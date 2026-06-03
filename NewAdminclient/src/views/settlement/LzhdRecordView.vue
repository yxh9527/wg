<template>
  <div class="lzhd-view">
    <div class="lzhd-topline">
      <div class="lzhd-metrics">
        <div class="lzhd-metric">
          <span class="lzhd-metric-label">单注</span>
          <span class="lzhd-metric-value">{{ formatMoney(view.lineBetGold) }}</span>
        </div>
        <div class="lzhd-metric">
          <span class="lzhd-metric-label">倍数</span>
          <span class="lzhd-metric-value">{{ view.lineBetTimes || 0 }}</span>
        </div>
        <div class="lzhd-metric">
          <span class="lzhd-metric-label">总投注</span>
          <span class="lzhd-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="lzhd-metric">
          <span class="lzhd-metric-label">总输赢</span>
          <span class="lzhd-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="lzhd-status">
        <div class="lzhd-status-title">龙虎对开</div>
        <div class="lzhd-status-sub">
          <span>龙列 {{ dragonColumns.length }}</span>
          <span>虎列 {{ tigerColumns.length }}</span>
          <span v-if="view.showDouble">双轴 +{{ formatMoney(view.battleWinLoseGold) }}</span>
        </div>
      </div>
    </div>

    <div class="lzhd-stage">
      <div class="lzhd-side lzhd-side-dragon" :class="{ 'is-unbet': !view.dragon.betInfo.hasBet }">
        <div class="lzhd-side-header">
          <div class="lzhd-side-title">龙</div>
          <div v-if="view.dragon.betInfo.hasBet" class="lzhd-side-badge is-win">
            +{{ formatMoney(view.dragon.betInfo.winLoseGold) }}
          </div>
          <div v-else class="lzhd-side-badge">未下注</div>
        </div>

        <div class="lzhd-board-shell">
          <div class="lzhd-board">
            <div
              v-for="column in dragonColumns"
              :key="`dragon-${column.index}`"
              class="lzhd-column"
              :class="{ 'is-split': !column.isSingle }"
              :style="{ transform: `translateY(${column.offsetY ? -4 : 0}px)` }"
            >
              <div class="lzhd-card lzhd-card-main">
                <div
                  class="lzhd-card-viewport"
                  :class="{ 'is-split': !column.isSingle }"
                >
                  <div v-if="column.isSingle" class="lzhd-card-single">
                    <atlas-sprite
                      v-if="columnMainIcon(column)"
                      :atlas="view.iconAtlas"
                      :frame-key="columnMainIcon(column)"
                      :max-width="84"
                      :max-height="84"
                    />
                    <span v-else class="lzhd-fallback">-</span>
                  </div>
                  <div v-else class="lzhd-card-stack">
                    <div class="lzhd-card-stack-item">
                      <atlas-sprite
                        v-if="column.topIconId"
                        :atlas="view.iconAtlas"
                        :frame-key="column.topIconId"
                        :max-width="84"
                        :max-height="84"
                      />
                      <span v-else class="lzhd-fallback">-</span>
                    </div>
                    <div class="lzhd-card-stack-item">
                      <atlas-sprite
                        v-if="column.bottomIconId"
                        :atlas="view.iconAtlas"
                        :frame-key="column.bottomIconId"
                        :max-width="84"
                        :max-height="84"
                      />
                      <span v-else class="lzhd-fallback">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!view.dragon.betInfo.hasBet" class="lzhd-unbet-overlay">
            <div class="lzhd-unbet-pill">未下注</div>
          </div>
        </div>

        <div class="lzhd-side-foot">
          <div v-if="view.dragon.betInfo.hasBet" class="lzhd-bet-card">
            <div class="lzhd-bet-win">+{{ formatMoney(view.dragon.betInfo.winLoseGold) }}</div>
            <div class="lzhd-bet-formula">{{ view.dragon.betInfo.formula || "-" }}</div>
          </div>
          <div v-else class="lzhd-tip">龙轴未下注</div>
        </div>
      </div>

      <div class="lzhd-middle">
        <div class="lzhd-vs">VS</div>
        <div v-if="view.showDouble" class="lzhd-double-card">
          <span class="lzhd-double-label">双轴奖励</span>
          <strong class="lzhd-double-value">+{{ formatMoney(view.battleWinLoseGold) }}</strong>
        </div>
      </div>

      <div class="lzhd-side lzhd-side-tiger" :class="{ 'is-unbet': !view.tiger.betInfo.hasBet }">
        <div class="lzhd-side-header">
          <div class="lzhd-side-title">虎</div>
          <div v-if="view.tiger.betInfo.hasBet" class="lzhd-side-badge is-win">
            +{{ formatMoney(view.tiger.betInfo.winLoseGold) }}
          </div>
          <div v-else class="lzhd-side-badge">未下注</div>
        </div>

        <div class="lzhd-board-shell">
          <div class="lzhd-board">
            <div
              v-for="column in tigerColumns"
              :key="`tiger-${column.index}`"
              class="lzhd-column"
              :class="{ 'is-split': !column.isSingle }"
              :style="{ transform: `translateY(${column.offsetY ? -4 : 0}px)` }"
            >
              <div class="lzhd-card lzhd-card-main">
                <div
                  class="lzhd-card-viewport"
                  :class="{ 'is-split': !column.isSingle }"
                >
                  <div v-if="column.isSingle" class="lzhd-card-single">
                    <atlas-sprite
                      v-if="columnMainIcon(column)"
                      :atlas="view.iconAtlas"
                      :frame-key="columnMainIcon(column)"
                      :max-width="84"
                      :max-height="84"
                    />
                    <span v-else class="lzhd-fallback">-</span>
                  </div>
                  <div v-else class="lzhd-card-stack">
                    <div class="lzhd-card-stack-item">
                      <atlas-sprite
                        v-if="column.topIconId"
                        :atlas="view.iconAtlas"
                        :frame-key="column.topIconId"
                        :max-width="84"
                        :max-height="84"
                      />
                      <span v-else class="lzhd-fallback">-</span>
                    </div>
                    <div class="lzhd-card-stack-item">
                      <atlas-sprite
                        v-if="column.bottomIconId"
                        :atlas="view.iconAtlas"
                        :frame-key="column.bottomIconId"
                        :max-width="84"
                        :max-height="84"
                      />
                      <span v-else class="lzhd-fallback">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!view.tiger.betInfo.hasBet" class="lzhd-unbet-overlay">
            <div class="lzhd-unbet-pill">未下注</div>
          </div>
        </div>

        <div class="lzhd-side-foot">
          <div v-if="view.tiger.betInfo.hasBet" class="lzhd-bet-card">
            <div class="lzhd-bet-win">+{{ formatMoney(view.tiger.betInfo.winLoseGold) }}</div>
            <div class="lzhd-bet-formula">{{ view.tiger.betInfo.formula || "-" }}</div>
          </div>
          <div v-else class="lzhd-tip">虎轴未下注</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";
import AtlasSprite from "./AtlasSprite.vue";

export default {
  name: "LzhdRecordView",
  components: {
    AtlasSprite,
  },
  props: {
    view: {
      type: Object,
      required: true,
    },
  },
  computed: {
    dragonColumns() {
      return Array.isArray(this.view && this.view.dragon && this.view.dragon.columns) ? this.view.dragon.columns : [];
    },
    tigerColumns() {
      return Array.isArray(this.view && this.view.tiger && this.view.tiger.columns) ? this.view.tiger.columns : [];
    },
  },
  methods: {
    formatMoney(value) {
      return toMoney(value || 0);
    },
    columnMainIcon(column) {
      if (!column) return 0;
      return column.isSingle ? column.mergedIconId : column.topIconId;
    },
  },
};
</script>

<style scoped>
.lzhd-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lzhd-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.lzhd-topline,
.lzhd-stage {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.lzhd-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
}

.lzhd-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.lzhd-metric-label {
  color: #64748b;
  font-size: 11px;
}

.lzhd-metric-value {
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.lzhd-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.lzhd-status-title {
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(180, 83, 9, 0.08);
  font-size: 12px;
  font-weight: 700;
  line-height: 30px;
  white-space: nowrap;
}

.lzhd-status-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: #9a3412;
  font-size: 11px;
}

.lzhd-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.lzhd-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
}

.lzhd-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lzhd-side.is-unbet .lzhd-side-badge {
  background: rgba(148, 163, 184, 0.14);
  color: #64748b;
}

.lzhd-side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lzhd-side-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.lzhd-side-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.lzhd-side-badge.is-win {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.lzhd-board-shell {
  position: relative;
  padding: 18px 12px 12px;
  border-radius: 16px;
  background: linear-gradient(180deg, #201008, #3a1b10 56%, #582816);
  overflow: hidden;
}

.lzhd-side.is-unbet .lzhd-card {
  opacity: 0.52;
  filter: saturate(0.65) brightness(0.94);
}

.lzhd-unbet-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.lzhd-unbet-pill {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  backdrop-filter: blur(2px);
}

.lzhd-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.lzhd-column {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 118px;
}

.lzhd-column.is-split {
  justify-content: center;
}

.lzhd-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(251, 191, 36, 0.18);
  background: linear-gradient(180deg, rgba(255, 247, 220, 0.95), rgba(246, 216, 159, 0.88));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.58), 0 8px 16px rgba(17, 24, 39, 0.16);
}

.lzhd-card-main {
  min-height: 102px;
  padding: 8px;
}

.lzhd-card-viewport {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 86px;
  overflow: hidden;
}

.lzhd-card-single {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.lzhd-card-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  transform: translateY(6px);
}

.lzhd-card-stack-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 84px;
}

.lzhd-fallback {
  color: #7c2d12;
  font-size: 13px;
  font-weight: 700;
}

.lzhd-side-foot {
  min-height: 58px;
}

.lzhd-bet-card {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.05);
}

.lzhd-bet-win {
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.lzhd-bet-formula {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.35;
  word-break: break-all;
}

.lzhd-tip {
  display: flex;
  align-items: center;
  min-height: 58px;
  padding: 0 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.05);
  color: #94a3b8;
  font-size: 12px;
}

.lzhd-middle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.lzhd-vs {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: #fff7ed;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 1px;
  box-shadow: 0 10px 22px rgba(194, 65, 12, 0.22);
}

.lzhd-double-card {
  width: 100%;
  padding: 10px 8px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.06);
  text-align: center;
}

.lzhd-double-label {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.lzhd-double-value {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .lzhd-stage {
    grid-template-columns: 1fr;
  }

  .lzhd-middle {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .lzhd-topline {
    display: block;
  }

  .lzhd-metrics {
    grid-template-columns: 1fr;
  }

  .lzhd-status {
    margin-top: 8px;
  }
}
</style>
