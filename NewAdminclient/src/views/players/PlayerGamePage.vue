<template>
  <div class="page-shell">
    <el-card shadow="never" class="content-card">
      <div class="panel-head">
        <div>
          <div class="panel-kicker">Player</div>
          <div class="panel-title">玩家注单</div>
          <div class="panel-note">查看玩家注单明细、回放和对应流水入口。</div>
        </div>
      </div>
      <el-descriptions :column="2" border v-if="userInfo" class="info-descriptions">
        <el-descriptions-item label="玩家ID">{{ userInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="玩家昵称">{{ userInfo.nickName }}</el-descriptions-item>
        <el-descriptions-item label="站点">{{ userInfo.webName }}</el-descriptions-item>
        <el-descriptions-item label="所属代理">{{ userInfo.agentName }}</el-descriptions-item>
        <el-descriptions-item label="最近登录时间">{{ formatDateTime(userInfo.logTime) }}</el-descriptions-item>
        <el-descriptions-item label="有效下注">{{ toFixedValue(userInfo.totalEffBet) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="content-card">
      <div class="table-toolbar">
        <div>
          <div class="panel-kicker">Filter</div>
          <div class="panel-title">注单筛选</div>
        </div>
        <div class="table-meta">共 {{ pageData.current }} 条注单</div>
      </div>
      <div class="toolbar-row">
        <div class="field-inline">
          <label>开始时间</label>
          <el-date-picker v-model="startTime" type="datetime" value-format="timestamp" />
        </div>
        <div class="field-inline">
          <label>结束时间</label>
          <el-date-picker v-model="endTime" type="datetime" value-format="timestamp" />
        </div>
        <div class="field-inline">
          <label>游戏</label>
          <el-select v-model="gameId" filterable clearable class="wide-select">
            <el-option v-for="item in gameOptions" :key="item.number" :label="item.label" :value="item.number" />
          </el-select>
        </div>
        <div class="field-inline">
          <label>注单号</label>
          <el-input v-model.trim="officeNumber" clearable />
        </div>
        <div class="field-inline">
          <el-button type="primary" @click="searchFirstPage">搜索</el-button>
        </div>
      </div>
      <div class="table-toolbar inner-toolbar">
        <div>
          <div class="panel-kicker">Orders</div>
          <div class="panel-title">注单列表</div>
        </div>
        <div class="table-meta">{{ currentGameText }}</div>
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

    <el-dialog title="注单详情回放" :visible.sync="detailVisible" width="70%">
      <iframe :src="detailUrl" width="100%" height="520" frameborder="0"></iframe>
      <span slot="footer"></span>
    </el-dialog>
  </div>
</template>

<script>
import AppTable from "@/components/AppTable.vue";
import { getGameData2, getGameServers, getPlayerFwDetailData, getPlayerInfoData } from "@/api/data";
import { formatDateTime, toFixedValue } from "./playersHelpers";

export default {
  name: "PlayerGamePage",
  components: {
    AppTable,
  },
  data() {
    return {
      loading: false,
      userInfo: null,
      startTime: "",
      endTime: "",
      officeNumber: "",
      gameId: "",
      gameOptions: [],
      replays: [],
      tableData: [],
      detailVisible: false,
      detailUrl: "",
      pageData: {
        current: 0,
        page: 1,
        pageSize: 15,
        pageOpts: [15, 30, 50, 100, 200, 300],
      },
    };
  },
  computed: {
    currentGameText() {
      if (!this.gameId || this.gameId === 0) return "当前游戏：全部";
      const hit = this.gameOptions.find((item) => item.number === this.gameId);
      return `当前游戏：${hit ? hit.label : this.gameId}`;
    },
    columns() {
      return [
        { title: "游戏ID", key: "gameId", width: 100, align: "center" },
        { title: "游戏名称", key: "gameName", minWidth: 180, align: "center" },
        { title: "局号", key: "roundID", minWidth: 180, align: "center" },
        {
          title: "对局时间",
          key: "playedDate",
          minWidth: 170,
          align: "center",
          render: (h, { row }) => h("span", row.playedDate ? new Date(row.playedDate).toLocaleString() : ""),
        },
        { title: "货币", key: "currency", width: 100, align: "center" },
        {
          title: "有效下注",
          key: "bet",
          minWidth: 120,
          align: "center",
          render: (h, { row }) => h("span", toFixedValue(row.bet)),
        },
        {
          title: "总盈亏",
          key: "win",
          minWidth: 120,
          align: "center",
          render: (h, { row }) => {
            const value = Number(row.win || 0);
            return h("span", { class: value > 0 ? "positive" : "negative" }, value.toFixed(2));
          },
        },
        {
          title: "操作",
          type: "action",
          width: 180,
          buttons: [
            {
              label: "详情页",
              onClick: (row) => this.openSettlementDetail(row),
            },
            {
              label: "回放",
              onClick: (row) => this.openReplay(row),
            },
            {
              label: "流水查询",
              onClick: (row) => this.openRecord(row),
            },
          ],
        },
      ];
    },
  },
  methods: {
    formatDateTime,
    toFixedValue,
    async initUser() {
      const response = await getPlayerInfoData({
        id: this.$route.query.id,
        agentId: this.$route.query.agent,
      });
      this.userInfo = response.data.data;
    },
    async initGames() {
      const response = await getGameData2();
      this.gameOptions = [{ number: 0, label: "全部" }].concat(
        (response.data.data || []).map((item) => ({
          ...item,
          label: item.nameZH ? `${item.name} [${item.nameZH}]` : item.name,
        }))
      );
    },
    async initGameServers() {
      const response = await getGameServers();
      this.replays = (((response.data.data || {}).data || {}).replays || []);
    },
    buildQuery() {
      return [
        { page: this.pageData.page },
        { pageSize: this.pageData.pageSize },
        { userId: this.$route.query.id },
        { officeNumber: this.officeNumber || this.$route.query.on || "" },
        { startTime: this.startTime || "" },
        { endTime: this.endTime || "" },
        { gameId: this.gameId },
        { agentId: this.$route.query.agent },
      ];
    },
    async fetchGameList() {
      this.loading = true;
      try {
        const response = await getPlayerFwDetailData(this.buildQuery());
        const payload = response.data.data || {};
        this.tableData = (payload.data || []).map((item) => {
          if (item.detail && typeof item.detail === "string") {
            try {
              item.detail = JSON.parse(item.detail);
            } catch (error) {
              // ignore invalid detail payload
            }
          }
          return item;
        });
        this.pageData.current = payload.total || 0;
      } finally {
        this.loading = false;
      }
    },
    searchFirstPage() {
      this.pageData.page = 1;
      this.fetchGameList();
    },
    changePage(page) {
      this.pageData.page = page;
      this.fetchGameList();
    },
    changePageSize(size) {
      this.pageData.pageSize = size;
      this.pageData.page = 1;
      this.fetchGameList();
    },
    openSettlementDetail(row) {
      this.$router.push({
        name: "settlement-detail",
        query: {
          siteId: this.$route.query.siteId || "",
          agentId: this.$route.query.agent || "",
          userId: this.$route.query.id || "",
          order: row.roundID,
          account: this.userInfo ? this.userInfo.userId || "" : "",
          nickName: this.userInfo ? this.userInfo.nickName || "" : "",
        },
      });
    },
    openReplay(row) {
      if (!this.replays.length || !row.hash) return;
      this.detailUrl = `${this.replays[0]}/share/${row.hash}`;
      this.detailVisible = true;
    },
    openRecord(row) {
      const route = this.$router.resolve({
        name: "players-record",
        query: {
          id: row.userId,
          agent: row.agentId,
          on: row.roundID,
        },
      });
      window.open(route.href, "_blank");
    },
  },
  async mounted() {
    await Promise.all([this.initUser(), this.initGames(), this.initGameServers()]);
    await this.fetchGameList();
  },
};
</script>

<style scoped>
.wide-select {
  min-width: 320px;
}

.info-descriptions {
  margin-top: 4px;
}

.inner-toolbar {
  margin-top: 16px;
  margin-bottom: 12px;
}
</style>
