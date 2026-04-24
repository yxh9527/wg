package dao

import (
	"app/entity"
	"context"
	"crypto/md5"
	"encoding/json"
	"fmt"
	"micro_service/services"
	"strconv"

	"github.com/olivere/elastic/v7"
	"go.uber.org/zap"
)

type ESDao struct {
	es *elastic.Client
}

const hashLotteryResultIndex = "hash_lottery_result"

type HashLotteryResultDoc struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type GameRecordLogDoc struct {
	Log string `json:"log"`
}

func NewESDao(client *elastic.Client) *ESDao {
	return &ESDao{es: client}
}

func (esDao *ESDao) SaveHashLotteryResult(key, value string) error {
	doc := &HashLotteryResultDoc{
		Key:   key,
		Value: value,
	}
	_, err := esDao.es.Index().
		Index(hashLotteryResultIndex).
		Id(key).
		BodyJson(doc).
		Do(context.Background())
	if err != nil {
		zap.L().Error("SaveHashLotteryResult,写入ES失败", zap.String("key", key), zap.Error(err))
		return err
	}
	zap.L().Debug("SaveHashLotteryResult,写入ES成功", zap.String("key", key))
	return nil
}

func (esDao *ESDao) BulkSaveHashLotteryResult(data []*HashLotteryResultDoc) error {
	bulkService := esDao.es.Bulk()
	records := make([]elastic.BulkableRequest, 0, len(data))
	for _, item := range data {
		records = append(records, elastic.NewBulkIndexRequest().
			Index(hashLotteryResultIndex).
			Id(item.Key).
			Doc(item))
	}
	bulkService.Add(records...)
	zap.L().Debug("BulkSaveHashLotteryResult,准备提交ES批量请求", zap.Int("count", len(data)))
	_, err := bulkService.Do(context.Background())
	if err != nil {
		zap.L().Error("BulkSaveHashLotteryResult,批量写入ES失败", zap.Int("count", len(data)), zap.Error(err))
		return err
	}
	zap.L().Debug("BulkSaveHashLotteryResult,批量写入ES完成", zap.Int("count", len(data)))
	return nil
}

func (esDao *ESDao) GetHashLotteryResult(key string) (string, error) {
	zap.L().Debug("GetHashLotteryResult,开始查询ES", zap.String("key", key))
	resp, err := esDao.es.Get().
		Index(hashLotteryResultIndex).
		Id(key).
		Do(context.Background())
	if elastic.IsNotFound(err) {
		zap.L().Debug("GetHashLotteryResult,ES未找到结果", zap.String("key", key))
		return "", nil
	}
	if err != nil {
		zap.L().Error("GetHashLotteryResult,读取ES失败", zap.String("key", key), zap.Error(err))
		return "", err
	}

	doc := &HashLotteryResultDoc{}
	if err := json.Unmarshal(resp.Source, doc); err != nil {
		zap.L().Error("GetHashLotteryResult,解析ES结果失败", zap.String("key", key), zap.Error(err))
		return "", err
	}
	zap.L().Debug("GetHashLotteryResult,ES查询成功", zap.String("key", key), zap.Bool("found", doc.Value != ""))
	return doc.Value, nil
}

