<template>
   <div>
    <Card style="margin: 10px 0">
        <Table :columns="gameSettingColumn" :data="gameSettingData"></Table>
        <div style="margin-top: 20px; text-align: center">
        </div>
    </Card>
    <Modal
        v-model="showBairenGameSettingData"
        title="金鲨银鲨游戏算法设置"
        @on-ok="saveBairenGameSettingData(currentBairenGameSettingData.isAdd)"
    >
        <div v-if="currentBairenGameSettingData">
            <div>
                <span>名字</span>
                <Input type="text" v-model="currentBairenGameSettingData.name"/>
                <span>盈亏比例Min</span>
                <Input type="number" v-model="currentBairenGameSettingData.min" />
                <span>盈亏比例Max</span>
                <Input type="number" v-model="currentBairenGameSettingData.max" />
                <span>低水位中奖概率</span>
                <Input type="number" v-model="currentBairenGameSettingData.low_odds" />
                <span>低水位中奖排除项</span>
                <div>
                <RadioGroup v-model="currentBairenGameSettingData.low_throw_away">
                    <Radio v-for="item in throwOpt" :label = "item.value" :value = "item.value" >
                        <span>{{item.label}}</span>
                    </Radio>
                </RadioGroup>
                </div>
                <span>正常水位中奖概率</span>
                <Input type="number" v-model="currentBairenGameSettingData.normal_odds" />
                <span>正常水位中奖排除项</span>
                <div>
                <RadioGroup v-model="currentBairenGameSettingData.normal_throw_away">
                    <Radio v-for="item in throwOpt" :label = "item.value" :value = "item.value" >
                        <span>{{item.label}}</span>
                    </Radio>
                </RadioGroup>
                </div>
                <span>高水位中奖概率</span>
                <Input type="number" v-model="currentBairenGameSettingData.high_odds" />
                <span>高水位中奖排除项</span>
                <div>
                <RadioGroup v-model="currentBairenGameSettingData.high_throw_away">
                    <Radio v-for="item in throwOpt" :label = "item.value" :value = "item.value" >
                        <span>{{item.label}}</span>
                    </Radio>
                </RadioGroup>
                </div>
            </div>
        </div>
        <div v-else></div>
    </Modal>
   </div>
</template>

<script>
import Tables from "_c/tables";
import axios from "@/libs/api.request";
import { getToken } from "@/libs/util";
import * as dayjs from "dayjs";

