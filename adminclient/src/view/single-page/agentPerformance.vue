<template>
  <div>
    <Card>
      <div class="inlineForm">
        <div>时间选择：</div>
        <div style="display: flex; align-items: center">
          <DatePicker
            v-model="startDate"
            :options="startDateRestrict"
            @on-change="resetIsMonth"
            placeholder=""
            style="width: 120px"
            :clearable="false"
          ></DatePicker>
        </div>
        <div style="padding-left: 20px">选择全月：</div>
        <div>
          <i-switch v-model="isMonth"></i-switch>
        </div>
        <Button @click="fetchGameList" style="margin-left: 20px" type="primary"
          >查询</Button
        >
      </div>
    </Card>
    <Card style="margin: 10px 0">
      <Table :columns="agentColumns" :data="agentData"></Table>
      <div style="margin-top: 20px; text-align: center">
        <Page
          :total="total"
          :page-size="pagesize"
          @on-change="currentChanged"
        />
      </div>
    </Card>

    <Modal width="1010px" v-model="gameDetailModel" title="游戏详情">
      <Table
        height="500"
        width="980"
        :columns="gameDetailColumns"
        :data="gameDetail"
      ></Table>
    </Modal>
  </div>
</template>

<script>
import axios from "@/libs/api.request";
import { getToken } from "@/libs/util";
import * as dayjs from "dayjs";

