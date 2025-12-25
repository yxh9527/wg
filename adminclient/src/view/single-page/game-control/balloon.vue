<template>
    <div>
     <Card style="margin: 10px 0">
         <p style="color:red">控制设置:</p>
         <Table :columns="gameSettingColumn" :data="gameSettingData.award_odds"></Table>
         <Button
              @click="showBairenGameSettingDataPage(null,true)"
              style="margin-top:10px;"
              type="primary"
              >添加</Button
            >
         <div style="margin-top: 10px; text-align: center">
         </div>
          <Modal
              v-model="showBairenGameSettingData"
              title="balloon游戏算法设置"
              @on-ok="saveAwardOdds(currentBairenGameSettingData.isAdd)"
          >
              <div v-if="currentBairenGameSettingData">
                  <div>
                      <span>名字</span>
                      <Input type="text" v-model="currentBairenGameSettingData.name"/>
                      <span>盈亏比例Min</span>
                      <Input type="number" v-model.number="currentBairenGameSettingData.min" />
                      <span>盈亏比例Max</span>
                      <Input type="number" v-model.number="currentBairenGameSettingData.max" />
                      <span>低水位中奖概率</span>
                      <Input type="number" v-model.number="currentBairenGameSettingData.low_odds" />
                      <span>正常水位中奖概率</span>
                      <Input type="number" v-model.number="currentBairenGameSettingData.normal_odds" />
                      <span>高水位中奖概率</span>
                      <Input type="number" v-model.number="currentBairenGameSettingData.high_odds" />
                  </div>
              </div>
              <div v-else></div>
          </Modal>
     </Card>
     <Card style="margin-top:10px">
      <div v-if="gameSettingData.pay_multiple!=null&&gameSettingData.pay_multiple.length==3">
        <p style="color:red;margin-top:10px;">赔付倍数:</p>
        <div>
          <span style="color:red;font-weight:1000">低水位：</span>
          <div>
            <ul class="payMultiple" style="list-style: none;">
              <li><span>下限：{{gameSettingData.pay_multiple[0][0].min}}</span><span>上限：{{gameSettingData.pay_multiple[0][0].max}}</span><span>命中概率：{{gameSettingData.pay_multiple[0][0].odds}}</span></li>
              <li><span>下限：{{gameSettingData.pay_multiple[0][1].min}}</span><span>上限：{{gameSettingData.pay_multiple[0][1].max}}</span><span>命中概率：{{gameSettingData.pay_multiple[0][1].odds}}</span></li>
              <li><span>下限：{{gameSettingData.pay_multiple[0][2].min}}</span><span>上限：{{gameSettingData.pay_multiple[0][2].max}}</span><span>命中概率：{{gameSettingData.pay_multiple[0][2].odds}}</span></li>
            </ul>
          </div>
        </div>

        <div>
          <span style="color:red;font-weight:1000">正常水位：</span>
          <div>
            <ul class="payMultiple" style="list-style: none;">
              <li><span>下限：{{gameSettingData.pay_multiple[1][0].min}}</span><span>上限：{{gameSettingData.pay_multiple[1][0].max}}</span><span>命中概率：{{gameSettingData.pay_multiple[1][0].odds}}</span></li>
              <li><span>下限：{{gameSettingData.pay_multiple[1][1].min}}</span><span>上限：{{gameSettingData.pay_multiple[1][1].max}}</span><span>命中概率：{{gameSettingData.pay_multiple[1][1].odds}}</span></li>
              <li><span>下限：{{gameSettingData.pay_multiple[1][2].min}}</span><span>上限：{{gameSettingData.pay_multiple[1][2].max}}</span><span>命中概率：{{gameSettingData.pay_multiple[1][2].odds}}</span></li>
            </ul>
          </div>
        </div>

        <div>
          <span style="color:red;font-weight:1000">高水位：</span>
          <div>
            <ul class="payMultiple" style="list-style: none;">
              <li><span>下限：{{gameSettingData.pay_multiple[2][0].min}}</span><span>上限：{{gameSettingData.pay_multiple[2][0].max}}</span><span>命中概率：{{gameSettingData.pay_multiple[2][0].odds}}</span></li>
              <li><span>下限：{{gameSettingData.pay_multiple[2][1].min}}</span><span>上限：{{gameSettingData.pay_multiple[2][1].max}}</span><span>命中概率：{{gameSettingData.pay_multiple[2][1].odds}}</span></li>
              <li><span>下限：{{gameSettingData.pay_multiple[2][2].min}}</span><span>上限：{{gameSettingData.pay_multiple[2][2].max}}</span><span>命中概率：{{gameSettingData.pay_multiple[2][2].odds}}</span></li>
            </ul>
          </div>
        </div>

      </div>
      <div style="margin-top:10px;">
        <Button 
                @click="showPayMultipleSettingPage"
                type="primary"
              >
              修改
              </Button>
      </div>
      <Modal
          v-model="showPayMultipleSetting"
          title="赔付设置"
          @on-ok="saveBairenGameSettingData(false)"
      >
          <div v-if="gameSettingData.pay_multiple!=null&&gameSettingData.pay_multiple.length==3">
            <div>
              <span style="color:red;font-weight:1000">低水位：</span>
              <div>
                <ul class="edit_pay_multiple" style="list-style: none;">
                  <li><span>下限：<Input type="number" v-model.number="gameSettingData.pay_multiple[0][0].min"/></span><span>上限：<Input type="number" v-model.number="gameSettingData.pay_multiple[0][0].max"/></span><span>命中概率：<Input type="number" v-model.number="gameSettingData.pay_multiple[0][0].odds"/></span></li>
                  <li><span>下限：<Input type="number" v-model.number="gameSettingData.pay_multiple[0][1].min"/></span><span>上限：<Input type="number" v-model.number="gameSettingData.pay_multiple[0][1].max"/></span><span>命中概率：<Input type="number" v-model.number="gameSettingData.pay_multiple[0][1].odds"/></span></li>
                  <li><span>下限：<Input type="number" v-model.number="gameSettingData.pay_multiple[0][2].min"/></span><span>上限：<Input type="number" v-model.number="gameSettingData.pay_multiple[0][2].max"/></span><span>命中概率：<Input type="number" v-model.number="gameSettingData.pay_multiple[0][2].odds"/></span></li>
                </ul>
              </div>
            </div>

            <div>
              <span style="color:red;font-weight:1000">正常水位：</span>
              <div>
                <ul class="edit_pay_multiple"  style="list-style: none;">
                  <li><span>下限：<Input type="number" v-model.number="gameSettingData.pay_multiple[1][0].min"/></span><span>上限：<Input type="number" v-model.number="gameSettingData.pay_multiple[1][0].max"/></span><span>命中概率：<Input type="number" v-model.number="gameSettingData.pay_multiple[1][0].odds"/></span></li>
                  <li><span>下限：<Input type="number" v-model.number="gameSettingData.pay_multiple[1][1].min"/></span><span>上限：<Input type="number" v-model.number="gameSettingData.pay_multiple[1][1].max"/></span><span>命中概率：<Input type="number" v-model.number="gameSettingData.pay_multiple[1][1].odds"/></span></li>
                  <li><span>下限：<Input type="number" v-model.number="gameSettingData.pay_multiple[1][2].min"/></span><span>上限：<Input type="number" v-model.number="gameSettingData.pay_multiple[1][2].max"/></span><span>命中概率：<Input type="number" v-model.number="gameSettingData.pay_multiple[1][2].odds"/></span></li>
                </ul>
              </div>
            </div>

            <div>
              <span style="color:red;font-weight:1000">高水位：</span>
              <div>
                <ul class="edit_pay_multiple" style="list-style: none;">
                  <li><span>下限：<Input type="number" v-model.number="gameSettingData.pay_multiple[2][0].min"/></span><span>上限：<Input type="number" v-model.number="gameSettingData.pay_multiple[2][0].max"/></span><span>命中概率：<Input type="number" v-model.number="gameSettingData.pay_multiple[2][0].odds"/></span></li>
                  <li><span>下限：<Input type="number" v-model.number="gameSettingData.pay_multiple[2][1].min"/></span><span>上限：<Input type="number" v-model.number="gameSettingData.pay_multiple[2][1].max"/></span><span>命中概率：<Input type="number" v-model.number="gameSettingData.pay_multiple[2][1].odds"/></span></li>
                  <li><span>下限：<Input type="number" v-model.number="gameSettingData.pay_multiple[2][2].min"/></span><span>上限：<Input type="number" v-model.number="gameSettingData.pay_multiple[2][2].max"/></span><span>命中概率：<Input type="number" v-model.number="gameSettingData.pay_multiple[2][2].odds"/></span></li>
                </ul>
              </div>
            </div>

          </div>
      </Modal>
     </Card>
     <Card style="margin-top:10px">
      <div v-if="gameSettingData.single_control!=null&&gameSettingData.single_control.length==3">
        <p style="color:red;margin-top:10px;">单控概率:</p>
        <ul id="singleControl" style="list-style: none;">
          <li><span>低比例系数:</span><span>{{gameSettingData.single_control[0].odds}}</span></li>
          <li><span>中比例系数:</span><span>{{gameSettingData.single_control[1].odds}}</span></li>
          <li><span>高比例系数:</span><span>{{gameSettingData.single_control[2].odds}}</span></li>
        </ul>
      </div>
      <div style="margin-top:10px;">
        <p style="color:red;margin-top:10px;"><b>备注:</b>此处设置单控概率，<b>百分比</b></p>
        <Button 
                @click="showSingleControlSettingPage"
                type="primary"
              >
              修改
              </Button>
      </div>
      <Modal
          v-model="showSingleControlSetting"
          title="单控概率设置"
          @on-ok="saveBairenGameSettingData(false)"
      >
          <div v-if="gameSettingData.single_control!=null&&gameSettingData.single_control.length==3">
              <div>
                  <span>低比例系数</span>
                  <Input type="number" v-model.number="gameSettingData.single_control[0].odds"/>
                  <span>中比例系数</span>
                  <Input type="number" v-model.number="gameSettingData.single_control[1].odds" />
                  <span>高比例系数</span>
                  <Input type="number" v-model.number="gameSettingData.single_control[2].odds" />
              </div>
          </div>
      </Modal>
     </Card>
     <Card style="margin: 10px 0">
         <p style="color:red">币种限制:</p>
         <Table :columns="gameLimitsColumn" :data="parseLimits(gameSettingData.limits)"></Table>
         <Button
              @click="showCurrcenyLimitsPage(null,true)"
              style="margin-top:10px;"
              type="primary"
              >添加</Button
            >
         <div style="margin-top: 10px; text-align: center">
         </div>

         <Modal
              v-model="showCurrencyLimitsSetting"
              title="币种限制"
              @on-ok="saveLimits(currentCurrencyLimitsSettingData.isAdd)"
          >
              <div v-if="currentCurrencyLimitsSettingData">
                  <div>
                      <span>币种</span>
                      <Input type="text" v-model="currentCurrencyLimitsSettingData.name" v-if ="currentCurrencyLimitsSettingData.isAdd"/>
                      <Input type="text" v-model="currentCurrencyLimitsSettingData.name" v-else disabled/>
                      <span>最小投注</span>
                      <Input type="number" v-model.number="currentCurrencyLimitsSettingData.min_bet" />
                      <span>最大投注</span>
                      <Input type="number" v-model.number="currentCurrencyLimitsSettingData.max_bet" />
                      <span>最大赢奖</span>
                      <Input type="number" v-model.number="currentCurrencyLimitsSettingData.max_win" />
                      <span>货币符号</span>
                      <Input type="text" v-model="currentCurrencyLimitsSettingData.tag"/>
                      <span>投注列表</span>
                      <Input type="text" v-model="currentCurrencyLimitsSettingData.bet_list" />
                  </div>
              </div>
              <div v-else></div>
          </Modal>
     </Card>
    </div>
 </template>
 
 <script>
 import Tables from "_c/tables";
 import axios from "@/libs/api.request";
 import { getToken } from "@/libs/util";
 import * as dayjs from "dayjs";
 
 export default {
   name: "balloon_control",
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
           title: "正常水位中奖概率",
           key: "normal_odds",
           align: "center",
         },
         {
           title: "高水位中奖概率",
           key: "high_odds",
           align: "center",
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
                           for(let i=0;i<_this.gameSettingData.award_odds.length;i++){
                             let item = _this.gameSettingData.award_odds[i];
                             if (item.id==params.row.id){
                               continue;
                             }else{
                               tmp.push(item);
                             }
                           }
                           _this.gameSettingData.award_odds = tmp;
                           _this.saveBairenGameSettingData();
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

       gameLimitsColumn: [
         {
           title:"币种",
           key:"name",
           align:"center",
           width:140,
         },
         {
           title: "最小投注",
           key: "min_bet",
           align: "center",
         },
         {
           title: "最大投注",
           key: "max_bet",
           align: "center",
         },
         {
           title: "最大赢奖",
           key: "max_win",
           align: "center",
         },
         {
           title: "投注列表",
           key: "bet_list",
           align: "center",
         },
         {
           title: "货币符号",
           key: "tag",
           align: "center",
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
                       _this.showCurrcenyLimitsPage(params.row,false);
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
                           let tmp = {};
                           let keys=_this.gameSettingData.limits.keys();
                           _this.gameSettingData.limits.forEach(function(value,key){
                            if(params.row.name!= value.name) {
                              tmp[key] = value;
                            }
                           })
                           _this.gameSettingData.limits = tmp;
                           console.log(tmp);
                           _this.saveBairenGameSettingData()
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
       showBairenGameSettingData:false,
       currentBairenGameSettingData:{},
       showCurrencyLimitsSetting:false,
       currentCurrencyLimitsSettingData:{},
       showPayMultipleSetting:false,
       showAutoPlaySetting:false,
       showSingleControlSetting:false,
     };
   },
   methods: {
     parseLimits(data) {
      return data;
     },
     showPayMultipleSettingPage(data){
        this.showPayMultipleSetting=true;
     },
     showSingleControlSettingPage(data){
      this.showSingleControlSetting = true;
     },
     showCurrcenyLimitsPage(row,isAdd) {
      if (!isAdd){
         this.currentCurrencyLimitsSettingData.name=row.name;
         this.currentCurrencyLimitsSettingData.min_bet=row.min_bet;
         this.currentCurrencyLimitsSettingData.max_bet=row.max_bet;
         this.currentCurrencyLimitsSettingData.max_win=row.max_win;
         this.currentCurrencyLimitsSettingData.bet_list=row.bet_list;
         this.currentCurrencyLimitsSettingData.tag = row.tag;
       }else{
         this.currentCurrencyLimitsSettingData.name="";
         this.currentCurrencyLimitsSettingData.min_bet=0;
         this.currentCurrencyLimitsSettingData.max_bet=0;
         this.currentCurrencyLimitsSettingData.max_win=0;
         this.currentCurrencyLimitsSettingData.tag="";
         this.currentCurrencyLimitsSettingData.bet_list="";
       }
       this.currentCurrencyLimitsSettingData.isAdd = isAdd;
       this.showCurrencyLimitsSetting = true;
     },
     showBairenGameSettingDataPage(row,isAdd) {
       if (!isAdd){
         this.currentBairenGameSettingData.id=row.id;
         this.currentBairenGameSettingData.name=row.name;
         this.currentBairenGameSettingData.min=row.min;
         this.currentBairenGameSettingData.max=row.max;
         this.currentBairenGameSettingData.low_odds=row.low_odds;
         this.currentBairenGameSettingData.normal_odds=row.normal_odds;
         this.currentBairenGameSettingData.high_odds=row.high_odds;
       }else{
         this.currentBairenGameSettingData.id=(new Date()).valueOf();
         this.currentBairenGameSettingData.name="";
         this.currentBairenGameSettingData.min=0;
         this.currentBairenGameSettingData.max=0;
         this.currentBairenGameSettingData.low_odds=0;
         this.currentBairenGameSettingData.normal_odds=0;
         this.currentBairenGameSettingData.high_odds=0;
       }
       this.currentBairenGameSettingData.isAdd= isAdd;
       this.showBairenGameSettingData = true;
     },
     async saveAwardOdds(isAdd){
      if (!isAdd) {
        for (let i=0;i<this.gameSettingData.award_odds.length;i++){
          if( this.gameSettingData.award_odds[i].id == this.currentBairenGameSettingData.id ){
            this.gameSettingData.award_odds[i]=this.currentBairenGameSettingData;
                break;
            } 
        }
      }else{
        this.gameSettingData.award_odds.push(this.currentBairenGameSettingData)
      }
      this.saveBairenGameSettingData()
     },
     async saveLimits(isAdd) {
      if (!isAdd) {
        for (let i=0;i<this.gameSettingData.limits.length;i++){
          if( this.gameSettingData.limits[i].name == this.currentCurrencyLimitsSettingData.name ){
            this.gameSettingData.limits[i]=this.currentCurrencyLimitsSettingData;
                break;
            } 
        }
      }else{
        this.gameSettingData.limits.push(this.currentCurrencyLimitsSettingData)
      }
      this.saveBairenGameSettingData()
     },
     async saveBairenGameSettingData() {
       if(this.paramBairen==null){
         this.$Message.warning("请先选择一款游戏!");
         return
       }
       if (Number(this.currentBairenGameSettingData.max) <= Number(this.currentBairenGameSettingData.min)&&this.currentBairenGameSettingData.name!="default") {
         this.$Message.error("高盈亏比不能小于低盈亏比");
         return;
       }
       let balloonConfig = {};
       balloonConfig.award_odds=[];
       balloonConfig.limits={};
       balloonConfig.bonus = this.gameSettingData.bonus;
       balloonConfig.pay_multiple = this.gameSettingData.pay_multiple;
       balloonConfig.single_control = [];
       for (let i=0;i<this.gameSettingData.single_control.length;i++){
        let tmp = {};
        tmp.odds = parseFloat(this.gameSettingData.single_control[i].odds);
        if (isNaN(tmp.odds)) {
            this.$Message.error("单控概率配置有问题！");
            return;
        }
        balloonConfig.single_control.push(tmp);
       }
       this.gameSettingData.award_odds.forEach(element => {
        balloonConfig.award_odds.push({
           id:parseInt(element.id),
           name:element.name,
           min:parseInt(element.min),
           max:parseInt(element.max),
           pool_odds:[
             {
               odds:parseInt(element.low_odds),
             },
             {
               odds:parseInt(element.normal_odds),
             },
             {
               odds:parseInt(element.high_odds),
             },
           ],
         });
       });

      for (let key in this.gameSettingData.limits) {
        if (this.gameSettingData.limits.hasOwnProperty(key)) {
          let item = {};
          item.min_bet =  parseFloat(this.gameSettingData.limits[key].min_bet);
          item.max_bet =  parseFloat(this.gameSettingData.limits[key].max_bet);
          item.max_win =  parseFloat(this.gameSettingData.limits[key].max_win);
          item.bet_list=[];
          let arr = this.gameSettingData.limits[key].bet_list.split(',');
          for (let i = 0;i<arr.length;i++){
            let tmp = parseFloat(arr[i]);
            if(isNaN(tmp)){
              continue;
            }
            item.bet_list.push(tmp);
          }
          item.tag = this.gameSettingData.limits[key].tag;
          balloonConfig.limits[this.gameSettingData.limits[key].name]=item;
        }
      }
       let Data = {
         token: getToken(),
         gameId:this.paramBairen,
         config:JSON.stringify(balloonConfig),
       };
       console.log(balloonConfig.limits);
       //提交保存
       let data = await axios.request({
         url: "v2/game/saveGameSettingData",
         method: "post",
         params: Data,
       });
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
 
 