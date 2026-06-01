<template>
  <div class="shz-view">
    <div class="shz-topline">
      <div class="shz-metrics">
        <div class="shz-metric">
          <span class="shz-metric-label">单注</span>
          <span class="shz-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="shz-metric">
          <span class="shz-metric-label">倍数</span>
          <span class="shz-metric-value">{{ view.betTimes }}</span>
        </div>
        <div class="shz-metric">
          <span class="shz-metric-label">总下注</span>
          <span class="shz-metric-value">{{ formatMoney(view.totalBetGold) }}</span>
        </div>
        <div class="shz-metric">
          <span class="shz-metric-label">总输赢</span>
          <span class="shz-metric-value">{{ formatMoney(view.totalWinLoseGold) }}</span>
        </div>
      </div>

      <div class="shz-status">
        <div class="shz-status-title">主盘面</div>
        <div class="shz-status-sub">
          <span>中奖线 {{ view.winAreas.length }}</span>
          <span>免费局 {{ view.freeRounds.length }}</span>
          <span>小玛丽 {{ formatMoney(view.battleWinLoseGold) }}</span>
        </div>
      </div>
    </div>

    <div class="shz-main-row">
      <div class="shz-stage">
        <div class="shz-board-shell">
          <div class="shz-board">
            <div
              v-for="(icon, index) in boardIcons"
              :key="`main-${index}`"
              class="shz-cell"
              :class="{
                'is-highlighted': isHighlightedIndex(index),
                'is-dimmed': hasHighlight && !isHighlightedIndex(index),
              }"
            >
              <div
                v-if="getSpriteStyle(icon, isHighlightedIndex(index))"
                class="shz-icon-sprite"
                :class="{ 'is-rotated': getSpriteMeta(icon, isHighlightedIndex(index)).rotated }"
                :style="getSpriteStyle(icon, isHighlightedIndex(index))"
              />
              <span v-else class="shz-cell-fallback">{{ iconLabel(icon) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="shz-side">
        <div class="shz-panel">
          <div class="shz-panel-title">中奖线</div>
          <div v-if="view.winAreas.length" class="shz-line-list">
            <button
              v-for="(area, index) in view.winAreas"
              :key="`${area.betAreaId}-${index}`"
              type="button"
              class="shz-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span class="shz-line-item-index">{{ index + 1 }}</span>
              <span class="shz-line-item-text">{{ areaLabel(area) }}</span>
              <strong class="shz-line-item-win">+{{ formatMoney(area.winLoseGold) }}</strong>
            </button>
          </div>
          <div v-else class="shz-empty">当前注单没有中奖线</div>
        </div>

        <div v-if="view.triggerDetails.length" class="shz-panel">
          <div class="shz-panel-title">游戏图标列表</div>
          <div class="shz-trigger-list">
            <div
              v-for="(trigger, index) in view.triggerDetails"
              :key="`trigger-${index}`"
              class="shz-trigger-item"
            >
              <span>{{ trigger.lineId }}线</span>
              <strong>x{{ trigger.rewardTimes }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeArea" class="shz-panel">
      <div class="shz-panel-title">当前中奖明细</div>
      <div class="shz-detail-row">
        <div class="shz-detail-chip">
          <span class="shz-detail-label">线号</span>
          <span class="shz-detail-value">{{ areaLabel(activeArea) }}</span>
        </div>
        <div class="shz-detail-chip">
          <span class="shz-detail-label">图标</span>
          <span class="shz-detail-value">{{ activeArea.iconName }}</span>
        </div>
        <div class="shz-detail-chip">
          <span class="shz-detail-label">连线数量</span>
          <span class="shz-detail-value">{{ activeArea.num }}</span>
        </div>
        <div class="shz-detail-chip">
          <span class="shz-detail-label">中奖</span>
          <span class="shz-detail-value">+{{ formatMoney(activeArea.winLoseGold) }}</span>
        </div>
        <div class="shz-detail-chip shz-detail-chip-formula">
          <span class="shz-detail-label">派奖公式</span>
          <span class="shz-detail-value">{{ activeArea.formula || "-" }}</span>
        </div>
      </div>
    </div>

    <div v-if="view.freeRounds.length && activeFreeRound" class="shz-panel">
      <div class="shz-panel-head">
        <div class="shz-panel-title">免费局 / 小玛丽</div>
        <div class="shz-free-nav">
          <button type="button" class="shz-arrow" :disabled="!canPrevFree" @click="prevFree">&lt;</button>
          <div class="shz-free-brief">
            第{{ activeFreeRound.setIndex + 1 }}组 第{{ activeFreeRound.roundIndex + 1 }}回合
          </div>
          <button type="button" class="shz-arrow" :disabled="!canNextFree" @click="nextFree">&gt;</button>
        </div>
      </div>

      <div class="shz-bonus-layout">
        <div class="shz-bonus-board">
          <div
            v-for="(icon, index) in activeFreeRound.allIcons"
            :key="`bonus-${activeFreeRound.key}-${index}`"
            class="shz-bonus-cell"
            :class="{ 'is-match': activeFreeRound.matchedIndexes.includes(index) || index === 4 }"
          >
            <div v-if="index === 4" class="shz-bonus-outer">
              <div
                v-if="getBonusStyle(icon)"
                class="shz-bonus-sprite"
                :class="{ 'is-rotated': getBonusMeta(icon).rotated }"
                :style="getBonusStyle(icon)"
              />
              <span v-else class="shz-cell-fallback">{{ iconLabel(icon) }}</span>
            </div>
            <template v-else>
              <div
                v-if="getSpriteStyle(icon, activeFreeRound.matchedIndexes.includes(index))"
                class="shz-icon-sprite"
                :class="{ 'is-rotated': getSpriteMeta(icon, activeFreeRound.matchedIndexes.includes(index)).rotated }"
                :style="getSpriteStyle(icon, activeFreeRound.matchedIndexes.includes(index))"
              />
              <span v-else class="shz-cell-fallback">{{ iconLabel(icon) }}</span>
            </template>
          </div>
        </div>

        <div class="shz-bonus-side">
          <div class="shz-bonus-card" :class="{ 'is-empty': !activeFreeRound.outerIncome }">
            <div class="shz-bonus-title">外圈</div>
            <div class="shz-bonus-win">{{ activeFreeRound.outerIncome ? `+${formatMoney(activeFreeRound.outerIncome)}` : "-" }}</div>
            <div v-if="activeFreeRound.outerIncome" class="shz-bonus-formula">
              {{ buildBonusFormula(activeFreeRound.singleBet, activeFreeRound.multi, activeFreeRound.outerOdds) }}
            </div>
          </div>

          <div class="shz-bonus-card" :class="{ 'is-empty': !activeFreeRound.innerIncome }">
            <div class="shz-bonus-title">内圈</div>
            <div class="shz-bonus-win">{{ activeFreeRound.innerIncome ? `+${formatMoney(activeFreeRound.innerIncome)}` : "-" }}</div>
            <div v-if="activeFreeRound.innerIncome" class="shz-bonus-formula">
              {{ buildBonusFormula(activeFreeRound.singleBet, activeFreeRound.multi, activeFreeRound.innerOdds) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toMoney } from "./settlementHelpers";

const MAIN_ATLAS_URL = "/shz-game-ui3.webp";
const MAIN_ATLAS_SIZE = { width: 2047, height: 1070 };
const MAIN_ICON_RECTS = {
  0: { x: 1469, y: 784, width: 172, height: 118, rotated: false },
  1: { x: 936, y: 176, width: 160, height: 124, rotated: false },
  2: { x: 548, y: 2, width: 178, height: 196, rotated: false },
  3: { x: 2, y: 200, width: 180, height: 196, rotated: false },
  4: { x: 366, y: 200, width: 178, height: 196, rotated: false },
  5: { x: 2, y: 2, width: 180, height: 196, rotated: false },
  6: { x: 523, y: 966, width: 164, height: 102, rotated: false },
  7: { x: 1035, y: 722, width: 164, height: 138, rotated: false },
  8: { x: 1930, y: 2, width: 164, height: 114, rotated: true },
};
const MAIN_SHADER_RECTS = {
  0: { x: 1467, y: 904, width: 172, height: 118, rotated: false },
  1: { x: 1665, y: 646, width: 160, height: 124, rotated: false },
  2: { x: 2, y: 398, width: 180, height: 196, rotated: false },
  3: { x: 2, y: 596, width: 179, height: 196, rotated: false },
  4: { x: 2, y: 596, width: 179, height: 196, rotated: false },
  5: { x: 184, y: 2, width: 180, height: 196, rotated: false },
  6: { x: 689, y: 962, width: 164, height: 102, rotated: false },
  7: { x: 1035, y: 862, width: 164, height: 138, rotated: false },
  8: { x: 1930, y: 168, width: 164, height: 114, rotated: true },
};
const BONUS_RECTS = {
  0: { x: 1331, y: 514, width: 150, height: 206, rotated: false },
  1: { x: 883, y: 810, width: 150, height: 206, rotated: false },
  2: { x: 998, y: 306, width: 150, height: 206, rotated: false },
  3: { x: 1150, y: 306, width: 150, height: 206, rotated: false },
  4: { x: 1302, y: 306, width: 150, height: 206, rotated: false },
  5: { x: 1454, y: 306, width: 150, height: 206, rotated: false },
  6: { x: 1606, y: 306, width: 150, height: 206, rotated: false },
  7: { x: 1027, y: 514, width: 150, height: 206, rotated: false },
  9: { x: 1331, y: 514, width: 150, height: 206, rotated: false },
};

export default {
  name: "ShzRecordView",
  props: {
    view: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeLineIndex: 0,
      freeRoundIndex: 0,
    };
  },
  computed: {
    boardIcons() {
      return Array.isArray(this.view.mainIcons) ? this.view.mainIcons : [];
    },
    activeArea() {
      return this.view.winAreas[this.activeLineIndex] || null;
    },
    highlightedPattern() {
      return this.activeArea ? this.activeArea.highlightPattern || this.activeArea.pattern || [] : [];
    },
    hasHighlight() {
      return this.highlightedPattern.length > 0;
    },
    activeFreeRound() {
      return this.view.freeRounds[this.freeRoundIndex] || this.view.activeFreeRound || null;
    },
    canPrevFree() {
      return this.freeRoundIndex > 0;
    },
    canNextFree() {
      return this.freeRoundIndex < this.view.freeRounds.length - 1;
    },
  },
  methods: {
    formatMoney(value) {
      return toMoney(value || 0);
    },
    areaLabel(area) {
      if (!area) return "-";
      return area.isFullScreen ? "全屏" : `${area.betAreaId}线`;
    },
    cellKey(index) {
      return `${Math.floor(index / 3)}-${index % 3}`;
    },
    isHighlightedIndex(index) {
      return this.highlightedPattern.includes(this.cellKey(index));
    },
    iconLabel(icon) {
      return this.view.iconNameMap && this.view.iconNameMap[icon] ? this.view.iconNameMap[icon] : String(icon);
    },
    buildAtlasStyle(rect, size) {
      if (!rect) return null;
      const sourceWidth = rect.rotated ? rect.height : rect.width;
      const sourceHeight = rect.rotated ? rect.width : rect.height;
      const scale = Math.min(size / sourceWidth, size / sourceHeight);
      return {
        width: `${rect.width * scale}px`,
        height: `${rect.height * scale}px`,
        backgroundImage: `url(${MAIN_ATLAS_URL})`,
        backgroundSize: `${MAIN_ATLAS_SIZE.width * scale}px ${MAIN_ATLAS_SIZE.height * scale}px`,
        backgroundPosition: `${-rect.x * scale}px ${-rect.y * scale}px`,
      };
    },
    getSpriteMeta(icon, highlighted) {
      const id = Number(icon);
      const rect = highlighted ? MAIN_SHADER_RECTS[id] || MAIN_ICON_RECTS[id] : MAIN_ICON_RECTS[id];
      return {
        rect,
        rotated: !!(rect && rect.rotated),
      };
    },
    getSpriteStyle(icon, highlighted) {
      const meta = this.getSpriteMeta(icon, highlighted);
      return this.buildAtlasStyle(meta.rect, 54);
    },
    getBonusMeta(icon) {
      const rect = BONUS_RECTS[Number(icon)] || BONUS_RECTS[9];
      return {
        rect,
        rotated: !!(rect && rect.rotated),
      };
    },
    getBonusStyle(icon) {
      const meta = this.getBonusMeta(icon);
      return this.buildAtlasStyle(meta.rect, 44);
    },
    buildBonusFormula(singleBet, multi, odds) {
      return `${this.formatMoney(singleBet)} x ${multi} x 9 x ${odds}`;
    },
    prevFree() {
      if (this.canPrevFree) {
        this.freeRoundIndex -= 1;
      }
    },
    nextFree() {
      if (this.canNextFree) {
        this.freeRoundIndex += 1;
      }
    },
  },
};
</script>

<style scoped>
.shz-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shz-topline,
.shz-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.shz-topline {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: stretch;
  overflow-x: auto;
}

.shz-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
  min-width: 520px;
}

.shz-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.shz-metric-label,
.shz-detail-label {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.shz-metric-value,
.shz-detail-value {
  display: block;
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}

.shz-status {
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

.shz-status-title {
  flex: 0 0 auto;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(180, 83, 9, 0.08);
  font-size: 12px;
  font-weight: 700;
  line-height: 30px;
}

.shz-status-sub {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 0;
  color: #9a3412;
  font-size: 11px;
  overflow-x: visible;
}

.shz-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.shz-main-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  align-items: flex-start;
  overflow-x: auto;
}

.shz-stage {
  flex: 0 0 auto;
  min-width: 0;
}

.shz-side {
  flex: 1 1 auto;
  width: auto;
  min-width: 220px;
}

.shz-board-shell {
  padding: 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #25130b, #4a2412 60%, #7c3a17);
  width: fit-content;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
}

.shz-board {
  display: grid;
  grid-template-columns: repeat(5, 116px);
  gap: 4px;
  width: max-content;
}

.shz-cell,
.shz-bonus-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 116px;
  min-height: 68px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
}

.shz-cell.is-dimmed {
  opacity: 0.28;
}

.shz-cell.is-highlighted {
  box-shadow: inset 0 0 0 2px rgba(251, 191, 36, 0.92), 0 0 14px rgba(251, 191, 36, 0.35);
  background: rgba(255, 255, 255, 0.15);
}

.shz-icon-sprite,
.shz-bonus-sprite {
  background-repeat: no-repeat;
  background-position: 0 0;
  image-rendering: auto;
  flex: 0 0 auto;
}

.shz-icon-sprite.is-rotated,
.shz-bonus-sprite.is-rotated {
  transform: rotate(-90deg);
}

.shz-cell-fallback {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.shz-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shz-side > .shz-panel:first-child {
  width: 100%;
}

.shz-side > .shz-panel:last-child {
  width: fit-content;
  max-width: 100%;
  align-self: flex-start;
}

.shz-panel-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.shz-line-list,
.shz-trigger-list,
.shz-detail-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 8px;
  overflow-x: auto;
}

.shz-line-list {
  width: 100%;
}

.shz-line-item {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-width: 92px;
  padding: 6px 7px;
  border: 0;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  cursor: pointer;
  font-size: 10px;
  white-space: nowrap;
  flex: 1 0 92px;
}

.shz-line-item.is-active {
  background: #0f172a;
  color: #f8fafc;
}

.shz-line-item-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  font-size: 9px;
  font-weight: 700;
}

.shz-line-item.is-active .shz-line-item-index {
  background: rgba(255, 255, 255, 0.18);
}

.shz-line-item-text,
.shz-line-item-win {
  flex: 0 0 auto;
}

.shz-trigger-item,
.shz-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 9px;
  white-space: nowrap;
  flex: 0 0 auto;
}

