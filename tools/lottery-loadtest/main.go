package main

import (
	"context"
	"flag"
	"fmt"
	"math/rand"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"micro_service/services"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

const defaultState = `{"commonRecord":{"recordId":"APICNY-30T0037-148306098-90","dispatchRewardGold":18.08,"settlementTimestamp":1779344123,"porderId":"APICNY-30T0037-148306098-90S29","settlementTms":"1779344123625","machineId":11},"betRecord":{"totalBetGold":30},"connectionRecord":{"betGold":30,"betAreaCount":6,"betAreas":[],"winLoseGold":18.08,"freeGameWin":0,"freeType":1,"rewardType":0,"icons":"14,1,14,11,3,4,31,53,43,13,51,52,12,12,31,4,11,4,1,3,2,1,31,4,0,0","betSingle":0.02,"betTimes":1,"specialInfoStr":"[\"6##0#1,11,2,14,12,11,11,12,1,53,3,3,52,4,43,2,43,3,2,1,2,14,13,11,0,1\",\"6#[\\\"13,0.02,1.6,2,1,5,13,0,1,1,3,2,0,3,3,4,1,5,0,5,1\\\"]#1.6#31,13,1,11,14,14,13,13,1,42,11,54,4,54,4,53,1,1,13,2,3,13,13,4,1,2;4,31,1,3,11,14,14,13,1,42,11,54,4,54,4,21,1,3,1,2,3,11,2,4,0,3\",\"6#[\\\"2,0.02,2.56,2,1,8,2,0,1,1,1,2,2,2,3\\\",\\\"11,0.02,0.64,1,1,4,11,0,2,1,0,2,4,3,3\\\",\\\"13,0.02,0.32,1,1,1,13,0,2,1,0,2,3\\\"]#3.52#13,2,11,11,2,12,1,13,4,2,2,11,44,43,14,11,3,13,3,12,3,4,31,11,2,4;11,3,13,13,12,12,1,11,1,51,13,4,11,44,43,14,3,13,3,12,3,4,31,11,1,5;11,11,3,4,12,12,1,31,11,1,51,4,11,44,43,14,3,13,3,12,3,4,31,11,0,6\",\"6##0#1,12,1,11,12,2,12,13,11,13,43,41,12,13,4,2,13,4,13,12,11,2,14,13,0,7\",\"6##0#12,31,1,13,14,14,2,14,3,11,54,2,1,44,2,4,3,13,12,1,12,13,2,12,0,8\",\"6##0#12,2,11,2,14,4,4,11,54,51,52,11,13,1,1,14,11,2,11,1,3,14,4,12,0,9\",\"6#[\\\"12,0.02,3.84,6,1,4,12,0,2,1,0,1,1,1,2,2,3,2,4,3,1\\\",\\\"14,0.02,3.84,4,1,3,14,0,0,1,0,1,3,2,2,3,1,3,2,4,1\\\",\\\"12,0.02,2.56,1,1,4,12,0,0,1,2,2,2,3,0\\\",\\\"13,0.02,1.28,2,1,1,13,0,1,0,2,1,0,2,2\\\"]#11.52#13,13,12,12,12,12,14,54,51,3,12,12,41,52,14,3,43,1,14,1,1,11,3,13,1,10;14,13,13,14,12,4,14,2,2,54,51,3,41,21,14,3,43,1,14,1,1,11,3,13,1,11;12,13,13,13,14,12,4,2,2,21,51,3,52,44,41,3,43,13,1,1,1,11,3,13,2,12;1,14,12,2,13,14,4,12,2,2,51,3,21,44,41,3,43,13,1,1,1,11,3,13,0,13\\\",\\\"6##0#1,12,12,12,4,13,31,51,11,3,1,13,54,2,13,1,1,1,4,11,3,14,4,12,0,14\\\",\\\"6##0#2,11,13,12,14,4,4,1,51,1,1,1,12,53,4,13,3,2,12,3,1,14,11,13,0,15\\\",\\\"6#[\\\"13,0.02,0.16,1,1,1,13,0,0,1,3,2,0\\\",\\\"11,0.02,1.28,2,1,4,11,0,1,1,0,2,3,2,4,3,3\\\"]#1.44#13,11,14,11,14,14,13,13,12,12,11,11,44,1,4,11,54,1,14,3,12,12,3,4,2,16;11,11,14,3,13,14,14,1,51,12,12,12,4,44,1,4,54,1,14,3,12,12,3,4,0,17\\\"]","timestampList":[1779344123,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},"roomLevel":99}`

func decodeState(s string) string {
	v, err := strconv.Unquote(`"` + s + `"`)
	if err != nil {
		return s
	}
	return v
}

func buildState(rawState, recordID, award string) string {
	state := decodeState(rawState)
	if rawState == defaultState {
		state = strings.ReplaceAll(state, `"recordId":"APICNY-30T0037-148306098-90"`, fmt.Sprintf(`"recordId":"%s"`, recordID))
		state = strings.ReplaceAll(state, `"porderId":"APICNY-30T0037-148306098-90S29"`, fmt.Sprintf(`"porderId":"%sS29"`, recordID))
		state = strings.ReplaceAll(state, `"dispatchRewardGold":18.08`, fmt.Sprintf(`"dispatchRewardGold":%s`, award))
		state = strings.ReplaceAll(state, `"winLoseGold":18.08`, fmt.Sprintf(`"winLoseGold":%s`, award))
	}
	return state
}

func randomAmount(r *rand.Rand, max float64) string {
	if max <= 0 {
		return "0"
	}
	return strconv.FormatFloat(r.Float64()*max, 'f', 2, 64)
}

func randomRecordID(r *rand.Rand, prefix string) string {
	return fmt.Sprintf("%s-%s-%09d-%02d", prefix, randomSegment(r, 6), r.Int63n(1_000_000_000), r.Intn(100))
}

func randomSegment(r *rand.Rand, n int) string {
	const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	b := make([]byte, n)
	for i := range b {
		b[i] = chars[r.Intn(len(chars))]
	}
	return string(b)
}

func main() {
	var (
		addr        = flag.String("addr", "127.0.0.1:10080", "grpc addr")
		qps         = flag.Int("qps", 100, "requests per second")
		concurrency = flag.Int("concurrency", 10, "worker count")
		duration    = flag.Duration("duration", 1*time.Minute, "test duration")
		agentID     = flag.Uint64("agent-id", 0, "agent id")
		gameID      = flag.Uint64("game-id", 1, "game id")
		symbol      = flag.String("symbol", "sjddj", "symbol")
		recordPref  = flag.String("record-prefix", "APICNY", "record prefix")
		bet         = flag.String("bet", "1", "bet amount")
		awardMax    = flag.Float64("award-max", 50, "max random award")
		currency    = flag.String("currency", "CNY", "currency type")
		state       = flag.String("state", defaultState, "state json")
		token       = flag.String("token", "", "token")
		complete    = flag.Bool("complete", true, "complete flag")
		timeout     = flag.Duration("timeout", 3*time.Second, "rpc timeout")
	)
	flag.Parse()

	fmt.Printf("symbol=%s gameId=%d qps=%d concurrency=%d timeout=%s\n", *symbol, *gameID, *qps, *concurrency, *timeout)

	ctx, cancel := context.WithTimeout(context.Background(), *duration)
	defer cancel()

	conn, err := grpc.NewClient(*addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}
	defer conn.Close()
	conn.Connect()

	client := services.NewLotteryServiceClient(conn)
	jobs := make(chan struct{}, *concurrency*2)

	var okCount uint64
	var errCount uint64

	var wg sync.WaitGroup
	for i := 0; i < *concurrency; i++ {
		wg.Add(1)
		go func(seed int64) {
			defer wg.Done()
			r := rand.New(rand.NewSource(time.Now().UnixNano() + seed))
			for range jobs {
				recordID := randomRecordID(r, *recordPref)
				award := randomAmount(r, *awardMax)
				req := &services.SlotsLotteryReq{
					PlayerId:     uint32(r.Intn(361) + 1),
					CurrencyType: *currency,
					AgentId:      int64(*agentID),
					GameId:       uint32(*gameID),
					ProfitLoss:   award,
					Bet:          *bet,
					State:        buildState(*state, recordID, award),
					Token:        *token,
					RoundID:      recordID,
					Complete:     *complete,
				}

				rpcCtx, rpcCancel := context.WithTimeout(context.Background(), *timeout)
				_, err := client.SlotsLottery(rpcCtx, req)
				rpcCancel()
				if err != nil {
					atomic.AddUint64(&errCount, 1)
					continue
				}
				atomic.AddUint64(&okCount, 1)
			}
		}(int64(i))
	}

	interval := time.Second
	if *qps > 0 {
		interval = time.Second / time.Duration(*qps)
	}
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	start := time.Now()
	for {
		select {
		case <-ctx.Done():
			close(jobs)
			wg.Wait()
			fmt.Printf("duration=%s ok=%d err=%d qps=%d concurrency=%d\n",
				time.Since(start).Truncate(time.Second), okCount, errCount, *qps, *concurrency)
			return
		case <-ticker.C:
			select {
			case jobs <- struct{}{}:
			default:
			}
		}
	}
}