export default {
  name: "jsys_control",
  components: {
    Tables
  },
  props:["gameSettingData","paramBairen"],
  inject: ["getGameSettingList"],
  data() {
    let _this = this;
    return {
        gameSettingColumn: [
        {
          title:"id",
          key:"id",
          align:"center",
          width:140,
        },
        {
          title: "配置名称",
          key: "name",
          align: "center",
        },
        {
          title: "盈亏比例Min",
          key: "min",
          align: "center",
        },
        {
          title: "盈亏比例Max",
          key: "max",
          align: "center",
        },
        {
          title: "低水位中奖概率",
          key: "low_odds",
          align: "center",
        },
        {
          title: "低水位中奖排除项",
          key: "low_throw_away",
          align: "center",
          render(h, params) {
            let tag = "奖励排除最大项";
            if (params.row.low_throw_away===0){
              tag = "奖励排除最小项";
            }
            return h("span", {}, tag);
          },
        },
        {
          title: "正常水位中奖概率",
          key: "normal_odds",
          align: "center",
        },
        {
          title: "正常水位中奖排除项",
          key: "normal_throw_away",
          align: "center",
          render(h, params) {
            let tag = "奖励排除最大项";
            if (params.row.normal_throw_away===0){
              tag = "奖励排除最小项";
            }
            return h("span", {}, tag);
          },
        },{
          title: "高水位中奖概率",
          key: "high_odds",
          align: "center",
        },
        {
          title: "高水位中奖排除项",
          key: "high_throw_away",
          align: "center",
          render(h, params) {
            let tag = "奖励排除最大项";
            if (params.row.high_throw_away===0){
              tag = "奖励排除最小项";
            }
            return h("span", {}, tag);
          },
        },
        {
          title: "操作",
          key: "gameNumber",
          align: "center",
          width: 140,
          render(h, params) {
            return h("div", {}, [
            h(
                "Button",
                {
                  style: {
                    marginRight: "10px",
                  },
                  props: {
                    type: "info",
                    size: "small",
                  },
                  on: {
                    async click() {
                      _this.showBairenGameSettingDataPage(params.row,false);
                    },
                  },
                },
                "修改"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "info",
                    size: "small",
                  },
                  on: {
                    async click() {
                      _this.$Modal.confirm({
                        title: "确定要删除该配置吗？",
                        async onOk() {
                          let tmp=[];
                          for(let i=0;i<_this.gameSettingData.length;i++){
                            let item = _this.gameSettingData[i];
                            if (item.id==params.row.id){
                              continue;
                            }else{
                              tmp.push(_this.gameSettingData[i]);
                            }
                          }
                          let d=[];
                          tmp.forEach(element => {
                            d.push({
                              id:element.id,
                              name:element.name,
                              min:parseInt(element.min),
                              max:parseInt(element.max),
                              pool_odds:[
                                {
                                  odds:parseInt(element.low_odds),
                                  throw_away:parseInt(element.low_throw_away),
                                },
                                {
                                  odds:parseInt(element.normal_odds),
                                  throw_away:parseInt(element.normal_throw_away),
                                },
                                {
                                  odds:parseInt(element.high_odds),
                                  throw_away:parseInt(element.high_throw_away),
                                },
                              ],
                            });
                          });
                          let iparams = {
                            token: getToken(),
                            config:JSON.stringify(d),
                            gameId:_this.paramBairen,
                          };
                          let data = await axios.request({
                            url: "v2/game/saveGameSettingData",
                            method: "post",
                            params: iparams,
                          });
                          _this.gameSettingData = tmp;
                        },
                        onCancel() {},
                      });
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      throwOpt:[
        {
          value:1,
          label:"排除最大项"
        },
        {
          value:0,
          label:"排除最小项"
        },
      ],
      showBairenGameSettingData:false,
      currentBairenGameSettingData:null,
      low_throw_away:"",
      normal_throw_away:"",
      high_throw_away:"",
    };
  },
  methods: {
    showBairenGameSettingDataPage(row,isAdd) {
      this.currentBairenGameSettingData={};
      if (!isAdd){
        this.currentBairenGameSettingData.id=row.id;
        this.currentBairenGameSettingData.name=row.name;
        this.currentBairenGameSettingData.min=row.min;
        this.currentBairenGameSettingData.max=row.max;
        this.currentBairenGameSettingData.low_odds=row.low_odds;
        this.currentBairenGameSettingData.low_throw_away=row.low_throw_away;
        this.currentBairenGameSettingData.normal_odds=row.normal_odds;
        this.currentBairenGameSettingData.normal_throw_away=row.normal_throw_away;
        this.currentBairenGameSettingData.high_odds=row.high_odds;
        this.currentBairenGameSettingData.high_throw_away=row.high_throw_away;
      }else{
        this.currentBairenGameSettingData.id=(new Date()).valueOf();
        this.currentBairenGameSettingData.name="";
        this.currentBairenGameSettingData.min=0;
        this.currentBairenGameSettingData.max=0;
        this.currentBairenGameSettingData.low_odds=0;
        this.currentBairenGameSettingData.low_throw_away=1;
        this.currentBairenGameSettingData.normal_odds=0;
        this.currentBairenGameSettingData.normal_throw_away=1;
        this.currentBairenGameSettingData.high_odds=0;
        this.currentBairenGameSettingData.high_throw_away=1;
      }
      this.currentBairenGameSettingData.isAdd= isAdd;
      this.showBairenGameSettingData = true;
    },
    async saveBairenGameSettingData(isAdd) {
      if(this.paramBairen==null){
        this.$Message.warning("请先选择一款游戏!");
        return
      }
      if (Number(this.currentBairenGameSettingData.max) <= Number(this.currentBairenGameSettingData.min)&&this.currentBairenGameSettingData.name!="default") {
        this.$Message.error("高盈亏比不能小于低盈亏比");
        return;
      }
      if(isAdd){
          //合并数据
          this.gameSettingData.push(this.currentBairenGameSettingData);
      }
      let tmp = [];
      this.gameSettingData.forEach(element => {
        if (element.id==this.currentBairenGameSettingData.id&&!isAdd){
          element = this.currentBairenGameSettingData;
        }
        tmp.push({
          id:parseInt(element.id),
          name:element.name,
          min:parseInt(element.min),
          max:parseInt(element.max),
          pool_odds:[
            {
              odds:parseInt(element.low_odds),
              throw_away:parseInt(element.low_throw_away),
            },
            {
              odds:parseInt(element.normal_odds),
              throw_away:parseInt(element.normal_throw_away),
            },
            {
              odds:parseInt(element.high_odds),
              throw_away:parseInt(element.high_throw_away),
            },
          ],
        });
      });
      let Data = {
        token: getToken(),
        gameId:this.paramBairen,
        config:JSON.stringify(tmp),
      };
      //提交保存
      let data = await axios.request({
        url: "v2/game/saveGameSettingData",
        method: "post",
        params: Data,
      });
      console.log(data);
      if (data && data.data.code == 200) {
        this.$Message.info("保存成功");
        this.getGameSettingList();
      } else {
        this.$Message.error("保存失败");
      }
    },
  },
  mounted() {
  }
};
</script>
<style>
</style>

