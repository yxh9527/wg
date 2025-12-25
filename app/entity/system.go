package entity

var AesKey = "7z2q$l^Jw^DM3*Ol"
var AesIV = "tBu&NN$qQb9bi5L*"

var TokenTimeOut int64 = 30 * 24 * 60 * 60

type LoginInfo struct {
	Id        int32  `json:"id"`
	Name      string `json:"name"`
	LoginTime int64  `json:"logon"`
	UserType  int32  `json:"UT"`
	AgentId   int64  `json:"agentId"`
	Rand      int64  `json:"rand"`
}