export default {
  components: {},
  props: ["id"],
  data() {
    let _this = this;
    return {
      gameDetailModel: false,
      isMonth: false,
      showIsMonth: false,
      startDate: new Date(),
      startDateRestrict: {
        disabledDate(date) {
          if (date.getTime() > Date.now()) {
            return true;
          }
        },
      },
      /**
       * 表格配置
       */
      gameDetailColumns: [
        {
          type: "expand",
          width: 50,
          render: (h, params) => {
            let gameDetailColumns = [
              {
                title: "房间",
                key: "gameName",
                align: "center",
              },
              {
                title: "上日人数",
                key: "gameName",
                width: 180,
                align: "center",
              },
              {
                title: "此日人数",
                key: "gameName",
                width: 180,
                align: "center",
              },
              {
                title: "上日投注",
                key: "gameName",
                width: 180,
                align: "center",
              },
              {
                title: "此日投注",
                key: "gameName",
                width: 180,
                align: "center",
              },
            ];
            let gameDetail = [
              {
                gameName: "",
              },
            ];
            return (
              <Table
                width="910"
                show-header={false}
                columns={gameDetailColumns}
                data={gameDetail}
              ></Table>
            );
          },
        },
        {
          title: "游戏",
          key: "gameName",
          align: "center",
        },

        {
          title: "游戏",
          width: 150,
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>上月人数</span>;
            } else {
              return <span>上日人数</span>;
            }
          },
          key: "userLast",
          align: "center",
        },

        {
          title: "游戏",
          width: 150,
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>此月人数</span>;
            } else {
              return <span>此日人数</span>;
            }
          },
          key: "userNow",
          align: "center",
        },

        {
          title: "游戏",
          width: 150,
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>上月有效投注</span>;
            } else {
              return <span>上日有效投注</span>;
            }
          },
          key: "last",
          align: "center",
        },
        {
          title: "游戏",
          width: 150,
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>此月有效投注</span>;
            } else {
              return <span>此日有效投注</span>;
            }
          },
          key: "now",
          align: "center",
        },
      ],
      gameDetail: [],
      agentColumns: [
        {
          title: "代理",
          key: "nickName",
          align: "center",
        },
        {
          title: "上月（日）有效投注",
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>上月有效投注</span>;
            } else {
              return <span>上日有效投注</span>;
            }
          },
          align: "center",
          render(h, params) {
            if (params.row.last.effectiveBetsTotal) {
              let jsx = (
                <span>{params.row.last.effectiveBetsTotal.toFixed(2)}</span>
              );
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "此月（日）有效投注",
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>此月有效投注</span>;
            } else {
              return <span>此日有效投注</span>;
            }
          },
          align: "center",
          render(h, params) {
            if (params.row.now.effectiveBetsTotal) {
              let jsx = (
                <span>{params.row.now.effectiveBetsTotal.toFixed(2)}</span>
              );
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "对比",
          align: "center",
          render(h, params) {
            if (
              params.row.last.effectiveBetsTotal &&
              params.row.now.effectiveBetsTotal
            ) {
              let percentage = Math.round(
                ((params.row.now.effectiveBetsTotal -
                  params.row.last.effectiveBetsTotal) /
                  params.row.last.effectiveBetsTotal) *
                  100
              );
              let jsx = (
                <span style={{ color: percentage > 0 ? "green" : "red" }}>
                  <span>{percentage > 0 ? "🡅" : "🡇"}</span> {percentage}%
                </span>
              );
              if (
                params.row.now.effectiveBetsTotal <= 0 ||
                params.row.last.effectiveBetsTotal <= 0
              ) {
                jsx = <span>-</span>;
              }
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "上月（日）注单",
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>上月注单</span>;
            } else {
              return <span>上日注单</span>;
            }
          },
          align: "center",
          render(h, params) {
            if (params.row.last.docCount) {
              let jsx = <span>{params.row.last.docCount.toFixed(2)}</span>;
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "此月（日）注单",
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>此月注单</span>;
            } else {
              return <span>此日注单</span>;
            }
          },
          align: "center",
          render(h, params) {
            if (params.row.now.docCount) {
              let jsx = <span>{params.row.now.docCount.toFixed(2)}</span>;
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "对比",
          align: "center",
          render(h, params) {
            if (params.row.last.docCount && params.row.now.docCount) {
              let percentage = Math.round(
                ((params.row.now.docCount - params.row.last.docCount) /
                  params.row.last.docCount) *
                  100
              );
              let jsx = (
                <span style='{{ color: percentage > 0 ? "green" : "red" }}'>
                  <span>{percentage > 0 ? "🡅" : "🡇"}</span>
                  {percentage}%
                </span>
              );
              if (
                params.row.now.docCount <= 0 ||
                params.row.last.docCount <= 0
              ) {
                jsx = <span>-</span>;
              }
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "上月（日）盈亏",
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>上月盈亏</span>;
            } else {
              return <span>上日盈亏</span>;
            }
          },
          align: "center",
          render(h, params) {
            if (params.row.last.profitLossTotal) {
              let jsx = (
                <span>{params.row.last.profitLossTotal.toFixed(2)}</span>
              );
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "此月（日）盈亏",
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>此月盈亏</span>;
            } else {
              return <span>此日盈亏</span>;
            }
          },
          align: "center",
          render(h, params) {
            if (params.row.now.profitLossTotal) {
              let jsx = (
                <span>{params.row.now.profitLossTotal.toFixed(2)}</span>
              );
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "对比",
          align: "center",
          render(h, params) {
            if (
              params.row.last.profitLossTotal &&
              params.row.now.profitLossTotal
            ) {
              let percentage = Math.round(
                ((params.row.now.profitLossTotal -
                  params.row.last.profitLossTotal) /
                  params.row.last.profitLossTotal) *
                  100
              );
              let jsx = (
                <span style={{ color: percentage > 0 ? "green" : "red" }}>
                  <span>{percentage > 0 ? "🡅" : "🡇"}</span> {percentage}%
                </span>
              );
              if (
                params.row.now.profitLossTotal <= 0 ||
                params.row.last.profitLossTotal <= 0
              ) {
                jsx = <span>-</span>;
              }
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "上月（日）杀数",
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>上月杀数</span>;
            } else {
              return <span>上日杀数</span>;
            }
          },
          align: "center",
          render(h, params) {
            if (
              params.row.last.profitLossTotal &&
              params.row.last.effectiveBetsTotal
            ) {
              let jsx = (
                <span>
                  {(
                    params.row.last.profitLossTotal /
                    params.row.last.effectiveBetsTotal
                  ).toFixed(3)}
                </span>
              );
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "此月（日）杀数",
          renderHeader(h, params) {
            if (_this.showIsMonth) {
              return <span>此月杀数</span>;
            } else {
              return <span>此日杀数</span>;
            }
          },
          align: "center",
          render(h, params) {
            if (
              params.row.now.profitLossTotal &&
              params.row.now.effectiveBetsTotal
            ) {
              let jsx = (
                <span>
                  {(
                    params.row.now.profitLossTotal /
                    params.row.now.effectiveBetsTotal
                  ).toFixed(3)}
                </span>
              );
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "对比",
          align: "center",
          render(h, params) {
            if (
              params.row.last.profitLossTotal &&
              params.row.last.effectiveBetsTotal &&
              params.row.now.profitLossTotal &&
              params.row.now.effectiveBetsTotal
            ) {
              let percentage =
                params.row.now.profitLossTotal /
                  params.row.now.effectiveBetsTotal -
                params.row.last.profitLossTotal /
                  params.row.last.effectiveBetsTotal;
              let jsx = (
                <span style='{{ color: percentage > 0 ? "green" : "red" }}'>
                  <span>{percentage > 0 ? "🡅" : "🡇"}</span>{" "}
                  {percentage.toFixed(3)}
                </span>
              );

              if (
                params.row.now.profitLossTotal <= 0 ||
                params.row.last.profitLossTotal <= 0 ||
                params.row.now.effectiveBetsTotal <= 0 ||
                params.row.last.effectiveBetsTotal <= 0
              ) {
                jsx = <span>-</span>;
              }
              return jsx;
            } else {
              return "";
            }
          },
        },
        {
          title: "游戏明细",
          align: "center",
          render(h, params) {
            let jsx = (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  if (params.row.last.games || params.row.now.games) {
                    let games = JSON.parse(sessionStorage.getItem("games"));
                    let arr = [];
                    if (!params.row.now.games) {
                      params.row.now.games = { buckets: [] };
                    }
                    if (!params.row.last.games) {
                      params.row.last.games = { buckets: [] };
                    }
                    //同步一下数据
                    params.row.last.games.buckets.map((game) => {
                      let ishas = params.row.now.games.buckets.find(
                        (x) => x.key == game.key
                      );
                      if (!ishas) {
                        params.row.now.games.buckets.push({
                          key: game.key,
                          effectiveBetsTotal: {
                            value: 0,
                          },
                          userTotal: {
                            value: 0,
                          },
                        });
                      }
                    });
                    params.row.last.games.buckets.sort((a, b) => a.key - b.key);
                    params.row.now.games.buckets.sort((a, b) => a.key - b.key);
                    let showType =
                      params.row.last.games.buckets.length >
                      params.row.now.games.buckets.length
                        ? params.row.last.games.buckets
                        : params.row.now.games.buckets;

                    let showType2 =
                      params.row.last.games.buckets.length >
                      params.row.now.games.buckets.length
                        ? "last"
                        : "now";
                    showType.map((item, gameindex) => {
                      let gameName = "未知游戏";
                      let obj = games.find((x, index) => x.number == item.key);
                      if (obj !== undefined && obj != null) {
                        if (obj.nameZH == "" || obj.nameZH == undefined) {
                          gameName = obj.name;
                        } else {
                          gameName = obj.name + " [" + obj.nameZH + "]";
                        }
                      }
                      let last, now, userLast, userNow;
                      if (showType2 == "last") {
                        last = item.effectiveBetsTotal.value;
                        now = params.row.now.games.buckets.find(
                          (x) => x.key == item.key
                        )
                          ? params.row.now.games.buckets.find(
                              (x) => x.key == item.key
                            ).effectiveBetsTotal.value
                          : 0;

                        userLast = item.userTotal.value;
                        userNow = params.row.now.games.buckets.find(
                          (x) => x.key == item.key
                        )
                          ? params.row.now.games.buckets.find(
                              (x) => x.key == item.key
                            ).userTotal.value
                          : 0;
                      } else {
                        now = item.effectiveBetsTotal.value;
                        last = params.row.last.games.buckets.find(
                          (x) => x.key == item.key
                        )
                          ? params.row.last.games.buckets.find(
                              (x) => x.key == item.key
                            ).effectiveBetsTotal.value
                          : 0;
                        userNow = item.userTotal.value;
                        userLast = params.row.last.games.buckets.find(
                          (x) => x.key == item.key
                        )
                          ? params.row.last.games.buckets.find(
                              (x) => x.key == item.key
                            ).userTotal.value
                          : 0;
                      }
                      arr.push({
                        gameName,
                        last: last.toFixed(2),
                        now: now.toFixed(2),
                        userLast,
                        userNow,
                      });
                    });
                    _this.gameDetail = arr;
                    _this.gameDetailModel = true;
                  }
                }}
              >
                查看
              </Button>
            );
            return jsx;
          },
        },
      ],

      /**
       * 表格数据
       */
      agentDataOrigin: [],
      agentData: [],
      page: 1,
      total: 1,
      pagesize: 20,
    };
  },
  methods: {
    resetIsMonth() {
      this.isMonth = false;
    },
    /**
     * 切换分页
     */
    currentChanged(page) {
      this.agentData = Array.from(this.agentDataOrigin).splice(
        (page - 1) * this.pagesize,
        this.pagesize
      );
    },
    /**
     * 查询游戏数据
     */
    async fetchGameList() {
      this.showIsMonth = this.isMonth;

      let data = await axios.request({
        url: "v2/stat/agent/ag-group",
        method: "get",
        params: {
          token: getToken(),
          //   agentId: this.id,
          date: dayjs(this.startDate).format("YYYY-MM-DD"),
          range_type: this.isMonth ? "month" : "day",
        },
      });

      if (data && data.data && data.data.code == 200) {
        await data.data.data.map((d) => {
          d.last.profitLossTotal &&
            (d.last.profitLossTotal = -d.last.profitLossTotal);
          d.now.profitLossTotal &&
            (d.now.profitLossTotal = -d.now.profitLossTotal);
        });
        this.agentDataOrigin = data.data.data;
        this.agentData = Array.from(data.data.data).splice(0, this.pagesize);
        this.total = data.data.data.length;
      }
    },
  },
  mounted() {
    // this.fetchGameList();
  },
};
</script>

<style scoped lang="less">
.inlineForm {
  display: flex;
  align-items: center;
  padding: 10px 0;
}
.countBox {
  // display: flex;
  // justify-content: space-between;
  height: 60px;
  clear: both;
  margin-top: 15px;
  .countItem {
    text-align: center;
    background: #efeeee;
    padding: 10px 40px;
    float: left;
    margin-left: 20px;
    background: url(../../assets/images/a2.png);
    font-size: 15px;
    border-radius: 5px;
    -webkit-box-shadow: 0px 1px 2px 0px #ccc4c4;
    box-shadow: 0px 1px 2px 0px #ccc4c4;
    background-size: cover;
    background-position: center;
    color: #fff;
    height: 80px;
    line-height: 25px;
    span {
      font-weight: 600;
    }
    b {
      font-size: 14px;
    }
  }
}
.countBox .countItem:first-child {
  margin-left: 0px;
}
</style>
