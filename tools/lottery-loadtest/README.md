# lottery-loadtest

```bash
go run . -addr 127.0.0.1:10080 -qps 200 -concurrency 20 -duration 60s
```

Flags:
- `-agent-id` default `0`
- `-game-id` default `1`
- `-symbol` default `sjddj`; kept as a load-test parameter, not sent in `SlotsLotteryReq`
- `-bet` default `1`
- `-award-max` default `50`; `ProfitLoss` is randomized in `0~award-max`
- `-currency` default `CNY`
- `-state` default built-in sample; `commonRecord.recordId`, `porderId`, `dispatchRewardGold`, and `winLoseGold` are replaced per request
- `-token` default `""`
- `-complete` default `true`
- `-timeout` default `3s`
