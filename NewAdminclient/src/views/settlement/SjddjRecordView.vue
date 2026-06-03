<template>
  <div class="sjddj-view">
    <div class="sjddj-topline">
      <div class="sjddj-metrics">
        <div class="sjddj-metric">
          <span class="sjddj-metric-label">单注</span>
          <span class="sjddj-metric-value">{{ formatMoney(view.betSingle) }}</span>
        </div>
        <div class="sjddj-metric">
          <span class="sjddj-metric-label">连线倍数</span>
          <span class="sjddj-metric-value">{{ view.betTimes }}</span>
        </div>
        <div class="sjddj-metric">
          <span class="sjddj-metric-label">递增中奖倍数</span>
          <span class="sjddj-metric-value">x{{ currentRound.multiplier }}</span>
        </div>
      </div>

      <div class="sjddj-status">
        <div class="sjddj-status-title">当前回合</div>
        <div class="sjddj-status-sub">
          <span>{{ currentRound.label }}</span>
          <span v-if="currentRound.timestamp">{{ formatDate(currentRound.timestamp) }}</span>
          <span>中奖线 {{ currentRound.betAreas.length }}</span>
          <span>scatter {{ scatterCount }}</span>
        </div>
      </div>
    </div>

    <div class="sjddj-toolbar">
      <div class="sjddj-inning-strip">
        <button
          v-for="(inning, index) in view.innings"
          :key="`${inning.label}-${index}`"
          type="button"
          class="sjddj-inning-chip"
          :class="{ 'is-active': index === inningIndex }"
          @click="selectInning(index)"
        >
          <span>{{ inning.label }}</span>
          <strong>{{ formatMoney(inning.displayWinLoseGold) }}</strong>
        </button>
      </div>

      <div class="sjddj-round-nav">
        <button type="button" class="sjddj-arrow" :disabled="!canPrev" @click="prevRound">&lt;</button>
        <div class="sjddj-round-brief">
          <div class="sjddj-round-brief-title">第{{ roundIndex + 1 }}回合</div>
          <div class="sjddj-round-brief-meta">
            <span>中奖线{{ currentRound.betAreas.length }}</span>
            <span>scatter {{ scatterCount }}</span>
          </div>
        </div>
        <button type="button" class="sjddj-arrow" :disabled="!canNext" @click="nextRound">&gt;</button>
      </div>
    </div>

    <div class="sjddj-round-summary">
      <table class="sjddj-round-summary-table">
        <thead>
          <tr>
            <th>阶段</th>
            <th>回合</th>
            <th>时间</th>
            <th>单注</th>
            <th>倍数</th>
            <th>奖励倍数</th>
            <th>Scatter</th>
            <th>中奖线</th>
            <th>输赢</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ currentInning.label }}</td>
            <td>{{ currentRound.label }}</td>
            <td>{{ currentRound.timestamp ? formatDate(currentRound.timestamp) : "-" }}</td>
            <td>{{ formatMoney(view.betSingle) }}</td>
            <td>{{ view.betTimes }}</td>
            <td>x{{ currentRound.multiplier }}</td>
            <td>{{ scatterCount }}</td>
            <td>{{ currentRound.betAreas.length }}</td>
            <td>{{ formatMoney(currentRoundWinLoseGold) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
<div class="sjddj-stage">
      <div class="sjddj-board-shell">
        <div class="sjddj-board">
          <div
            v-for="cell in boardCells"
            :key="cell.key"
            class="sjddj-cell"
            :class="{
              'is-empty': !cell.icon,
              'is-scatter': cell.isScatter,
              'is-highlight': highlightedCells.has(cell.coordKey),
            }"
            :style="cell.style"
          >
            <div v-if="cell.specialFrameStyle" class="sjddj-special-icon">
              <div
                class="sjddj-icon-sprite sjddj-special-frame"
                :class="{ 'is-rotated': cell.specialFrameRotated }"
                :style="cell.specialFrameStyle"
              />
              <div
                v-if="cell.overlayStyle"
                class="sjddj-icon-sprite sjddj-special-overlay"
                :class="{ 'is-rotated': cell.overlayRotated }"
                :style="cell.overlayStyle"
              />
            </div>
            <div
              v-else-if="cell.spriteStyle"
              class="sjddj-icon-sprite sjddj-cell-icon"
              :class="{ 'is-rotated': cell.spriteRotated }"
              :style="cell.spriteStyle"
            />
            <span v-else class="sjddj-cell-value">{{ iconLabel(cell.icon) }}</span>
          </div>
        </div>
      </div>

      <div class="sjddj-sidebar">
        <div class="sjddj-panel">
          <div class="sjddj-panel-title">中奖线</div>
          <div v-if="currentRound.betAreas.length" class="sjddj-line-list">
            <button
              v-for="(area, index) in currentRound.betAreas"
              :key="`${area.betAreaId}-${index}`"
              type="button"
              class="sjddj-line-item"
              :class="{ 'is-active': index === activeLineIndex }"
              @click="activeLineIndex = index"
            >
              <span>#{{ index + 1 }}</span>
              <span>{{ formatMoney(area.winLoseGold) }}</span>
            </button>
          </div>
          <div v-else class="sjddj-empty">当前回合无中奖线</div>
        </div>
      </div>
    </div>

    <div class="sjddj-road-grid">
      <div v-if="scatterCount > 2" class="sjddj-road-card is-scatter">
        <div class="sjddj-road-icon">
          <div
            v-if="getRoadSpriteStyle('31')"
            class="sjddj-icon-sprite sjddj-road-icon-sprite"
            :class="{ 'is-rotated': getRoadSpriteMeta('31').rotated }"
            :style="getRoadSpriteStyle('31')"
          />
          <span v-else>31</span>
        </div>
        <div class="sjddj-road-body">
          <div class="sjddj-road-title">scatter 触发</div>
          <div class="sjddj-road-formula">x{{ scatterCount }}</div>
          <div class="sjddj-road-win">免费下注 {{ scatterFreeCount }}</div>
        </div>
      </div>

      <button
        v-for="(area, index) in currentRound.betAreas"
        :key="`${area.betAreaId}-${index}-road`"
        type="button"
        class="sjddj-road-card"
        :class="{ 'is-active': index === activeLineIndex }"
        @click="activeLineIndex = index"
      >
        <div class="sjddj-road-icon">
          <div
            v-if="getRoadSpriteStyle(area.iconId)"
            class="sjddj-icon-sprite sjddj-road-icon-sprite"
            :class="{ 'is-rotated': getRoadSpriteMeta(area.iconId).rotated }"
            :style="getRoadSpriteStyle(area.iconId)"
          />
          <span v-else>{{ iconLabel(area.iconId) }}</span>
        </div>
        <div class="sjddj-road-body">
          <div class="sjddj-road-title">中奖线#{{ index + 1 }}</div>
          <div class="sjddj-road-formula">({{ buildRoadFormula(area) }})</div>
          <div class="sjddj-road-win">+{{ formatMoney(area.winLoseGold) }}</div>
          <div class="sjddj-road-path">{{ formatLinePos(area.linePos) }}</div>
        </div>
      </button>

      <div v-if="scatterCount <= 2 && !currentRound.betAreas.length" class="sjddj-empty-panel">
        当前回合未触发 scatter，也没有中奖线。
      </div>
    </div>

    <div v-if="activeArea" class="sjddj-panel">
      <div class="sjddj-panel-title">当前中奖线明细</div>
      <div class="sjddj-detail-grid">
        <div class="sjddj-detail-item">
          <span class="sjddj-detail-label">区域ID</span>
          <span class="sjddj-detail-value">{{ activeArea.betAreaId }}</span>
        </div>
        <div class="sjddj-detail-item">
          <span class="sjddj-detail-label">下注</span>
          <span class="sjddj-detail-value">{{ formatMoney(activeArea.betGold) }}</span>
        </div>
        <div class="sjddj-detail-item">
          <span class="sjddj-detail-label">连线倍数</span>
          <span class="sjddj-detail-value">{{ activeArea.betMultiple }}</span>
        </div>
        <div class="sjddj-detail-item">
          <span class="sjddj-detail-label">连线数量</span>
          <span class="sjddj-detail-value">{{ activeArea.num }}</span>
        </div>
        <div class="sjddj-detail-item">
          <span class="sjddj-detail-label">图标倍数</span>
          <span class="sjddj-detail-value">{{ activeArea.iconMultiple }}</span>
        </div>
        <div class="sjddj-detail-item">
          <span class="sjddj-detail-label">图标ID</span>
          <span class="sjddj-detail-value">{{ activeArea.iconId }}</span>
        </div>
        <div class="sjddj-detail-item is-wide">
          <span class="sjddj-detail-label">奖励公式</span>
          <span class="sjddj-detail-value">{{ buildRoadFormula(activeArea) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatUnixDateTime, toMoney } from "./settlementHelpers";

const COLUMN_X = [-146, -88, -28, 28, 88, 146];
const COLUMN_ROWS = [
  [108, 0, -108],
  [170, 56, -56, -170],
  [228, 114, 0, -114, -228],
  [228, 114, 0, -114, -228],
  [170, 56, -56, -170],
  [108, 0, -108],
];

const LEFT_ICON_COORDS = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 0],
  [2, 1],
  [2, 2],
  [2, 3],
  [2, 4],
];

