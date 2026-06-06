<template>
  <component
    :is="embedded ? 'div' : 'el-dialog'"
    v-bind="dialogProps"
    class="settlement-record-dialog"
    @update:visible="$emit('update:visible', $event)"
    @close="$emit('close')"
  >
    <div v-if="detail" class="record-detail-shell">
      <div class="record-hero">
        <div>
          <div class="record-title">{{ row.gameName || detail.confName || row.gameId }}</div>
          <div class="record-subtitle">
            <span>局号 {{ row.roundID || "-" }}</span>
            <span>玩家 {{ row.account || "-" }}</span>
          </div>
        </div>
        <div v-if="detail.supported" class="record-badge is-supported">已按客户端结构解析</div>
        <div v-else class="record-badge">通用解析</div>
      </div>

      <div v-if="!hasCustomRenderer" class="record-summary-wrap">
        <table class="record-summary-table">
          <tbody>
            <tr>
              <th
                v-for="entry in detail.summary"
                :key="`label-${entry.label}`"
                class="record-summary-label"
                :class="summaryColClass(entry.label)"
              >
                {{ entry.label }}
              </th>
            </tr>
            <tr>
              <td
                v-for="entry in detail.summary"
                :key="`value-${entry.label}`"
                class="record-summary-value"
                :class="summaryColClass(entry.label)"
              >
                {{ entry.value }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <el-alert
        v-if="detail.parseError"
        type="warning"
        :closable="false"
        :title="`解析失败: ${detail.parseError}`"
        class="record-alert"
      />

      <component
        :is="customRendererComponent"
        v-if="customRendererComponent && resolvedCustomView"
        :view="resolvedCustomView"
      />

      <div
        v-for="block in hasCustomRenderer ? [] : detail.blocks"
        :key="`${block.type}-${block.title}`"
        class="record-block"
      >
        <div class="record-block-title">{{ block.title }}</div>

        <div v-if="block.type === 'entries'" class="record-entry-list">
          <div v-for="entry in block.entries" :key="entry.label" class="record-entry-item">
            <span class="record-entry-label">{{ entry.label }}</span>
            <span class="record-entry-value">{{ entry.value }}</span>
          </div>
        </div>

        <div v-else-if="block.type === 'tags'" class="record-tag-list">
          <span v-for="(item, index) in block.items" :key="`${block.title}-${index}`" class="record-tag">{{ item }}</span>
        </div>

        <el-table v-else-if="block.type === 'table'" :data="block.rows" border size="mini" class="record-table">
          <el-table-column
            v-for="column in block.columns"
            :key="column.key"
            :prop="column.key"
            :label="column.label"
            min-width="110"
            show-overflow-tooltip
          />
        </el-table>

        <pre v-else-if="block.type === 'json'" class="record-json">{{ block.value }}</pre>
      </div>

      <div class="record-block">
        <div class="record-block-head">
          <div class="record-block-title">原始 log</div>
          <div class="record-block-actions">
            <button type="button" class="record-action-trigger" @click="copyRawLog">Copy</button>
            <button type="button" class="record-action-trigger" @click="rawLogExpanded = !rawLogExpanded">
              <span class="record-collapse-icon">{{ rawLogExpanded ? "收起" : "展开" }}</span>
            </button>
          </div>
        </div>
        <pre v-if="rawLogExpanded" class="record-json">{{ detail.rawJson }}</pre>
      </div>
    </div>
  </component>
</template>

<script>
import { buildSettlementRecordDetail, getSettlementConfName } from "./settlementRecordParser";
import SjddjRecordView from "./SjddjRecordView.vue";
import ShzRecordView from "./ShzRecordView.vue";
import SlotRecordView from "./SlotRecordView.vue";
import LhdbRecordView from "./LhdbRecordView.vue";
import LzhdRecordView from "./LzhdRecordView.vue";
import XldbRecordView from "./XldbRecordView.vue";
import WcgRecordView from "./WcgRecordView.vue";
import RhdbRecordView from "./RhdbRecordView.vue";
import SbwhRecordView from "./SbwhRecordView.vue";
import CfmmRecordView from "./CfmmRecordView.vue";
import StkhRecordView from "./StkhRecordView.vue";
import BdydsRecordView from "./BdydsRecordView.vue";
import JbpRecordView from "./JbpRecordView.vue";
import DwwgRecordView from "./DwwgRecordView.vue";
import JlbzRecordView from "./JlbzRecordView.vue";
import FksevenRecordView from "./FksevenRecordView.vue";
import SbjnRecordView from "./SbjnRecordView.vue";
import JqtRecordView from "./JqtRecordView.vue";
import SjnwRecordView from "./SjnwRecordView.vue";
import JszcRecordView from "./JszcRecordView.vue";
import XmwljRecordView from "./XmwljRecordView.vue";
import CjwpRecordView from "./CjwpRecordView.vue";
import BhjkRecordView from "./BhjkRecordView.vue";
import BaviatorRecordView from "./BaviatorRecordView.vue";
import QklsRecordView from "./QklsRecordView.vue";

export default {
  name: "SettlementRecordDialog",
  components: {
    SjddjRecordView,
    ShzRecordView,
    SlotRecordView,
    LhdbRecordView,
    LzhdRecordView,
    XldbRecordView,
    WcgRecordView,
    RhdbRecordView,
    SbwhRecordView,
    CfmmRecordView,
    StkhRecordView,
    BdydsRecordView,
    JbpRecordView,
    DwwgRecordView,
    JlbzRecordView,
    FksevenRecordView,
    SbjnRecordView,
    JqtRecordView,
    SjnwRecordView,
    JszcRecordView,
    XmwljRecordView,
    CjwpRecordView,
    BhjkRecordView,
    BaviatorRecordView,
    QklsRecordView,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    embedded: {
      type: Boolean,
      default: false,
    },
    row: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      rawLogExpanded: false,
    };
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit("update:visible", value);
      },
    },
    detail() {
      if (!this.row || !Object.keys(this.row).length) return null;
      const freshDetail = buildSettlementRecordDetail(this.row);
      const cachedDetail = this.row && this.row._recordDetail ? this.row._recordDetail : null;
      if (!cachedDetail) return freshDetail;
      return {
        ...cachedDetail,
        ...freshDetail,
        customView: freshDetail.customView || cachedDetail.customView || null,
        confName: freshDetail.confName || cachedDetail.confName || "",
        summary: freshDetail.summary && freshDetail.summary.length ? freshDetail.summary : cachedDetail.summary || [],
        blocks: freshDetail.blocks && freshDetail.blocks.length ? freshDetail.blocks : cachedDetail.blocks || [],
        rawJson: freshDetail.rawJson || cachedDetail.rawJson || "",
      };
    },
    resolvedConfName() {
      const detail = this.detail || {};
      return detail.confName || getSettlementConfName(this.row && this.row.gameId);
    },
    resolvedCustomView() {
      const detail = this.detail || {};
      return detail.customView || (this.row && this.row._recordDetail && this.row._recordDetail.customView) || null;
    },
    customRendererComponent() {
      const mode = this.resolvedCustomView && this.resolvedCustomView.mode;
      const confName = this.resolvedConfName || "";
      const componentMap = {
        sjddj: "SjddjRecordView",
        shz: "ShzRecordView",
        lhdb: "LhdbRecordView",
        lzhd: "LzhdRecordView",
        xldb: "XldbRecordView",
        wcg: "WcgRecordView",
        rhdb: "RhdbRecordView",
        sbwh: "SbwhRecordView",
        cfmm: "CfmmRecordView",
        stkh: "StkhRecordView",
        bdyds: "BdydsRecordView",
        jbp: "JbpRecordView",
        dwwg: "DwwgRecordView",
        jlbz: "JlbzRecordView",
        fkseven: "FksevenRecordView",
        sbjn: "SbjnRecordView",
        jqt: "JqtRecordView",
        sjnw: "SjnwRecordView",
        jszc: "JszcRecordView",
        xmwlj: "XmwljRecordView",
        cjwp: "CjwpRecordView",
        bhjk: "BhjkRecordView",
        baviator: "BaviatorRecordView",
        qkls: "QklsRecordView",
        slot: "SlotRecordView",
      };
      return componentMap[mode] || componentMap[confName] || "";
    },
    hasCustomRenderer() {
      return !!(this.customRendererComponent && this.resolvedCustomView);
    },
    isCustomRecordDetail() {
      return this.hasCustomRenderer;
    },
    dialogProps() {
      if (this.embedded) return {};
      return {
        title: "游戏详情",
        visible: this.innerVisible,
        width: "960px",
        top: "5vh",
      };
    },
  },
  watch: {
    visible() {
      this.rawLogExpanded = false;
    },
    row() {
      this.rawLogExpanded = false;
    },
  },
  methods: {
    summaryColClass(label) {
      if (label === "游戏ID" || label === "用户ID") return "is-narrow";
      if (label === "玩家" || label === "投注") return "is-tight";
      if (label === "输赢") return "is-compact";
      if (label === "局号") return "is-wide";
      return "";
    },
    async copyRawLog() {
      const text = this.detail && this.detail.rawJson ? this.detail.rawJson : "";
      if (!text) {
        this.$message && this.$message.warning ? this.$message.warning("没有可复制的原始 log") : null;
        return;
      }
      try {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.setAttribute("readonly", "readonly");
          textarea.style.position = "absolute";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        this.$message && this.$message.success ? this.$message.success("原始 log 已复制") : null;
      } catch (error) {
        this.$message && this.$message.error ? this.$message.error("复制失败") : null;
      }
    },
  },
};
</script>