func (esDao *ESDao) GetGameRecordsList(gameID, userID int32, isWinGold bool) ([]string, error) {
	querys := []elastic.Query{
		elastic.NewTermQuery("gameId", gameID),
		elastic.NewTermQuery("userId", userID),
	}
	if isWinGold {
		querys = append(querys, elastic.NewRangeQuery("win").Gt(0))
	}
	zap.L().Debug("GetGameRecordsList,开始查询ES", zap.Int32("gameId", gameID), zap.Int32("userId", userID), zap.Bool("isWinGold", isWinGold))
	includeFields := elastic.NewFetchSourceContext(true).Include("log")
	resp, err := esDao.es.Search().
		Index("pp_gp_settlement").
		FetchSourceContext(includeFields).
		Query(elastic.NewBoolQuery().Must(querys...)).
		Pretty(true).
		Size(20).
		Sort("playedDate", false).
		Do(context.Background())
	if err != nil {
		zap.L().Error("GetGameRecordsList,读取ES失败", zap.Int32("gameId", gameID), zap.Int32("userId", userID), zap.Bool("isWinGold", isWinGold), zap.Error(err))
		return nil, err
	}

	records := make([]string, 0, len(resp.Hits.Hits))
	for _, v := range resp.Hits.Hits {
		b, _ := v.Source.MarshalJSON()
		r := &GameRecordLogDoc{}
		if err := json.Unmarshal(b, r); err != nil {
			zap.L().Warn("GetGameRecordsList,解析log失败", zap.Error(err))
			continue
		}
		if r.Log != "" {
			records = append(records, r.Log)
		}
	}
	zap.L().Debug("GetGameRecordsList,ES查询结果完成", zap.Int32("gameId", gameID), zap.Int32("userId", userID), zap.Bool("isWinGold", isWinGold), zap.Int("count", len(records)))
	return records, nil
}

func (esDao *ESDao) BulkRecordsSave(data []*entity.CacheRecordsReq) error {
	bulkService := esDao.es.Bulk()
	records := make([]elastic.BulkableRequest, 0)
	for _, req := range data {
		hashStr := fmt.Sprintf("%d|%d|%s", req.AgentId, req.UserId, req.RoundID)
		req.Hash = fmt.Sprintf("%x", md5.Sum([]byte(hashStr)))
		records = append(records, elastic.NewBulkIndexRequest().Index("pp_gp_settlement").Id(req.Hash).Doc(req))
	}
	bulkService.Add(records...)
	_, err := bulkService.Do(context.Background())
	if err != nil {
		zap.L().Error("BulkRecordsSave,批量插入数据失败", zap.Any("err", err), zap.Any("data", data))
	}
	return nil
}

func (esDao *ESDao) BulkBillsSave(data []*entity.CacheBillsReq) error {
	bulkService := esDao.es.Bulk()
	records := make([]elastic.BulkableRequest, 0)
	for _, req := range data {
		records = append(records, elastic.NewBulkIndexRequest().Index("pp_gp_flowing_water").Doc(req))
	}
	bulkService.Add(records...)
	_, err := bulkService.Do(context.Background())
	if err != nil {
		zap.L().Error("BulkBillsSave,批量插入数据失败", zap.Any("err", err), zap.Any("data", data))
	}
	return nil
}

func (esDao *ESDao) GetRecords(userId int64, symbol, hash, currency string) []*services.RecordItem {
	querys := make([]elastic.Query, 0)
	if hash != "" {
		querys = append(querys, elastic.NewTermQuery("hash", hash))
	} else {
		querys = append(querys, elastic.NewTermQuery("userId", userId))
		querys = append(querys, elastic.NewTermQuery("symbol", symbol))
		querys = append(querys, elastic.NewTermQuery("complete", true))
	}
	if currency != "" {
		querys = append(querys, elastic.NewMatchPhraseQuery("currency", currency))
	}
	boolQuery := elastic.NewBoolQuery().Must(querys...)
	var sorce []string = nil
	if hash == "" {
		sorce = []string{"userId", "agentId", "bet", "currency", "currencySymbol", "base_bet", "win", "rtp", "playedDate", "roundID", "symbol", "hash", "balance", "balance_cash", "balance_bonus", "isTourist"}
	} else {
		sorce = []string{"init", "log"}
	}
	includeFields := elastic.NewFetchSourceContext(true).Include(sorce...)
	resp, _ := esDao.es.Search().Index("pp_gp_settlement").FetchSourceContext(includeFields).
		Query(boolQuery).
		Pretty(true).
		Size(100).
		Sort("playedDate", false).
		Do(context.Background())
	records := make([]*services.RecordItem, 0)
	for _, v := range resp.Hits.Hits {
		b, _ := v.Source.MarshalJSON()
		r := &services.RecordItem{}
		json.Unmarshal(b, r)
		records = append(records, r)
	}
	return records
}