const ICON_COORDS = LEFT_ICON_COORDS.concat([...LEFT_ICON_COORDS].reverse().map(([x, y]) => [5 - x, y]));

const SJDDJ_CLEAR_ATLAS_URL = "/sjddj-clear-atlas.webp";
const SJDDJ_CLEAR_ATLAS_SIZE = { width: 471, height: 1128 };
const SJDDJ_CLEAR_ICON_RECTS = {
  1: { x: 3, y: 459, width: 237, height: 178, rotated: false },
  2: { x: 244, y: 617, width: 234, height: 224, rotated: true },
  3: { x: 3, y: 821, width: 153, height: 183, rotated: true },
  4: { x: 3, y: 641, width: 187, height: 176, rotated: false },
  11: { x: 138, y: 978, width: 167, height: 144, rotated: false },
  12: { x: 309, y: 855, width: 150, height: 143, rotated: false },
  13: { x: 3, y: 978, width: 131, height: 147, rotated: false },
  14: { x: 309, y: 1002, width: 121, height: 135, rotated: true },
  21: { x: 3, y: 231, width: 224, height: 242, rotated: true },
  31: { x: 249, y: 422, width: 194, height: 191, rotated: false },
  40: { x: 249, y: 3, width: 215, height: 220, rotated: false },
};
function normalizePoint([x, y]) {
  return {
    left: `${((x + 380) / 760) * 100}%`,
    top: `${((270 - y) / 540) * 100}%`,
  };
}

