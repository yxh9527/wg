<template>
  <div class="page-shell">
    <el-card shadow="never" class="content-card settlement-filter-card">
      <div class="panel-head">
        <div>
          <div class="panel-kicker">Settlement</div>
          <div class="panel-title">所有注单</div>
          <div class="panel-note">按站点、代理、游戏、账号与时间筛选注单，支持导出和明细回放。</div>
        </div>
        <div class="panel-actions">
          <span class="badge-inline">{{ rangeText }}</span>
        </div>
      </div>
      <div class="settlement-filter-layout">
        <div class="settlement-filter-grid">
          <div class="field-inline">
            <label>站点</label>
            <el-select v-model="params.webId" @change="siteChanged">
              <el-option v-for="item in siteOption" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </div>
          <div class="field-inline">
            <label>代理</label>
            <el-select v-model="params.agentId" filterable clearable>
              <el-option v-for="item in agentOption" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </div>
          <div class="field-inline field-span-2">
            <label>游戏</label>
            <el-select v-model="games.value" filterable clearable class="wide-select">
              <el-option v-for="item in games.option" :key="item.number" :label="item.label" :value="item.number" />
            </el-select>
          </div>
          <div class="field-inline">
            <label>账号</label>
            <el-input v-model.trim="params.account" clearable />
          </div>
          <div class="field-inline">
            <label>昵称</label>
            <el-input v-model.trim="params.nickName" clearable />
          </div>
          <div class="field-inline">
            <label>局号</label>
            <el-input v-model.trim="params.officeNumber" clearable />
          </div>
          <div class="field-inline">
            <label>Hash</label>
            <el-input v-model.trim="params.hash" clearable class="hash-input" />
          </div>
          <div class="field-inline field-span-2">
            <label>开始时间</label>
            <el-date-picker v-model="startDate" type="datetime" value-format="timestamp" />
          </div>
          <div class="field-inline field-span-2">
            <label>结束时间</label>
            <el-date-picker v-model="endDate" type="datetime" value-format="timestamp" />
          </div>
        </div>
        <div class="settlement-filter-actions">
          <div class="settlement-complete-toggle">
            <label>完成状态</label>
            <el-switch
              v-model="params.complete"
              active-text="完成"
              inactive-text="未完成"
            />
          </div>
          <el-button type="primary" @click="searchFirstPage">搜索</el-button>
          <el-button @click="exportSearch">导出</el-button>
          <div class="settlement-filter-meta">
            <span>{{ currentSiteName }}</span>
            <span>{{ currentAgentName }}</span>
            <span>{{ currentGameName }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="content-card settlement-table-card">
      <div class="table-toolbar settlement-table-toolbar">
        <div>
          <div class="panel-kicker">Orders</div>
          <div class="panel-title">注单列表</div>
        </div>
        <div class="table-meta">共 {{ pageData.current }} 条记录</div>
      </div>
      <app-table :data="tableData" :columns="columns" :loading="loading" />
      <div class="pager-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pageData.page"
          :page-size="pageData.pageSize"
          :page-sizes="pageData.pageOpts"
          :total="pageData.current"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-dialog
      title="游戏详情"
      :visible.sync="detailVisible"
      width="70%"
      custom-class="settlement-detail-dialog"
      append-to-body
    >
      <settlement-record-dialog :row="detailRow" embedded />
      <span slot="footer"></span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from "dayjs";
import JSZip from "jszip";
import FileSaver from "file-saver";
import * as XLSX from "xlsx";
import AppTable from "@/components/AppTable.vue";
import { setting } from "@/config";
import SettlementRecordDialog from "./SettlementRecordDialog.vue";
import {
  getExportSettlementCount,
  getExportSettlements,
  getSettlement,
} from "@/api/data";
import { formatUnixDateTime, toMoney } from "./settlementHelpers";
import { buildSettlementRecordDetail } from "./settlementRecordParser";

export default {
  name: "SettlementDetailPage",
  components: {
    AppTable,
    SettlementRecordDialog,
  },
  data() {
    return {
      loading: false,
      startDate: "",
      endDate: "",
      detailVisible: false,
      detailRow: null,
      tableData: [],
      pageData: {
        current: setting.page,
        page: setting.page,
        pageSize: setting.pageSize,
        pageOpts: setting.pageOpts,
      },
      siteOption: [],
      agentOption: [],
      games: {
        value: "",
        option: [],
      },
      params: {
        webId: null,
        agentId: null,
        officeNumber: "",
        startTime: null,
        endTime: null,
        gameId: 0,
        hash: "",
        complete: true,
        account: "",
        nickName: "",
      },
    };
  },
  computed: {
    rangeText() {
      if (!this.startDate || !this.endDate) return "全部时间";
      return `${dayjs(Number(this.startDate)).format("YYYY-MM-DD HH:mm")} - ${dayjs(Number(this.endDate)).format("YYYY-MM-DD HH:mm")}`;
    },
    currentSiteName() {
      const site = this.siteOption.find((item) => item.id === this.params.webId);
      return site ? site.name : "全部站点";
    },
    currentAgentName() {
      if (!this.params.agentId || this.params.agentId === 9999999) return "全部代理";
      const agent = this.agentOption.find((item) => item.id === this.params.agentId);
      return agent ? agent.name : this.params.agentId;
    },
    currentGameName() {
      if (this.games.value === "" || this.games.value === 0) return "全部游戏";
      const game = this.games.option.find((item) => item.number === this.games.value);
      return game ? game.label : this.games.value;
    },
    columns() {
      return [
        {
          title: "代理",
          key: "agentId",
          minWidth: 100,
          align: "center",
          render: (h, { row }) => h("span", this.resolveAgentName(row.agentId)),
        },
        { title: "游戏名称", key: "gameName", minWidth: 220, align: "center" },
        { title: "局号", key: "roundID", minWidth: 280, align: "center" },
        { title: "用户ID", key: "userId", width: 90, align: "center" },
        { title: "账号", key: "account", minWidth: 100, align: "center" },
        { title: "昵称", key: "nickName", minWidth: 140, align: "center" },
        {
          title: "试玩",
          key: "isTourist",
          width: 80,
          align: "center",
          render: (h, { row }) =>
            h(
              "span",
              { class: ["status-pill", Number(row.isTourist) > 0 ? "is-negative" : "is-positive"] },
              Number(row.isTourist) > 0 ? "是" : "否"
            ),
        },
        { title: "Symbol", key: "symbol", minWidth: 140, align: "center" },
        {
          title: "状态",
          key: "complete",
          width: 100,
          align: "center",
          render: (h, { row }) =>
            h("span", { class: ["status-pill", row.complete ? "is-positive" : "is-negative"] }, row.complete ? "完成" : "未完成"),
        },
        {
          title: "流水",
          type: "action",
          width: 90,
          buttons: [
            {
              label: "查询",
              onClick: (row) => this.openRecord(row),
            },
          ],
        },
        {
          title: "详情",
          type: "action",
          width: 90,
          buttons: [
            {
              label: "查看",
              onClick: (row) => this.imgClick(row),
            },
          ],
        },
        {
          title: "有效下注",
          key: "bet",
          width: 110,
          align: "right",
          render: (h, { row }) => h("span", toMoney(row.bet)),
        },
        {
          title: "返奖",
          key: "win",
          width: 110,
          align: "right",
          render: (h, { row }) =>
            h("span", { class: Number(row.win) > 0 ? "positive" : "negative" }, toMoney(row.win)),
        },
        { title: "货币", key: "currency", width: 90, align: "center" },
        { title: "索引", key: "rowVersion", minWidth: 180, align: "center" },
        {
          title: "对局时间",
          key: "playedDate",
          minWidth: 170,
          align: "center",
          render: (h, { row }) => h("span", formatUnixDateTime(row.playedDate)),
        },
      ];
    },
  },
  methods: {
    resolveAgentName(agentId) {
      const hit = this.siteOption
        .flatMap((item) => item.agentList || [])
        .find((item) => item.id === agentId);
      return hit ? hit.name : agentId;
    },
    siteChanged(siteId) {
      sessionStorage.setItem("siteVal", siteId);
      const site = this.siteOption.find((item) => item.id === siteId);
      const agents = site ? [...site.agentList] : [];
      if (!agents.find((item) => item.id === 9999999)) {
        agents.unshift({ id: 9999999, name: "全部" });
      }
      this.agentOption = agents;
      if (!agents.find((item) => item.id === this.params.agentId)) {
        this.params.agentId = agents[0] ? agents[0].id : null;
      }
    },
    loadGames() {
      const source = JSON.parse(sessionStorage.getItem("games") || "[]");
      this.games.option = [{ number: 0, label: "全部" }].concat(
        source.map((item) => ({
          ...item,
          label: item.nameZH ? `${item.name} [${item.nameZH}]` : item.name,
        }))
      );
    },
    buildQuery() {
      const query = {
        ...this.params,
        page: this.pageData.page,
        pageSize: this.pageData.pageSize,
        gameId: this.games.value === "" || this.games.value === 0 ? null : this.games.value,
        agentId: this.params.agentId === 9999999 ? undefined : this.params.agentId,
      };
      if (this.startDate && this.endDate) {
        query.startTime = dayjs(Number(this.startDate)).unix();
        query.endTime = dayjs(Number(this.endDate)).unix();
      } else {
        query.startTime = null;
        query.endTime = null;
      }
      return query;
    },
    async fetchData() {
      this.loading = true;
      try {
        const response = await getSettlement(this.buildQuery());
        const payload = response.data.data || {};
        this.pageData.page = payload.page || this.pageData.page;
        this.pageData.current = payload.total || 0;
        this.tableData = (payload.data || []).map((item) => {
          if (item.log) {
            item._recordDetail = buildSettlementRecordDetail(item);
          }
          return item;
        });
      } finally {
        this.loading = false;
      }
    },
    searchFirstPage() {
      this.pageData.page = 1;
      this.fetchData();
    },
    async exportSearch() {
      const params = this.buildQuery();
      const countResponse = await getExportSettlementCount(params);
      const total = Number(countResponse.data.data || 0);
      if (total >= 10000) {
        this.$message.error("导出数据量大于 1w 条，请缩小查询范围后再导出");
        return;
      }
      const response = await getExportSettlements(params);
      const rows = (response.data.data.data || []).map((item) => ({
        玩家id: item.userId,
        账号: item.account,
        Symbol: item.symbol,
        游戏名称: item.gameName,
        昵称: item.nickName,
        局号: item.roundID,
        游戏时间: formatUnixDateTime(item.playedDate),
        代理id: item.agentId,
        余额: item.balance,
        下注: item.bet,
        返奖: item.win,
        是否完成: item.complete,
        税收: item.revenue,
        货币: item.currency,
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "注单");
      const array = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const zip = new JSZip();
      zip.file("注单.xlsx", array);
      const content = await zip.generateAsync({ type: "blob" });
      FileSaver.saveAs(content, `注单${Date.now()}.zip`);
    },
    imgClick(row) {
      this.detailRow = row;
      this.detailVisible = true;
    },
    openRecord(row) {
      this.$router.push({
        name: "players-record",
        query: {
          id: row.userId,
          agent: row.agentId,
          on: row.roundID,
        },
      });
    },
    changePage(page) {
      this.pageData.page = page;
      this.fetchData();
    },
    changePageSize(size) {
      this.pageData.pageSize = size;
      this.pageData.page = 1;
      this.fetchData();
    },
    initSiteOption() {
      const siteOption = JSON.parse(sessionStorage.getItem("siteOption") || "[]");
      const siteVal = Number(sessionStorage.getItem("siteVal"));
      this.siteOption = siteOption;
      this.params.webId = this.$route.query.siteId ? Number(this.$route.query.siteId) : siteVal || (siteOption[0] && siteOption[0].id);
      this.siteChanged(this.params.webId);
      if (this.$route.query.agentId) {
        this.params.agentId = Number(this.$route.query.agentId);
      }
      if (this.$route.query.userId) {
        this.params.userId = this.$route.query.userId;
      }
      if (this.$route.query.account) {
        this.params.account = this.$route.query.account;
      }
      if (this.$route.query.nickName) {
        this.params.nickName = this.$route.query.nickName;
      }
      if (this.$route.query.order) {
        this.params.officeNumber = this.$route.query.order;
      }
    },
  },
  async mounted() {
    this.initSiteOption();
    this.loadGames();
    await this.fetchData();
  },
};
</script>

<style scoped>
.settlement-filter-card /deep/ .el-card__body {
  padding-top: 14px;
  padding-bottom: 12px;
}

.settlement-filter-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 14px;
  align-items: start;
}

.settlement-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px 12px;
}

.settlement-filter-grid .field-inline {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 5px;
  min-height: auto;
}

.settlement-filter-grid .field-inline :deep(.el-input),
.settlement-filter-grid .field-inline :deep(.el-select),
.settlement-filter-grid .field-inline :deep(.el-date-editor) {
  width: 100%;
}

.field-span-2 {
  grid-column: span 2;
}

.settlement-filter-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98));
}