func (esDao *ESDao) GetRecordsByRoundId(roundId string) []*services.RecordItem {
	querys := make([]elastic.Query, 0)
	rid, _ := strconv.ParseInt(roundId, 10, 64)
	querys = append(querys, elastic.NewTermQuery("roundID", rid))
	sorce := []string{"currency", "currencySymbol", "symbol", "log"}
	includeFields := elastic.NewFetchSourceContext(true).Include(sorce...)
	boolQuery := elastic.NewBoolQuery().Must(querys...)
	resp, _ := esDao.es.Search().Index("pp_gp_settlement").FetchSourceContext(includeFields).
		Query(boolQuery).
		Pretty(true).
		Size(100).
		Sort("playedDate", false).
		Do(context.Background())
	records := make([]*services.RecordItem, 0)
	for _, v := range resp.Hits.Hits {
		b, _ := v.Source.MarshalJSON()
		r := &services.RecordItem{}
		json.Unmarshal(b, r)
		records = append(records, r)
	}
	return records
}

func (esDao *ESDao) GetRecordsReplayDataByRoundId(roundId string) []*services.RecordItem {
	querys := make([]elastic.Query, 0)
	rid, _ := strconv.ParseInt(roundId, 10, 64)
	querys = append(querys, elastic.NewTermQuery("roundID", rid))
	boolQuery := elastic.NewBoolQuery().Must(querys...)
	resp, err := esDao.es.Search().Index("pp_gp_settlement").
		Query(boolQuery).
		Pretty(true).
		Size(100).
		Sort("playedDate", false).
		Do(context.Background())
	if err != nil {
		return nil
	}
	records := make([]*services.RecordItem, 0)
	for _, v := range resp.Hits.Hits {
		b, _ := v.Source.MarshalJSON()
		r := &services.RecordItem{}
		json.Unmarshal(b, r)
		records = append(records, r)
	}
	return records
}

func (esDao *ESDao) GetRecordsReplayDataByToken(token string) []*services.RecordItem {
	querys := make([]elastic.Query, 0)
	querys = append(querys, elastic.NewTermQuery("hash", token))
	boolQuery := elastic.NewBoolQuery().Must(querys...)
	resp, err := esDao.es.Search().Index("pp_gp_settlement").
		Query(boolQuery).
		Pretty(true).
		Size(100).
		Sort("playedDate", false).
		Do(context.Background())
	records := make([]*services.RecordItem, 0)
	if err != nil {
		return nil
	}
	for _, v := range resp.Hits.Hits {
		b, _ := v.Source.MarshalJSON()
		r := &services.RecordItem{}
		json.Unmarshal(b, r)
		records = append(records, r)
	}
	return records
}

func (esDao *ESDao) GetRtpGreaterThan10(symbol string, userId int64) []*services.RecordItem {
	querys := make([]elastic.Query, 0)
	sorce := []string{"userId", "agentId", "bet", "currency", "currencySymbol", "base_bet", "win", "rtp", "playedDate", "roundID", "symbol", "hash", "balance", "balance_cash", "balance_bonus"}
	includeFields := elastic.NewFetchSourceContext(true).Include(sorce...)
	querys = append(querys, elastic.NewTermQuery("userId", userId))
	querys = append(querys, elastic.NewRangeQuery("rtp").Gte(10))
	querys = append(querys, elastic.NewTermQuery("symbol", symbol))
	boolQuery := elastic.NewBoolQuery().Must(querys...)
	resp, err := esDao.es.Search().Index("pp_gp_settlement").FetchSourceContext(includeFields).
		Query(boolQuery).
		Pretty(true).
		Size(100).
		Sort("playedDate", false).
		Do(context.Background())
	if err != nil {
		return nil
	}
	records := make([]*services.RecordItem, 0)
	for _, v := range resp.Hits.Hits {
		b, _ := v.Source.MarshalJSON()
		r := &services.RecordItem{}
		json.Unmarshal(b, r)
		records = append(records, r)
	}
	return records
}