export default {
  name: "SjddjRecordView",
  props: {
    view: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      inningIndex: 0,
      roundIndex: 0,
      activeLineIndex: 0,
    };
  },
  computed: {
    currentInning() {
      return this.view.innings[this.inningIndex] || { rounds: [], label: "", displayWinLoseGold: 0, kind: "ordinary" };
    },
    currentRound() {
      return this.currentInning.rounds[this.roundIndex] || { icons: [], betAreas: [], multiplier: 1, label: "绗?1 鍥炲悎" };
    },
    boardCells() {
      const icons = this.currentRound.icons || [];
      return Array.from({ length: 24 }, (_, index) => {
        const [x, y] = ICON_COORDS[index] || [];
        const point = [COLUMN_X[x], (COLUMN_ROWS[x] || [])[y]];
        const icon = icons[index] !== undefined ? String(icons[index]) : "";
        const spriteMeta = this.getBoardSpriteMeta(icon);
        const frameMeta = this.getSpecialFrameMeta(icon);
        const overlayMeta = this.getOverlayMeta(icon);
        return {
          key: `${this.inningIndex}-${this.roundIndex}-${index}`,
          coordKey: `${x}-${y}`,
          icon,
          isScatter: icon === "31",
          spriteStyle: this.buildSpriteStyle(spriteMeta, "board"),
          spriteRotated: !!(spriteMeta && spriteMeta.rotated),
          specialFrameStyle: this.buildSpriteStyle(frameMeta, "board"),
          specialFrameRotated: !!(frameMeta && frameMeta.rotated),
          overlayStyle: this.buildSpriteStyle(overlayMeta, "overlay"),
          overlayRotated: !!(overlayMeta && overlayMeta.rotated),
          style: normalizePoint(point),
        };
      });
    },
    activeArea() {
      return this.currentRound.betAreas[this.activeLineIndex] || null;
    },
    highlightedCells() {
      const set = new Set();
      if (!this.activeArea || !Array.isArray(this.activeArea.linePos)) return set;
      this.activeArea.linePos.forEach(([x, y]) => set.add(`${Number(x)}-${Number(y)}`));
      return set;
    },
    scatterCount() {
      return (this.currentRound.icons || []).filter((icon) => String(icon) === "31").length;
    },
    scatterFreeCount() {
      if (this.scatterCount < 3) return 0;
      return 10 + 2 * (this.scatterCount - 3);
    },
    currentRoundWinLoseGold() {
      return (this.currentRound.betAreas || []).reduce(
        (total, area) => total + Number((area && area.winLoseGold) || 0),
        0
      );
    },
    canPrev() {
      return this.inningIndex > 0 || this.roundIndex > 0;
    },
    canNext() {
      if (this.roundIndex < this.currentInning.rounds.length - 1) return true;
      return this.inningIndex < this.view.innings.length - 1;
    },
  },
  watch: {
    inningIndex() {
      this.roundIndex = 0;
      this.activeLineIndex = 0;
    },
    roundIndex() {
      this.activeLineIndex = 0;
    },
  },
  methods: {
    formatMoney(value) {
      return toMoney(value || 0);
    },
    formatDate(value) {
      return formatUnixDateTime(value);
    },
    iconLabel(icon) {
      if (!icon) return "";
      const value = Number(icon);
      if (Number.isNaN(value)) return String(icon);
      return value > 40 ? `${value - 40}+` : String(value);
    },
    normalizeIconId(icon) {
      const value = Number(icon);
      if (Number.isNaN(value) || value <= 0) return null;
      return value > 40 ? value - 40 : value;
    },
    isSpecialIcon(icon) {
      return Number(icon) > 40;
    },
    getIconRect(icon) {
      const id = this.normalizeIconId(icon);
      if (!id) return null;
      return SJDDJ_CLEAR_ICON_RECTS[id] || null;
    },
    buildAtlasStyle(rect, atlasSize, atlasUrl, size) {
      if (!rect) return null;
      const displayWidth = rect.rotated ? rect.height : rect.width;
      const displayHeight = rect.rotated ? rect.width : rect.height;
      const scale = Math.min(size / displayWidth, size / displayHeight);
      return {
        width: `${rect.width * scale}px`,
        height: `${rect.height * scale}px`,
        backgroundImage: `url(${atlasUrl})`,
        backgroundSize: `${atlasSize.width * scale}px ${atlasSize.height * scale}px`,
        backgroundPosition: `${-rect.x * scale}px ${-rect.y * scale}px`,
      };
    },
    getBoardSpriteMeta(icon) {
      if (!icon || this.isSpecialIcon(icon)) return null;
      const rect = this.getIconRect(icon);
      if (!rect) return null;
      return {
        atlasUrl: SJDDJ_CLEAR_ATLAS_URL,
        atlasSize: SJDDJ_CLEAR_ATLAS_SIZE,
        rect,
        rotated: rect.rotated,
      };
    },
    buildSpriteStyle(meta, kind = "board") {
      if (!meta || !meta.rect) return null;
      if (kind === "road") {
        return this.buildAtlasStyle(meta.rect, meta.atlasSize, meta.atlasUrl, 24);
      }
      if (kind === "overlay") {
        return this.buildAtlasStyle(meta.rect, meta.atlasSize, meta.atlasUrl, 18);
      }
      return this.buildAtlasStyle(meta.rect, meta.atlasSize, meta.atlasUrl, 30);
    },
    getSpecialFrameMeta(icon) {
      if (!this.isSpecialIcon(icon)) return null;
      const rect = this.getIconRect(40);
      if (!rect) return null;
      return {
        atlasUrl: SJDDJ_CLEAR_ATLAS_URL,
        atlasSize: SJDDJ_CLEAR_ATLAS_SIZE,
        rect,
        rotated: !!rect.rotated,
      };
    },
    getOverlayMeta(icon) {
      if (!this.isSpecialIcon(icon)) return null;
      const rect = this.getIconRect(icon);
      if (!rect) return null;
      return {
        atlasUrl: SJDDJ_CLEAR_ATLAS_URL,
        atlasSize: SJDDJ_CLEAR_ATLAS_SIZE,
        rect,
        rotated: !!rect.rotated,
      };
    },
    getRoadSpriteMeta(icon) {
      const rect = this.getIconRect(icon);
      return {
        rect,
        rotated: !!(rect && rect.rotated),
      };
    },
    getRoadSpriteStyle(icon) {
      const rect = this.getIconRect(icon);
      return this.buildAtlasStyle(rect, SJDDJ_CLEAR_ATLAS_SIZE, SJDDJ_CLEAR_ATLAS_URL, 24);
    },
    formatLinePos(linePos) {
      if (!Array.isArray(linePos) || !linePos.length) return "-";
      return linePos.map(([x, y]) => `${x}-${y}`).join(" / ");
    },
    buildRoadFormula(area) {
      if (!area) return "";
      return [this.formatMoney(area.betGold), area.betMultiple, area.num, area.iconMultiple, this.currentRound.multiplier].join("x");
    },
    selectInning(index) {
      this.inningIndex = index;
    },
    prevRound() {
      if (this.roundIndex > 0) {
        this.roundIndex -= 1;
        return;
      }
      if (this.inningIndex > 0) {
        this.inningIndex -= 1;
        this.roundIndex = Math.max((this.view.innings[this.inningIndex] || { rounds: [] }).rounds.length - 1, 0);
      }
    },
    nextRound() {
      if (this.roundIndex < this.currentInning.rounds.length - 1) {
        this.roundIndex += 1;
        return;
      }
      if (this.inningIndex < this.view.innings.length - 1) {
        this.inningIndex += 1;
        this.roundIndex = 0;
      }
    },
  },
};
</script>

