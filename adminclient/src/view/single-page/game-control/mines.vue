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
              title="mines游戏算法设置"
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


     <Card style="margin: 10px 0">
         <p style="color:red">根据赔付倍数产生的修正值:</p>
         <Table :columns="OddsFixColumn" :data="gameSettingData.fix_hit"></Table>
         <Button
              @click="showFixHitDataPage(null,true)"
              style="margin-top:10px;"
              type="primary"
              >添加</Button
            >
         <div style="margin-top: 10px; text-align: center">
         </div>
          <Modal
              v-model="showFixOddsData"
              title="根据赔付倍数产生的修正值"
              @on-ok="saveFixHit(currentFixOddsData.isAdd)"
          >
              <div v-if="currentFixOddsData">
                  <div>
                      <span>赔付倍数下限</span>
                      <Input type="number" v-model.number="currentFixOddsData.min" />
                      <span>赔付倍数上限</span>
                      <Input type="number" v-model.number="currentFixOddsData.max" />
                      <span>修正概率</span>
                      <Input type="number" v-model.number="currentFixOddsData.odds" />
                  </div>
              </div>
              <div v-else></div>
          </Modal>
     </Card>

     <Card style="margin-top:10px">
      <div v-if="gameSettingData.xtable!=null">
        <p style="color:red;margin-top:10px;">赔付倍数范围:</p>
        <ul id="allPayX">
            <li>
              <div style="text-align:center;">低水位</div>
              <div>
                <div>雷1&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[0][1].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][1].max}}</span></div>
                <div>雷2&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[0][2].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][2].max}}</span></div>
                <div>雷3&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[0][3].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][3].max}}</span></div>
                <div>雷4&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[0][4].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][4].max}}</span></div>
                <div>雷5&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[0][5].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][5].max}}</span></div>
                <div>雷6&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[0][6].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][6].max}}</span></div>
                <div>雷7&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[0][7].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][7].max}}</span></div>
                <div>雷8&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[0][8].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][8].max}}</span></div>
                <div>雷9&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[0][9].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][9].max}}</span></div>
                <div>雷10:<span>下限：{{gameSettingData.xtable[0][10].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][10].max}}</span></div>
                <div>雷11:<span>下限：{{gameSettingData.xtable[0][11].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][11].max}}</span></div>
                <div>雷12:<span>下限：{{gameSettingData.xtable[0][12].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][12].max}}</span></div>
                <div>雷13:<span>下限：{{gameSettingData.xtable[0][13].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][13].max}}</span></div>
                <div>雷14:<span>下限：{{gameSettingData.xtable[0][14].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][14].max}}</span></div>
                <div>雷15:<span>下限：{{gameSettingData.xtable[0][15].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][15].max}}</span></div>
                <div>雷16:<span>下限：{{gameSettingData.xtable[0][16].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][16].max}}</span></div>
                <div>雷17:<span>下限：{{gameSettingData.xtable[0][17].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][17].max}}</span></div>
                <div>雷18:<span>下限：{{gameSettingData.xtable[0][18].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][18].max}}</span></div>
                <div>雷19:<span>下限：{{gameSettingData.xtable[0][19].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][19].max}}</span></div>
                <div>雷20:<span>下限：{{gameSettingData.xtable[0][20].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[0][20].max}}</span></div>
              </div>
            </li>
            <li>
              <div style="text-align:center;">中水位</div>
              <div>
                <div>雷1&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[1][1].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][1].max}}</span></div>
                <div>雷2&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[1][2].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][2].max}}</span></div>
                <div>雷3&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[1][3].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][3].max}}</span></div>
                <div>雷4&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[1][4].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][4].max}}</span></div>
                <div>雷5&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[1][5].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][5].max}}</span></div>
                <div>雷6&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[1][6].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][6].max}}</span></div>
                <div>雷7&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[1][7].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][7].max}}</span></div>
                <div>雷8&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[1][8].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][8].max}}</span></div>
                <div>雷9&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[1][9].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][9].max}}</span></div>
                <div>雷10:<span>下限：{{gameSettingData.xtable[1][10].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][10].max}}</span></div>
                <div>雷11:<span>下限：{{gameSettingData.xtable[1][11].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][11].max}}</span></div>
                <div>雷12:<span>下限：{{gameSettingData.xtable[1][12].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][12].max}}</span></div>
                <div>雷13:<span>下限：{{gameSettingData.xtable[1][13].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][13].max}}</span></div>
                <div>雷14:<span>下限：{{gameSettingData.xtable[1][14].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][14].max}}</span></div>
                <div>雷15:<span>下限：{{gameSettingData.xtable[1][15].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][15].max}}</span></div>
                <div>雷16:<span>下限：{{gameSettingData.xtable[1][16].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][16].max}}</span></div>
                <div>雷17:<span>下限：{{gameSettingData.xtable[1][17].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][17].max}}</span></div>
                <div>雷18:<span>下限：{{gameSettingData.xtable[1][18].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][18].max}}</span></div>
                <div>雷19:<span>下限：{{gameSettingData.xtable[1][19].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][19].max}}</span></div>
                <div>雷20:<span>下限：{{gameSettingData.xtable[1][20].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[1][20].max}}</span></div>
              </div>
            </li>
            <li>
              <div style="text-align:center;">高水位</div>
              <div>
                <div>雷1&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[2][1].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][1].max}}</span></div>
                <div>雷2&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[2][2].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][2].max}}</span></div>
                <div>雷3&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[2][3].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][3].max}}</span></div>
                <div>雷4&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[2][4].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][4].max}}</span></div>
                <div>雷5&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[2][5].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][5].max}}</span></div>
                <div>雷6&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[2][6].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][6].max}}</span></div>
                <div>雷7&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[2][7].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][7].max}}</span></div>
                <div>雷8&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[2][8].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][8].max}}</span></div>
                <div>雷9&nbsp&nbsp:<span>下限：{{gameSettingData.xtable[2][9].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][9].max}}</span></div>
                <div>雷10:<span>下限：{{gameSettingData.xtable[2][10].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][10].max}}</span></div>
                <div>雷11:<span>下限：{{gameSettingData.xtable[2][11].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][11].max}}</span></div>
                <div>雷12:<span>下限：{{gameSettingData.xtable[2][12].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][12].max}}</span></div>
                <div>雷13:<span>下限：{{gameSettingData.xtable[2][13].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][13].max}}</span></div>
                <div>雷14:<span>下限：{{gameSettingData.xtable[2][14].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][14].max}}</span></div>
                <div>雷15:<span>下限：{{gameSettingData.xtable[2][15].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][15].max}}</span></div>
                <div>雷16:<span>下限：{{gameSettingData.xtable[2][16].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][16].max}}</span></div>
                <div>雷17:<span>下限：{{gameSettingData.xtable[2][17].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][17].max}}</span></div>
                <div>雷18:<span>下限：{{gameSettingData.xtable[2][18].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][18].max}}</span></div>
                <div>雷19:<span>下限：{{gameSettingData.xtable[2][19].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][19].max}}</span></div>
                <div>雷20:<span>下限：{{gameSettingData.xtable[2][20].min}}</span>&nbsp&nbsp&nbsp&nbsp<span>上限：{{gameSettingData.xtable[2][20].max}}</span></div>
              </div>
            </li>
          </ul>
      </div>
      <div style="margin-top:10px;">
        <Button 
                @click="showXtableSettingPage"
                type="primary"
              >
              修改
              </Button>
      </div>
      <Modal width="1400px"
          v-model="showXtableSetting"
          title="雷数对应配置设置"
          @on-ok="saveBairenGameSettingData(false)"
      >
          <div v-if="gameSettingData.xtable!=null">
            <div>
              <div>
                <ul id="allEditXtable">
                  <li>
                    <div style="text-align:center;">低水位</div>
                    <div>
                      <ul class="edit_xtable">
                        <li>雷1&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][1].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][1].max"/></span></li>
                        <li>雷2&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][2].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][2].max"/></span></li>
                        <li>雷3&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][3].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][3].max"/></span></li>
                        <li>雷4&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][4].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][4].max"/></span></li>
                        <li>雷5&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][5].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][5].max"/></span></li>
                        <li>雷6&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][6].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][6].max"/></span></li>
                        <li>雷7&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][7].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][7].max"/></span></li>
                        <li>雷8&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][8].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][8].max"/></span></li>
                        <li>雷9&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][9].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][9].max"/></span></li>
                        <li>雷10&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][10].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][10].max"/></span></li>
                        <li>雷11&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][11].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][11].max"/></span></li>
                        <li>雷12&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][12].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][12].max"/></span></li>
                        <li>雷13&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][13].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][13].max"/></span></li>
                        <li>雷14&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][14].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][14].max"/></span></li>
                        <li>雷15&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][15].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][15].max"/></span></li>
                        <li>雷16&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][16].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][16].max"/></span></li>
                        <li>雷17&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][17].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][17].max"/></span></li>
                        <li>雷18&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][18].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][18].max"/></span></li>
                        <li>雷19&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][19].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][19].max"/></span></li>
                        <li>雷20&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[0][20].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[0][20].max"/></span></li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div style="text-align:center;">中水位</div>
                    <div>
                      <ul class="edit_xtable">
                        <li>雷1&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][1].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][1].max"/></span></li>
                        <li>雷2&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][2].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][2].max"/></span></li>
                        <li>雷3&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][3].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][3].max"/></span></li>
                        <li>雷4&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][4].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][4].max"/></span></li>
                        <li>雷5&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][5].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][5].max"/></span></li>
                        <li>雷6&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][6].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][6].max"/></span></li>
                        <li>雷7&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][7].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][7].max"/></span></li>
                        <li>雷8&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][8].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][8].max"/></span></li>
                        <li>雷9&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][9].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][9].max"/></span></li>
                        <li>雷10&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][10].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][10].max"/></span></li>
                        <li>雷11&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][11].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][11].max"/></span></li>
                        <li>雷12&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][12].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][12].max"/></span></li>
                        <li>雷13&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][13].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][13].max"/></span></li>
                        <li>雷14&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][14].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][14].max"/></span></li>
                        <li>雷15&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][15].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][15].max"/></span></li>
                        <li>雷16&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][16].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][16].max"/></span></li>
                        <li>雷17&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][17].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][17].max"/></span></li>
                        <li>雷18&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][18].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][18].max"/></span></li>
                        <li>雷19&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][19].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][19].max"/></span></li>
                        <li>雷20&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[1][20].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[1][20].max"/></span></li>
                      </ul>
                    </div>
                  </li>

                  <li>
                    <div style="text-align:center;">高水位</div>
                    <div>
                      <ul class="edit_xtable">
                        <li>雷1&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][1].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][1].max"/></span></li>
                        <li>雷2&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][2].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][2].max"/></span></li>
                        <li>雷3&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][3].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][3].max"/></span></li>
                        <li>雷4&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][4].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][4].max"/></span></li>
                        <li>雷5&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][5].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][5].max"/></span></li>
                        <li>雷6&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][6].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][6].max"/></span></li>
                        <li>雷7&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][7].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][7].max"/></span></li>
                        <li>雷8&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][8].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][8].max"/></span></li>
                        <li>雷9&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][9].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][9].max"/></span></li>
                        <li>雷10&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][10].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][10].max"/></span></li>
                        <li>雷11&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][11].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][11].max"/></span></li>
                        <li>雷12&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][12].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][12].max"/></span></li>
                        <li>雷13&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][13].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][13].max"/></span></li>
                        <li>雷14&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][14].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][14].max"/></span></li>
                        <li>雷15&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][15].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][15].max"/></span></li>
                        <li>雷16&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][16].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][16].max"/></span></li>
                        <li>雷17&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][17].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][17].max"/></span></li>
                        <li>雷18&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][18].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][18].max"/></span></li>
                        <li>雷19&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][19].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][19].max"/></span></li>
                        <li>雷20&nbsp&nbsp&nbsp&nbsp<span>下限：<Input type="number" v-model.number="gameSettingData.xtable[2][20].min"/></span>&nbsp&nbsp&nbsp&nbsp<span>上限：<Input type="number" v-model.number="gameSettingData.xtable[2][20].max"/></span></li>
                      </ul>
                    </div>
                  </li>
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
   name: "mines_control",
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
       showFixOddsData:false,
       currentFixOddsData:{},
       currentBairenGameSettingData:{},
       showCurrencyLimitsSetting:false,
       showXtableSetting:false,
       currentCurrencyLimitsSettingData:{},
     };
   },
   methods: {
     parseLimits(data) {
      return data;
     },
     showXtableSettingPage(){
      this.showXtableSetting = true;
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
     showFixHitDataPage(row,isAdd) {
       if (!isAdd){
         this.currentFixOddsData.id=row.id;
         this.currentFixOddsData.min=row.min;
         this.currentFixOddsData.max=row.max;
         this.currentFixOddsData.odds=row.odds;
       }else{
         this.currentFixOddsData.id=(new Date()).valueOf();
         this.currentFixOddsData.min=0;
         this.currentFixOddsData.max=0;
         this.currentFixOddsData.odds=0;
       }
       this.currentFixOddsData.isAdd= isAdd;
       this.showFixOddsData = true;
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

     async saveFixHit(isAdd){
      if (!isAdd) {
        for (let i=0;i<this.gameSettingData.fix_hit.length;i++){
          if( this.gameSettingData.fix_hit[i].id == this.currentFixOddsData.id ){
                this.gameSettingData.fix_hit[i]=this.currentFixOddsData;
                break;
            } 
        }
      }else{
        this.gameSettingData.fix_hit.push(this.currentFixOddsData)
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
       let minesConfig = {};
       minesConfig.award_odds=[];
       minesConfig.limits={};
       minesConfig.fix_hit = this.gameSettingData.fix_hit;
       for (let i=0;i<this.gameSettingData.xtable.length;i++){
        for (let key in this.gameSettingData.xtable[i]) {
          if (this.gameSettingData.xtable[i].hasOwnProperty(key)) {
            if (this.gameSettingData.xtable[i][key].min>=this.gameSettingData.xtable[i][key].max){
              this.$Message.error("赔付倍数最小值不能大于等于最大值，第"+(i+1)+"组，雷"+key);
              return;
            } 
          }
        }
       }

       minesConfig.xtable = this.gameSettingData.xtable;
       this.gameSettingData.award_odds.forEach(element => {
        minesConfig.award_odds.push({
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
          minesConfig.limits[this.gameSettingData.limits[key].name]=item;
        }
      }
       let Data = {
         token: getToken(),
         gameId:this.paramBairen,
         config:JSON.stringify(minesConfig),
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
#normal,#hrm{
  font-size:12pt;
 }

#normal li,#hrm li{
  display:inline;
  margin-right:20px;
  border:1px solid red;
  background-color:lightgray;
 }

 #allPayX{
  list-style:none;
  font-size:12pt;
 }

 #allEditXtable{
    list-style:none;
 }

 #allEditXtable li{
  width:400px;
  margin-right:50px;
  display:inline-block;
  border:1px solid lightgray;
 }

 #allPayX li{
  padding-left:20px;
  padding-right:20px;
  margin-right:150px;
  display:inline-block;
  border:1px solid lightgray;
 }

 #normal li span,#hrm li span{
  margin-right:20px;
 }

 .xtable,.edit_xtable{
  font-size:12pt;
 }

 .xtable li span, {
  margin-right:20px;
 }


.edit_xtable li div {
  margin-left:20px;
  width:80px;
  display:inline-block;
 }
 </style>
 
 