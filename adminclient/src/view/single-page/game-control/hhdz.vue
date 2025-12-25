<template>
    <div>
     <Card style="margin: 10px 0">
         <Table :columns="gameSettingColumn" :data="gameSettingData"></Table>
         <div style="margin-top: 20px; text-align: center">
         </div>
     </Card>
     <Modal
         v-model="showBairenGameSettingData"
         title="红黑大战游戏算法设置"
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
                        <Checkbox :label="3">
                            <span>金花</span>
                        </Checkbox>
                        <Checkbox :label="4">
                            <span>同花顺</span>
                        </Checkbox>
                        <Checkbox :label="5">
                            <span>豹子</span>
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
   name: "hhdz_control",
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
                if (item == 3){
                    tag.push("金花");
                }else if (item==4) {
                    tag.push("同花顺")
                }else if (item == 5) {
                    tag.push("豹子")
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
       throwOpt:[
         {
           value:3,
           label:"金花"
         },
         {
           value:4,
           label:"同花顺"
         },
         {
           value:5,
           label:"豹子"
         },
       ],
       showBairenGameSettingData:false,
       currentBairenGameSettingData:{},
       filter:[],
     };
   },
   methods: {
     filterChoseChange(data) {
        console.log(this.currentBairenGameSettingData.filter);
     },
     showBairenGameSettingDataPage(row,isAdd) {
      console.log(row)
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
 
 