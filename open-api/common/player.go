package common

type Session struct {
	AgentId      int64  `json:"agentId"`
	UserId       int64  `json:"userId"`
	GameId       int64  `json:"gameId"`
	NickName     string `json:"nickName"`
	AuthToken    string `json:"authToken"`
	Mgckey       string `json:"mgckey"`
	Lang         string `json:"zh"`
	Account      string `json:"account"`
	LastAuthTime int64  `json:"lastAuthTime"`
	AuthCount    int64  `json:"authCount"`
	CurrencyType string `json:"currencyType"`
}
