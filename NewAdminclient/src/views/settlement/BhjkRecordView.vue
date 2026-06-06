<template>
  <div class="bhjk-view">
    <div class="bhjk-topline">
      <div class="bhjk-metric">
        <div class="bhjk-metric-label">总下注</div>
        <div class="bhjk-metric-value">{{ view.totalBetGold || "-" }}</div>
      </div>
      <div class="bhjk-metric">
        <div class="bhjk-metric-label">总输赢</div>
        <div class="bhjk-metric-value">{{ view.totalWinLoseGold || "-" }}</div>
      </div>
    </div>

    <div v-if="view.infoEntries && view.infoEntries.length" class="bhjk-panel bhjk-panel--full">
      <div class="bhjk-panel-title">通用信息</div>
      <div class="bhjk-entry-row">
        <div
          v-for="entry in view.infoEntries"
          :key="`${entry.label}-${entry.value}`"
          class="bhjk-entry-chip"
        >
          <span class="bhjk-entry-label">{{ entry.label }}</span>
          <span class="bhjk-entry-value">{{ entry.value }}</span>
        </div>
      </div>
    </div>

    <div v-if="view.metaEntries && view.metaEntries.length" class="bhjk-panel bhjk-panel--full">
      <div class="bhjk-panel-title">本局结果</div>
      <div class="bhjk-entry-row">
        <div
          v-for="entry in view.metaEntries"
          :key="`${entry.label}-${entry.value}`"
          class="bhjk-entry-chip bhjk-entry-chip--soft"
        >
          <span class="bhjk-entry-label">{{ entry.label }}</span>
          <span class="bhjk-entry-value">{{ entry.value }}</span>
        </div>
      </div>
    </div>

    <div class="bhjk-board">
      <div class="bhjk-column bhjk-column--dealer">
        <div class="bhjk-section-head">
          <div class="bhjk-section-title">{{ view.dealer.title }}</div>
          <div v-if="view.dealer.value" class="bhjk-score">{{ view.dealer.value }}</div>
        </div>
          <div class="bhjk-card-row">
          <div
            v-for="(card, index) in view.dealer.cards"
            :key="`dealer-${index}`"
            class="bhjk-card-chip"
            :class="cardTone(card)"
          >
            <template v-if="getCardFace(card)">
              <div class="bhjk-card-corner bhjk-card-corner--top">
                <span class="bhjk-card-rank">{{ getCardFace(card).rank }}</span>
                <span class="bhjk-card-suit">{{ getCardFace(card).suit }}</span>
              </div>
              <div class="bhjk-card-center">{{ getCardFace(card).center }}</div>
              <div class="bhjk-card-corner bhjk-card-corner--bottom">
                <span class="bhjk-card-rank">{{ getCardFace(card).rank }}</span>
                <span class="bhjk-card-suit">{{ getCardFace(card).suit }}</span>
              </div>
            </template>
            <template v-else>
              {{ formatCard(card) }}
            </template>
          </div>
          </div>
        <div v-if="view.dealer.badges && view.dealer.badges.length" class="bhjk-badge-row">
          <span
            v-for="badge in view.dealer.badges"
            :key="badge"
            class="bhjk-badge"
          >
            {{ badge }}
          </span>
        </div>
      </div>

      <div class="bhjk-hand-grid">
        <div
          v-for="hand in view.hands"
          :key="hand.key"
          class="bhjk-hand"
          :class="`is-${hand.tone || 'neutral'}`"
        >
          <div class="bhjk-section-head">
            <div>
              <div class="bhjk-section-title">{{ hand.title }}</div>
              <div v-if="hand.subtitle" class="bhjk-section-subtitle">{{ hand.subtitle }}</div>
            </div>
            <div class="bhjk-hand-meta">
              <div v-if="hand.result" class="bhjk-result-text">{{ hand.result }}</div>
              <div v-if="hand.value" class="bhjk-score">{{ hand.value }}</div>
            </div>
          </div>

          <div class="bhjk-card-row">
            <div
              v-for="(card, index) in hand.cards"
              :key="`${hand.key}-${index}`"
              class="bhjk-card-chip"
              :class="cardTone(card)"
            >
              <template v-if="getCardFace(card)">
                <div class="bhjk-card-corner bhjk-card-corner--top">
                  <span class="bhjk-card-rank">{{ getCardFace(card).rank }}</span>
                  <span class="bhjk-card-suit">{{ getCardFace(card).suit }}</span>
                </div>
                <div class="bhjk-card-center">{{ getCardFace(card).center }}</div>
                <div class="bhjk-card-corner bhjk-card-corner--bottom">
                  <span class="bhjk-card-rank">{{ getCardFace(card).rank }}</span>
                  <span class="bhjk-card-suit">{{ getCardFace(card).suit }}</span>
                </div>
              </template>
              <template v-else>
                {{ formatCard(card) }}
              </template>
            </div>
          </div>

          <div class="bhjk-hand-info">
            <span v-if="hand.betGold" class="bhjk-mini-chip">下注 {{ hand.betGold }}</span>
            <span
              v-for="badge in hand.badges"
              :key="`${hand.key}-${badge}`"
              class="bhjk-mini-chip bhjk-mini-chip--accent"
            >
              {{ badge }}
            </span>
          </div>

          <div v-if="hand.actions && hand.actions.length" class="bhjk-action-row">
            <span
              v-for="action in hand.actions"
              :key="`${hand.key}-${action.id}`"
              class="bhjk-action-chip"
            >
              {{ action.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BhjkRecordView",
  props: {
    view: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    getCardFace(card) {
      const numeric = this.toNumericCard(card);
      if (!Number.isFinite(numeric) || numeric <= 0) return null;

      const rankValue = numeric % 16;
      const suitValue = Math.floor(numeric / 16);
      const rankMap = {
        1: "A",
        11: "J",
        12: "Q",
        13: "K",
      };
      const suitMap = {
        0: { suit: "♦", center: "♦" },
        1: { suit: "♣", center: "♣" },
        2: { suit: "♥", center: "♥" },
        3: { suit: "♠", center: "♠" },
      };
      const suitMeta = suitMap[suitValue];
      if (!suitMeta || rankValue < 1 || rankValue > 13) return null;

      return {
        rank: rankMap[rankValue] || String(rankValue),
        suit: suitMeta.suit,
        center: suitMeta.center,
      };
    },
    toNumericCard(card) {
      if (typeof card === "number") return card;
      const value = String(card || "").trim();
      if (!value) return NaN;
      if (/^\d+$/.test(value)) return Number(value);
      return NaN;
    },
    formatCard(card) {
      const face = this.getCardFace(card);
      if (face) return `${face.rank}${face.suit}`;
      const value = String(card || "").trim();
      if (!value) return "-";
      return value;
    },
    cardTone(card) {
      const face = this.getCardFace(card);
      if (face) {
        if (face.suit === "♥" || face.suit === "♦") return "is-red";
        return "is-black";
      }
      const value = String(card || "").toUpperCase();
      if (value.includes("♥") || value.includes("♦")) return "is-red";
      return "is-black";
    },
  },
};
</script>

<style scoped>
.bhjk-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bhjk-topline {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.bhjk-metric,
.bhjk-panel,
.bhjk-column,
.bhjk-hand {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.bhjk-metric {
  padding: 12px 14px;
}

.bhjk-metric-label,
.bhjk-entry-label,
.bhjk-section-subtitle {
  color: #64748b;
  font-size: 11px;
}

.bhjk-metric-value {
  margin-top: 4px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
}

.bhjk-panel {
  padding: 12px 14px;
}

.bhjk-panel-title,
.bhjk-section-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.bhjk-entry-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.bhjk-entry-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 247, 237, 0.92);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.bhjk-entry-chip--soft {
  background: rgba(239, 246, 255, 0.92);
  border-color: rgba(59, 130, 246, 0.16);
}

.bhjk-entry-value,
.bhjk-result-text,
.bhjk-score {
  color: #0f172a;
  font-weight: 700;
}

.bhjk-board {
  display: grid;
  grid-template-columns: minmax(260px, 0.85fr) minmax(0, 1.15fr);
  gap: 10px;
}

.bhjk-column,
.bhjk-hand {
  padding: 12px 14px;
}

.bhjk-column--dealer {
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.96), rgba(255, 255, 255, 0.98));
}

