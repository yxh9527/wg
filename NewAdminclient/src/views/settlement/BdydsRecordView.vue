<template>
  <div class="bdyds-view">
    <div class="bdyds-head">
      <div class="bdyds-metric">
        <span>总投注</span>
        <strong>{{ money(view.totalBetGold) }}</strong>
      </div>
      <div class="bdyds-metric">
        <span>总输赢</span>
        <strong>{{ money(view.totalWinLoseGold) }}</strong>
      </div>
      <div class="bdyds-metric">
        <span>总倍率</span>
        <strong>{{ money(view.totalRate) }}</strong>
      </div>
      <div class="bdyds-metric">
        <span>图标数</span>
        <strong>{{ view.itemCount }}</strong>
      </div>
    </div>

    <div v-if="view.pages.length > 1" class="bdyds-tabs">
      <button
        v-for="page in view.pages"
        :key="page.pageIndex"
        type="button"
        class="bdyds-tab"
        :class="{ 'is-active': page.pageIndex === pageIndex }"
        @click="pageIndex = page.pageIndex"
      >
        {{ page.label }}
      </button>
    </div>

    <div class="bdyds-grid">
      <div v-for="item in currentPage.items" :key="item.index" class="bdyds-card">
        <div class="bdyds-card-top">
          <atlas-sprite
            v-if="hasAtlasFrame(item.iconId)"
            :atlas="view.iconAtlas"
            :frame-key="item.iconId"
            :max-width="76"
            :max-height="64"
          />
          <span v-else class="bdyds-fallback">{{ item.iconId || "-" }}</span>
        </div>
        <div class="bdyds-card-bottom">
          <span class="bdyds-card-label">倍率</span>
          <strong>x{{ money(item.rate) }}</strong>
        </div>
      </div>
    </div>

    <div class="bdyds-footer">
      <span>{{ currentPage.label }}</span>
      <strong>本页倍率 {{ money(currentPage.totalRate) }}</strong>
    </div>
  </div>
</template>

<script>
import AtlasSprite from "./AtlasSprite.vue";
import { toMoney } from "./settlementHelpers";

export default {
  name: "BdydsRecordView",
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
      return this.view.pages[this.pageIndex] || { label: "第 1 页", items: [], totalRate: 0 };
    },
  },
  methods: {
    hasAtlasFrame(iconId) {
      return !!(
        this.view &&
        this.view.iconAtlas &&
        this.view.iconAtlas.frames &&
        this.view.iconAtlas.frames[String(iconId)]
      );
    },
    money(value) {
      return toMoney(value || 0);
    },
  },
};
</script>

<style scoped>
.bdyds-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bdyds-head,
.bdyds-footer,
.bdyds-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bdyds-metric,
.bdyds-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  background: #fff;
}

.bdyds-metric span,
.bdyds-footer span {
  font-size: 11px;
  color: #64748b;
}

.bdyds-metric strong,
.bdyds-footer strong {
  font-size: 12px;
  color: #0f172a;
}

.bdyds-tabs {
  overflow-x: auto;
  flex-wrap: nowrap;
}

.bdyds-tab {
  border: 0;
  border-radius: 999px;
  padding: 6px 10px;
  background: #e2e8f0;
  color: #334155;
  cursor: pointer;
}

.bdyds-tab.is-active {
  background: #0f172a;
  color: #fff;
}

.bdyds-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.bdyds-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, #fff, #f8fafc);
}

.bdyds-card-top {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bdyds-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.bdyds-card-label {
  font-size: 11px;
  color: #64748b;
}

.bdyds-card-bottom strong {
  font-size: 12px;
  color: #0f172a;
}

.bdyds-fallback {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}
</style>