<style scoped>
.sjddj-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sjddj-topline,
.sjddj-toolbar,
.sjddj-round-summary,
.sjddj-panel {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.sjddj-topline {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: stretch;
  overflow-x: auto;
}

.sjddj-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(130px, 1fr));
  gap: 6px;
  flex: 1 1 auto;
  min-width: 420px;
}

.sjddj-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.sjddj-metric-label,
.sjddj-detail-label {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.sjddj-metric-value,
.sjddj-detail-value {
  display: block;
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
  word-break: break-all;
}

.sjddj-status {
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

.sjddj-status-title {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(180, 83, 9, 0.08);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.sjddj-status-sub {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  color: #9a3412;
  font-size: 11px;
  overflow-x: auto;
}

.sjddj-status-sub span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  white-space: nowrap;
}

.sjddj-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 10px;
  align-items: center;
}

.sjddj-inning-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sjddj-inning-chip,
.sjddj-arrow,
.sjddj-line-item,
.sjddj-road-card {
  border: 0;
  cursor: pointer;
}

.sjddj-inning-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 118px;
  padding: 7px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  text-align: left;
  font-size: 12px;
}

.sjddj-inning-chip strong {
  color: #0f172a;
  font-size: 13px;
}

.sjddj-inning-chip.is-active {
  background: #0f172a;
  color: #cbd5e1;
}

