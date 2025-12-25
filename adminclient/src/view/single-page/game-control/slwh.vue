<template>
    <div>
      <Card style="margin-top:10px">
      <div v-if="gameSettingData.animal_weight!=null&&gameSettingData.animal_weight.length==3">
        <p style="color:red;margin-top:10px;">赔率表1:</p>
        <ul id="animalWeight" style="list-style: none;">
          <li>兔子:{{gameSettingData.animal_weight[0][0]}}</li>
          <li>猴子:{{gameSettingData.animal_weight[0][1]}}</li>
          <li>熊猫:{{gameSettingData.animal_weight[0][2]}}</li>
          <li>狮子:{{gameSettingData.animal_weight[0][3]}}</li>
        </ul>
        <p style="color:red;margin-top:10px;">赔率表2:</p>
        <ul id="animalWeight" style="list-style: none;">
          <li>兔子:{{gameSettingData.animal_weight[1][0]}}</li>
          <li>猴子:{{gameSettingData.animal_weight[1][1]}}</li>
          <li>熊猫:{{gameSettingData.animal_weight[1][2]}}</li>
          <li>狮子:{{gameSettingData.animal_weight[1][3]}}</li>
        </ul>
        <p style="color:red;margin-top:10px;">赔率表3:</p>
        <ul id="animalWeight" style="list-style: none;">
          <li>兔子:{{gameSettingData.animal_weight[2][0]}}</li>
          <li>猴子:{{gameSettingData.animal_weight[2][1]}}</li>
          <li>熊猫:{{gameSettingData.animal_weight[2][2]}}</li>
          <li>狮子:{{gameSettingData.animal_weight[2][3]}}</li>
        </ul>
      </div>
      <div style="margin-top:20px;">
        <Button 
                @click="showAnimalWeightSettingPage"
                type="primary"
              >
              修改
              </Button>
              <p style="color:red;margin-top:10px;"><b>备注:</b>此处设置每种赔率表下，每种动物的开奖权重，<b>万分比</b>,赔率表赔率 从高到底排列 表一赔率最高 表二其次 表三赔率最低</p>
      </div>
      <Modal
          v-model="showAnimalWeightSetting"
          title="森林舞会动物权重设置"
          @on-ok="saveBairenGameSettingData(false)"
      >
          <div v-if="gameSettingData.animal_weight!=null&&gameSettingData.animal_weight.length==3">
            <p style="color:red;margin-top:10px;">赔率表1:</p>
              <div>
                  <span>兔子</span>
                  <Input type="text" v-model="gameSettingData.animal_weight[0][0]"/>
                  <span>猴子</span>
                  <Input type="number" v-model="gameSettingData.animal_weight[0][1]" />
                  <span>熊猫</span>
                  <Input type="number" v-model="gameSettingData.animal_weight[0][2]" />
                  <span>狮子</span>
                  <Input type="number" v-model="gameSettingData.animal_weight[0][3]" />
              </div>
              <p style="color:red;margin-top:10px;">赔率表2:</p>
              <div>
                  <span>兔子</span>
                  <Input type="text" v-model="gameSettingData.animal_weight[1][0]"/>
                  <span>猴子</span>
                  <Input type="number" v-model="gameSettingData.animal_weight[1][1]" />
                  <span>熊猫</span>
                  <Input type="number" v-model="gameSettingData.animal_weight[1][2]" />
                  <span>狮子</span>
                  <Input type="number" v-model="gameSettingData.animal_weight[1][3]" />
              </div>
              <p style="color:red;margin-top:10px;">赔率表3:</p>
              <div>
                  <span>兔子</span>
                  <Input type="text" v-model="gameSettingData.animal_weight[2][0]"/>
                  <span>猴子</span>
                  <Input type="number" v-model="gameSettingData.animal_weight[2][1]" />
                  <span>熊猫</span>
                  <Input type="number" v-model="gameSettingData.animal_weight[2][2]" />
                  <span>狮子</span>
                  <Input type="number" v-model="gameSettingData.animal_weight[2][3]" />
              </div>
          </div>
      </Modal>
     </Card>
     <Card style="margin: 10px 0">
         <Table :columns="gameSettingColumn" :data="gameSettingData.award_odds"></Table>
         <div style="margin-top: 20px; text-align: center">
         </div>
     </Card>
     <Modal
         v-model="showBairenGameSettingData"
         title="森林舞会游戏算法设置"
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
                 <span>正常水位中奖概率</span>
                 <Input type="number" v-model="currentBairenGameSettingData.normal_odds" />
                 <span>高水位中奖概率</span>
                 <Input type="number" v-model="currentBairenGameSettingData.high_odds" />
                 <span>中奖排除项</span>
                 <div>
                    <CheckboxGroup v-model="currentBairenGameSettingData.filter" @on-change="filterChoseChange">
                        <Checkbox :label="1">
                            <span>大三元</span>
                        </Checkbox>
                        <Checkbox :label="2">
                            <span>大四喜</span>
                        </Checkbox>
                        <Checkbox :label="3">
                            <span>送灯</span>
                        </Checkbox>
                        <Checkbox :label="4">
                            <span>霹雳闪电</span>
                        </Checkbox>
                    </CheckboxGroup>
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
   name: "slwh_control",
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
             params.row.filter.forEach((item)=>{
                if (item == 1){
                    tag.push("大三元");
                }else if (item==2) {
                    tag.push("大四喜")
                }else if (item == 3) {
                    tag.push("送灯")
                }else if (item == 4) {
                    tag.push("霹雳闪电")
                }
             })
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
                           let tmp={};
                           tmp.award_odds=[];
                           tmp.animal_weight=[];
                           for(let i=0;i<_this.gameSettingData.award_odds.length;i++){
                             let item = _this.gameSettingData.award_odds[i];
                             if (item.id==params.row.id){
                               continue;
                             }else{
                               tmp.award_odds.push(item);
                             }
                           }
                           let d={};
                           d.award_odds=[];
                           d.animal_weight=[];
                           
                          for (let i=0;i<_this.gameSettingData.animal_weight.length;i++){
                              let t = [];
                              for (let j=0;j<_this.gameSettingData.animal_weight[i].length;j++){
                                t.push(parseInt(_this.gameSettingData.animal_weight[i][j]));
                              }
                              d.animal_weight.push(t);
                              tmp.animal_weight.push(t);
                          }

                           tmp.award_odds.forEach(element => {
                            d.award_odds.push({
                               id:element.id,
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
       showBairenGameSettingData:false,
       currentBairenGameSettingData:{},
       showAnimalWeightSetting:false,
     };
   },
   methods: {
     filterChoseChange(data) {
        console.log(this.currentBairenGameSettingData.filter);
     },
     showAnimalWeightSettingPage(data){
        this.showAnimalWeightSetting=true;
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
         this.currentBairenGameSettingData.filter=[];
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
           this.gameSettingData.award_odds.push(this.currentBairenGameSettingData);
       }
       let slwhConfig = {};
       slwhConfig.award_odds=[];
       slwhConfig.animal_weight=[];
       for (let i=0;i<this.gameSettingData.animal_weight.length;i++){
          let t = [];
          for (let j=0;j<this.gameSettingData.animal_weight[i].length;j++){
            t.push(parseInt(this.gameSettingData.animal_weight[i][j]));
          }
          slwhConfig.animal_weight.push(t);
       }
       this.gameSettingData.award_odds.forEach(element => {
         if (element.id==this.currentBairenGameSettingData.id&&!isAdd){
           element = this.currentBairenGameSettingData;
         }
         slwhConfig.award_odds.push({
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
       let Data = {
         token: getToken(),
         gameId:this.paramBairen,
         config:JSON.stringify(slwhConfig),
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
 #animalWeight{
  font-size:12pt;
 }
 #animalWeight li {
  display:inline;
  margin-right:80px;
 }
 </style>
 
 