package rpc

import (
	"app/config"
	"app/entity"
	"context"
	"fmt"
	"lottery/dao"
	"micro_service/services"

	jsoniter "github.com/json-iterator/go"
	"github.com/shopspring/decimal"
	"go.uber.org/zap"
)

func (d *LotteryService) qklBet(agentId, userId uint32, exchange decimal.Decimal, symbol, recordId, betStr, currencyType string) (decimal.Decimal, bool) {
	var newCurrency int64 = 0
	bet, _ := decimal.NewFromString(betStr)
	exBet := bet.Mul(exchange)
	pc := config.CfgIns.GetPoolCfg(int64(agentId), symbol)
	if pc == nil {
		zap.L().Error("获取Pool配置文件失败", zap.Any("roundId", recordId), zap.Any("pc", pc))
		return decimal.Zero, false
	}
	zap.L().Debug("qklBet:下注", zap.Any("agentId", agentId),
		zap.Any("symbol", symbol),
		zap.Any("roundId", recordId),
		zap.Any("playerId", userId),
		zap.Any("bet", bet),
		zap.Any("currenType", currencyType))
	if bet.GreaterThan(decimal.Zero) {
		//首先扣减用户金额
		tmp, err := d.updatePlayerCurrency(userId, (bet.Neg()).Mul(decimal.NewFromInt(100)).IntPart())
		if err != nil {
			zap.L().Debug("qklBet:下注失败,更新玩家积分失败",
				zap.Any("agentId", agentId),
				zap.Any("symbol", symbol),
				zap.Any("roundId", recordId),
				zap.Any("playerId", userId),
				zap.Any("bet", bet),
				zap.Any("currenType", currencyType))
			return decimal.Zero, false
		}
		newCurrency = tmp
	}
	//
	nc := decimal.NewFromInt(newCurrency).Div(decimal.NewFromInt(100))
	dao.CacheIns().ChangePool(int64(agentId), int32(userId), symbol, currencyType, exBet, decimal.Zero)
	if bet.GreaterThan(decimal.Zero) {
		//下注流水
		d.SaveBill(uint32(agentId), userId, bet.Neg(), nc.Truncate(2).InexactFloat64(), symbol, "下注", currencyType, recordId)
	}
	//打点水池记录
	d.pcr.Record(int64(agentId), symbol, dao.CacheIns().GetPool(int64(agentId), symbol))
	zap.L().Debug("qklBet:下注成功",
		zap.Any("agentId", agentId),
		zap.Any("symbol", symbol),
		zap.Any("roundId", recordId),
		zap.Any("playerId", userId))
	return nc, true
}

func (d *LotteryService) qklReturn(agentId, userId uint32, exchange decimal.Decimal, symbol, recordId, betStr, currencyType string) (decimal.Decimal, bool) {
	var newCurrency int64 = 0
	bet, _ := decimal.NewFromString(betStr)
	exBet := bet.Mul(exchange)
	pc := config.CfgIns.GetPoolCfg(int64(agentId), symbol)
	if pc == nil {
		zap.L().Error("获取Pool配置文件失败", zap.Any("roundId", recordId), zap.Any("pc", pc))
		return decimal.Zero, false
	}
	zap.L().Debug("qklReturn:回退", zap.Any("agentId", agentId),
		zap.Any("symbol", symbol),
		zap.Any("roundId", recordId),
		zap.Any("playerId", userId),
		zap.Any("bet", bet),
		zap.Any("currenType", currencyType))
	if bet.GreaterThan(decimal.Zero) {
		//首先扣减用户金额
		tmp, err := d.updatePlayerCurrency(userId, bet.Mul(decimal.NewFromInt(100)).IntPart())
		if err != nil {
			zap.L().Debug("qklReturn:回退失败,更新玩家积分失败",
				zap.Any("agentId", agentId),
				zap.Any("symbol", symbol),
				zap.Any("roundId", recordId),
				zap.Any("playerId", userId),
				zap.Any("bet", bet),
				zap.Any("currenType", currencyType))
			return decimal.Zero, false
		}
		newCurrency = tmp
	}
	//
	nc := decimal.NewFromInt(newCurrency).Div(decimal.NewFromInt(100))
	dao.CacheIns().ChangePool(int64(agentId), int32(userId), symbol, currencyType, exBet.Abs().Neg(), decimal.Zero)
	if bet.GreaterThan(decimal.Zero) {
		//下注流水
		d.SaveBill(uint32(agentId), userId, bet.Neg(), nc.Truncate(2).InexactFloat64(), symbol, "回退", currencyType, recordId)
	}
	//打点水池记录
	d.pcr.Record(int64(agentId), symbol, dao.CacheIns().GetPool(int64(agentId), symbol))
	zap.L().Debug("qklReturn:回退成功",
		zap.Any("agentId", agentId),
		zap.Any("symbol", symbol),
		zap.Any("roundId", recordId),
		zap.Any("playerId", userId))
	return nc, true
}