.sjddj-inning-chip.is-active strong {
  color: #f8fafc;
}

.sjddj-round-nav {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 28px;
  gap: 6px;
  align-items: center;
}

.sjddj-arrow {
  height: 28px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.12);
  color: #0f172a;
  font-size: 16px;
  line-height: 1;
}

.sjddj-arrow:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.sjddj-round-brief {
  text-align: center;
  padding: 2px 0;
}

.sjddj-round-brief-title {
  color: #0f172a;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}

.sjddj-round-brief-meta {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 0;
  color: #64748b;
  font-size: 10px;
  line-height: 1.2;
}

.sjddj-round-summary {
  overflow-x: auto;
}

.sjddj-round-summary-table {
  width: 100%;
  min-width: 760px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}

.sjddj-round-summary-table th,
.sjddj-round-summary-table td {
  padding: 6px 8px;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  text-align: left;
  white-space: nowrap;
}

.sjddj-round-summary-table th {
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

.sjddj-round-summary-table td {
  color: #0f172a;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.sjddj-round-summary-table tr > :last-child {
  border-right: 0;
}


.sjddj-stage {
  display: grid;
  grid-template-columns: minmax(0, 560px) 168px;
  gap: 10px;
  justify-content: start;
  align-items: start;
}

.sjddj-board-shell {
  position: relative;
  width: 100%;
  min-height: 232px;
  padding: 8px;
  border-radius: 16px;
  background:
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08), transparent 40%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.16);
  overflow: hidden;
}

