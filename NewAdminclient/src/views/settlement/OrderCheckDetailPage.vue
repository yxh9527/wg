<template>
  <div class="page-shell">
    <el-card shadow="never" class="content-card">
      <app-table :data="tableData" :columns="columns" :loading="loading" />
    </el-card>

    <el-dialog title="游戏详情" :visible.sync="detailVisible" width="70%">
      <iframe :src="detailUrl" width="100%" height="520" frameborder="0"></iframe>
      <span slot="footer"></span>
    </el-dialog>
  </div>
</template>

<script>
import AppTable from "@/components/AppTable.vue";
import { getGameServers, getQueryOrder } from "@/api/data";
import { formatUnixDateTime, toMoney } from "./settlementHelpers";

export default {
  name: "OrderCheckDetailPage",
  components: {
    AppTable,
  },
  data() {
    return {
      loading: false,
      tableData: [],
      replays: [],
      detailVisible: false,
      detailUrl: "",
    };
  },
  computed: {
    columns() {
      return [
        { title: "代理", key: "agentId", width: 90, align: "center" },
        { title: "游戏名称", key: "gameName", minWidth: 220, align: "center" },
        { title: "局号", key: "roundID", minWidth: 180, align: "center" },
        { title: "用户ID", key: "userId", width: 90, align: "center" },
        { title: "账号", key: "account", minWidth: 100, align: "center" },
        { title: "昵称", key: "nickName", minWidth: 140, align: "center" },
        { title: "Symbol", key: "symbol", minWidth: 140, align: "center" },
        {
          title: "状态",
          key: "complete",
          width: 100,
          align: "center",
          render: (h, { row }) => h("span", { class: row.complete ? "positive" : "negative" }, row.complete ? "完成" : "未完成"),
        },
        {
          title: "详情",
          type: "action",
          width: 90,
          buttons: [
            {
              label: "查看",
              onClick: (row) => this.openDetail(row),
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
    async initReplays() {
      const response = await getGameServers();
      this.replays = (((response.data.data || {}).data || {}).replays || []);
    },
    async fetchData() {
      this.loading = true;
      try {
        const response = await getQueryOrder({
          token: this.$route.query.token,
          account: this.$route.query.account,
          roundId: this.$route.query.order,
        });
        const payload = response.data.data || {};
        this.tableData = (payload.data || []).map((item) => {
          if (item.detail && typeof item.detail === "string") {
            try {
              item.detail = JSON.parse(item.detail);
            } catch (error) {
              // ignore invalid json
            }
          }
          return item;
        });
      } finally {
        this.loading = false;
      }
    },
    openDetail(row) {
      if (!this.replays.length || !row.hash) return;
      this.detailUrl = `${this.replays[0]}/share/${row.hash}`;
      this.detailVisible = true;
    },
  },
  async mounted() {
    await this.initReplays();
    await this.fetchData();
  },
};
</script>
