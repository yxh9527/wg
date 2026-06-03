<template>
  <div class="cfmm-view">
    <div class="cfmm-topline">
      <div class="cfmm-metrics">
        <div class="cfmm-metric">
          <span class="cfmm-metric-label">单注</span>
          <span class="cfmm-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="cfmm-metric">
          <span class="cfmm-metric-label">倍数</span>
          <span class="cfmm-metric-value">{{ view.betTimes || 0 }}</span>
        </div>
        <div class="cfmm-metric">
          <span class="cfmm-metric-label">总投注</span>
          <span class="cfmm-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="cfmm-metric">
          <span class="cfmm-metric-label">总输赢</span>
          <span class="cfmm-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="cfmm-status">
        <div class="cfmm-status-title">{{ currentPage.title }}</div>
        <div class="cfmm-status-sub">
          <span>{{ currentPage.label }}</span>
          <span>{{ currentPage.description }}</span>
        </div>
      </div>
    </div>

    <div class="cfmm-toolbar" v-if="view.pages.length > 1">
      <button
        type="button"
        class="cfmm-arrow"
        :disabled="pageIndex <= 0"
        @click="pageIndex -= 1"
      >
        ‹
      </button>
      <div class="cfmm-page-strip">
        <button
          v-for="(page, index) in view.pages"
          :key="`${page.label}-${index}`"
          type="button"
          class="cfmm-page-chip"
          :class="{ 'is-active': index === pageIndex }"
          @click="pageIndex = index"
        >
          <span>{{ page.label }}</span>
        </button>
      </div>
      <button
        type="button"
        class="cfmm-arrow"
        :disabled="pageIndex >= view.pages.length - 1"
        @click="pageIndex += 1"
      >
        ›
      </button>
    </div>

    <div class="cfmm-stage">
      <div class="cfmm-board-panel">
        <div v-if="currentPage.showBoard && currentPage.boardColumns.length" class="cfmm-board">
          <div
            v-for="column in currentPage.boardColumns"
            :key="column.columnIndex"
            class="cfmm-column"
            :class="{ 'is-locked': currentPage.lockColumnIndex === column.columnIndex }"
          >
            <div class="cfmm-slot">
              <atlas-sprite
                v-if="hasIconAsset(column.topIcon)"
                :atlas="view.iconAtlas"
                :frame-key="column.topIcon"
                :max-width="58"
                :max-height="58"
              />
            </div>
            <div class="cfmm-slot cfmm-slot-center">
              <atlas-sprite
                v-if="hasIconAsset(column.centerIcon)"
                :atlas="view.iconAtlas"
                :frame-key="column.centerIcon"
                :max-width="62"
                :max-height="62"
              />
            </div>
            <div class="cfmm-slot">
              <atlas-sprite
                v-if="hasIconAsset(column.bottomIcon)"
                :atlas="view.iconAtlas"
                :frame-key="column.bottomIcon"
                :max-width="58"
                :max-height="58"
              />
            </div>
            <div v-if="currentPage.lockColumnIndex === column.columnIndex" class="cfmm-lock">锁</div>
          </div>
        </div>

        <div v-else-if="currentPage.showBoard" class="cfmm-empty-board">
          <div class="cfmm-empty-board-title">{{ currentPage.title }}</div>
          <div class="cfmm-empty-board-desc">{{ currentPage.description }}</div>
        </div>

        <div v-else class="cfmm-lucky-panel">
          <div class="cfmm-lucky-icon">
            <atlas-sprite
              v-if="hasIconAsset(currentPage.triggerIcon)"
              :atlas="view.iconAtlas"
              :frame-key="currentPage.triggerIcon"
              :max-width="120"
              :max-height="120"
            />
          </div>
          <div class="cfmm-lucky-title">{{ currentPage.title }}</div>
          <div class="cfmm-lucky-desc">{{ currentPage.description }}</div>
        </div>
      </div>

      <div class="cfmm-sidebar">
        <div class="cfmm-panel">
          <div class="cfmm-panel-title">当前说明</div>
          <div class="cfmm-desc-row">
            <span v-if="hasIconAsset(currentPage.triggerIcon)" class="cfmm-desc-icon">
              <atlas-sprite
                :atlas="view.iconAtlas"
                :frame-key="currentPage.triggerIcon"
                :max-width="28"
                :max-height="28"
              />
            </span>
            <span class="cfmm-desc-text">{{ currentPage.description }}</span>
          </div>
        </div>

        <div class="cfmm-panel">
          <div class="cfmm-panel-title">当前中奖明细</div>
          <div class="cfmm-detail-row">
            <div class="cfmm-chip">
              <span class="cfmm-chip-label">公式</span>
              <span class="cfmm-chip-value">{{ currentPage.formula || "-" }}</span>
            </div>
            <div class="cfmm-chip">
              <span class="cfmm-chip-label">中奖</span>
              <span class="cfmm-chip-value">+{{ formatMoney(view.totalWinLoseGold) }}</span>
            </div>
          </div>
        </div>

        <div class="cfmm-panel">
          <div class="cfmm-panel-title">中奖区域</div>
          <div v-if="view.rewardItems.length" class="cfmm-reward-list">
            <div
              v-for="item in view.rewardItems"
              :key="`${item.index}-${item.betAreaId}`"
              class="cfmm-reward-item"
            >
              <span class="cfmm-reward-id">区 {{ item.betAreaId || "-" }}</span>
              <span v-if="hasIconAsset(item.iconId)" class="cfmm-reward-icon">
                <atlas-sprite
                  :atlas="view.iconAtlas"
                  :frame-key="item.iconId"
                  :max-width="22"
                  :max-height="22"
                />
              </span>
              <span class="cfmm-reward-text">{{ iconLabel(item.iconId) }}</span>
              <span class="cfmm-reward-num">x{{ item.num || 0 }}</span>
              <strong class="cfmm-reward-win">+{{ formatMoney(item.winLoseGold) }}</strong>
            </div>
          </div>
          <div v-else class="cfmm-empty">当前局没有中奖区域</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";