func (d *LotteryService) PoolAmountResult(_ context.Context, req *services.PoolAmountResultReq) (resp *services.PoolAmountResultResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.PoolAmountResultResp{Code: services.ErrorCode_OK}
	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil || eAgent.IsFrozen == 1 {
		resp.Code = services.ErrorCode_AGENT_FROZEN
		zap.L().Debug("PoolAmountResult:代理被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Debug("PoolAmountResult:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	pc := config.CfgIns.GetPoolCfg(int64(req.AgentId), eGame.ConfName)
	if pc == nil {
		zap.L().Error("PoolAmountResult:获取Pool配置文件失败", zap.Any("pc", pc))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("PoolAmountResult:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	p := dao.CacheIns().GetPool(int64(req.AgentId), eGame.ConfName)
	//换算成对应币种的积分   cny->[currencyType]
	resp.Currency = p.Div(exchange).Truncate(2).String()
	return resp, nil
}

func (d *LotteryService) QKLDoBetInit(_ context.Context, req *services.QKLDoBetInitReq) (resp *services.QKLDoBetInitResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLDoBetInitResp{Code: services.ErrorCode_OK}
	bet, _ := decimal.NewFromString(req.Bet)
	resp.Code = services.ErrorCode_OK
	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil || eAgent.IsFrozen == 1 {
		resp.Code = services.ErrorCode_AGENT_FROZEN
		zap.L().Debug("QKLDoBetInit:代理被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Debug("QKLDoBetInit:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLDoBetInit:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	//下注或购买
	if bet.GreaterThan(decimal.Zero) {
		newCurrency, ok := d.qklBet(req.AgentId, req.UserId, exchange, eGame.ConfName, req.RoundID, req.Bet, req.CurrencyType)
		if !ok {
			resp.Code = services.ErrorCode_SYSTEM_ERROR
		} else {
			resp.Currency = newCurrency.String()
		}
	}
	return resp, nil
}

func (d *LotteryService) QKLDoBetMore(_ context.Context, req *services.QKLDoBetMoreReq) (resp *services.QKLDoBetMoreResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLDoBetMoreResp{Code: services.ErrorCode_OK}
	bet, _ := decimal.NewFromString(req.Bet)
	resp.Code = services.ErrorCode_OK
	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil || eAgent.IsFrozen == 1 {
		resp.Code = services.ErrorCode_AGENT_FROZEN
		zap.L().Debug("QKLDoBetMore:代理被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Debug("QKLDoBetMore:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLDoBetMore:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	//下注或购买
	if bet.GreaterThan(decimal.Zero) {
		newCurrency, ok := d.qklBet(req.AgentId, req.UserId, exchange, eGame.ConfName, req.RoundID, req.Bet, req.CurrencyType)
		if !ok {
			resp.Code = services.ErrorCode_SYSTEM_ERROR
		} else {
			resp.Currency = newCurrency.String()
		}
	}
	return resp, nil
}

func (d *LotteryService) QKLDoBetContinue(_ context.Context, req *services.QKLDoBetContinueReq) (resp *services.QKLDoBetContinueResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLDoBetContinueResp{Code: services.ErrorCode_OK}
	deltaWin, _ := decimal.NewFromString(req.DeltaWin)
	resp.Code = services.ErrorCode_OK
	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil || eAgent.IsFrozen == 1 {
		resp.Code = services.ErrorCode_AGENT_FROZEN
		zap.L().Debug("QKLDoBetContinue:代理被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Debug("QKLDoBetContinue:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	pc := config.CfgIns.GetPoolCfg(int64(req.AgentId), eGame.ConfName)
	if pc == nil {
		zap.L().Error("QKLDoBetContinue:获取Pool配置文件失败", zap.Any("roundId", req.RoundID), zap.Any("pc", pc))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLDoBetContinue:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	//判断是否可以开奖
	if deltaWin.GreaterThan(decimal.Zero) {
		if req.GuaranteedWin {
			//必中 直接预扣 修改水池值
			dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, decimal.Zero, deltaWin.Mul(exchange))
			resp.CanAfford = true
		} else {
			//判断是否可以开奖
			_, ok := dao.CacheIns().Lottery(int64(req.AgentId), int32(req.UserId), pc, eGame.ConfName, req.CurrencyType, decimal.Zero, deltaWin.Mul(exchange), req.RoundID)
			if ok {
				//可以开  预扣
				dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, decimal.Zero, deltaWin.Mul(exchange))
				resp.CanAfford = true
			}
		}
	}
	return resp, nil
}

func (d *LotteryService) QKLDoBetSettle(_ context.Context, req *services.QKLDoBetSettleReq) (resp *services.QKLDoBetSettleResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLDoBetSettleResp{Code: services.ErrorCode_OK}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetSettle:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	//获取注单信息
	ur := &entity.UserRecordInfo{}
	err = jsoniter.UnmarshalFromString(req.Result, ur)
	if err != nil {
		zap.L().Error("QKLDoBetSettle:获取注单信息失败",
			zap.Any("userId", req.UserId),
			zap.Any("symbol", eGame.ConfName),
			zap.Any("agentId", req.AgentId),
			zap.Any("state", req.Result))
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		return resp, nil
	}
	w1 := decimal.NewFromFloat(ur.Common.DispatchRewardGold).Truncate(2)
	w2, _ := decimal.NewFromString(req.Win)
	if !w1.Equal(w2.Truncate(2)) {
		zap.L().Error("QKLDoBetSettle:中奖值不一致", zap.Any("result中的中奖值", ur.Common.DispatchRewardGold), zap.Any("接口中的中奖值", req.Win))
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		return resp, nil
	}
	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetSettle:获取代理信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	account := dao.CacheIns().GetPlayerAccount(int64(req.AgentId), int64(req.UserId))
	if account == "" {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetSettle:获取账号信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	pc := config.CfgIns.GetPoolCfg(int64(req.AgentId), eGame.ConfName)
	if pc == nil {
		zap.L().Error("QKLDoBetSettle:获取Pool配置文件失败", zap.Any("roundId", req.RoundID), zap.Any("pc", pc))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLDoBetSettle:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	win, _ := decimal.NewFromString(req.Win)
	exWin := win.Mul(exchange)
	newCurrency := int64(0)
	//命中 玩家赢了 直接增加玩家余额
	if req.Hit {
		//判断是否可以开奖
		_, ok := dao.CacheIns().Lottery(int64(req.AgentId), int32(req.UserId), pc, eGame.ConfName, req.CurrencyType, decimal.Zero, exWin, req.RoundID)
		if !ok {
			//不够赔 不可以开
			resp.Code = services.ErrorCode_NO_ENOUGH_POOL_MONEY
			return resp, nil
		}
		tmp, err := d.updatePlayerCurrency(req.UserId, (exWin).Mul(decimal.NewFromInt(100)).IntPart())
		if err != nil {
			zap.L().Error("QKLDoBetSettle:更新玩家积分失败",
				zap.Any("agentId", req.AgentId),
				zap.Any("symbol", eGame.ConfName),
				zap.Any("roundId", req.RoundID),
				zap.Any("playerId", req.UserId),
				zap.Any("Win", req.Win),
				zap.Any("TotalBet", req.TotalBet),
				zap.Any("currenType", req.CurrencyType))
			resp.Code = services.ErrorCode_SYSTEM_ERROR
			return resp, nil
		}
		newCurrency = tmp
		resp.Currency = fmt.Sprintf("%d", tmp)
		//扣除pool值
		dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, decimal.Zero, exWin)
		zap.L().Debug("QKLDoBetSettle:扣除Pool", zap.Any("agentId", req.AgentId), zap.Any("userId", req.UserId), zap.Any("symbol", eGame.ConfName), zap.Any("currencyType", req.CurrencyType), zap.Any("delta", exWin))
	} else {
		//返还pool值
		dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, decimal.Zero, exWin.Neg())
		zap.L().Debug("QKLDoBetSettle:返还Pool", zap.Any("agentId", req.AgentId), zap.Any("userId", req.UserId), zap.Any("symbol", eGame.ConfName), zap.Any("currencyType", req.CurrencyType), zap.Any("delta", exWin))
	}

	//新余额
	nc := decimal.NewFromInt(newCurrency).Div(decimal.NewFromInt(100))
	//增加结算注单
	record := ConvertRecord(
		uint32(req.AgentId),
		req.UserId,
		req.RoundID,
		req.CurrencyType,
		eGame.ConfName,
		account,
		req.Result,
		nc,
		uint32(eAgent.WebId),
		true,
		ur.BetRecord.TotalBetGold,
		ur.Common.DispatchRewardGold)
	d.SaveRecord(record)
	if exWin.GreaterThan(decimal.Zero) {
		//下注流水
		d.SaveBill(uint32(req.AgentId), req.UserId, win, nc.Truncate(2).InexactFloat64(), eGame.ConfName, "结算", req.CurrencyType, req.RoundID)
	}
	//打点水池记录
	d.pcr.Record(int64(req.AgentId), eGame.ConfName, dao.CacheIns().GetPool(int64(req.AgentId), eGame.ConfName))
	return resp, nil
}

func (d *LotteryService) QKLDoBetSettleWithCheck(_ context.Context, req *services.QKLDoBetSettleWithCheckReq) (resp *services.QKLDoBetSettleWithCheckResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLDoBetSettleWithCheckResp{Code: services.ErrorCode_OK}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetSettleWithCheck:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	//获取注单信息
	ur := &entity.UserRecordInfo{}
	err = jsoniter.UnmarshalFromString(req.Result, ur)
	if err != nil {
		zap.L().Error("QKLDoBetSettleWithCheck:获取注单信息失败",
			zap.Any("userId", req.UserId),
			zap.Any("symbol", eGame.ConfName),
			zap.Any("agentId", req.AgentId),
			zap.Any("state", req.Result))
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		return resp, nil
	}
	initBet, _ := decimal.NewFromString(req.InitBet)
	w1 := decimal.NewFromFloat(ur.Common.DispatchRewardGold).Truncate(2)
	w2, _ := decimal.NewFromString(req.Win)
	if !w1.Equal(w2.Truncate(2)) {
		zap.L().Error("QKLDoBetSettleWithCheck:中奖值不一致", zap.Any("result中的中奖值", ur.Common.DispatchRewardGold), zap.Any("接口中的中奖值", req.Win))
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		return resp, nil
	}
	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetSettleWithCheck:获取代理信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	account := dao.CacheIns().GetPlayerAccount(int64(req.AgentId), int64(req.UserId))
	if account == "" {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetSettleWithCheck:获取账号信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	pc := config.CfgIns.GetPoolCfg(int64(req.AgentId), eGame.ConfName)
	if pc == nil {
		zap.L().Error("QKLDoBetSettleWithCheck:获取Pool配置文件失败", zap.Any("roundId", req.RoundID), zap.Any("pc", pc))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLDoBetSettleWithCheck:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	if req.Hit == "win" {
		if w2.GreaterThan(decimal.Zero) {
			//判断是否可以开奖
			_, ok := dao.CacheIns().Lottery(int64(req.AgentId), int32(req.UserId), pc, eGame.ConfName, req.CurrencyType, decimal.Zero, w2.Mul(exchange), req.RoundID)
			if !ok {
				//不够赔 不可以开
				resp.Code = services.ErrorCode_NO_ENOUGH_POOL_MONEY
				return resp, nil
			}
			tmp, err := d.updatePlayerCurrency(req.UserId, w2.Mul(exchange).Mul(decimal.NewFromInt(100)).IntPart())
			if err != nil {
				zap.L().Error("QKLDoBetSettleWithCheck:更新玩家积分失败",
					zap.Any("agentId", req.AgentId),
					zap.Any("symbol", eGame.ConfName),
					zap.Any("roundId", req.RoundID),
					zap.Any("playerId", req.UserId),
					zap.Any("Win", req.Win),
					zap.Any("InitBet", req.InitBet),
					zap.Any("currenType", req.CurrencyType))
				resp.Code = services.ErrorCode_SYSTEM_ERROR
				return resp, nil
			}

			//新余额
			nc := decimal.NewFromInt(tmp).Div(decimal.NewFromInt(100))
			resp.CanAfford = true
			resp.Currency = nc.String()
			dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, decimal.Zero, w2.Mul(exchange))

			//增加结算注单
			record := ConvertRecord(
				uint32(req.AgentId),
				req.UserId,
				req.RoundID,
				req.CurrencyType,
				eGame.ConfName,
				account,
				req.Result,
				nc,
				uint32(eAgent.WebId),
				true,
				ur.BetRecord.TotalBetGold,
				ur.Common.DispatchRewardGold)
			d.SaveRecord(record)
			if w2.Mul(exchange).GreaterThan(decimal.Zero) {
				//下注流水
				d.SaveBill(uint32(req.AgentId), req.UserId, w2, nc.Truncate(2).InexactFloat64(), eGame.ConfName, "结算", req.CurrencyType, req.RoundID)
			}
			//打点水池记录
			d.pcr.Record(int64(req.AgentId), eGame.ConfName, dao.CacheIns().GetPool(int64(req.AgentId), eGame.ConfName))
		}
	}
	if req.Hit == "draw" {
		tmp, err := d.updatePlayerCurrency(req.UserId, initBet.Mul(exchange).Mul(decimal.NewFromInt(100)).IntPart())
		if err != nil {
			zap.L().Error("QKLDoBetSettleWithCheck:更新玩家积分失败",
				zap.Any("agentId", req.AgentId),
				zap.Any("symbol", eGame.ConfName),
				zap.Any("roundId", req.RoundID),
				zap.Any("playerId", req.UserId),
				zap.Any("Win", req.Win),
				zap.Any("InitBet", req.InitBet),
				zap.Any("currenType", req.CurrencyType))
			resp.Code = services.ErrorCode_SYSTEM_ERROR
			return resp, nil
		}

		//新余额
		nc := decimal.NewFromInt(tmp).Div(decimal.NewFromInt(100))
		resp.CanAfford = true
		resp.Currency = nc.String()
		dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, decimal.Zero, w2.Mul(exchange))

		//增加结算注单
		record := ConvertRecord(
			uint32(req.AgentId),
			req.UserId,
			req.RoundID,
			req.CurrencyType,
			eGame.ConfName,
			account,
			req.Result,
			nc,
			uint32(eAgent.WebId),
			true,
			ur.BetRecord.TotalBetGold,
			ur.Common.DispatchRewardGold)
		d.SaveRecord(record)
		if w2.Mul(exchange).GreaterThan(decimal.Zero) {
			//下注流水
			d.SaveBill(uint32(req.AgentId), req.UserId, w2, nc.Truncate(2).InexactFloat64(), eGame.ConfName, "回退", req.CurrencyType, req.RoundID)
		}
		//打点水池记录
		d.pcr.Record(int64(req.AgentId), eGame.ConfName, dao.CacheIns().GetPool(int64(req.AgentId), eGame.ConfName))
	}
	return resp, nil
}

func (d *LotteryService) QKLDoBetStop(_ context.Context, req *services.QKLDoBetStopReq) (resp *services.QKLDoBetStopResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLDoBetStopResp{Code: services.ErrorCode_OK}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetStop:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	initBet, _ := decimal.NewFromString(req.InitBet)

	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetStop:获取代理信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	account := dao.CacheIns().GetPlayerAccount(int64(req.AgentId), int64(req.UserId))
	if account == "" {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetStop:获取账号信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	pc := config.CfgIns.GetPoolCfg(int64(req.AgentId), eGame.ConfName)
	if pc == nil {
		zap.L().Error("QKLDoBetStop:获取Pool配置文件失败", zap.Any("roundId", req.RoundID), zap.Any("pc", pc))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLDoBetStop:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	tmp, err := d.updatePlayerCurrency(req.UserId, initBet.Mul(exchange).Mul(decimal.NewFromInt(100)).IntPart())
	if err != nil {
		zap.L().Error("QKLDoBetSettleWithCheck:更新玩家积分失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("symbol", eGame.ConfName),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("InitBet", req.InitBet),
			zap.Any("currenType", req.CurrencyType))
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		return resp, nil
	}

	//新余额
	nc := decimal.NewFromInt(tmp).Div(decimal.NewFromInt(100))
	resp.Currency = nc.String()
	if initBet.Mul(exchange).GreaterThan(decimal.Zero) {
		//下注流水
		d.SaveBill(uint32(req.AgentId), req.UserId, initBet, nc.Truncate(2).InexactFloat64(), eGame.ConfName, "回退", req.CurrencyType, req.RoundID)
	}
	//打点水池记录
	d.pcr.Record(int64(req.AgentId), eGame.ConfName, dao.CacheIns().GetPool(int64(req.AgentId), eGame.ConfName))
	return resp, nil
}

func (d *LotteryService) QKLDoBet(_ context.Context, req *services.QKLDoBetReq) (resp *services.QKLDoBetResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLDoBetResp{Code: services.ErrorCode_OK}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBet:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}

	bet, _ := decimal.NewFromString(req.Bet)
	win, _ := decimal.NewFromString(req.Win)

	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBet:获取代理信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	account := dao.CacheIns().GetPlayerAccount(int64(req.AgentId), int64(req.UserId))
	if account == "" {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBet:获取账号信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	pc := config.CfgIns.GetPoolCfg(int64(req.AgentId), eGame.ConfName)
	if pc == nil {
		zap.L().Error("QKLDoBet:获取Pool配置文件失败", zap.Any("roundId", req.RoundID), zap.Any("pc", pc))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLDoBet:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	if bet.Abs().GreaterThan(decimal.Zero) {
		if nc, ok := d.qklBet(req.AgentId, req.UserId, exchange, eGame.ConfName, req.RoundID, req.Bet, req.CurrencyType); ok {
			resp.Currency = nc.Truncate(2).String()
		}
	}
	//判断是否可以开奖
	_, ok = dao.CacheIns().Lottery(int64(req.AgentId), int32(req.UserId), pc, eGame.ConfName, req.CurrencyType, decimal.Zero, win.Mul(exchange), req.RoundID)
	if !ok {
		//不够赔 不可以开
		resp.Code = services.ErrorCode_NO_ENOUGH_POOL_MONEY
		return resp, nil
	}
	tmp, err := d.updatePlayerCurrency(req.UserId, win.Mul(exchange).Mul(decimal.NewFromInt(100)).IntPart())
	if err != nil {
		zap.L().Error("QKLDoBet:更新玩家积分失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("symbol", eGame.ConfName),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("win", win),
			zap.Any("currenType", req.CurrencyType))
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		return resp, nil
	}
	//新余额
	nc := decimal.NewFromInt(tmp).Div(decimal.NewFromInt(100))
	resp.Currency = nc.String()

	dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, bet.Mul(exchange), win.Mul(exchange))

	if len(req.Result) > 0 {
		ur := &entity.UserRecordInfo{}
		err = jsoniter.UnmarshalFromString(req.Result, ur)
		if err != nil {
			zap.L().Error("QKLDoBet:获取注单信息失败",
				zap.Any("userId", req.UserId),
				zap.Any("symbol", eGame.ConfName),
				zap.Any("agentId", req.AgentId),
				zap.Any("state", req.Result))
			resp.Code = services.ErrorCode_SYSTEM_ERROR
			return resp, nil
		}
		record := ConvertRecord(
			uint32(req.AgentId),
			req.UserId,
			req.RoundID,
			req.CurrencyType,
			eGame.ConfName,
			account,
			req.Result,
			nc,
			uint32(eAgent.WebId),
			true,
			ur.BetRecord.TotalBetGold,
			ur.Common.DispatchRewardGold)
		d.SaveRecord(record)
	}

	if bet.GreaterThan(decimal.Zero) {
		//下注流水
		d.SaveBill(uint32(req.AgentId), req.UserId, bet.Neg(), nc.Truncate(2).InexactFloat64(), eGame.ConfName, "下注", req.CurrencyType, req.RoundID)
	}

	if win.GreaterThan(decimal.Zero) {
		d.SaveBill(uint32(req.AgentId), req.UserId, win, nc.Truncate(2).InexactFloat64(), eGame.ConfName, "结算", req.CurrencyType, req.RoundID)
	}
	//打点水池记录
	d.pcr.Record(int64(req.AgentId), eGame.ConfName, dao.CacheIns().GetPool(int64(req.AgentId), eGame.ConfName))
	return resp, nil
}

func (d *LotteryService) QKLDoBetMultiplayerGame(_ context.Context, req *services.QKLDoBetMultiplayerGameReq) (resp *services.QKLDoBetMultiplayerGameResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLDoBetMultiplayerGameResp{Code: services.ErrorCode_OK}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetMultiplayerGame:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}

	initBet, _ := decimal.NewFromString(req.InitBet)

	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetMultiplayerGame:获取代理信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	account := dao.CacheIns().GetPlayerAccount(int64(req.AgentId), int64(req.UserId))
	if account == "" {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoBetMultiplayerGame:获取账号信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	pc := config.CfgIns.GetPoolCfg(int64(req.AgentId), eGame.ConfName)
	if pc == nil {
		zap.L().Error("QKLDoBetMultiplayerGame:获取Pool配置文件失败", zap.Any("roundId", req.RoundID), zap.Any("pc", pc))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLDoBetMultiplayerGame:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	if initBet.Abs().GreaterThan(decimal.Zero) {
		if nc, ok := d.qklBet(req.AgentId, req.UserId, exchange, eGame.ConfName, req.RoundID, req.InitBet, req.CurrencyType); ok {
			dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, initBet.Mul(exchange), decimal.Zero)
			resp.Currency = nc.Truncate(2).String()
		} else {
			zap.L().Error("QKLDoBetMultiplayerGame:获取汇率配置失败",
				zap.Any("currencyType", req.CurrencyType),
				zap.Any("roundId", req.RoundID),
				zap.Any("agentId", req.AgentId),
				zap.Any("playerId", req.UserId),
				zap.Any("gameId", req.GameId))
		}
	}
	return resp, nil
}

func (d *LotteryService) QKLCancelBetMultiplayerGame(_ context.Context, req *services.QKLCancelBetMultiplayerGameReq) (resp *services.QKLCancelBetMultiplayerGameResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLCancelBetMultiplayerGameResp{Code: services.ErrorCode_OK}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLCancelBetMultiplayerGame:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}

	bet, _ := decimal.NewFromString(req.Bet)

	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLCancelBetMultiplayerGame:获取代理信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	account := dao.CacheIns().GetPlayerAccount(int64(req.AgentId), int64(req.UserId))
	if account == "" {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLCancelBetMultiplayerGame:获取账号信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	pc := config.CfgIns.GetPoolCfg(int64(req.AgentId), eGame.ConfName)
	if pc == nil {
		zap.L().Error("QKLCancelBetMultiplayerGame:获取Pool配置文件失败", zap.Any("roundId", req.RoundID), zap.Any("pc", pc))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLCancelBetMultiplayerGame:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}

	if nc, ok := d.qklReturn(req.AgentId, req.UserId, exchange, eGame.ConfName, req.RoundID, req.Bet, req.CurrencyType); ok {
		dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, bet.Mul(exchange).Abs().Neg(), decimal.Zero)
		resp.Currency = nc.Truncate(2).String()
	}
	return resp, nil
}

func (d *LotteryService) QKLDoMultiplayerCashout(_ context.Context, req *services.QKLDoMultiplayerCashoutReq) (resp *services.QKLDoMultiplayerCashoutResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	resp = &services.QKLDoMultiplayerCashoutResp{Code: services.ErrorCode_OK}
	eGame := dao.GamesManagerIns().GetById(int64(req.GameId))
	if eGame == nil || eGame.State == 2 {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoMultiplayerCashout:游戏被冻结",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}

	win, _ := decimal.NewFromString(req.Win)

	eAgent := dao.AgentManagerIns().Get(int64(req.AgentId))
	if eAgent == nil {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoMultiplayerCashout:获取代理信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	account := dao.CacheIns().GetPlayerAccount(int64(req.AgentId), int64(req.UserId))
	if account == "" {
		resp.Code = services.ErrorCode_GAME_FROZEN
		zap.L().Error("QKLDoMultiplayerCashout:获取账号信息失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	pc := config.CfgIns.GetPoolCfg(int64(req.AgentId), eGame.ConfName)
	if pc == nil {
		zap.L().Error("QKLDoMultiplayerCashout:获取Pool配置文件失败", zap.Any("roundId", req.RoundID), zap.Any("pc", pc))
		return resp, nil
	}
	exchange, ok := config.CfgIns.GetExchange(req.CurrencyType)
	if !ok {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		zap.L().Error("QKLDoMultiplayerCashout:获取汇率配置失败",
			zap.Any("currencyType", req.CurrencyType),
			zap.Any("roundId", req.RoundID),
			zap.Any("agentId", req.AgentId),
			zap.Any("playerId", req.UserId),
			zap.Any("gameId", req.GameId))
		return resp, nil
	}
	//判断是否可以开奖
	_, ok = dao.CacheIns().Lottery(int64(req.AgentId), int32(req.UserId), pc, eGame.ConfName, req.CurrencyType, decimal.Zero, win.Mul(exchange), req.RoundID)
	if !ok {
		//不够赔 不可以开
		resp.Code = services.ErrorCode_NO_ENOUGH_POOL_MONEY
		return resp, nil
	}
	tmp, err := d.updatePlayerCurrency(req.UserId, (win.Mul(exchange)).Mul(decimal.NewFromInt(100)).IntPart())
	if err != nil {
		zap.L().Error("QKLDoMultiplayerCashout:更新玩家积分失败",
			zap.Any("agentId", req.AgentId),
			zap.Any("symbol", eGame.ConfName),
			zap.Any("roundId", req.RoundID),
			zap.Any("playerId", req.UserId),
			zap.Any("Win", req.Win),
			zap.Any("currenType", req.CurrencyType))
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		return resp, nil
	}
	resp.Currency = fmt.Sprintf("%d", tmp)
	//扣除pool值
	dao.CacheIns().ChangePool(int64(req.AgentId), int32(req.UserId), eGame.ConfName, req.CurrencyType, decimal.Zero, (win.Mul(exchange)))
	zap.L().Debug("QKLDoMultiplayerCashout:扣除Pool", zap.Any("agentId", req.AgentId), zap.Any("userId", req.UserId), zap.Any("symbol", eGame.ConfName), zap.Any("currencyType", req.CurrencyType), zap.Any("delta", win.Mul(exchange)))
	//新余额
	//不记录注单由游戏统一调用记录注单信息
	nc := decimal.NewFromInt(tmp).Div(decimal.NewFromInt(100))
	if win.GreaterThan(decimal.Zero) {
		//下注流水
		d.SaveBill(uint32(req.AgentId), req.UserId, win, nc.Truncate(2).InexactFloat64(), eGame.ConfName, "结算", req.CurrencyType, req.RoundID)
	}
	//打点水池记录
	d.pcr.Record(int64(req.AgentId), eGame.ConfName, dao.CacheIns().GetPool(int64(req.AgentId), eGame.ConfName))
	return resp, nil
}

func (d *LotteryService) QKLSaveMultiplayerRecords(_ context.Context, req *services.QKLSaveMultiplayerRecordsReq) (resp *services.QKLSaveMultiplayerRecordsResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	zap.L().Debug("QKLSaveMultiplayerRecords:批量保存注单数据结算", zap.Any("req", req))
	ids, tmp := make([]uint32, 0, 64), make(map[uint32]int64)
	for _, item := range req.Records {
		ids = append(ids, item.UserId)
		if len(ids) >= 100 {
			if ncs, e := dao.RedisIns().BatchGetPlayerCurrencys(ids); e == nil {
				for id, c := range ncs {
					tmp[id] = c
				}
			}
			ids = make([]uint32, 0, 64)
		}
	}

	if len(ids) > 0 {
		if ncs, e := dao.RedisIns().BatchGetPlayerCurrencys(ids); e == nil {
			for id, c := range ncs {
				tmp[id] = c
			}
		}
	}

	newCurrencys := make([]*services.QKLNewCurrencyItem, 0)
	for k, v := range tmp {
		newCurrencys = append(newCurrencys, &services.QKLNewCurrencyItem{UserId: k, Currency: decimal.NewFromInt(v).Div(decimal.NewFromInt(100)).Truncate(2).String()})
	}

	for _, item := range req.Records {
		agent := dao.AgentManagerIns().Get(int64(item.AgentId))
		game := dao.GamesManagerIns().GetById(int64(item.GameId))
		if game.Number > 0 && agent != nil {
			nc := decimal.Zero
			bet, _ := decimal.NewFromString(item.Bet)
			win, _ := decimal.NewFromString(item.Win)
			for _, v := range newCurrencys {
				if v.UserId == item.UserId {
					nc, _ = decimal.NewFromString(v.Currency)
				}
			}
			account := dao.CacheIns().GetPlayerAccount(int64(item.AgentId), int64(item.UserId))
			nc = nc.Div(decimal.NewFromInt(100))
			//增加结算注单
			record := ConvertRecord(
				uint32(item.AgentId),
				item.UserId,
				item.RoundID,
				item.CurrencyType,
				game.ConfName,
				account,
				item.Log,
				nc,
				uint32(agent.WebId),
				true,
				bet.Truncate(2).InexactFloat64(),
				win.Truncate(2).InexactFloat64())
			d.SaveRecord(record)
		}
	}

	return &services.QKLSaveMultiplayerRecordsResp{Code: services.ErrorCode_OK, Currencys: newCurrencys}, nil
}

func (d *LotteryService) QKLSettleMultiplayer(_ context.Context, req *services.QKLSettleMultiplayerReq) (resp *services.QKLSettleMultiplayerResp, err error) {
	defer func() {
		if err := recover(); err != nil {
			zap.L().Error("panic", zap.Any("err", err))
		}
	}()
	zap.L().Debug("QKLSettleMultiplayer:批量结算", zap.Any("req", req))
	newCurrencys := make(map[uint32]*services.QKLNewCurrencyItem)
	deltas := make(map[uint32]int64)
	//批量更新积分
	for _, item := range req.Records {
		game := dao.GamesManagerIns().GetById(int64(item.GameId))
		win, _ := decimal.NewFromString(item.Win)
		exchange, ok := config.CfgIns.GetExchange(item.CurrencyType)
		if !ok {
			resp.Code = services.ErrorCode_SYSTEM_ERROR
			zap.L().Error("QKLSettleMultiplayer:获取汇率配置失败",
				zap.Any("currencyType", item.CurrencyType),
				zap.Any("roundId", item.RoundID),
				zap.Any("agentId", item.AgentId),
				zap.Any("playerId", item.UserId),
				zap.Any("gameId", item.GameId))
			continue
		}
		//换算成redis里面的单位
		deltas[item.UserId] = win.Mul(exchange).Mul(decimal.NewFromInt(100)).Truncate(0).IntPart()
		if len(deltas) >= 100 {
			tmp, err := dao.RedisIns().BatchUpdatePlayerCurrencys(deltas)
			if err != nil {
				zap.L().Error("QKLSettleMultiplayer:更新玩家积分失败",
					zap.Any("agentId", item.AgentId),
					zap.Any("symbol", game.ConfName),
					zap.Any("roundId", item.RoundID),
					zap.Any("playerId", item.UserId),
					zap.Any("win", win),
					zap.Any("currenType", item.CurrencyType))
				resp.Code = services.ErrorCode_SYSTEM_ERROR
				return resp, nil
			}
			for k, v := range tmp {
				newCurrencys[k] = &services.QKLNewCurrencyItem{UserId: k, Currency: decimal.NewFromInt(v).Div(decimal.NewFromInt(100)).Truncate(2).String()}
			}
			deltas = make(map[uint32]int64)
		}
	}
	if len(deltas) > 0 {
		tmp, err := dao.RedisIns().BatchUpdatePlayerCurrencys(deltas)
		if err != nil {
			zap.L().Error("QKLSettleMultiplayer:更新玩家积分失败", zap.Any("data", deltas))
			resp.Code = services.ErrorCode_SYSTEM_ERROR
			return resp, nil
		}
		for k, v := range tmp {
			newCurrencys[k] = &services.QKLNewCurrencyItem{UserId: k, Currency: decimal.NewFromInt(v).Div(decimal.NewFromInt(100)).Truncate(2).String()}
		}
	}
	//批量保存注单信息
	for _, item := range req.Records {
		agent := dao.AgentManagerIns().Get(int64(item.AgentId))
		game := dao.GamesManagerIns().GetById(int64(item.GameId))
		win, _ := decimal.NewFromString(item.Win)
		account := dao.CacheIns().GetPlayerAccount(int64(item.AgentId), int64(item.UserId))
		// bet, _ := decimal.NewFromString(item.Bet)
		exchange, ok := config.CfgIns.GetExchange(item.CurrencyType)
		if !ok {
			resp.Code = services.ErrorCode_SYSTEM_ERROR
			zap.L().Error("QKLSettleMultiplayer:获取汇率配置失败",
				zap.Any("currencyType", item.CurrencyType),
				zap.Any("roundId", item.RoundID),
				zap.Any("agentId", item.AgentId),
				zap.Any("playerId", item.UserId),
				zap.Any("gameId", item.GameId))
			continue
		}
		if tmp := newCurrencys[item.UserId]; tmp != nil {
			//新余额
			nc, _ := decimal.NewFromString(tmp.Currency)
			dao.CacheIns().ChangePool(int64(item.AgentId), int32(item.UserId), game.ConfName, item.CurrencyType, decimal.Zero, win.Mul(exchange))
			if win.GreaterThan(decimal.Zero) {
				//下注流水
				d.SaveBill(uint32(item.AgentId), item.UserId, win, nc.Truncate(2).InexactFloat64(), game.ConfName, "结算", item.CurrencyType, item.RoundID)
			}
			newCurrencys[item.UserId] = &services.QKLNewCurrencyItem{UserId: item.UserId, Currency: nc.Truncate(2).String()}
			if game.Number > 0 && agent != nil {
				bet, _ := decimal.NewFromString(item.Bet)
				win, _ := decimal.NewFromString(item.Win)
				//增加结算注单
				record := ConvertRecord(
					uint32(item.AgentId),
					item.UserId,
					item.RoundID,
					item.CurrencyType,
					game.ConfName,
					account,
					item.Log,
					nc,
					uint32(agent.WebId),
					true,
					bet.Truncate(2).InexactFloat64(),
					win.Truncate(2).InexactFloat64())
				d.SaveRecord(record)
			}
		}
	}
	resArr := make([]*services.QKLNewCurrencyItem, 64)
	for _, v := range newCurrencys {
		resArr = append(resArr, v)
	}
	return &services.QKLSettleMultiplayerResp{Code: services.ErrorCode_OK, Currencys: resArr}, nil
}