.sjddj-board {
  position: relative;
  width: 100%;
  min-height: 216px;
}

.sjddj-cell {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  color: #334155;
  overflow: visible;
}

.sjddj-cell.is-empty {
  opacity: 0.16;
}

.sjddj-cell.is-scatter {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(168, 85, 247, 0.9));
  color: #fff;
}

.sjddj-cell.is-highlight {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #111827;
  box-shadow: 0 6px 14px rgba(249, 115, 22, 0.22);
}

.sjddj-cell-value {
  font-size: 12px;
  font-weight: 800;
}

.sjddj-icon-sprite {
  background-repeat: no-repeat;
  background-position: 0 0;
  background-origin: content-box;
  background-color: transparent;
  flex: 0 0 auto;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.sjddj-icon-sprite.is-rotated {
  transform: rotate(-90deg);
}

.sjddj-cell-icon {
  filter: drop-shadow(0 3px 6px rgba(15, 23, 42, 0.2));
}

.sjddj-special-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.sjddj-special-frame,
.sjddj-special-overlay {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center;
}

.sjddj-special-frame.is-rotated,
.sjddj-special-overlay.is-rotated {
  transform: translate(-50%, -50%) rotate(-90deg);
}

.sjddj-special-overlay {
  filter: drop-shadow(0 6px 10px rgba(15, 23, 42, 0.24));
}

.sjddj-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sjddj-summary-panel {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: auto;
  padding-top: 8px;
  padding-bottom: 8px;
  flex-wrap: wrap;
}

.sjddj-panel-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.sjddj-summary-title {
  margin-right: 2px;
}

.sjddj-summary-main {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
}

.sjddj-summary-sub {
  color: #64748b;
  font-size: 11px;
  line-height: 1;
}

.sjddj-summary-sub.is-free {
  margin-left: auto;
}

.sjddj-line-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.sjddj-line-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1 1 calc(50% - 2px);
  min-width: 0;
  min-height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.96);
  color: #334155;
  font-size: 11px;
  font-weight: 600;
}

.sjddj-line-item.is-active {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(255, 237, 213, 0.96);
  color: #9a3412;
}

.sjddj-road-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
  gap: 8px;
}

.sjddj-road-card {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.16);
  text-align: left;
}

.sjddj-road-card.is-active {
  border-color: rgba(245, 158, 11, 0.48);
  box-shadow: 0 10px 24px rgba(245, 158, 11, 0.12);
}

.sjddj-road-card.is-scatter {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(168, 85, 247, 0.12));
}

.sjddj-road-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #0f172a;
  color: #f8fafc;
  font-size: 12px;
  font-weight: 800;
}

.sjddj-road-icon-sprite {
  max-width: 24px;
  max-height: 24px;
  transform-origin: center;
}

.sjddj-road-title {
  color: #0f172a;
  font-size: 11px;
  font-weight: 700;
}

.sjddj-road-formula,
.sjddj-road-path,
.sjddj-road-win {
  margin-top: 3px;
  font-size: 10px;
}

.sjddj-road-formula,
.sjddj-road-path {
  color: #64748b;
  word-break: break-all;
}

.sjddj-road-win {
  color: #16a34a;
  font-weight: 700;
}

.sjddj-detail-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
  align-items: start;
}

.sjddj-detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sjddj-detail-item.is-wide {
  grid-column: auto;
}

.sjddj-empty,
.sjddj-empty-panel {
  color: #94a3b8;
  font-size: 12px;
}

.sjddj-empty-panel {
  padding: 12px;
  border: 1px dashed rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.7);
}

@media (max-width: 1100px) {
  .sjddj-toolbar,
  .sjddj-stage {
    grid-template-columns: 1fr;
  }

  .sjddj-topline {
    display: block;
  }

  .sjddj-metrics {
    min-width: 0;
  }

  .sjddj-status {
    margin-top: 8px;
  }

  .sjddj-board-shell {
    min-height: 232px;
  }

  .sjddj-board {
    min-height: 216px;
  }
}

@media (max-width: 768px) {
  .sjddj-metrics {
    grid-template-columns: 1fr;
  }

  .sjddj-board-shell {
    min-height: 184px;
    padding: 8px;
  }

  .sjddj-board {
    min-height: 168px;
  }

  .sjddj-cell {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .sjddj-cell-value {
    font-size: 10px;
  }
}
</style>