<style scoped>
.record-detail-shell {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 76vh;
  overflow: auto;
  padding-right: 2px;
}

.record-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.18);
  background: linear-gradient(135deg, #fff7ed, #fffbeb 68%, #ffffff);
  color: #7c2d12;
}

.record-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  color: #7c2d12;
}

.record-subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  color: #9a3412;
  font-size: 11px;
}

.record-badge {
  flex-shrink: 0;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #475569;
  font-size: 10px;
  font-weight: 600;
  line-height: 28px;
}

.record-badge.is-supported {
  border-color: rgba(34, 197, 94, 0.24);
  background: rgba(240, 253, 244, 0.92);
  color: #15803d;
}

.record-summary-wrap {
  overflow-x: auto;
}

.record-summary-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  border: 0;
  background: transparent;
}

.record-summary-label {
  padding: 0 10px;
  border-right: 6px solid transparent;
  border-bottom: 0;
  background: transparent;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.record-summary-value {
  padding: 8px 10px;
  border-right: 6px solid transparent;
  color: #0f172a;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  word-break: break-all;
  vertical-align: top;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.record-summary-label.is-narrow,
.record-summary-value.is-narrow {
  width: 72px;
  min-width: 72px;
}

.record-summary-label.is-tight,
.record-summary-value.is-tight {
  width: 92px;
  min-width: 92px;
}

.record-summary-label.is-compact,
.record-summary-value.is-compact {
  width: 84px;
  min-width: 84px;
}

.record-summary-label.is-wide,
.record-summary-value.is-wide {
  width: 240px;
  min-width: 240px;
}

.record-summary-table tr > :last-child {
  border-right: 0;
}

.record-alert {
  margin-bottom: -2px;
}

.record-block {
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.record-block-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.record-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.record-block-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.record-action-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.record-collapse-icon {
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
}

.record-entry-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px 14px;
}

.record-entry-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-entry-label {
  color: #64748b;
  font-size: 11px;
}

.record-entry-value {
  color: #0f172a;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}

.record-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.record-tag {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
}

.record-table {
  width: 100%;
}

.record-json {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: auto;
}

@media (max-width: 768px) {
  .record-hero {
    flex-direction: column;
  }

  .record-entry-list {
    grid-template-columns: 1fr;
  }
}
</style>