.settlement-filter-actions .el-button {
  width: 100%;
  margin-left: 0;
}

.settlement-complete-toggle {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 4px;
}

.settlement-complete-toggle label {
  color: var(--text-sub);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.settlement-complete-toggle :deep(.el-switch) {
  display: flex;
  align-items: center;
}

.settlement-complete-toggle :deep(.el-switch__label) {
  color: var(--text-sub);
}

.settlement-filter-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 2px;
  color: var(--text-sub);
  font-size: 12px;
  line-height: 1.5;
}

.wide-select {
  min-width: 260px;
}

.hash-input {
  min-width: 180px;
}

.settlement-table-card /deep/ .el-card__body {
  padding-top: 14px;
}

.settlement-table-toolbar {
  margin-bottom: 12px;
}
@media (max-width: 1200px) {
  .settlement-filter-layout {
    grid-template-columns: 1fr;
  }

  .settlement-filter-actions {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }

  .settlement-filter-actions .el-button {
    width: auto;
    min-width: 112px;
  }

  .settlement-filter-meta {
    flex: 1;
    min-width: 220px;
  }

  .settlement-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .settlement-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .settlement-filter-grid {
    grid-template-columns: 1fr;
  }

  .field-span-2 {
    grid-column: span 1;
  }
}

:global(.settlement-detail-dialog) {
  width: min(1360px, calc(100vw - 48px)) !important;
  max-width: calc(100vw - 48px);
  margin: 0 auto !important;
  top: 50%;
  transform: translateY(-50%);
}

:global(.settlement-detail-dialog .el-dialog__body) {
  padding: 12px 16px 16px;
}

@media (max-width: 768px) {
  :global(.settlement-detail-dialog) {
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px);
  }
}
</style>
