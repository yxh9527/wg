<template>
  <div class="baviator-view">
    <div class="baviator-topline">
      <div class="baviator-metric">
        <div class="baviator-metric-label">总下注</div>
        <div class="baviator-metric-value">{{ view.totalBetGold || "-" }}</div>
      </div>
      <div class="baviator-metric">
        <div class="baviator-metric-label">总输赢</div>
        <div class="baviator-metric-value">{{ view.totalWinLoseGold || "-" }}</div>
      </div>
      <div class="baviator-metric baviator-metric--accent">
        <div class="baviator-metric-label">开出倍率</div>
        <div class="baviator-metric-value">{{ view.resultRate || "-" }}</div>
      </div>
    </div>

    <div v-if="view.infoEntries && view.infoEntries.length" class="baviator-panel">
      <div class="baviator-panel-title">通用信息</div>
      <div class="baviator-entry-row">
        <div
          v-for="entry in view.infoEntries"
          :key="`${entry.label}-${entry.value}`"
          class="baviator-entry-chip"
        >
          <span class="baviator-entry-label">{{ entry.label }}</span>
          <span class="baviator-entry-value">{{ entry.value }}</span>
        </div>
      </div>
    </div>

    <div class="baviator-panel">
      <div class="baviator-panel-head">
        <div class="baviator-panel-title">下注区域</div>
        <div class="baviator-panel-subtitle">仅保留有效下注信息</div>
      </div>
      <div v-if="view.betAreas && view.betAreas.length" class="baviator-area-grid">
        <div
          v-for="area in view.betAreas"
          :key="area.key"
          class="baviator-area-card"
          :class="areaTone(area)"
        >
          <div class="baviator-area-inline">
            <div class="baviator-area-title">{{ area.label }}</div>
            <div v-if="area.rate" class="baviator-area-rate">{{ area.rate }}</div>
            <div class="baviator-area-stat">
              <span class="baviator-area-stat-label">下注</span>
              <span class="baviator-area-stat-value">{{ area.betGold || "-" }}</span>
            </div>
            <div class="baviator-area-stat">
              <span class="baviator-area-stat-label">输赢</span>
              <span class="baviator-area-stat-value">{{ area.winLoseGold || "-" }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="baviator-empty">没有下注区域数据</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaviatorRecordView",
  props: {
    view: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    areaTone(area) {
      const value = Number(String(area && area.winLoseGold ? area.winLoseGold : 0).replace(/,/g, ""));
      if (value > 0) return "is-win";
      if (value < 0) return "is-lose";
      return "is-neutral";
    },
  },
};
</script>

<style scoped>
.baviator-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.baviator-topline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.baviator-metric,
.baviator-panel,
.baviator-area-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.baviator-metric {
  padding: 12px 14px;
}

.baviator-metric-label,
.baviator-entry-label,
.baviator-area-stat-label,
.baviator-panel-subtitle {
  color: #64748b;
  font-size: 11px;
}

.baviator-metric-value,
.baviator-entry-value,
.baviator-area-title,
.baviator-area-rate,
.baviator-area-stat-value {
  color: #0f172a;
}

.baviator-metric-value,
.baviator-area-title,
.baviator-area-rate,
.baviator-area-stat-value {
  font-weight: 700;
}

.baviator-metric-value {
  margin-top: 4px;
  font-size: 16px;
}

.baviator-panel {
  padding: 12px 14px;
}

.baviator-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.baviator-panel-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.baviator-entry-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.baviator-entry-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.baviator-area-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.baviator-area-card {
  flex: 1 1 220px;
  min-width: 220px;
  padding: 10px 12px;
}

.baviator-area-card.is-win,
.baviator-area-card.is-lose,
.baviator-area-card.is-neutral {
  border-color: rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.baviator-area-inline,
.baviator-area-stat {
  display: flex;
  align-items: center;
  gap: 10px;
}

.baviator-area-inline {
  flex-wrap: wrap;
}

.baviator-area-rate {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.96);
  color: #475569;
  font-size: 11px;
}

.baviator-area-stat {
  justify-content: flex-start;
  gap: 6px;
}

.baviator-empty {
  margin-top: 10px;
  padding: 18px 0 8px;
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 768px) {
  .baviator-topline {
    grid-template-columns: 1fr;
  }

  .baviator-area-card {
    min-width: 0;
  }

  .baviator-panel-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
