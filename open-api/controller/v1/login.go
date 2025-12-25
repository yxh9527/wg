package v1

import (
	"app/config"
	"app/tables/manager"
	"app/tables/player"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	. "open-api/common"
	"open-api/dao"
	. "open-api/dao"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	jsoniter "github.com/json-iterator/go"
	"go.uber.org/zap"
)

func Update3rdParams(userId int64, currencyType string) {
	key := fmt.Sprintf("player_%d", userId)
	txManager := dao.Mysql().Manager.Begin()
	txPlayer := dao.Mysql().Player.Begin()
	txManager.Model(&manager.User{}).Debug().Where("id=?", userId).Updates(map[string]interface{}{"currencyType": currencyType})
	txPlayer.Model(&player.Player{}).Debug().Where("user_id = ?", userId).Updates(map[string]interface{}{"currency_type": currencyType})
	if dao.Redis().Exists(key) {
		if dao.Redis().TTL(key) <= 5 {
			dao.Redis().Del(key)
		} else {
			if !dao.Redis().HSet(key, "currency_type", currencyType) {
				txManager.Rollback()
				txPlayer.Rollback()
			}
		}
	}
	txManager.Commit()
	txPlayer.Commit()
}

func Login(ctx *gin.Context, params url.Values, agent *manager.Agent) {
	account := params.Get("account")
	nickName := params.Get("nickName")
	ip := params.Get("ip")
	money := params.Get("money")
	symbol := params.Get("gameId")
	currencyType := params.Get("currencyType")
	lang := params.Get("lang")
	if lang == "" {
		lang = "zh"
	}
	game := dao.GameCacheIns.GetGame(symbol)
	if game == nil {
		ctx.JSON(http.StatusOK, GetJsonObj(API_LOGIN.String(), &SimpleResp{Code: int(CODE_GAME_NOT)}))
		zap.L().Error("游戏不存在", zap.Any("gameId", symbol))
		return
	}
	if game.State != 1 {
		ctx.JSON(http.StatusOK, GetJsonObj(API_LOGIN.String(), &SimpleResp{Code: int(CODE_GAME_PROHIBIT)}))
		zap.L().Error("游戏维护中", zap.Any("gameId", symbol), zap.Any("state", game.State))
		return
	}
	var userId int64 = 0
	//查询玩家是否已经存在
	player := Mysql().GetAgentPlayerInfoByAgentIdAndAcc(agent.Id, account)
	if player == nil {
		score, _ := strconv.ParseFloat(money, 64)
		//新建玩家信息
		player = Mysql().AddNewPlayer(agent.Id, agent.WebId, score, account, nickName, ip, currencyType)
		if player.Id <= 0 {
			ctx.JSON(http.StatusOK, GetJsonObj(API_LOGIN.String(), &SimpleResp{Code: int(CODE_REQUEST_ERR)}))
			return
		}
	} else {
		userId = int64(player.Id)
		Update3rdParams(player.Id, currencyType)
	}
	aesKey, aesIv := agent.AesKey[16:], agent.AesKey[0:16]
	source := fmt.Sprintf("agentId=%d&userId=%d&times=%d", agent.Id, userId, time.Now().UnixMilli())
	res, _ := AesEncrypt(aesKey, aesIv, []byte(source))
	sessionKey := fmt.Sprintf("SESSION@%s", res)
	//创建用户session
	session := &Session{}
	sessionStr, _ := Redis().Get(sessionKey)
	if sessionStr != "" {
		if jsoniter.UnmarshalFromString(sessionStr, session) == nil {
			session.GameId, _ = strconv.ParseInt(symbol, 10, 0)
			session.CurrencyType = currencyType
			session.Lang = lang
		}
	} else {
		session = &Session{
			AgentId:      agent.Id,
			UserId:       player.Id,
			GameId:       game.Id,
			NickName:     player.NickName,
			AuthToken:    res,
			Mgckey:       sessionKey,
			Lang:         lang,
			Account:      player.UserId,
			LastAuthTime: time.Now().Unix(),
			AuthCount:    0,
		}
	}
	session.LastAuthTime = time.Now().Unix()
	str, err := jsoniter.MarshalToString(session)
	if err != nil {
		ctx.JSON(http.StatusOK, GetJsonObj(API_LOGIN.String(), &SimpleResp{Code: int(CODE_REQUEST_ERR)}))
		return
	}
	if err := Redis().Set(sessionKey, str, 20*60); err != nil {
		zap.L().Error("创建用户session失败", zap.Any("err", err))
		ctx.JSON(http.StatusOK, GetJsonObj(API_LOGIN.String(), &SimpleResp{Code: int(CODE_REQUEST_ERR)}))
		return
	}
	arr := config.CfgIns.System.GameUrls
	if len(arr) > 0 {
		//https://vv85w4t.ezmkpkwldso.com:23438/clientv3/index.html?gameId=3031&lang=zh&sc=2066&currencyCode=CNY&other=https:%2F%2F146.103.80.204:5029;https:%2F%2F00okccnheh.buwqo.com:5030;https:%2F%2F146.103.88.77:5012;https:%2F%2Fsze8t.qzqgsewldxu.com:31530
		routs := []string{}
		requestUrl := fmt.Sprintf("%s/clientv3/index.html?agentId=%d&gameId=%d&lang=%s&token=%s&sc=2066&currencyCode=%s&sessionKey=%s&other=%s", arr[rand.Intn(len(arr))], player.AgentId, game.Number, lang, session.Mgckey, currencyType, sessionKey, strings.Join(routs, ";"))
		ctx.PureJSON(http.StatusOK, GetJsonObj(API_LOGIN.String(), &LoginResp{
			Code: int(CODE_OK),
			Url:  requestUrl,
		}))
	} else {
		ctx.JSON(http.StatusOK, GetJsonObj(API_LOGIN.String(), &SimpleResp{Code: int(CODE_REQUEST_ERR)}))
	}
}

func UpdateCurrencyType(ctx *gin.Context, params url.Values, agent *manager.Agent) {
	account := params.Get("account")
	currencyType := params.Get("currencyType")
	var userId int64 = 0
	//查询玩家是否已经存在
	player := Mysql().GetAgentPlayerInfoByAgentIdAndAcc(agent.Id, account)
	if player == nil {
		ctx.JSON(http.StatusOK, GetJsonObj(API_LOGIN.String(), &SimpleResp{Code: int(CODE_REQUEST_ERR)}))
		return
	} else {
		userId = int64(player.Id)
	}
	Update3rdParams(userId, currencyType)
	ctx.PureJSON(http.StatusOK, GetJsonObj(API_LOGIN.String(), map[string]interface{}{
		"code": CODE_OK,
	}))
}