.shz-trigger-item {
  background: rgba(245, 158, 11, 0.08);
  color: #92400e;
  font-size: 10px;
  font-weight: 700;
}

.shz-detail-chip {
  background: rgba(15, 23, 42, 0.05);
}

.shz-detail-chip-formula {
  min-width: 200px;
}

.shz-detail-chip .shz-detail-label,
.shz-detail-chip .shz-detail-value {
  display: inline;
  margin-top: 0;
}

.shz-empty {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.shz-panel-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.shz-free-nav {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 28px;
  gap: 6px;
  align-items: center;
}

.shz-arrow {
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.12);
  color: #0f172a;
  cursor: pointer;
}

.shz-arrow:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.shz-free-brief {
  text-align: center;
  color: #334155;
  font-size: 11px;
  font-weight: 700;
}

.shz-bonus-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 10px;
}

.shz-bonus-board {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

.shz-bonus-cell {
  min-height: 72px;
}

.shz-bonus-cell.is-match {
  box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.8);
}

.shz-bonus-outer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.shz-bonus-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shz-bonus-card {
  padding: 10px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.05);
}

.shz-bonus-card.is-empty {
  opacity: 0.55;
}

.shz-bonus-title {
  color: #64748b;
  font-size: 11px;
}

.shz-bonus-win {
  margin-top: 4px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.shz-bonus-formula {
  margin-top: 4px;
  color: #64748b;
  font-size: 10px;
  line-height: 1.35;
  word-break: break-word;
}

@media (max-width: 980px) {
  .shz-topline,
  .shz-bonus-layout {
    display: block;
  }

  .shz-metrics {
    grid-template-columns: 1fr 1fr;
    min-width: 0;
  }

  .shz-status {
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .shz-metrics,
  .shz-board,
  .shz-bonus-board {
    grid-template-columns: 1fr;
  }

  .shz-panel-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