import AtlasSprite from "./AtlasSprite.vue";

export default {
  name: "CfmmRecordView",
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
    currentPage() {
      return (
        this.view.pages[this.pageIndex] || {
          label: "结果页",
          title: "结果页",
          description: "",
          boardColumns: [],
          showBoard: true,
          lockColumnIndex: -1,
          triggerIcon: "",
          formula: "",
        }
      );
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
  },
};
</script>

<style scoped>
.cfmm-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cfmm-topline,
.cfmm-toolbar,
.cfmm-board-panel,
.cfmm-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.cfmm-topline {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.cfmm-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
}

.cfmm-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.cfmm-metric-label,
.cfmm-chip-label {
  color: #64748b;
  font-size: 11px;
}

.cfmm-metric-value,
.cfmm-chip-value {
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
}

.cfmm-status {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 230px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.cfmm-status-title {
  font-size: 12px;
  font-weight: 700;
}

.cfmm-status-sub {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 11px;
}

.cfmm-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.cfmm-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cfmm-page-strip {
  display: flex;
  gap: 6px;
  flex: 1 1 auto;
}

.cfmm-arrow,
.cfmm-page-chip {
  border: 0;
  cursor: pointer;
}

.cfmm-arrow {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
  font-size: 18px;
  line-height: 32px;
}

.cfmm-arrow[disabled] {
  opacity: 0.35;
  cursor: default;
}

.cfmm-page-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  font-size: 11px;
  font-weight: 600;
}

.cfmm-page-chip.is-active {
  background: #0f172a;
  color: #f8fafc;
}

.cfmm-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 10px;
}

.cfmm-board-panel {
  background: radial-gradient(circle at 50% 36%, rgba(250, 204, 21, 0.1), transparent 42%), linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.cfmm-board {
  display: grid;
  grid-template-columns: repeat(4, 96px);
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.cfmm-column {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 96px;
  height: 192px;
  padding: 0 8px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
  overflow: hidden;
}

.cfmm-column > .cfmm-slot:first-child {
  margin-top: -43px;
}

.cfmm-column.is-locked {
  box-shadow: inset 0 0 0 1px rgba(250, 204, 21, 0.28);
}

.cfmm-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 86px;
  height: 86px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.96);
  flex: 0 0 86px;
}

.cfmm-slot-center {
  background: rgba(255, 237, 213, 0.96);
}

.cfmm-lock {
  position: absolute;
  right: 8px;
  top: 8px;
  min-width: 28px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(250, 204, 21, 0.9);
  color: #111827;
  font-size: 10px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
}

.cfmm-lucky-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 306px;
  gap: 12px;
  color: #f8fafc;
}

.cfmm-lucky-title {
  font-size: 18px;
  font-weight: 700;
}

.cfmm-lucky-desc {
  font-size: 12px;
  color: rgba(248, 250, 252, 0.82);
}

.cfmm-empty-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 306px;
  gap: 10px;
  color: #f8fafc;
}

.cfmm-empty-board-title {
  font-size: 16px;
  font-weight: 700;
}

.cfmm-empty-board-desc {
  font-size: 12px;
  color: rgba(248, 250, 252, 0.82);
}

.cfmm-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cfmm-panel-title {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.cfmm-desc-row,
.cfmm-detail-row,
.cfmm-reward-list {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.cfmm-desc-row {
  align-items: center;
}

.cfmm-desc-icon,
.cfmm-reward-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
}

.cfmm-desc-text {
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.cfmm-chip,
.cfmm-reward-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 5px 8px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #ffffff;
  white-space: nowrap;
  flex: 0 0 auto;
}

.cfmm-reward-id,
.cfmm-reward-text,
.cfmm-reward-num,
.cfmm-reward-win {
  font-size: 11px;
}

.cfmm-reward-win {
  font-weight: 700;
}

.cfmm-empty {
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
  .cfmm-topline {
    flex-direction: column;
  }

  .cfmm-stage {
    grid-template-columns: 1fr;
  }

  .cfmm-metrics {
    grid-template-columns: repeat(2, minmax(110px, 1fr));
  }
}
</style>
