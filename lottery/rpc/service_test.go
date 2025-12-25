package rpc

import (
	"lottery/dao"
	"testing"
)

func TestService(T *testing.T) {
	// util.InitZapLogger("./", "lottery")
	// rc := util.InitBaseConfig("../config.yaml")
	// if rc == nil {
	// 	return
	// }
	// dao.NewRedisDao(rc.Host, rc.User, rc.Pwd)
	// dao.ConfigsInit()
	// cfg := dao.LoadConfig()
	// err := dao.InitDB(cfg)
	// if err != nil {
	// 	return
	// }
	// es, eErr := dao.InitES(cfg)
	// if eErr != nil {
	// 	zap.L().Error("创建es客户端失败", zap.Error(err))
	// 	return
	// }
	// ns := NewLotteryService(es)
	// //缓存初始化
	// dao.CahceInit()
	// for i := 0; i < 1000; i++ {
	// 	_, err := ns.Bet(context.Background(), &services.BetReq{
	// 		PlayerId:     4002,
	// 		Delta:        decimal.NewFromInt(2).Neg().String(),
	// 		Symbol:       "vs1024mjwinbns",
	// 		CurrencyType: "CNY",
	// 		AgentId:      0,
	// 	})
	// 	if err != nil {
	// 		zap.L().Fatal("bet err", zap.Any("err", err))
	// 	}
	// 	//随机是否开奖
	// 	n := rand.Intn(2)
	// 	if n == 1 {
	// 		//开奖
	// 		l := decimal.NewFromInt(int64(rand.Intn(100) + 1)).String()
	// 		resp, err := ns.Lottery(context.Background(), &services.LotteryReq{
	// 			PlayerId:     4002,
	// 			CurrencyType: "CNY",
	// 			AgentId:      0,
	// 			Symbol:       "vs1024mjwinbns",
	// 			ProfitLoss:   l,
	// 		})
	// 		if err != nil {
	// 			zap.L().Error("开奖失败", zap.Any("err", err))
	// 			continue
	// 		}
	// 		if resp.Result {
	// 			zap.L().Debug("开奖成功", zap.Any("lottery", l), zap.Any("newcurrency", resp.NewCurrency))
	// 		}
	// 	}
	// }

	users, games := dao.GetAgentChanges()
	dao.SaveAgentData(games) //定时保存代理数据
	dao.SaveUserData(users)  //定时保存玩家数据

}