.bhjk-hand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}

.bhjk-hand.is-win {
  border-color: rgba(34, 197, 94, 0.24);
  background: linear-gradient(180deg, rgba(240, 253, 244, 0.96), rgba(255, 255, 255, 0.98));
}

.bhjk-hand.is-lose {
  border-color: rgba(248, 113, 113, 0.24);
  background: linear-gradient(180deg, rgba(254, 242, 242, 0.96), rgba(255, 255, 255, 0.98));
}

.bhjk-hand.is-draw {
  border-color: rgba(96, 165, 250, 0.22);
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.96), rgba(255, 255, 255, 0.98));
}

.bhjk-hand.is-accent {
  border-color: rgba(245, 158, 11, 0.26);
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.96), rgba(255, 255, 255, 0.98));
}

.bhjk-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.bhjk-hand-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bhjk-score {
  min-width: 40px;
  text-align: right;
  font-size: 18px;
}

.bhjk-result-text {
  font-size: 12px;
}

.bhjk-card-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.bhjk-card-chip {
  display: grid;
  grid-template-rows: auto 1fr auto;
  align-items: stretch;
  min-width: 46px;
  min-height: 64px;
  padding: 5px 4px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
  color: #111827;
  font-size: 14px;
  font-weight: 700;
}

.bhjk-card-chip.is-red {
  color: #dc2626;
}

.bhjk-card-corner {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.bhjk-card-corner--top {
  justify-self: flex-start;
}

.bhjk-card-corner--bottom {
  justify-self: flex-end;
  transform: rotate(180deg);
}

.bhjk-card-rank {
  font-size: 11px;
  font-weight: 800;
}

.bhjk-card-suit {
  margin-top: 1px;
  font-size: 10px;
}

.bhjk-card-center {
  align-self: center;
  justify-self: center;
  font-size: 22px;
  line-height: 1;
}

.bhjk-badge-row,
.bhjk-hand-info,
.bhjk-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.bhjk-badge,
.bhjk-mini-chip,
.bhjk-action-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.bhjk-badge,
.bhjk-mini-chip--accent {
  background: rgba(255, 247, 237, 0.96);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.bhjk-mini-chip {
  background: rgba(241, 245, 249, 0.96);
  color: #475569;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.bhjk-action-chip {
  background: rgba(239, 246, 255, 0.96);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.14);
}

@media (max-width: 768px) {
  .bhjk-topline,
  .bhjk-board {
    grid-template-columns: 1fr;
  }

  .bhjk-hand-grid {
    grid-template-columns: 1fr;
  }
}
</style>
