package rpc

import (
	"app/entity"
	"bytes"
	"compress/flate"
	"compress/gzip"
	"context"
	"data-center/dao"
	"fmt"
	"io"
	"micro_service/services"
	"time"

	"github.com/olivere/elastic/v7"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type DataCenterService struct {
	db  *dao.DBDao
	rds *dao.RedisDao
	es  *dao.ESDao

	RecordChan    chan *entity.CacheRecordsReq
	GameStateChan chan *services.SaveGameStateReq
}

func NewDataCenterService(db, mdb *gorm.DB, es *elastic.Client) *DataCenterService {
	tmp := &DataCenterService{
		db:            dao.NewDBDao(db, mdb),
		rds:           dao.RedisIns(),
		es:            dao.NewESDao(es),
		RecordChan:    make(chan *entity.CacheRecordsReq, 10240),
		GameStateChan: make(chan *services.SaveGameStateReq, 512),
	}

	tmp.syncRecords()
	tmp.syncSaveGameState()
	return tmp
}

// 注单入库
func (dc *DataCenterService) syncRecords() {
	go func() {
		defer func() {
			if e := recover(); e != nil {
				zap.L().Error("syncRecords,数据落地协程panic", zap.Any("recover", e))
			}
		}()
		data := make([]*entity.CacheRecordsReq, 0, 16)
		//十秒写一次
		t := time.NewTicker(10 * time.Second)
		for {
			select {
			case <-t.C:
				if len(data) > 0 {
					dc.es.BulkRecordsSave(data)
					ids := make([]int64, 0, 64)
					for _, v := range data {
						ids = append(ids, v.RoundID)
					}
					zap.L().Debug("批量写入注单信息", zap.Any("roundIds", ids))
					data = make([]*entity.CacheRecordsReq, 0, 16)
				}
			case req := <-dc.RecordChan:
				data = append(data, req)
				if len(data) >= 8 {
					dc.es.BulkRecordsSave(data)
					ids := make([]int64, 0, 64)
					for _, v := range data {
						ids = append(ids, v.RoundID)
					}
					zap.L().Debug("批量写入注单信息", zap.Any("roundIds", ids))
					data = make([]*entity.CacheRecordsReq, 0, 16)
				}
			}
		}
	}()
}

// 最近玩的游戏
func (dc *DataCenterService) syncSaveGameState() {
	go func() {
		defer func() {
			if e := recover(); e != nil {
				zap.L().Error("syncSaveGameState,数据落地协程panic", zap.Any("recover", e))
			}
		}()
		data := make([]*services.SaveGameStateReq, 0, 64)
		//十秒写一次
		t := time.NewTicker(10 * time.Second)
		for {
			select {
			case <-t.C:
				if len(data) > 0 {
					dc.es.BulkGameStateSave(data)
					data = make([]*services.SaveGameStateReq, 0, 64)
				}
			case req := <-dc.GameStateChan:
				data = append(data, req)
				if len(data) >= 32 {
					dc.es.BulkGameStateSave(data)
					data = make([]*services.SaveGameStateReq, 0, 64)
				}
			}
		}
	}()
}

func (d *DataCenterService) GetPlayer(ctx context.Context, req *services.GetPlayerReq) (resp *services.GetPlayerResp, err error) {
	p, err := d.rds.GetPlayer(req.GetPlayerId(), req.Factory)
	if err != nil {
		return nil, err
	}
	resp = &services.GetPlayerResp{}
	if p != nil {
		resp.HumanPlayer = p
		return resp, nil
	}
	// 在redis中没有找到玩家信息，从db中加载
	player, err := d.db.GetPlayer(ctx, req.PlayerId)
	if err != nil {
		return nil, err
	}
	p = ConvertUserEntityToHumanPlayer(player)
	if err := d.rds.SetPlayer(p, false); err != nil {
		zap.L().Warn("向redis写入玩家信息缓存失败，下一次获取该玩家信息时还将从数据库中读取", zap.Uint32("player_id", p.Id))
	}
	resp.HumanPlayer = p
	return resp, nil
}

func (d *DataCenterService) UpdatePlayerAvatarAndGender(ctx context.Context, req *services.UpdatePlayerAvatarAndGenderReq) (resp *services.UpdatePlayerAvatarAndGenderResp, err error) {
	err = d.rds.UpdatePlayerAvatarAndGender(req.PlayerId, req.Avatar, req.Name, req.Gender)
	if err == redis.Nil {
		// 在redis中没有找到玩家信息，从db中加载
		player, err := d.db.GetPlayer(ctx, req.PlayerId)
		if err != nil {
			zap.L().Error("从数据库加载玩家信息失败", zap.Stringer("req", req), zap.Error(err))
			return nil, err
		}
		if err := d.rds.SetPlayer(ConvertUserEntityToHumanPlayer(player), true); err != nil {
			zap.L().Error("向redis写入玩家信息缓存失败", zap.Stringer("req", req), zap.Error(err))
			return nil, err
		}
	} else if err != nil {
		zap.L().Error("更新玩家头像或性别失败", zap.Stringer("req", req), zap.Error(err))
		return nil, err
	}
	return &services.UpdatePlayerAvatarAndGenderResp{}, nil
}

func (d *DataCenterService) GetValue(_ context.Context, req *services.GetValueReq) (resp *services.GetValueResp, err error) {
	resp = &services.GetValueResp{Code: services.ErrorCode_OK}
	res, err := d.rds.Get(req.Key, req.TimeOut)
	if err != nil && err != redis.Nil {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		return resp, err
	}
	resp.Value = res
	return resp, nil
}

func (d *DataCenterService) SetValue(_ context.Context, req *services.SetValueReq) (resp *services.SetValueResp, err error) {
	resp = &services.SetValueResp{Code: services.ErrorCode_OK}
	if err := d.rds.Set(req.Key, req.Value, req.TimeOut); err != nil {
		resp.Code = services.ErrorCode_SYSTEM_ERROR
		return nil, err
	}
	return resp, nil
}

// 获取注单信息
func (d *DataCenterService) GetRecords(ctx context.Context, req *services.GetRecordsReq) (resp *services.GetRecordsResp, err error) {
	resp = &services.GetRecordsResp{}
	resp.Code = services.ErrorCode_OK
	resp.Data = d.es.GetRecords(req.UserId, req.Symbol, req.Hash)
	return resp, nil
}

// 玩家锁 加锁
func (d *DataCenterService) UserLock(ctx context.Context, req *services.UserLockReq) (resp *services.UserLockResp, err error) {
	resp = &services.UserLockResp{}
	resp.Result = d.rds.UserLock(req.UserId)
	return resp, nil
}

// 玩家锁 解锁
func (d *DataCenterService) UserUnLock(ctx context.Context, req *services.UserUnLockReq) (resp *services.UserUnLockResp, err error) {
	resp = &services.UserUnLockResp{}
	resp.Result = d.rds.UserUnLock(req.UserId, req.Token)
	return resp, nil
}

func Compress(s string) ([]byte, error) {
	var buf bytes.Buffer
	gz, err := gzip.NewWriterLevel(&buf, flate.BestCompression)
	if err != nil {
		return nil, err
	}
	// 将字符串转换为[]byte并写入到gzip writer
	if _, err := gz.Write([]byte(s)); err != nil {
		return nil, err
	}
	// 关闭writer，完成压缩
	if err := gz.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func Decompress(compressedData []byte) (string, error) {
	b := bytes.NewBuffer(compressedData)
	gzr, err := gzip.NewReader(b)
	if err != nil {
		return "", err
	}
	defer gzr.Close() // 确保在函数结束时关闭reader
	// 读取解压后的数据
	result, err := io.ReadAll(gzr) // 注意：在Go 1.16及以后应使用io/ioutil替换掉旧的ioutil包功能
	if err != nil {
		return "", err
	}
	return string(result), nil
}

// 保存游戏状态
func (d *DataCenterService) SaveGameState(ctx context.Context, req *services.SaveGameStateReq) (resp *services.SaveGameStateResp, err error) {
	// cs, err := Compress(req.Data)
	// if err != nil {
	// 	zap.L().Error("压缩数据失败", zap.Any("err", err))
	// 	return nil, err
	// }
	//1、写入缓存
	key := fmt.Sprintf("game_state_%d_%s", req.UserId, req.Symbol)
	err = d.rds.Client.Set(context.Background(), key, req.Data, time.Second*300).Err()
	if err != nil {
		return nil, err
	}
	//2、入库
	resp = &services.SaveGameStateResp{}
	d.GameStateChan <- req
	return resp, nil
}

// 获取游戏状态
func (d *DataCenterService) GetGameState(ctx context.Context, req *services.GetGameStateReq) (resp *services.GetGameStateResp, err error) {
	resp = &services.GetGameStateResp{}
	//1、首先获取redis
	state := d.rds.Client.Get(context.Background(), fmt.Sprintf("game_state_%d_%s", req.UserId, req.Symbol)).Val()
	if state == "" {
		data := d.es.GetGameState(req)
		if data != nil {
			resp.Data = data.Data
		}
	} else {
		resp.Data = state
	}
	return resp, nil
}

// 获取游戏列表
func (d *DataCenterService) GetGameList(ctx context.Context, req *services.GetGameListReq) (resp *services.GetGameListResp, err error) {
	resp = d.db.GetGameList()
	// zap.L().Debug("游戏列表", zap.Any("data", resp), zap.Any("count", len(resp.All)))
	return resp, nil
}
