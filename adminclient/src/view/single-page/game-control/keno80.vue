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
              title="keno80游戏算法设置"
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
                      <span>中奖排除项</span>
                      <div>
                          <CheckboxGroup v-model="currentBairenGameSettingData.filter" @on-change="filterChoseChange">
                              <Checkbox :label="1" >
                                  <span>最小项</span>
                              </Checkbox>
                              <Checkbox :label="2">
                                  <span>最大项</span>
                              </Checkbox>
                          </CheckboxGroup>
                      </div>
                  </div>
              </div>
              <div v-else></div>
          </Modal>
     </Card>

     <Card style="margin-top:10px">
      <div v-if="gameSettingData.classic!=null">
        <p style="color:red;margin-top:10px;">classic赔率设置:</p>
        <ul id="xs" style="list-style: none;">
          <li><span>押注01个号赔率列表:</span><span>[{{gameSettingData.classic[1]}}]</span></li>
          <li><span>押注02个号赔率列表:</span><span>[{{gameSettingData.classic[2]}}]</span></li>
          <li><span>押注03个号赔率列表:</span><span>[{{gameSettingData.classic[3]}}]</span></li>
          <li><span>押注04个号赔率列表:</span><span>[{{gameSettingData.classic[4]}}]</span></li>
          <li><span>押注05个号赔率列表:</span><span>[{{gameSettingData.classic[5]}}]</span></li>
          <li><span>押注06个号赔率列表:</span><span>[{{gameSettingData.classic[6]}}]</span></li>
          <li><span>押注07个号赔率列表:</span><span>[{{gameSettingData.classic[7]}}]</span></li>
          <li><span>押注08个号赔率列表:</span><span>[{{gameSettingData.classic[8]}}]</span></li>
          <li><span>押注09个号赔率列表:</span><span>[{{gameSettingData.classic[9]}}]</span></li>
          <li><span>押注10个号赔率列表:</span><span>[{{gameSettingData.classic[10]}}]</span></li>
        </ul>
      </div>
      <div style="margin-top:10px;">
        <Button 
                @click="showClassicControlSettingPage"
                type="primary"
              >
              修改
              </Button>
      </div>
      <Modal
          v-model="showClassicControlSetting"
          title="赔率参数设置"
          @on-ok="saveBairenGameSettingData()"
      >
      <div v-if="gameSettingData.classic" style="border: 1px solid  red; padding:5px;border-radius:5px;">
          <span>押注01个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[1]"/>
          <span>押注02个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[2]" />
          <span>押注03个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[3]" />
          <span>押注04个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[4]" />
          <span>押注05个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[5]" />
          <span>押注06个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[6]" />
          <span>押注07个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[7]" />
          <span>押注08个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[8]" />
          <span>押注09个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[9]" />
          <span>押注10个号赔率列表:</span>
          <Input type="text" v-model="gameSettingData.classic[10]" />
      </div>
      <p style="color:red;margin-top:10px;">1、每个赔率列表中的赔率之间用英文逗号(,)分隔</p>
      <p style="color:red;margin-top:10px;">2、每个赔率列表中的赔率位置+1代表号码猜中的个数(从0号位置开始)</p>
      </Modal>
     </Card>

     <Card style="margin-top:10px">
      <div v-if="gameSettingData.last_ball!=null">
        <p style="color:red;margin-top:10px;">Lastball赔率设置:</p>
        <ul id="xs" style="list-style: none;">
          <li><span>押注1中1赔率:</span><span>[{{gameSettingData.last_ball[0]}}]</span></li>
          <li><span>押注2中1赔率:</span><span>[{{gameSettingData.last_ball[1]}}]</span></li>
          <li><span>押注3中1赔率:</span><span>[{{gameSettingData.last_ball[2]}}]</span></li>
          <li><span>押注4中1赔率:</span><span>[{{gameSettingData.last_ball[3]}}]</span></li>
          <li><span>押注5中1赔率:</span><span>[{{gameSettingData.last_ball[4]}}]</span></li>
          <li><span>押注6中1赔率:</span><span>[{{gameSettingData.last_ball[5]}}]</span></li>
          <li><span>押注7中1赔率:</span><span>[{{gameSettingData.last_ball[6]}}]</span></li>
          <li><span>押注8中1赔率:</span><span>[{{gameSettingData.last_ball[7]}}]</span></li>
          <li><span>押注9中1赔率:</span><span>[{{gameSettingData.last_ball[8]}}]</span></li>
          <li><span>押注10中1赔率:</span><span>[{{gameSettingData.last_ball[9]}}]</span></li>
        </ul>
      </div>
      <div style="margin-top:10px;">
        <Button 
                @click="showLastBallControlSettingPage"
                type="primary"
              >
              修改
              </Button>
      </div>
      <Modal
          v-model="showLastBallControlSetting"
          title="赔率参数设置"
          @on-ok="saveBairenGameSettingData()"
      >
      <div v-if="gameSettingData.last_ball" style="border: 1px solid  red; padding:5px;border-radius:5px;">
          <span>押注1中1赔率:</span>
          <Input type="number"  v-model.number="gameSettingData.last_ball[0]"/>
          <span>押注2中1赔率:</span>
          <Input type="number" v-model.number="gameSettingData.last_ball[1]" />
          <span>押注3中1赔率:</span>
          <Input type="number" v-model.number="gameSettingData.last_ball[2]" />
          <span>押注4中1赔率:</span>
          <Input type="number" v-model.number="gameSettingData.last_ball[3]" />
          <span>押注5中1赔率:</span>
          <Input type="number" v-model.number="gameSettingData.last_ball[4]" />
          <span>押注6中1赔率:</span>
          <Input type="number" v-model.number="gameSettingData.last_ball[5]" />
          <span>押注7中1赔率:</span>
          <Input type="number" v-model.number="gameSettingData.last_ball[6]" />
          <span>押注8中1赔率:</span>
          <Input type="number" v-model.number="gameSettingData.last_ball[7]" />
          <span>押注9中1赔率:</span>
          <Input type="number" v-model.number="gameSettingData.last_ball[8]" />
          <span>押注10中1赔率:</span>
          <Input type="number" v-model.number="gameSettingData.last_ball[9]" />
      </div>
      <p style="color:red;margin-top:10px;">1、每个赔率列表中的赔率之间用英文逗号(,)分隔</p>
      <p style="color:red;margin-top:10px;">2、每个赔率列表中的赔率位置+1代表号码猜中的个数(从0号位置开始)</p>
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
          title="Keno80赔付设置"
          @on-ok="saveBairenGameSettingData()"
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
   name: "keno80_control",
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
           title: "中奖排除项",
           key: "filter",
           align: "center",
           render(h, params) {
              let tag = [];
              if (params.row.filter!=undefined&&params.row.filter!=null){
                params.row.filter.forEach((item)=>{
                  if (item == 1){
                      tag.push("最小项");
                  }else if (item==2) {
                      tag.push("最大项")
                  }
              })
              }
             
              return h("span", {}, tag.join(","));
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
       OddsFixColumn: [
         {
           title: "倍率下限",
           key: "min",
           align: "center",
         },
         {
           title: "倍率上限",
           key: "max",
           align: "center",
         },
         {
           title: "修正概率(百分比)",
           key: "odds",
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
                       _this.showFixHitDataPage(params.row,false);
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
                           for(let i=0;i<_this.gameSettingData.fix_hit.length;i++){
                             let item = _this.gameSettingData.fix_hit[i];
                             if (item.id==params.row.id){
                               continue;
                             }else{
                               tmp.push(item);
                             }
                           }
                           _this.gameSettingData.fix_hit = tmp;
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
       showClassicControlSetting:false,
       showLastBallControlSetting:false,
       currentCurrencyLimitsSettingData:{},
       showPayMultipleSetting:false,
     };
   },
   methods: {
     parseLimits(data) {
      return data;
     },
     filterChoseChange(data) {
        console.log(this.currentBairenGameSettingData.filter);
     },
     showClassicControlSettingPage(){
      this.showClassicControlSetting = true;
     },
     showLastBallControlSettingPage(){
      this.showLastBallControlSetting = true;
     },
     showPayMultipleSettingPage(){
      this.showPayMultipleSetting = true;
     },
     showCurrcenyLimitsPage(row,isAdd) {
      if (!isAdd){
         this.currentCurrencyLimitsSettingData.name=row.name;
         this.currentCurrencyLimitsSettingData.min_bet=row.min_bet;
         this.currentCurrencyLimitsSettingData.max_bet=row.max_bet;
         this.currentCurrencyLimitsSettingData.max_win=row.max_win;
         this.currentCurrencyLimitsSettingData.bet_list=row.bet_list;
         this.currentCurrencyLimitsSettingData.tag = row.tag;
         this.currentCurrencyLimitsSettingData.filter = row.filter;
       }else{
         this.currentCurrencyLimitsSettingData.name="";
         this.currentCurrencyLimitsSettingData.min_bet=0;
         this.currentCurrencyLimitsSettingData.max_bet=0;
         this.currentCurrencyLimitsSettingData.max_win=0;
         this.currentCurrencyLimitsSettingData.tag="";
         this.currentCurrencyLimitsSettingData.bet_list="";
         this.currentCurrencyLimitsSettingData.filter=[];
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
         this.currentBairenGameSettingData.filter = row.filter;
       }else{
         this.currentBairenGameSettingData.id=(new Date()).valueOf();
         this.currentBairenGameSettingData.name="";
         this.currentBairenGameSettingData.min=0;
         this.currentBairenGameSettingData.max=0;
         this.currentBairenGameSettingData.low_odds=0;
         this.currentBairenGameSettingData.normal_odds=0;
         this.currentBairenGameSettingData.high_odds=0;
         this.currentBairenGameSettingData.filter = [];
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
     isNumber(str) {
      return /(^\d+.\d+$)|(^\d+$)/.test(str)
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
       let kenoConfig = {};
       kenoConfig.award_odds=[];
       kenoConfig.limits={};
       this.gameSettingData.award_odds.forEach(element => {
        kenoConfig.award_odds.push({
           id:parseInt(element.id),
           name:element.name,
           min:parseInt(element.min),
           max:parseInt(element.max),
           filter:element.filter,
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
      let isOk=true
      let classic = {};
      let i=1;
      //检测设置的值是否正确
      for (let key in this.gameSettingData.classic) {
        if (this.gameSettingData.classic.hasOwnProperty(key)) {
          let tmp = [];
          let item = this.gameSettingData.classic[key];
          let arr = item.split(',');
          if (arr.length != i+1) {
            this.$Message.error("赔率设置赔率个数有问题，第:"+(i+1)+"行");
            return;
          }
          i++;
          for (let j=0;j<arr.length;j++) {
            if (!this.isNumber(arr[j])) {
              this.$Message.error("赔率设置有非法字符，第:"+(i+1)+"行");
              return;
            }
            tmp.push(parseFloat(arr[j]));
          }
          classic[key] = tmp;
        }
      }
      kenoConfig.classic = classic;
      kenoConfig.last_ball = this.gameSettingData.last_ball;
      kenoConfig.pay_multiple = this.gameSettingData.pay_multiple;
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
          kenoConfig.limits[this.gameSettingData.limits[key].name]=item;
        }
      }
       let Data = {
         token: getToken(),
         gameId:this.paramBairen,
         config:JSON.stringify(kenoConfig),
       };
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
#xs{
  font-size:12pt;
 }

#xs li{
  margin-right:20px;
  background-color:lightgray;
  border-bottom:1px solid red;
 }

 #xs li span{
  margin-right:20px;
 }
 </style>
 
 